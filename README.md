# MFEC GeoAI Agricultural Analytics Platform
## Meghalaya Farmers' Empowerment Commission – Buckwheat & Fruit Wine Initiatives

**Project ID:** PO-DS-AGRI-2026-27-01  
**Client:** Meghalaya Farmers' Empowerment Commission (MFEC) / Government of Meghalaya  
**Period:** 22 May 2026 – 31 August 2026  
**Scope:** Buckwheat suitability mapping + Plum, Peach, Passion Fruit wine crop analytics across 9 Meghalaya districts

---

## Project Structure

```
Agri_Meg/
├── backend/                        # Node.js + Express REST API (port 5000)
│   ├── package.json
│   └── src/
│       ├── server.js               # Express app entry point
│       ├── routes/
│       │   ├── districts.js        # GET /api/districts
│       │   ├── suitability.js      # GET /api/suitability
│       │   ├── climate.js          # GET /api/climate
│       │   ├── crophealth.js       # GET /api/crophealth
│       │   └── water.js            # GET /api/water
│       └── data/
│           ├── districts.json      # 9 districts with elevation, blocks, coordinates
│           ├── suitability.json    # MaxEnt scores per district × crop
│           ├── climate.json        # WorldClim + IMD climate profiles
│           ├── crophealth.json     # Sentinel-2 NDVI/NDWI by district
│           └── water.json          # CWR, rainfall adequacy, water class
│
├── frontend/                       # React 18 SPA (port 3000)
│   ├── package.json
│   ├── public/
│   │   └── index.html              # Google Fonts, Leaflet CSS CDN
│   └── src/
│       ├── index.jsx               # React DOM entry
│       ├── App.jsx                 # Router with 9 routes
│       ├── styles/
│       │   └── global.css          # Design system (CSS variables, components)
│       ├── components/
│       │   ├── Navbar.jsx          # Fixed header with mobile hamburger
│       │   ├── Footer.jsx          # 4-column footer with all links
│       │   ├── MeghalayaMap.jsx    # Reusable choropleth map (react-leaflet)
│       │   └── StatsCard.jsx       # Metric card component
│       ├── data/
│       │   ├── meghalayaGeoJSON.js # GeoJSON polygons for all 9 districts
│       │   ├── districtData.js     # Static datasets + color utility functions
│       │   └── projectData.js      # PROJECT_INFO, DELIVERABLES, MILESTONES, DATA_SOURCES
│       └── pages/
│           ├── Home.jsx            # Landing page with hero + module overview
│           ├── BuckwheatSuitability.jsx  # MaxEnt suitability map + charts
│           ├── WineFruits.jsx      # Plum/Peach/Passion Fruit analytics
│           ├── CropHealth.jsx      # NDVI/NDWI satellite health maps
│           ├── ClimateRisk.jsx     # Frost/rainfall/temperature maps
│           ├── WaterManagement.jsx # CWR + rainfall adequacy analysis
│           ├── PriorityZones.jsx   # Top 5 priority blocks per district
│           ├── Dashboard.jsx       # Consolidated GIS dashboard (7 layers)
│           └── DataSources.jsx     # All data sources + methodology
│
├── README.md                       # This file
└── MFEC_Project_Deliverables_and_timelines.pdf   # Source project document
```

---

## Installation & Running

### Prerequisites
- Node.js v18+ (LTS)
- npm v9+

### 1. Start Backend (Express API)
```bash
cd backend
npm install
npm run dev        # nodemon – auto-restarts on changes
# API available at http://localhost:5000
```

### 2. Start Frontend (React)
```bash
cd frontend
npm install
npm start          # Create React App dev server
# App available at http://localhost:3000
# Proxy: all /api/* requests forwarded to :5000
```

