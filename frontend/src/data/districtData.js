// ── 12 Real Meghalaya Districts (from data/Districts_12 shapefile) ─────────────
export const suitabilityData = [
  { district: 'East Khasi Hills',         buckwheat: 87, plum: 91, peach: 88, passionFruit: 75, overallRank: 1,  aucScore: 0.89 },
  { district: 'West Khasi Hills',         buckwheat: 82, plum: 86, peach: 83, passionFruit: 70, overallRank: 2,  aucScore: 0.86 },
  { district: 'West Jaintia Hills',       buckwheat: 78, plum: 80, peach: 76, passionFruit: 72, overallRank: 3,  aucScore: 0.83 },
  { district: 'South West Khasi Hills',   buckwheat: 72, plum: 75, peach: 71, passionFruit: 65, overallRank: 4,  aucScore: 0.80 },
  { district: 'Eastern West Khasi Hills', buckwheat: 68, plum: 70, peach: 67, passionFruit: 68, overallRank: 5,  aucScore: 0.78 },
  { district: 'East Jaintia Hills',       buckwheat: 65, plum: 68, peach: 63, passionFruit: 78, overallRank: 6,  aucScore: 0.76 },
  { district: 'Ri Bhoi',                  buckwheat: 58, plum: 55, peach: 52, passionFruit: 82, overallRank: 7,  aucScore: 0.74 },
  { district: 'North Garo Hills',         buckwheat: 48, plum: 42, peach: 40, passionFruit: 72, overallRank: 8,  aucScore: 0.72 },
  { district: 'East Garo Hills',          buckwheat: 42, plum: 38, peach: 36, passionFruit: 78, overallRank: 9,  aucScore: 0.71 },
  { district: 'West Garo Hills',          buckwheat: 38, plum: 35, peach: 33, passionFruit: 80, overallRank: 10, aucScore: 0.70 },
  { district: 'South Garo Hills',         buckwheat: 35, plum: 30, peach: 28, passionFruit: 73, overallRank: 11, aucScore: 0.72 },
  { district: 'South West Garo Hills',    buckwheat: 32, plum: 28, peach: 26, passionFruit: 75, overallRank: 12, aucScore: 0.71 },
];

export const climateData = [
  { district: 'East Khasi Hills',         temp: 17.2, rainfall: 2380, frostDays: 12, frostLevel: 'High',    waterClass: 'High' },
  { district: 'West Khasi Hills',         temp: 16.8, rainfall: 3200, frostDays: 8,  frostLevel: 'Medium',  waterClass: 'Very High' },
  { district: 'West Jaintia Hills',       temp: 18.5, rainfall: 2600, frostDays: 5,  frostLevel: 'Medium',  waterClass: 'Very High' },
  { district: 'South West Khasi Hills',   temp: 20.1, rainfall: 1950, frostDays: 2,  frostLevel: 'Low',     waterClass: 'Medium' },
  { district: 'Eastern West Khasi Hills', temp: 19.2, rainfall: 2100, frostDays: 3,  frostLevel: 'Low',     waterClass: 'High' },
  { district: 'East Jaintia Hills',       temp: 21.5, rainfall: 1780, frostDays: 1,  frostLevel: 'Minimal', waterClass: 'Medium' },
  { district: 'Ri Bhoi',                  temp: 22.3, rainfall: 1850, frostDays: 0,  frostLevel: 'None',    waterClass: 'Medium' },
  { district: 'North Garo Hills',         temp: 23.8, rainfall: 2150, frostDays: 0,  frostLevel: 'None',    waterClass: 'High' },
  { district: 'East Garo Hills',          temp: 24.5, rainfall: 2050, frostDays: 0,  frostLevel: 'None',    waterClass: 'High' },
  { district: 'West Garo Hills',          temp: 25.1, rainfall: 2800, frostDays: 0,  frostLevel: 'None',    waterClass: 'Very High' },
  { district: 'South Garo Hills',         temp: 26.2, rainfall: 2100, frostDays: 0,  frostLevel: 'None',    waterClass: 'High' },
  { district: 'South West Garo Hills',    temp: 25.8, rainfall: 1950, frostDays: 0,  frostLevel: 'None',    waterClass: 'Medium' },
];

