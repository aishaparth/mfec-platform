const express = require('express');
const router = express.Router();
const suitabilityData = require('../data/suitability.json');

router.get('/', (req, res) => res.json(suitabilityData));

router.get('/crop/:cropName', (req, res) => {
  const crop = req.params.cropName.toLowerCase().replace(/-/g, '');
  const cropKey = { buckwheat: 'buckwheat', plum: 'plum', peach: 'peach', passionfruit: 'passionFruit' }[crop];
  if (!cropKey) return res.status(400).json({ error: 'Invalid crop. Use: buckwheat, plum, peach, passionfruit' });
  const cropData = suitabilityData.map(d => ({
    district: d.district,
    score: d[cropKey],
    classification: d[`${cropKey}Class`],
    suitableArea: d.suitableArea[cropKey] || null
  }));
  res.json(cropData);
});

router.get('/district/:name', (req, res) => {
  const district = suitabilityData.find(
    d => d.district.toLowerCase().replace(/\s+/g, '-') === req.params.name.toLowerCase()
  );
  if (!district) return res.status(404).json({ error: 'District not found' });
  res.json(district);
});

router.get('/rankings', (req, res) => {
  const ranked = [...suitabilityData].sort((a, b) => a.overallRank - b.overallRank);
  res.json(ranked.map(d => ({
    rank: d.overallRank,
    district: d.district,
    buckwheat: d.buckwheat,
    plum: d.plum,
    peach: d.peach,
    passionFruit: d.passionFruit
  })));
});

module.exports = router;
