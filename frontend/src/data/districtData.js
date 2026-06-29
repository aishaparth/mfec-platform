// ── 12 Real Meghalaya Districts (from Districts_12 shapefile) ─────────────
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
//   season             – acquisition season label e.g. 'Rabi 2025'
//   sentinelDate       – Sentinel-2 image acquisition date e.g. 'Oct 2025'
//   prevSeasonNDVI     – NDVI from previous season (for trend comparison)
export const ndviData = [
  { district: 'East Khasi Hills',         ndvi: 0.71, ndviClass: 'Very High', ndwi: 0.22, moistureStress: 'None',   healthStatus: 'Excellent', anomalyFlag: false, buckwheatCoverHa: 8420, vegetationCoverPct: 71, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.68 },
  { district: 'West Khasi Hills',         ndvi: 0.74, ndviClass: 'Very High', ndwi: 0.28, moistureStress: 'None',   healthStatus: 'Excellent', anomalyFlag: false, buckwheatCoverHa: 5180, vegetationCoverPct: 74, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.70 },
  { district: 'West Jaintia Hills',       ndvi: 0.68, ndviClass: 'High',      ndwi: 0.20, moistureStress: 'Low',    healthStatus: 'Good',      anomalyFlag: false, buckwheatCoverHa: 4210, vegetationCoverPct: 68, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.65 },
  { district: 'South West Khasi Hills',   ndvi: 0.63, ndviClass: 'High',      ndwi: 0.16, moistureStress: 'Low',    healthStatus: 'Good',      anomalyFlag: false, buckwheatCoverHa: 1850, vegetationCoverPct: 63, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.61 },
  { district: 'Eastern West Khasi Hills', ndvi: 0.65, ndviClass: 'High',      ndwi: 0.18, moistureStress: 'Low',    healthStatus: 'Good',      anomalyFlag: false, buckwheatCoverHa: 2240, vegetationCoverPct: 65, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.62 },
  { district: 'East Jaintia Hills',       ndvi: 0.58, ndviClass: 'Medium',    ndwi: 0.12, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: false, buckwheatCoverHa: 1650, vegetationCoverPct: 58, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.60 },
  { district: 'Ri Bhoi',                  ndvi: 0.55, ndviClass: 'Medium',    ndwi: 0.10, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: true,  buckwheatCoverHa: 980,  vegetationCoverPct: 55, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.61 },
  { district: 'North Garo Hills',         ndvi: 0.60, ndviClass: 'Medium',    ndwi: 0.14, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: false, buckwheatCoverHa: 620,  vegetationCoverPct: 60, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.59 },
  { district: 'East Garo Hills',          ndvi: 0.53, ndviClass: 'Medium',    ndwi: 0.09, moistureStress: 'High',   healthStatus: 'Poor',      anomalyFlag: true,  buckwheatCoverHa: 480,  vegetationCoverPct: 53, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.59 },
  { district: 'West Garo Hills',          ndvi: 0.56, ndviClass: 'Medium',    ndwi: 0.11, moistureStress: 'Medium', healthStatus: 'Fair',      anomalyFlag: false, buckwheatCoverHa: 420,  vegetationCoverPct: 56, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.55 },
  { district: 'South Garo Hills',         ndvi: 0.51, ndviClass: 'Low',       ndwi: 0.07, moistureStress: 'High',   healthStatus: 'Poor',      anomalyFlag: true,  buckwheatCoverHa: 290,  vegetationCoverPct: 51, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.55 },
  { district: 'South West Garo Hills',    ndvi: 0.49, ndviClass: 'Low',       ndwi: 0.06, moistureStress: 'High',   healthStatus: 'Poor',      anomalyFlag: true,  buckwheatCoverHa: 210,  vegetationCoverPct: 49, season: 'Rabi 2025', sentinelDate: 'Oct 2025', prevSeasonNDVI: 0.52 },
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

// ── 46 Real Blocks (from Blocks_46 shapefile) ─────────────────────────────
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
  if (score >= 80) return '#1B5E20';
  if (score >= 65) return '#388E3C';
  if (score >= 50) return '#8BC34A';
  if (score >= 35) return '#FDD835';
  return '#E53935';
}
export function getSuitClass(score) {
  if (score >= 80) return 'High';
  if (score >= 65) return 'Medium-High';
  if (score >= 50) return 'Medium';
  if (score >= 35) return 'Low';
  return 'Very Low';
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