// ── Crop Health Data (Sentinel-2 · Rabi 2025) ─────────────────────────────
// Fields to fill from real analysis:
//   ndvi               – Sentinel-2 derived NDVI (0–1)
//   ndviClass          – 'Very High' | 'High' | 'Medium' | 'Low'
//   ndwi               – Sentinel-2 derived NDWI (0–1)
//   moistureStress     – 'None' | 'Low' | 'Medium' | 'High'
//   healthStatus       – 'Excellent' | 'Good' | 'Fair' | 'Poor'
//   anomalyFlag        – true if NDVI anomaly detected vs previous season
//   buckwheatCoverHa   – buckwheat cultivation area in hectares (LULC classification)
//   vegetationCoverPct – % vegetation cover in the district
//   season             – acquisition season label
//   sentinelDate       – image source & date label
//   prevSeasonNDVI     – NDVI from previous season (Oct 2025 Rabi, for trend comparison)
//
//   Source: MODIS/061/MOD13Q1 · 250 m · 16-day composites · Median Jan 01 – Jun 22, 2026
//   GEE script: NDVI_2026_JSfile.txt · Scale factor: ×0.0001
//   Jan–Feb values (dry/winter) pull median lower vs Oct peak; May–Jun monsoon onset raises it.
//   Garo Hills benefit from earlier monsoon arrival relative to Oct Rabi snapshot.
export const ndviData = [
  { district: 'East Khasi Hills',         ndvi: 0.69, ndviClass: 'High',      ndwi: 0.25, moistureStress: 'Low',    healthStatus: 'Good',      anomalyFlag: false, buckwheatCoverHa: 5310, vegetationCoverPct: 69, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.71 },
  { district: 'West Khasi Hills',         ndvi: 0.72, ndviClass: 'Very High', ndwi: 0.30, moistureStress: 'None',   healthStatus: 'Excellent', anomalyFlag: false, buckwheatCoverHa:  170, vegetationCoverPct: 72, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.74 },
  { district: 'West Jaintia Hills',       ndvi: 0.65, ndviClass: 'High',      ndwi: 0.21, moistureStress: 'Low',    healthStatus: 'Good',      anomalyFlag: false, buckwheatCoverHa: 1040, vegetationCoverPct: 65, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.68 },
  { district: 'South West Khasi Hills',   ndvi: 0.62, ndviClass: 'High',      ndwi: 0.17, moistureStress: 'Low',    healthStatus: 'Good',      anomalyFlag: false, buckwheatCoverHa:  940, vegetationCoverPct: 62, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.63 },
  { district: 'Eastern West Khasi Hills', ndvi: 0.63, ndviClass: 'High',      ndwi: 0.19, moistureStress: 'Low',    healthStatus: 'Good',      anomalyFlag: false, buckwheatCoverHa:  500, vegetationCoverPct: 63, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.65 },
  { district: 'East Jaintia Hills',       ndvi: 0.58, ndviClass: 'Medium',    ndwi: 0.13, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: false, buckwheatCoverHa:  530, vegetationCoverPct: 58, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.58 },
  { district: 'Ri Bhoi',                  ndvi: 0.57, ndviClass: 'Medium',    ndwi: 0.12, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: false, buckwheatCoverHa:  460, vegetationCoverPct: 57, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.55 },
  { district: 'North Garo Hills',         ndvi: 0.59, ndviClass: 'Medium',    ndwi: 0.15, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: false, buckwheatCoverHa:  190, vegetationCoverPct: 59, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.60 },
  { district: 'East Garo Hills',          ndvi: 0.52, ndviClass: 'Medium',    ndwi: 0.10, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: true,  buckwheatCoverHa:   70, vegetationCoverPct: 52, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.53 },
  { district: 'West Garo Hills',          ndvi: 0.55, ndviClass: 'Medium',    ndwi: 0.12, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: false, buckwheatCoverHa:  350, vegetationCoverPct: 55, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.56 },
  { district: 'South Garo Hills',         ndvi: 0.50, ndviClass: 'Medium',    ndwi: 0.08, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: true,  buckwheatCoverHa:  190, vegetationCoverPct: 50, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.51 },
  { district: 'South West Garo Hills',    ndvi: 0.47, ndviClass: 'Low',       ndwi: 0.07, moistureStress: 'High',   healthStatus: 'Poor',      anomalyFlag: true,  buckwheatCoverHa:  100, vegetationCoverPct: 47, season: 'Jan–Jun 2026', sentinelDate: 'MODIS Jan–Jun 2026', prevSeasonNDVI: 0.49 },
];

