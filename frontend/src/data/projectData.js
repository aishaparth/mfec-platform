export const PROJECT_INFO = {
  title: 'MFEC Buckwheat & Fruit Wine Initiatives',
  subtitle: 'Geospatial Analysis – Habitat Suitability & Agricultural Analytics',
  client: 'Meghalaya Farmers\' Empowerment Commission Development (MFEC)',
  government: 'Government of Meghalaya',
  poNumber: 'PO-DS-AGRI-2026-27-01',
  poDate: '22 May 2026',
  contractValidity: '31 August 2026',
  targetAUC: '> 0.70',
  districts: 12,
  crops: ['Buckwheat', 'Plum', 'Peach', 'Passion Fruit'],
};

export const DELIVERABLES = [
  {
    id: 1, title: 'Habitat Suitability Modelling – Buckwheat',
    category: 'Crop Suitability & Core Modelling',
    week: 'Week 3–5', planned: '30 Jun 2026',
    milestone: 1,
    outputs: ['GeoTIFF suitability maps', 'PDF maps', 'District-wise rankings'],
    description: 'MaxEnt habitat suitability model for Buckwheat across 12 districts, generating High/Medium/Low classifications, terrain typology analysis, and Top 5 priority blocks per district.',
    route: '/buckwheat-suitability'
  },
  {
    id: 2, title: 'Habitat Suitability Modelling – Wine Fruits',
    category: 'Crop Suitability & Core Modelling',
    week: 'Week 3–5', planned: '30 Jun 2026',
    milestone: 1,
    outputs: ['GeoTIFF rasters', 'PDF map reports', 'Priority zone analysis'],
    description: 'Separate MaxEnt models for Plum, Peach, and Passion Fruit with terrain overlay and priority cultivation zone identification.',
    route: '/wine-fruits'
  },
  {
    id: 3, title: 'Model Validation Report',
    category: 'Crop Suitability & Core Modelling',
    week: 'Week 6', planned: '03 Jul 2026',
    milestone: 2,
    outputs: ['Validation report', 'Accuracy assessment', 'Predictor analysis'],
    description: 'AUC assessment for all crop models, environmental variable contribution analysis, and field data validation. Target AUC > 0.70.',
    route: '/dashboard'
  },
  {
    id: 4, title: 'Crop Presence & Area Mapping',
    category: 'Satellite Analytics & Environmental Risk',
    week: 'Week 7–8', planned: '17 Jul 2026',
    milestone: 2,
    outputs: ['Vector shapefiles', 'Cultivation maps', 'Expansion zone maps'],
    description: 'Satellite-based identification of current buckwheat cultivation areas, land-use/land-cover analysis, and surveyed cultivation site mapping.',
    route: '/crop-health'
  },
  {
    id: 5, title: 'Crop Health Assessment (NDVI & NDWI)',
    category: 'Satellite Analytics & Environmental Risk',
    week: 'Week 9', planned: '24 Jul 2026',
    milestone: 3,
    outputs: ['NDVI maps', 'NDWI maps', 'Health assessment report'],
    description: 'Sentinel-2 based vegetation health analysis using NDVI and moisture stress assessment using NDWI, correlated with field observations.',
    route: '/crop-health'
  },
  {
    id: 6, title: 'Climate Suitability & Risk Analysis',
    category: 'Satellite Analytics & Environmental Risk',
    week: 'Week 10', planned: '31 Jul 2026',
    milestone: 3,
    outputs: ['Climate suitability maps', 'Frost risk maps', 'Rainfall analysis report'],
    description: 'Historical climate assessment, frost risk mapping for buckwheat, temperature suitability for wine fruits, and rainfall adequacy evaluation.',
    route: '/climate-risk'
  },
  {
    id: 7, title: 'Water Management Insights',
    category: 'Satellite Analytics & Environmental Risk',
    week: 'Week 11', planned: '07 Aug 2026',
    milestone: 3,
    outputs: ['Water requirement report', 'Seasonal water maps', 'Rain-fed assessment'],
    description: 'Crop Water Requirement (CWR) estimation for all crops, rainfall adequacy assessment, and seasonal water availability analysis.',
    route: '/water-management'
  },
  {
    id: 8, title: 'Priority Zone Report',
    category: 'Strategic Reporting & Platforms',
    week: 'Week 12', planned: '14 Aug 2026',
    milestone: 4,
    outputs: ['Priority block report', 'Excel statistics', 'Suitability summaries'],
    description: 'District-wise Top 5 block rankings, area estimation under each suitability class, and consolidated priority zone analysis.',
    route: '/priority-zones'
  },
  {
    id: 9, title: 'Interactive GIS Dashboard',
    category: 'Strategic Reporting & Platforms',
    week: 'Week 12–13', planned: '21 Aug 2026',
    milestone: 4,
    outputs: ['Web GIS Dashboard', 'Interactive layers', 'Download functionality'],
    description: 'Web-based GIS Viewer with layer switching, district-level filtering, interactive map queries, and dataset download functionality.',
    route: '/dashboard',
    conditional: true
  },
  {
    id: 10, title: 'Final Deliverable Package',
    category: 'Strategic Reporting & Platforms',
    week: 'Week 13–14', planned: '25 Aug 2026',
    milestone: 5,
    outputs: ['GeoTIFFs & shapefiles', 'PDF maps', 'Excel summaries', 'Analytical reports'],
    description: 'Compilation of all GeoTIFF raster datasets, vector shapefiles, high-resolution PDF maps, Excel summaries, and analytical reports.',
    route: '/dashboard'
  },
  {
    id: 11, title: 'Training & Handover Support',
    category: 'Strategic Reporting & Platforms',
    week: 'Week 14', planned: '31 Aug 2026',
    milestone: 5,
    outputs: ['User guide', 'Training materials', 'Handover report'],
    description: 'Methodology walkthrough, dashboard demonstration, knowledge transfer sessions, user guide preparation, and Q&A support.',
    route: '/data-sources'
  },
];

