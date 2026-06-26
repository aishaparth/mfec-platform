const express = require('express');
const router = express.Router();
const climateData = require('../data/climate.json');

router.get('/', (req, res) => res.json(climateData));

router.get('/district/:name', (req, res) => {
  const district = climateData.find(
    d => d.district.toLowerCase().replace(/\s+/g, '-') === req.params.name.toLowerCase()
  );
  if (!district) return res.status(404).json({ error: 'District not found' });
  res.json(district);
});

router.get('/frost-risk', (req, res) => {
  res.json(climateData.map(d => ({
    district: d.district,
    frostRiskDays: d.frostRiskDays,
    frostRiskLevel: d.frostRiskLevel,
    minTemperature: d.minTemperature,
    meanTemperature: d.meanTemperature
  })));
});

router.get('/rainfall', (req, res) => {
  res.json(climateData.map(d => ({
    district: d.district,
    annualRainfallMm: d.annualRainfallMm,
    rainfallAdequacy: d.rainfallAdequacy,
    seasonalRainfall: d.seasonalRainfall
  })));
});

module.exports = router;
