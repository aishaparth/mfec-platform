const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { KEYS } = require('../data/datasetsRegistry');

const LIVE_DIR = path.join(__dirname, '..', 'data', 'live');
const DEFAULTS_DIR = path.join(__dirname, '..', 'data', 'defaults');
const META_FILE = path.join(LIVE_DIR, '_meta.json');

function liveFile(key) { return path.join(LIVE_DIR, `${key}.json`); }
function defaultFile(key) { return path.join(DEFAULTS_DIR, `${key}.json`); }

function readJSON(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); }

function readMeta() {
  try { return readJSON(META_FILE); } catch { return { lastUpdated: {} }; }
}
function stampMeta(key, iso) {
  const meta = readMeta();
  if (iso) meta.lastUpdated[key] = iso;
  else delete meta.lastUpdated[key];
  writeJSON(META_FILE, meta);
  return meta;
}

router.get('/', requireAuth(), (req, res) => {
  const data = {};
  for (const key of KEYS) data[key] = readJSON(liveFile(key));
  res.json({ data, meta: readMeta() });
});

router.put('/:key', requireAuth('admin'), (req, res) => {
  const { key } = req.params;
  if (!KEYS.includes(key)) return res.status(404).json({ error: 'Unknown dataset' });
  writeJSON(liveFile(key), req.body);
  const updatedAt = new Date().toISOString();
  stampMeta(key, updatedAt);
  res.json({ data: req.body, updatedAt });
});

router.post('/:key/reset', requireAuth('admin'), (req, res) => {
  const { key } = req.params;
  if (!KEYS.includes(key)) return res.status(404).json({ error: 'Unknown dataset' });
  const data = readJSON(defaultFile(key));
  writeJSON(liveFile(key), data);
  stampMeta(key, null);
  res.json({ data });
});

module.exports = router;