export const waterData = [
  { district: 'East Khasi Hills',         rainfall: 2380, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'High',      irrigation: 'None',    adequacy: 'Very High' },
  { district: 'West Khasi Hills',         rainfall: 3200, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'Very High', irrigation: 'None',    adequacy: 'Very High' },
  { district: 'West Jaintia Hills',       rainfall: 2600, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'Very High', irrigation: 'None',    adequacy: 'Very High' },
  { district: 'South West Khasi Hills',   rainfall: 1950, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'Medium',    irrigation: 'Minimal', adequacy: 'High'      },
  { district: 'Eastern West Khasi Hills', rainfall: 2100, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'High',      irrigation: 'None',    adequacy: 'High'      },
  { district: 'East Jaintia Hills',       rainfall: 1780, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'Medium',    irrigation: 'Minimal', adequacy: 'High'      },
  { district: 'Ri Bhoi',                  rainfall: 1850, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'Medium',    irrigation: 'Minimal', adequacy: 'High'      },
  { district: 'North Garo Hills',         rainfall: 2150, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'High',      irrigation: 'None',    adequacy: 'High'      },
  { district: 'East Garo Hills',          rainfall: 2050, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'High',      irrigation: 'None',    adequacy: 'High'      },
  { district: 'West Garo Hills',          rainfall: 2800, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'Very High', irrigation: 'None',    adequacy: 'Very High' },
  { district: 'South Garo Hills',         rainfall: 2100, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'High',      irrigation: 'None',    adequacy: 'High'      },
  { district: 'South West Garo Hills',    rainfall: 1950, cwrBuckwheat: 350, cwrPlum: 720, cwrPeach: 680, cwrPassionFruit: 1400, waterClass: 'Medium',    irrigation: 'Minimal', adequacy: 'High'      },
];

// ── 46 Real Blocks (from data/Blocks_46 shapefile) ─────────────────────────────
export const priorityBlocks = {
  'East Khasi Hills': [
    { block: 'Mawlai',                score: 92, areaSqKm: 32   },
    { block: 'Mawphlang',             score: 88, areaSqKm: 173  },
    { block: 'Mylliem',               score: 86, areaSqKm: 167  },
    { block: 'Mawpat',                score: 84, areaSqKm: 56   },
    { block: 'Sohiong',               score: 82, areaSqKm: 187  },
    { block: 'Mawryngkneng',          score: 79, areaSqKm: 323  },
    { block: 'Pynursla',              score: 76, areaSqKm: 391  },
    { block: 'Shella Bholaganj',      score: 73, areaSqKm: 289  },
    { block: 'Mawsynram',             score: 70, areaSqKm: 477  },
    { block: 'Mawkynrew',             score: 67, areaSqKm: 378  },
    { block: 'Khatarshnong Laitkroh', score: 64, areaSqKm: 341  },
  ],
  'West Khasi Hills': [
    { block: 'Nongstoin',  score: 85, areaSqKm: 1059 },
    { block: 'Mawshynrut', score: 78, areaSqKm: 1605 },
  ],
  'West Jaintia Hills': [
    { block: 'Thadlaskein', score: 82, areaSqKm: 797 },
    { block: 'Amlarem',     score: 76, areaSqKm: 447 },
    { block: 'Laskein',     score: 72, areaSqKm: 529 },
  ],
  'East Jaintia Hills': [
    { block: 'Khliehriat', score: 68, areaSqKm: 971  },
    { block: 'Saipung',    score: 62, areaSqKm: 1072 },
  ],
  'South West Khasi Hills': [
    { block: 'Mawkyrwat', score: 75, areaSqKm: 744 },
    { block: 'Ranikor',   score: 64, areaSqKm: 576 },
  ],
  'Eastern West Khasi Hills': [
    { block: 'Mairang',        score: 72, areaSqKm: 868 },
    { block: 'Mawthadraishan', score: 65, areaSqKm: 400 },
  ],
  'Ri Bhoi': [
    { block: 'Jirang',      score: 62, areaSqKm: 664 },
    { block: 'Umsning',     score: 60, areaSqKm: 673 },
    { block: 'Umling',      score: 57, areaSqKm: 705 },
    { block: 'Bhoirymbong', score: 52, areaSqKm: 328 },
  ],
  'North Garo Hills': [
    { block: 'Kharkutta',   score: 52, areaSqKm: 430 },
    { block: 'Bajengdoba',  score: 48, areaSqKm: 335 },
    { block: 'Resubelpara', score: 44, areaSqKm: 307 },
  ],
  'East Garo Hills': [
    { block: 'Songsak',        score: 46, areaSqKm: 635 },
    { block: 'Samanda',        score: 42, areaSqKm: 547 },
    { block: 'Dambo Rongjeng', score: 38, areaSqKm: 531 },
  ],
  'West Garo Hills': [
    { block: 'Rongram',    score: 45, areaSqKm: 666 },
    { block: 'Dadenggiri', score: 42, areaSqKm: 586 },
    { block: 'Dalu',       score: 40, areaSqKm: 387 },
    { block: 'Selsella',   score: 38, areaSqKm: 327 },
    { block: 'Tikrikilla', score: 36, areaSqKm: 316 },
    { block: 'Gambegre',   score: 34, areaSqKm: 241 },
    { block: 'Demdemma',   score: 32, areaSqKm: 171 },
  ],
  'South Garo Hills': [
    { block: 'Chokpot',    score: 40, areaSqKm: 591 },
    { block: 'Rongara',    score: 37, areaSqKm: 559 },
    { block: 'Gasuapara',  score: 34, areaSqKm: 342 },
    { block: 'Baghmara',   score: 30, areaSqKm: 472 },
  ],
  'South West Garo Hills': [
    { block: 'Zikzak',   score: 36, areaSqKm: 400 },
    { block: 'Betasing',  score: 33, areaSqKm: 171 },
    { block: 'Rerapara',  score: 30, areaSqKm: 159 },
  ],
};

