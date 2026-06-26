const express = require('express');
const router = express.Router();
const waterData = require('../data/water.json');

router.get('/', (req, res) => res.json(waterData));

router.get('/adequacy', (req, res) => {
  res.json(waterData.map(d => ({
    district: d.district,
    rainfallMm: d.annualRainfallMm,
    cwrBuckwheatMm: d.cwrBuckwheatMm,
    adequacyRatio: (d.annualRainfallMm / d.cwrBuckwheatMm).toFixed(2),
    status: d.rainfallAdequacy,
    waterAvailabilityClass: d.waterAvailabilityClass,
    irrigationRequirement: d.irrigationRequirement
  })));
});

router.get('/district/:name', (req, res) => {
  const district = waterData.find(
    d => d.district.toLowerCase().replace(/\s+/g, '-') === req.params.name.toLowerCase()
  );
  if (!district) return res.status(404).json({ error: 'District not found' });
  res.json(district);
});

module.exports = router;
