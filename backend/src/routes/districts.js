const express = require('express');
const router = express.Router();
const districts = require('../data/districts.json');

router.get('/', (req, res) => res.json(districts));

router.get('/:name', (req, res) => {
  const district = districts.find(
    d => d.name.toLowerCase().replace(/\s+/g, '-') === req.params.name.toLowerCase()
  );
  if (!district) return res.status(404).json({ error: 'District not found' });
  res.json(district);
});

router.get('/:name/blocks', (req, res) => {
  const district = districts.find(
    d => d.name.toLowerCase().replace(/\s+/g, '-') === req.params.name.toLowerCase()
  );
  if (!district) return res.status(404).json({ error: 'District not found' });
  res.json(district.priorityBlocks);
});

module.exports = router;