Both servers must run concurrently. Open two terminals.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/summary` | Key project statistics |
| GET | `/api/districts` | All 9 districts |
| GET | `/api/districts/:name` | Single district detail |
| GET | `/api/districts/:name/blocks` | Priority blocks for district |
| GET | `/api/suitability` | All suitability scores |
| GET | `/api/suitability/crop/:cropName` | Scores for a specific crop |
| GET | `/api/suitability/district/:name` | All crops for a district |
| GET | `/api/suitability/rankings` | District ranking by buckwheat score |
| GET | `/api/climate` | All climate profiles |
| GET | `/api/climate/district/:name` | Climate data for a district |
| GET | `/api/climate/frost-risk` | Frost risk summary |
| GET | `/api/climate/rainfall` | Rainfall data by district |
| GET | `/api/crophealth` | All NDVI/NDWI data |
| GET | `/api/crophealth/ndvi` | NDVI values by district |
| GET | `/api/crophealth/ndwi` | NDWI values by district |
| GET | `/api/crophealth/district/:name` | Full crop health for district |
| GET | `/api/water` | All water data |
| GET | `/api/water/adequacy` | Rainfall adequacy ratios |
| GET | `/api/water/district/:name` | Water profile for district |

---

## Analytics Pages & Maps

| Page | Route | Maps | Description |
|------|-------|------|-------------|
| Home | `/` | 1 overview choropleth | Landing page with hero, crop tabs, milestone timeline |
| Buckwheat Suitability | `/buckwheat-suitability` | 1 choropleth | MaxEnt scores, terrain typology, AUC validation |
| Wine Fruits | `/wine-fruits` | 1 switchable choropleth | Plum / Peach / Passion Fruit comparative analysis |
| Crop Health | `/crop-health` | 1 NDVI/NDWI choropleth | Sentinel-2 vegetation health, anomaly flags |
| Climate Risk | `/climate-risk` | 1 tri-layer choropleth | Frost risk, rainfall, temperature switching |
| Water Management | `/water-management` | 1 water availability map | CWR, rainfall adequacy, irrigation need |
| Priority Zones | `/priority-zones` | 1 priority choropleth | Top 5 blocks per district, ranking table |
| Dashboard | `/dashboard` | 1 × 7-layer GIS viewer | Consolidated all-in-one analytics dashboard |
| Data Sources | `/data-sources` | – | Full data provenance and methodology |

**Total: 8 interactive Leaflet maps** with switchable tile layers (OpenTopoMap / OSM / CartoDB Positron / Esri Satellite)

---

## Districts Covered

| District | HQ | Elevation Range | Buckwheat Score |
|----------|----|-----------------|----------------|
| East Khasi Hills | Shillong | 900–1,960m | 87/100 |
| West Khasi Hills | Nongstoin | 1,200–1,960m | 82/100 |
| West Jaintia Hills | Jowai | 800–1,650m | 78/100 |
| East Jaintia Hills | Khliehriat | 400–1,200m | 65/100 |
| South West Khasi Hills | Mawkyrwat | 600–1,400m | 72/100 |
| Ri Bhoi | Nongpoh | 200–1,100m | 58/100 |
| East Garo Hills | Williamnagar | 50–800m | 42/100 |
| West Garo Hills | Tura | 50–700m | 38/100 |
| South Garo Hills | Baghmara | 50–650m | 35/100 |

---

## Data Sources

### Satellite Imagery
| Source | Provider | Resolution | Usage |
|--------|----------|------------|-------|
| Sentinel-2 MSI Level-2A | ESA Copernicus | 10m | NDVI, NDWI, LULC |
| Landsat 8/9 OLI | USGS Earth Explorer | 30m | Supplementary crop mapping |
| MODIS MOD13Q1 | NASA EARTHDATA | 250m | Time-series vegetation index |

### Climate & Weather
| Source | Provider | Resolution | Usage |
|--------|----------|------------|-------|
| WorldClim v2.1 (Bio1–Bio19) | WorldClim / UC Davis | ~1km | Bioclimatic variables for MaxEnt |
| IMD Gridded Rainfall | India Meteorological Department | 0.25° | District rainfall analysis |
| ERA5 Reanalysis | ECMWF Copernicus CDS | ~30km | Temperature, frost days |
| ICAR-RC NEH Region Data | ICAR | Station-level | Local validation data |

### Terrain & Elevation
| Source | Provider | Resolution | Usage |
|--------|----------|------------|-------|
| SRTM DEM | NASA / USGS | 30m | Elevation, slope, aspect for MaxEnt |
| Cartosat-1 DEM | ISRO Bhuvan | 30m | Supplementary terrain data |

### Species Occurrence & Field Data
| Source | Provider | Usage |
|--------|----------|-------|
| GBIF Backbone Taxonomy | Global Biodiversity Information Facility | Training occurrence points for MaxEnt |
| MFEC GPS Field Survey | MFEC / Government of Meghalaya | Ground-truth validation points |

### Administrative Boundaries
| Source | Provider | Usage |
|--------|----------|-------|
| Survey of India 1:50,000 | Survey of India (SOI) | District & block boundaries |
| GADM v4.1 | Database of Global Administrative Areas | Cross-validation boundaries |
| Meghalaya GIS Cell | Government of Meghalaya | Official district shapefiles |

### Modelling Framework
| Tool | Version | Usage |
|------|---------|-------|
| MaxEnt | v3.4.4 | Habitat suitability modelling (AUC target >0.70) |
| Google Earth Engine | JS API | Sentinel-2 processing and NDVI calculation |
| QGIS / ArcGIS | v3.x / 10.x | Cartographic output, GeoTIFF export |

---

## Project Milestones

| Milestone | Date | Deliverables |
|-----------|------|-------------|
| M1 – Suitability Modelling | 30 Jun 2026 | 1, 2, 3, 4 |
| M2 – Model Validation & Mapping | 17 Jul 2026 | 5 |
| M3 – Crop Health & Climate | 07 Aug 2026 | 6, 7 |
| M4 – Priority Zones & Dashboard | 21 Aug 2026 | 8, 9, 10 |
| M5 – Final Submission | 31 Aug 2026 | 11 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 18, Express 4, CORS, dotenv |
| Frontend | React 18, React Router v6 |
| Maps | react-leaflet v4, Leaflet 1.9.4 |
| Charts | Recharts (Bar, Line, Area, Pie, Radar, Composed) |
| HTTP | Axios (frontend → backend proxy) |
| Fonts | Google Fonts: Playfair Display + Inter |
| Tile Layers | OpenTopoMap, OpenStreetMap, CartoDB Positron, Esri World Imagery |

---

## Key Analytical Methods

- **Habitat Suitability:** MaxEnt v3.4.4 with 19 WorldClim bioclim variables + SRTM terrain predictors; AUC validation target >0.70
- **Vegetation Health:** Sentinel-2 NDVI = (B8 – B4)/(B8 + B4); NDWI = (B3 – B8)/(B3 + B8); processed on Google Earth Engine
- **Crop Water Requirement:** Penman-Monteith FAO-56 method (Allen et al., 1998); buckwheat CWR = 350mm/season
- **Frost Risk:** Days below 0°C from WorldClim monthly minimum temperature rasters
- **Chilling Hours:** Hours at 0–7°C (dormancy requirement for plum and peach orchard establishment)

---

*Deepspatial AI · MFEC Buckwheat & Fruit Wine Initiatives · 2026*
