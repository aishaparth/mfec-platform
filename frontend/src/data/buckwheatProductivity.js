// Synthetic data — replace with real KoboToolbox export when available
// Source: Final_Report_Buckwheat_v9.0_22_06_2026 · n=55 current farmers
// When real data arrives: update yieldBands, cropLoss, seedSources with actual survey data

// Yield distribution — number of farmers per harvest band
export const yieldBands = [
  { band: '<5 kg',     farmers: 4,  pct: 7.3,  label: 'Negligible',   color: '#EF4444' },
  { band: '5–10 kg',  farmers: 9,  pct: 16.4, label: 'Below viable',  color: '#F97316' },
  { band: '10–20 kg', farmers: 18, pct: 32.7, label: 'Marginal',      color: '#FBBF24' },
  { band: '20–40 kg', farmers: 16, pct: 29.1, label: 'Viable',        color: '#84CC16' },
  { band: '40–80 kg', farmers: 6,  pct: 10.9, label: 'Good',          color: '#22C55E' },
  { band: '>80 kg',   farmers: 2,  pct: 3.6,  label: 'Excellent',     color: '#16A34A' },
];

// Crop loss incidence — farmers reporting loss by cause (n=55 current + 180 dropout)
export const cropLoss = [
  { cause: 'Unseasonal rain / hailstorm', farmers: 94, pct: 40.0, color: '#7C3AED' },
  { cause: 'Pest infestation',            farmers: 54, pct: 23.0, color: '#DC2626' },
  { cause: 'Drought / moisture stress',   farmers: 37, pct: 15.7, color: '#D97706' },
  { cause: 'Wild animal damage',          farmers: 29, pct: 12.3, color: '#059669' },
  { cause: 'Disease (fungal/bacterial)',  farmers: 21, pct: 8.9,  color: '#0891B2' },
  { cause: 'No significant loss',         farmers: 0,  pct: 0,    color: '#9CA3AF' },
];

// Seed source breakdown — where farmers get their seed
export const seedSources = [
  {
    source: 'Own saved seed (unimproved)',
    farmersPct: 62,
    color: '#92400E',
    risk: 'high',
    riskNote: 'Progressive genetic erosion over seasons — yield decline ~8% per season without varietal renewal',
  },
  {
    source: 'Neighbour / community exchange',
    farmersPct: 24,
    color: '#D97706',
    risk: 'medium',
    riskNote: 'Variable seed quality; disease transmission risk if source farm had infection',
  },
  {
    source: 'MFEC / government supply (improved)',
    farmersPct: 10,
    color: '#16A34A',
    risk: 'low',
    riskNote: 'Certified, improved varieties (VL-7, PRB-1). Yield potential 2–3× own-saved seed.',
  },
  {
    source: 'Purchased from market',
    farmersPct: 4,
    color: '#2563EB',
    risk: 'medium',
    riskNote: 'Unverified source; potential counterfeit or off-type seed',
  },
];

// Crop substitution — what farmers replaced buckwheat with
export const cropSubstitution = [
  { crop: 'Broom grass',          farmers: 61, pct: 33.9, color: '#16A34A' },
  { crop: 'Potato',               farmers: 47, pct: 26.1, color: '#D97706' },
  { crop: 'Maize',                farmers: 31, pct: 17.2, color: '#F59E0B' },
  { crop: 'Ginger',               farmers: 22, pct: 12.2, color: '#7C3AED' },
  { crop: 'Vegetables (mixed)',   farmers: 14, pct: 7.8,  color: '#059669' },
  { crop: 'Left field fallow',    farmers: 5,  pct: 2.8,  color: '#9CA3AF' },
];

// Productivity summary constants
export const PRODUCTIVITY_SUMMARY = {
  medianYield_kg: 12,
  meanYield_kg: 19.4,
  viableThreshold_kg: 30,    // below this, individual sale to trader is unviable
  farmersAboveViable: 8,     // of 55 active
  pctAboveViable: 14.5,
  improvedSeedYield_kg: 45,  // expected with MFEC improved variety + guidance
  ownSeedYield_kg: 12,       // typical own-saved seed without guidance
};