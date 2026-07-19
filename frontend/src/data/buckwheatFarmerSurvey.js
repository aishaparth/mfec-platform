// Synthetic data — replace with real KoboToolbox export when available
// Source: Final_Report_Buckwheat_v9.0_22_06_2026 · 55 current cultivator records
// Each record = one farmer. GPS coords are district-centroid ± small jitter.
// When real data arrives: replace with actual GPS coordinates and farmer attributes.
// Fields match KoboToolbox column names for direct substitution.

export const activeFarmerProfiles = [
  // West Khasi Hills (35 active farmers — largest bloc)
  { id: 'A001', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.561, lon: 91.480, area_ha: 0.32, yield_kg: 28, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'Trader',  pricePerKg: 38 },
  { id: 'A002', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.558, lon: 91.474, area_ha: 0.18, yield_kg: 16, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 30 },
  { id: 'A003', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.555, lon: 91.488, area_ha: 0.40, yield_kg: 42, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 45 },
  { id: 'A004', district: 'West Khasi Hills', block: 'Mawkyrwat',  lat: 25.278, lon: 91.448, area_ha: 0.25, yield_kg: 22, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 32 },
  { id: 'A005', district: 'West Khasi Hills', block: 'Mawkyrwat',  lat: 25.274, lon: 91.442, area_ha: 0.20, yield_kg: 18, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 28 },
  { id: 'A006', district: 'West Khasi Hills', block: 'Nongstoin',  lat: 25.522, lon: 91.270, area_ha: 0.28, yield_kg: 24, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'Trader',  pricePerKg: 40 },
  { id: 'A007', district: 'West Khasi Hills', block: 'Nongstoin',  lat: 25.516, lon: 91.264, area_ha: 0.15, yield_kg: 12, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Own use', pricePerKg: 0  },
  { id: 'A008', district: 'West Khasi Hills', block: 'Nongstoin',  lat: 25.524, lon: 91.278, area_ha: 0.35, yield_kg: 36, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 45 },
  { id: 'A009', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.564, lon: 91.468, area_ha: 0.22, yield_kg: 20, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 31 },
  { id: 'A010', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.549, lon: 91.476, area_ha: 0.30, yield_kg: 26, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 34 },
  { id: 'A011', district: 'West Khasi Hills', block: 'Mawkyrwat',  lat: 25.265, lon: 91.455, area_ha: 0.18, yield_kg: 16, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 29 },
  { id: 'A012', district: 'West Khasi Hills', block: 'Ranikor',    lat: 25.378, lon: 91.128, area_ha: 0.45, yield_kg: 48, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 46 },
  { id: 'A013', district: 'West Khasi Hills', block: 'Ranikor',    lat: 25.372, lon: 91.120, area_ha: 0.22, yield_kg: 20, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 33 },
  { id: 'A014', district: 'West Khasi Hills', block: 'Nongstoin',  lat: 25.519, lon: 91.258, area_ha: 0.28, yield_kg: 25, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 44 },
  { id: 'A015', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.552, lon: 91.492, area_ha: 0.16, yield_kg: 14, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 30 },
  { id: 'A016', district: 'West Khasi Hills', block: 'Mawkyrwat',  lat: 25.272, lon: 91.438, area_ha: 0.24, yield_kg: 22, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 32 },
  { id: 'A017', district: 'West Khasi Hills', block: 'Rambrai Jyrngam', lat: 25.610, lon: 91.300, area_ha: 0.38, yield_kg: 38, seedSource: 'MFEC improved', hasGuidance: true, sellsTo: 'FPC', pricePerKg: 45 },
  { id: 'A018', district: 'West Khasi Hills', block: 'Rambrai Jyrngam', lat: 25.605, lon: 91.292, area_ha: 0.20, yield_kg: 18, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 28 },
  { id: 'A019', district: 'West Khasi Hills', block: 'Rambrai Jyrngam', lat: 25.614, lon: 91.308, area_ha: 0.26, yield_kg: 24, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 34 },
  { id: 'A020', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.556, lon: 91.482, area_ha: 0.32, yield_kg: 30, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 44 },
  { id: 'A021', district: 'West Khasi Hills', block: 'Mawkyrwat',  lat: 25.282, lon: 91.450, area_ha: 0.14, yield_kg: 11, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Own use', pricePerKg: 0  },
  { id: 'A022', district: 'West Khasi Hills', block: 'Nongstoin',  lat: 25.526, lon: 91.268, area_ha: 0.28, yield_kg: 25, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'Trader',  pricePerKg: 40 },
  { id: 'A023', district: 'West Khasi Hills', block: 'Ranikor',    lat: 25.370, lon: 91.126, area_ha: 0.20, yield_kg: 18, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 30 },
  { id: 'A024', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.560, lon: 91.470, area_ha: 0.36, yield_kg: 34, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 46 },
  { id: 'A025', district: 'West Khasi Hills', block: 'Mawkyrwat',  lat: 25.268, lon: 91.444, area_ha: 0.18, yield_kg: 16, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 31 },
  { id: 'A026', district: 'West Khasi Hills', block: 'Nongstoin',  lat: 25.518, lon: 91.274, area_ha: 0.22, yield_kg: 20, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 29 },
  { id: 'A027', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.554, lon: 91.486, area_ha: 0.28, yield_kg: 26, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 43 },
  { id: 'A028', district: 'West Khasi Hills', block: 'Ranikor',    lat: 25.376, lon: 91.122, area_ha: 0.16, yield_kg: 14, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 28 },
  { id: 'A029', district: 'West Khasi Hills', block: 'Mawkyrwat',  lat: 25.276, lon: 91.446, area_ha: 0.30, yield_kg: 28, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'Trader',  pricePerKg: 39 },
  { id: 'A030', district: 'West Khasi Hills', block: 'Nongstoin',  lat: 25.522, lon: 91.266, area_ha: 0.20, yield_kg: 18, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 30 },
  { id: 'A031', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.548, lon: 91.478, area_ha: 0.34, yield_kg: 32, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 44 },
  { id: 'A032', district: 'West Khasi Hills', block: 'Rambrai Jyrngam', lat: 25.608, lon: 91.298, area_ha: 0.22, yield_kg: 20, seedSource: 'Own saved', hasGuidance: false, sellsTo: 'Trader', pricePerKg: 32 },
  { id: 'A033', district: 'West Khasi Hills', block: 'Mawkyrwat',  lat: 25.270, lon: 91.440, area_ha: 0.24, yield_kg: 22, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 33 },
  { id: 'A034', district: 'West Khasi Hills', block: 'Mairang',    lat: 25.562, lon: 91.484, area_ha: 0.18, yield_kg: 16, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 28 },
  { id: 'A035', district: 'West Khasi Hills', block: 'Nongstoin',  lat: 25.520, lon: 91.272, area_ha: 0.28, yield_kg: 26, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 45 },

  // East Khasi Hills (14 active farmers)
  { id: 'A036', district: 'East Khasi Hills', block: 'Mawphlang', lat: 25.458, lon: 91.864, area_ha: 0.22, yield_kg: 20, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 44 },
  { id: 'A037', district: 'East Khasi Hills', block: 'Mawphlang', lat: 25.454, lon: 91.858, area_ha: 0.16, yield_kg: 14, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 29 },
  { id: 'A038', district: 'East Khasi Hills', block: 'Mylliem',   lat: 25.536, lon: 91.860, area_ha: 0.28, yield_kg: 26, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 45 },
  { id: 'A039', district: 'East Khasi Hills', block: 'Mylliem',   lat: 25.532, lon: 91.854, area_ha: 0.20, yield_kg: 18, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 32 },
  { id: 'A040', district: 'East Khasi Hills', block: 'Mawlai',    lat: 25.599, lon: 91.914, area_ha: 0.14, yield_kg: 12, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Own use', pricePerKg: 0  },
  { id: 'A041', district: 'East Khasi Hills', block: 'Mawlai',    lat: 25.595, lon: 91.906, area_ha: 0.30, yield_kg: 28, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 44 },
  { id: 'A042', district: 'East Khasi Hills', block: 'Sohra',     lat: 25.256, lon: 91.736, area_ha: 0.18, yield_kg: 16, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 31 },
  { id: 'A043', district: 'East Khasi Hills', block: 'Sohra',     lat: 25.252, lon: 91.730, area_ha: 0.24, yield_kg: 22, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 43 },
  { id: 'A044', district: 'East Khasi Hills', block: 'Mawsynram', lat: 25.300, lon: 91.584, area_ha: 0.20, yield_kg: 18, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 28 },
  { id: 'A045', district: 'East Khasi Hills', block: 'Mawsynram', lat: 25.296, lon: 91.580, area_ha: 0.34, yield_kg: 32, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 46 },
  { id: 'A046', district: 'East Khasi Hills', block: 'Mawphlang', lat: 25.460, lon: 91.866, area_ha: 0.22, yield_kg: 20, seedSource: 'Neighbour',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 33 },
  { id: 'A047', district: 'East Khasi Hills', block: 'Mylliem',   lat: 25.534, lon: 91.858, area_ha: 0.16, yield_kg: 14, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Local market', pricePerKg: 29 },
  { id: 'A048', district: 'East Khasi Hills', block: 'Mawlai',    lat: 25.597, lon: 91.910, area_ha: 0.26, yield_kg: 24, seedSource: 'MFEC improved', hasGuidance: true,  sellsTo: 'FPC',     pricePerKg: 44 },
  { id: 'A049', district: 'East Khasi Hills', block: 'Sohra',     lat: 25.254, lon: 91.732, area_ha: 0.18, yield_kg: 16, seedSource: 'Own saved',     hasGuidance: false, sellsTo: 'Trader',  pricePerKg: 30 },

  // West Jaintia Hills (4 active farmers)
  { id: 'A050', district: 'West Jaintia Hills', block: 'Thadlaskein', lat: 25.343, lon: 92.298, area_ha: 0.12, yield_kg: 10, seedSource: 'Own saved', hasGuidance: false, sellsTo: 'Local market', pricePerKg: 27 },
  { id: 'A051', district: 'West Jaintia Hills', block: 'Laskein',     lat: 25.415, lon: 92.365, area_ha: 0.16, yield_kg: 14, seedSource: 'Neighbour', hasGuidance: false, sellsTo: 'Trader',       pricePerKg: 30 },
  { id: 'A052', district: 'West Jaintia Hills', block: 'Saipung',     lat: 25.273, lon: 92.457, area_ha: 0.10, yield_kg: 8,  seedSource: 'Own saved', hasGuidance: false, sellsTo: 'Own use',      pricePerKg: 0  },
  { id: 'A053', district: 'West Jaintia Hills', block: 'Khliehriat',  lat: 25.222, lon: 92.524, area_ha: 0.14, yield_kg: 11, seedSource: 'Own saved', hasGuidance: false, sellsTo: 'Local market', pricePerKg: 26 },

  // South West Khasi Hills (2 active farmers)
  { id: 'A054', district: 'South West Khasi Hills', block: 'Mawkma', lat: 25.145, lon: 91.255, area_ha: 0.18, yield_kg: 15, seedSource: 'Own saved', hasGuidance: false, sellsTo: 'Local market', pricePerKg: 28 },
  { id: 'A055', district: 'South West Khasi Hills', block: 'Mawkma', lat: 25.150, lon: 91.260, area_ha: 0.22, yield_kg: 19, seedSource: 'Neighbour', hasGuidance: false, sellsTo: 'Trader',       pricePerKg: 31 },
];