export const MILESTONES = [
  { id: 1, title: 'Data Preparation & Suitability Modelling', deliverables: '1 & 2', date: '30 Jun 2026', color: '#1B5E20' },
  { id: 2, title: 'Model Validation & Mapping',               deliverables: '3 & 4', date: '17 Jul 2026', color: '#388E3C' },
  { id: 3, title: 'Crop Health & Climate Analytics',          deliverables: '5, 6 & 7', date: '07 Aug 2026', color: '#66BB6A' },
  { id: 4, title: 'Priority Zone Identification & Dashboard', deliverables: '8 & 9', date: '21 Aug 2026', color: '#F9A825' },
  { id: 5, title: 'Final Submission & Knowledge Transfer',    deliverables: '10 & 11', date: '31 Aug 2026', color: '#1565C0' },
];

export const DATA_SOURCES = [
  {
    category: 'Satellite Imagery',
    icon: '🛰',
    sources: [
      { name: 'Sentinel-2 MSI', description: 'Multispectral imagery at 10m resolution for NDVI, NDWI, crop health, and land-use mapping', provider: 'European Space Agency (ESA) / Copernicus Programme', access: 'Open Access – Copernicus Data Space', usedFor: 'Deliverables 4, 5' },
      { name: 'Copernicus Land Service', description: 'Land cover classification layers and vegetation monitoring products', provider: 'Copernicus Land Monitoring Service (CLMS)', access: 'Open Access', usedFor: 'Deliverable 4' },
    ]
  },
  {
    category: 'Climate & Weather Data',
    icon: '🌦',
    sources: [
      { name: 'WorldClim v2.1', description: 'Global climate layers: monthly temperature, precipitation, and bioclimatic variables at 1km resolution', provider: 'WorldClim (Fick & Hijmans, 2017)', access: 'Open Access – worldclim.org', usedFor: 'Deliverables 1, 2, 6' },
      { name: 'India Meteorological Department (IMD)', description: 'Historical weather station data for Meghalaya districts: temperature, rainfall, humidity, frost events', provider: 'IMD, Government of India', access: 'Licensed/Official Data Request', usedFor: 'Deliverables 6, 7' },
      { name: 'ICAR-RC NEH Region', description: 'Regional agroclimatic data and phenology observations for North East Hill region', provider: 'ICAR Research Complex for NEH Region, Umiam', access: 'Institutional Collaboration', usedFor: 'Deliverables 6, 7' },
    ]
  },
  {
    category: 'Terrain & Elevation',
    icon: '⛰',
    sources: [
      { name: 'SRTM DEM (30m)', description: 'Shuttle Radar Topography Mission digital elevation model for slope, aspect, and elevation analysis', provider: 'NASA / USGS EarthExplorer', access: 'Open Access – earthexplorer.usgs.gov', usedFor: 'Deliverables 1, 2, 8' },
      { name: 'Bhuvan ISRO DEM', description: 'Cartosat-1 based 30m DEM for India with improved accuracy in hilly terrain', provider: 'ISRO National Remote Sensing Centre (NRSC)', access: 'Open Access – bhuvan.nrsc.gov.in', usedFor: 'Deliverables 1, 2' },
    ]
  },
  {
    category: 'Species Occurrence & Field Data',
    icon: '📍',
    sources: [
      { name: 'GBIF (Global Biodiversity Information Facility)', description: 'Buckwheat occurrence records for MaxEnt model training and validation', provider: 'GBIF Secretariat – gbif.org', access: 'Open Access – CC BY 4.0', usedFor: 'Deliverables 1, 2, 3' },
      { name: 'Field Survey Data (MFEC)', description: 'Ground-truth cultivation points, soil samples, and farmer crop records collected by MFEC', provider: 'MFEC / Government of Meghalaya', access: 'Client-Provided', usedFor: 'Deliverables 3, 4, 5' },
    ]
  },
  {
    category: 'Administrative Boundaries',
    icon: '🗺',
    sources: [
      { name: 'Survey of India', description: 'Official district and block boundary shapefiles for Meghalaya', provider: 'Survey of India, Government of India', access: 'Licensed', usedFor: 'All Deliverables' },
      { name: 'Meghalaya GIS Cell', description: 'State GIS repository with village boundaries, roads, and land parcels', provider: 'Meghalaya State GIS Cell', access: 'State Government Data', usedFor: 'All Deliverables' },
      { name: 'GADM v4.1', description: 'Global Administrative Areas for reference boundary validation', provider: 'GADM – gadm.org', access: 'Open Access – CC BY-NC', usedFor: 'Reference Validation' },
    ]
  },
  {
    category: 'Modelling Framework',
    icon: '🤖',
    sources: [
      { name: 'MaxEnt v3.4.4', description: 'Maximum Entropy species distribution modelling software used for habitat suitability modelling', provider: 'Phillips, Anderson & Schapire (2006)', access: 'Open Source – biodiversityinformatics.amnh.org', usedFor: 'Deliverables 1, 2, 3' },
      { name: 'Google Earth Engine', description: 'Cloud computing platform for Sentinel-2 processing, NDVI/NDWI computation at scale', provider: 'Google LLC', access: 'Free for Research', usedFor: 'Deliverables 4, 5' },
      { name: 'QGIS 3.34', description: 'Open source GIS for spatial analysis, map production, and shapefile generation', provider: 'QGIS Development Team', access: 'Open Source – qgis.org', usedFor: 'All Deliverables' },
    ]
  },
];
