# MFEC GeoAI Platform
## Meghalaya Farmers' Empowerment Commission – Buckwheat & Fruit Wine Initiatives

**PO Number:** PO-DS-AGRI-2026-27-01  
**Contract Validity:** Until 31 August 2026  
**End Client:** MFEC · Government of Meghalaya  

---

## Project Structure

```
mfec-platform/
├── frontend/                     # React Frontend
│   ├── package.json
│   └── src/
│       ├── components/
│       │   ├── maps/
│       │   │   ├── SuitabilityMap.jsx    # Buckwheat MaxEnt map (Leaflet)
│       │   │   ├── WineFruitMap.jsx      # Wine crops distribution map
│       │   │   ├── RainfallMap.jsx       # Rainfall analysis map (IMD data)
│       │   │   └── ElevationMap.jsx      # Terrain/DEM map (SRTM)
│       │   ├── DistrictCard.jsx          # District sidebar card
│       │   ├── DistrictModal.jsx         # District detail popup
│       │   ├── DeliverableCard.jsx       # Deliverable detail card
│       │   ├── CropProfile.jsx           # Crop intelligence card
│       │   └── MilestoneTimeline.jsx     # Project timeline
│       ├── pages/
│       │   ├── HomePage.jsx              # Hero + overview
│       │   ├── MapsPage.jsx              # All 4 interactive maps
│       │   ├── DeliverablesPage.jsx      # 11 deliverables
│       │   ├── CropsPage.jsx             # 4 crop profiles
│       │   ├── TimelinePage.jsx          # 5 milestone timeline
│       │   └── DataSourcesPage.jsx       # 12 data sources
│       ├── data/
│       │   ├── districts.js              # 9 district records
│       │   ├── deliverables.js           # 11 deliverables
│       │   ├── crops.js                  # 4 crop profiles
│       │   └── datasources.js            # 12 data sources
│       └── App.jsx
│
├── backend/                      # Node.js Express Backend API
│   ├── package.json
│   └── src/
│       ├── server.js             # Express entry point (port 5000)
│       ├── data/
│       │   └── districts.js      # Master district dataset
│       └── routes/
│           ├── deliverables.js   # GET /api/deliverables
│           ├── districts.js      # GET /api/districts
│           ├── timeline.js       # GET /api/timeline
│           └── crops.js          # GET /api/crops
│
└── README.md
```

---

## Setup & Running

### Backend
```bash
cd backend
npm install
node src/server.js
# API running at http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start
# React app at http://localhost:3000
# Proxied to backend at :5000
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/districts` | All 9 Meghalaya districts with suitability data |
| `GET /api/districts/:id` | Single district detail |
| `GET /api/districts/stats/summary` | Suitability statistics summary |
| `GET /api/deliverables` | All 11 project deliverables |
| `GET /api/deliverables/:id` | Single deliverable detail |
| `GET /api/crops` | All 4 crop profiles |
| `GET /api/crops/:id` | Single crop profile |
| `GET /api/timeline` | 5 project milestones |

---

## Maps Included

1. **Buckwheat Suitability Map** — MaxEnt model output, color-coded by High/Medium/Low suitability with score proportional markers. Base: OpenStreetMap. Layers: Street / Satellite (ESRI) / Topographic.

2. **Wine Fruit Distribution Map** — Shows Plum, Peach, Passion Fruit cultivation zones per district. Toggle layers per crop. Base: OpenStreetMap.

3. **Rainfall Analysis Map** — Annual rainfall (mm/yr) per district. Circle size and color proportional to rainfall volume. Source: IMD + WorldClim v2.1.

4. **Terrain & Elevation Map** — Elevation ranges per district with OpenTopoMap base. Source: NASA SRTM DEM 30m.

---

## Data Sources

| Dataset | Provider | Usage |
|---------|----------|-------|
| WorldClim v2.1 | WorldClim / UC Davis | Bioclimatic variables for MaxEnt |
| GBIF Occurrence Records | Global Biodiversity Information Facility | Species presence points |
| SRTM DEM 30m | NASA / USGS | Elevation, slope, aspect |
| Sentinel-2 MSI L2A | ESA Copernicus | NDVI, NDWI, LULC |
| Landsat 8/9 OLI | USGS Earth Explorer | Crop presence mapping |
| SoilGrids 250m | ISRIC | Soil properties |
| CHIRPS v2.0 | Climate Hazards Group / UCSB | Rainfall for CWR |
| ERA5 Reanalysis | ECMWF Copernicus CDS | Temperature & frost risk |
| IMD Gridded Rainfall | India Meteorological Department | District-level rainfall |
| Survey of India Boundaries | Survey of India (SOI) | District & block shapefiles |
| MODIS Vegetation Products | NASA EARTHDATA | Time-series NDVI/EVI |
| GRACE-FO Groundwater | NASA / DLR | Groundwater monitoring |

---

## Tech Stack

- **Frontend:** React 18, Leaflet.js (maps), Recharts (charts), Inter + DM Serif Display fonts
- **Backend:** Node.js, Express 4
- **Maps:** Leaflet 1.9 with OpenStreetMap, ESRI Satellite, OpenTopoMap basemaps
- **GIS Output Formats:** GeoTIFF, Shapefiles, PDF maps

---

*MFEC Buckwheat & Fruit Wine Initiatives · Deepspatial · 2026*
