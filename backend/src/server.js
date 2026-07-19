const express = require('express');
const cors = require('cors');
require('dotenv').config();

const districtRoutes = require('./routes/districts');
const suitabilityRoutes = require('./routes/suitability');
const climateRoutes = require('./routes/climate');
const cropHealthRoutes = require('./routes/crophealth');
const waterRoutes = require('./routes/water');
const authRoutes = require('./routes/auth');
const datasetsRoutes = require('./routes/datasets');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/districts', districtRoutes);
app.use('/api/suitability', suitabilityRoutes);
app.use('/api/climate', climateRoutes);
app.use('/api/crophealth', cropHealthRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    project: 'MFEC Meghalaya Agricultural Analytics Platform',
    version: '1.0.0',
    poNumber: 'PO-DS-AGRI-2026-27-01',
    client: 'Meghalaya Farmers Empowerment Commission Development (MFEC)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/summary', (req, res) => {
  res.json({
    projectName: 'MFEC Buckwheat & Fruit Wine Initiatives',
    client: 'Meghalaya Farmers Empowerment Commission Development (MFEC)',
    government: 'Government of Meghalaya',
    districtsCovered: 9,
    totalBlocksAnalysed: 45,
    cropsCovered: ['Buckwheat', 'Plum', 'Peach', 'Passion Fruit'],
    modelType: 'MaxEnt Habitat Suitability Model',
    targetAUC: '>0.70',
    satelliteData: ['Sentinel-2', 'Copernicus'],
    climateData: ['WorldClim', 'IMD'],
    projectPeriod: '22 May 2026 – 31 August 2026',
    deliverables: 11,
    milestones: 5
  });
});

// Local dev: start server; Vercel serverless: export app
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n🌿 MFEC Analytics Server running on http://localhost:${PORT}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
