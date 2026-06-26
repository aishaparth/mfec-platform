const express = require('express');
const router = express.Router();
const healthData = require('../data/crophealth.json');

router.get('/', (req, res) => res.json(healthData));

router.get('/ndvi', (req, res) => {
  res.json(healthData.map(d => ({
    district: d.district,
    ndvi: d.ndvi,
    ndviClass: d.ndviClass,
    season: d.season,
    buckwheatCoverHectares: d.buckwheatCoverHectares,
    monthlyNDVI: d.monthlyNDVI
  })));
});

router.get('/ndwi', (req, res) => {
  res.json(healthData.map(d => ({
    district: d.district,
    ndwi: d.ndwi,
    moistureStress: d.moistureStress,
    healthStatus: d.healthStatus,
    anomalyFlag: d.anomalyFlag
  })));
});

router.get('/district/:name', (req, res) => {
  const district = healthData.find(
    d => d.district.toLowerCase().replace(/\s+/g, '-') === req.params.name.toLowerCase()
  );
  if (!district) return res.status(404).json({ error: 'District not found' });
  res.json(district);
});

module.exports = router;
