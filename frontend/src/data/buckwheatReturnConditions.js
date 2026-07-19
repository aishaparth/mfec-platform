// Synthetic data — replace with real KoboToolbox export when available
// Source: Final_Report_Buckwheat_v9.0_22_06_2026 · n=153 revival-willing dropout farmers
// Multi-select question: "What conditions would bring you back to buckwheat cultivation?"
// count = number of farmers citing this condition (multiple selections allowed)

export const returnConditions = [
  {
    condition: 'Guaranteed buyer / assured offtake',
    count: 137,
    pct: 89.5,
    color: '#1B5E20',
    priority: 1,
  },
  {
    condition: 'On-farm technical guidance / extension visits',
    count: 128,
    pct: 83.7,
    color: '#2E7D32',
    priority: 1,
  },
  {
    condition: 'Processing and value-addition support (BRIC hub)',
    count: 119,
    pct: 77.8,
    color: '#388E3C',
    priority: 1,
  },
  {
    condition: 'Improved seed varieties (higher yield / climate resilient)',
    count: 104,
    pct: 68.0,
    color: '#558B2F',
    priority: 2,
  },
  {
    condition: 'Group farming / collective support structure',
    count: 91,
    pct: 59.5,
    color: '#33691E',
    priority: 2,
  },
  {
    condition: 'Crop insurance / weather risk cover',
    count: 82,
    pct: 53.6,
    color: '#827717',
    priority: 2,
  },
  {
    condition: 'Transport / road connectivity to market',
    count: 68,
    pct: 44.4,
    color: '#4E342E',
    priority: 3,
  },
  {
    condition: 'Formal contract / MoU with buyer organisation',
    count: 61,
    pct: 39.9,
    color: '#37474F',
    priority: 3,
  },
];

// Key insight derived from above
export const REVIVAL_INSIGHT = {
  topThree: ['Guaranteed buyer', 'Technical guidance', 'Processing support'],
  revivalWilling: 153,
  topConditionPct: 89.5,
  message: '89.5% of revival-ready farmers need buyer confirmation first — market linkage must precede all other interventions',
};