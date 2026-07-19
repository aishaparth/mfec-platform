// Synthetic data — replace with real KoboToolbox export when available
// Source: Final_Report_Buckwheat_v9.0_22_06_2026 · block-level aggregations
// Key blocks with buckwheat presence; others have 0 active farmers
// When real data arrives: update activeFarmers, dropoutFarmers per block

export const buckwheatBlockLevel = [
  // East Khasi Hills
  { block: 'Mawlai',              district: 'East Khasi Hills',      activeFarmers: 3, dropoutFarmers: 4,  bricHub: 'H1' },
  { block: 'Mawphlang',          district: 'East Khasi Hills',      activeFarmers: 4, dropoutFarmers: 5,  bricHub: 'H1' },
  { block: 'Mylliem',            district: 'East Khasi Hills',      activeFarmers: 4, dropoutFarmers: 4,  bricHub: 'H1' },
  { block: 'Sohra (Cherrapunji)',district: 'East Khasi Hills',      activeFarmers: 2, dropoutFarmers: 3,  bricHub: 'H1' },
  { block: 'Mawsynram',          district: 'East Khasi Hills',      activeFarmers: 1, dropoutFarmers: 2,  bricHub: 'H1' },

  // West Khasi Hills
  { block: 'Mairang',            district: 'West Khasi Hills',      activeFarmers: 11, dropoutFarmers: 8, bricHub: 'H2' },
  { block: 'Mawkyrwat',         district: 'West Khasi Hills',      activeFarmers: 9,  dropoutFarmers: 6, bricHub: 'H2' },
  { block: 'Nongstoin',         district: 'West Khasi Hills',      activeFarmers: 8,  dropoutFarmers: 5, bricHub: 'H2' },
  { block: 'Ranikor',           district: 'West Khasi Hills',      activeFarmers: 4,  dropoutFarmers: 2, bricHub: 'H2' },
  { block: 'Rambrai Jyrngam',   district: 'West Khasi Hills',      activeFarmers: 3,  dropoutFarmers: 1, bricHub: 'H2' },

  // West Jaintia Hills
  { block: 'Thadlaskein',       district: 'West Jaintia Hills',    activeFarmers: 1, dropoutFarmers: 24, bricHub: 'H3' },
  { block: 'Laskein',           district: 'West Jaintia Hills',    activeFarmers: 1, dropoutFarmers: 19, bricHub: 'H3' },
  { block: 'Saipung',           district: 'West Jaintia Hills',    activeFarmers: 1, dropoutFarmers: 18, bricHub: 'H3' },
  { block: 'Khliehriat',        district: 'West Jaintia Hills',    activeFarmers: 1, dropoutFarmers: 13, bricHub: 'H3' },
  { block: 'Jowai',             district: 'West Jaintia Hills',    activeFarmers: 0, dropoutFarmers: 7,  bricHub: 'H3' },

  // South West Khasi Hills
  { block: 'Mawkma',            district: 'South West Khasi Hills', activeFarmers: 2, dropoutFarmers: 10, bricHub: null },
  { block: 'Mawkyrwat (SWKH)', district: 'South West Khasi Hills', activeFarmers: 0, dropoutFarmers: 8,  bricHub: null },

  // Eastern West Khasi Hills
  { block: 'Jirang',            district: 'Eastern West Khasi Hills', activeFarmers: 0, dropoutFarmers: 6, bricHub: null },
  { block: 'Umsning',           district: 'Eastern West Khasi Hills', activeFarmers: 0, dropoutFarmers: 5, bricHub: null },

  // East Jaintia Hills
  { block: 'Amlarem',           district: 'East Jaintia Hills',     activeFarmers: 0, dropoutFarmers: 5, bricHub: null },
  { block: 'Mynso',             district: 'East Jaintia Hills',     activeFarmers: 0, dropoutFarmers: 4, bricHub: null },

  // Ri Bhoi
  { block: 'Nongpoh',           district: 'Ri Bhoi',                activeFarmers: 0, dropoutFarmers: 4, bricHub: null },
  { block: 'Umsning (RB)',      district: 'Ri Bhoi',                activeFarmers: 0, dropoutFarmers: 4, bricHub: null },
];

// Summarised per-district lookup from block data (auto-derived)
export function getBlocksByDistrict(district) {
  return buckwheatBlockLevel.filter(b => b.district === district);
}

export function getBlocksByHub(hubId) {
  return buckwheatBlockLevel.filter(b => b.bricHub === hubId);
}