export function getSuitColor(score) {
  if (score >= 86) return '#1B5E20';
  if (score >= 66) return '#388E3C';
  if (score >= 46) return '#8BC34A';
  if (score >= 26) return '#FDD835';
  return '#E53935';
}
export function getSuitClass(score) {
  if (score >= 86) return 'High';
  if (score >= 66) return 'Medium-High';
  if (score >= 46) return 'Medium';
  if (score >= 26) return 'Low';
  return 'Very Low';
}
export function getSuitBadgeStyle(score) {
  if (score >= 86) return { background: '#E8F5E9', color: '#1B5E20', border: '1px solid #A5D6A7' };
  if (score >= 66) return { background: '#F1F8E9', color: '#558B2F', border: '1px solid #C5E1A5' };
  if (score >= 46) return { background: '#FFF8E1', color: '#E65100', border: '1px solid #FFD54F' };
  if (score >= 26) return { background: '#FFF3E0', color: '#BF360C', border: '1px solid #FFCC80' };
  return { background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' };
}
export function getFrostColor(level) {
  if (level === 'High')    return '#B71C1C';
  if (level === 'Medium')  return '#E64A19';
  if (level === 'Low')     return '#F57F17';
  if (level === 'Minimal') return '#8BC34A';
  return '#1B5E20';
}
export function getNDVIColor(ndvi) {
  if (ndvi >= 0.70) return '#1B5E20';
  if (ndvi >= 0.60) return '#388E3C';
  if (ndvi >= 0.50) return '#8BC34A';
  if (ndvi >= 0.40) return '#FDD835';
  return '#E53935';
}
export function getWaterColor(cls) {
  if (cls === 'Very High') return '#0D47A1';
  if (cls === 'High')      return '#1976D2';
  if (cls === 'Medium')    return '#64B5F6';
  return '#FFB74D';
}

// ── Terrain (DEM) Data · SRTM · Zonal Stats per District ────────────────────
// Source: data/DEM, Slope & Aspect rasters (EPSG:32646) · rasterstats.zonal_stats()
// elevMin/Max/Mean in metres · slopeMean/Max in degrees
// terrainClass: Optimal ≥1000m | Good ≥700m | Marginal ≥400m | Unsuitable <400m
export const demData = [
  { district: 'East Khasi Hills',         elevMin: 4,   elevMax: 1964, elevMean: 1105, slopeMean: 17.0, slopeMax: 72.9, slopeClass: 'Steep',    terrainClass: 'Optimal',    buckwheatElevSuit: 'High'     },
  { district: 'West Khasi Hills',         elevMin: 60,  elevMax: 1924, elevMean: 880,  slopeMean: 12.9, slopeMax: 71.0, slopeClass: 'Moderate', terrainClass: 'Good',       buckwheatElevSuit: 'High'     },
  { district: 'West Jaintia Hills',       elevMin: 2,   elevMax: 1525, elevMean: 1006, slopeMean: 10.9, slopeMax: 65.6, slopeClass: 'Moderate', terrainClass: 'Optimal',    buckwheatElevSuit: 'High'     },
  { district: 'South West Khasi Hills',   elevMin: 4,   elevMax: 1703, elevMean: 819,  slopeMean: 14.7, slopeMax: 72.8, slopeClass: 'Moderate', terrainClass: 'Good',       buckwheatElevSuit: 'High'     },
  { district: 'Eastern West Khasi Hills', elevMin: 143, elevMax: 1888, elevMean: 1217, slopeMean: 13.3, slopeMax: 66.8, slopeClass: 'Moderate', terrainClass: 'Optimal',    buckwheatElevSuit: 'High'     },
  { district: 'East Jaintia Hills',       elevMin: 10,  elevMax: 1630, elevMean: 866,  slopeMean: 13.0, slopeMax: 76.1, slopeClass: 'Moderate', terrainClass: 'Good',       buckwheatElevSuit: 'High'     },
  { district: 'Ri Bhoi',                  elevMin: 58,  elevMax: 1849, elevMean: 607,  slopeMean: 13.7, slopeMax: 62.7, slopeClass: 'Moderate', terrainClass: 'Marginal',   buckwheatElevSuit: 'Medium'   },
  { district: 'North Garo Hills',         elevMin: 33,  elevMax: 789,  elevMean: 223,  slopeMean: 12.7, slopeMax: 63.1, slopeClass: 'Moderate', terrainClass: 'Unsuitable', buckwheatElevSuit: 'Low'      },
  { district: 'East Garo Hills',          elevMin: 65,  elevMax: 1418, elevMean: 444,  slopeMean: 11.2, slopeMax: 65.1, slopeClass: 'Moderate', terrainClass: 'Marginal',   buckwheatElevSuit: 'Low'      },
  { district: 'West Garo Hills',          elevMin: 9,   elevMax: 1379, elevMean: 222,  slopeMean: 9.0,  slopeMax: 63.2, slopeClass: 'Gentle',   terrainClass: 'Unsuitable', buckwheatElevSuit: 'Low'      },
  { district: 'South Garo Hills',         elevMin: 8,   elevMax: 1420, elevMean: 245,  slopeMean: 13.1, slopeMax: 69.1, slopeClass: 'Moderate', terrainClass: 'Unsuitable', buckwheatElevSuit: 'Low'      },
  { district: 'South West Garo Hills',    elevMin: 15,  elevMax: 674,  elevMean: 89,   slopeMean: 8.3,  slopeMax: 51.4, slopeClass: 'Gentle',   terrainClass: 'Unsuitable', buckwheatElevSuit: 'Very Low' },
];

// ── LULC 2025-26 · ESRI 10m Annual Land Cover · Zonal Stats per District ────
// Source: data/LULC25_26 raster (EPSG:32646) · rasterstats.zonal_stats()
// All percentages rounded to 1 dp; otherPct = water + flooded + bare + sparse
export const lulcData = [
  { district: 'East Khasi Hills',         evergreenForestPct: 66.3, shrublandPct: 21.3, builtupPct: 9.0, croplandPct: 2.9,  otherPct: 0.5 },
  { district: 'West Khasi Hills',         evergreenForestPct: 81.2, shrublandPct: 15.8, builtupPct: 2.7, croplandPct: 0.1,  otherPct: 0.2 },
  { district: 'West Jaintia Hills',       evergreenForestPct: 65.7, shrublandPct: 25.6, builtupPct: 7.2, croplandPct: 0.9,  otherPct: 0.6 },
  { district: 'South West Khasi Hills',   evergreenForestPct: 73.6, shrublandPct: 20.7, builtupPct: 4.1, croplandPct: 1.1,  otherPct: 0.5 },
  { district: 'Eastern West Khasi Hills', evergreenForestPct: 67.4, shrublandPct: 26.5, builtupPct: 5.3, croplandPct: 0.6,  otherPct: 0.2 },
  { district: 'East Jaintia Hills',       evergreenForestPct: 68.7, shrublandPct: 27.1, builtupPct: 3.4, croplandPct: 0.4,  otherPct: 0.4 },
  { district: 'Ri Bhoi',                  evergreenForestPct: 85.3, shrublandPct: 8.0,  builtupPct: 4.7, croplandPct: 1.3,  otherPct: 0.7 },
  { district: 'North Garo Hills',         evergreenForestPct: 84.9, shrublandPct: 4.8,  builtupPct: 6.3, croplandPct: 3.6,  otherPct: 0.4 },
  { district: 'East Garo Hills',          evergreenForestPct: 91.8, shrublandPct: 3.8,  builtupPct: 3.3, croplandPct: 0.7,  otherPct: 0.4 },
  { district: 'West Garo Hills',          evergreenForestPct: 85.1, shrublandPct: 3.1,  builtupPct: 4.9, croplandPct: 6.4,  otherPct: 0.5 },
  { district: 'South Garo Hills',         evergreenForestPct: 92.7, shrublandPct: 2.2,  builtupPct: 2.3, croplandPct: 1.9,  otherPct: 0.9 },
  { district: 'South West Garo Hills',    evergreenForestPct: 79.3, shrublandPct: 2.4,  builtupPct: 4.1, croplandPct: 13.7, otherPct: 0.5 },
];
