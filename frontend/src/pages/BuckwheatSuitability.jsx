import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import BuckwheatMap from '../components/BuckwheatMap';
import { getSuitColor, getSuitClass, getSuitBadgeStyle, demData, lulcData } from '../data/districtData';
import { farmerPoints, SEGMENT_META } from '../data/farmerData';
import { REVIVAL_INSIGHT } from '../data/buckwheatReturnConditions';
import { PRODUCTIVITY_SUMMARY } from '../data/buckwheatProductivity';
import { useData } from '../context/DataContext';

const SUITABILITY_LEGEND = [
  { color: '#1B5E20', label: 'High (86–100)' },
  { color: '#388E3C', label: 'Medium-High (66–85)' },
  { color: '#8BC34A', label: 'Medium (46–65)' },
  { color: '#FDD835', label: 'Low (26–45)' },
  { color: '#E53935', label: 'Very Low (<26)' },
];

const PIE_COLORS = ['#1B5E20', '#F9A825', '#E53935'];

const SCENARIO_META = {
  baseline: { label: 'Baseline',        sublabel: 'Current Climate',  color: '#1B5E20', bg: '#E8F5E9', description: 'WorldClim v2.1 · 1970–2000 normals',       meaning: 'What farmers experience today. The reference point all other scores are compared against.' },
  ssp126:   { label: 'SSP1-2.6 · 2050', sublabel: 'Low Emissions',    color: '#0277BD', bg: '#E1F5FE', description: '+1.5°C by 2050 · CMIP6 ensemble median',   meaning: 'Optimistic future — global emissions cut sharply. Closest to the Paris Agreement target.' },
  ssp585:   { label: 'SSP5-8.5 · 2050', sublabel: 'High Emissions',   color: '#C62828', bg: '#FFEBEE', description: '+2.8°C by 2050 · CMIP6 ensemble median',   meaning: 'Worst case — fossil fuel use continues unchecked. Shows the maximum climate stress on districts.' },
};

const BRIC_HUBS = [
  {
    id: 'H1', name: 'Shillong BRIC Hub', district: 'East Khasi Hills', type: 'primary',
    lat: 25.578, lon: 91.883,
    spokes: [
      { name: 'Mawlai',              lat: 25.597, lon: 91.910 },
      { name: 'Mawphlang',           lat: 25.456, lon: 91.861 },
      { name: 'Mylliem',             lat: 25.534, lon: 91.857 },
      { name: 'Sohra (Cherrapunji)', lat: 25.254, lon: 91.733 },
      { name: 'Mawsynram',           lat: 25.298, lon: 91.582 },
    ],
  },
  {
    id: 'H2', name: 'Nongstoin BRIC Hub', district: 'West Khasi Hills', type: 'secondary',
    lat: 25.519, lon: 91.266,
    spokes: [
      { name: 'Mairang',    lat: 25.553, lon: 91.470 },
      { name: 'Mawkyrwat', lat: 25.270, lon: 91.442 },
      { name: 'Ranikor',   lat: 25.374, lon: 91.123 },
    ],
  },
  {
    id: 'H3', name: 'Jowai BRIC Hub', district: 'West Jaintia Hills', type: 'secondary',
    lat: 25.450, lon: 92.201,
    spokes: [
      { name: 'Thadlaskein', lat: 25.341, lon: 92.295 },
      { name: 'Laskein',     lat: 25.413, lon: 92.362 },
      { name: 'Saipung',     lat: 25.271, lon: 92.454 },
      { name: 'Khliehriat',  lat: 25.220, lon: 92.521 },
    ],
  },
];

const DISTRICT_INTERVENTION = {
  'West Jaintia Hills':       { zone: 'revival-urgent', activeFarmers: 3,  dropoutFarmers: 81, revivalWilling: 69, action: 'Establish market linkage first → communicate guaranteed MSP → restart seed supply → SBCC trust-building', topBarriers: ['Low/unstable market price', 'Lack of buyer access', 'Market uncertainty'], seedIndex: 'Very Low', marketScore: 1, extScore: 1 },
  'East Khasi Hills':         { zone: 'revival',        activeFarmers: 4,  dropoutFarmers: 35, revivalWilling: 30, action: 'Deploy crop-stage technical visits → secure confirmed buyer linkage → ensure seed availability before next sowing', topBarriers: ['Lack of technical guidance', 'Market uncertainty', 'Seed unavailability'], seedIndex: 'Low', marketScore: 2, extScore: 1 },
  'West Khasi Hills':         { zone: 'consolidation',  activeFarmers: 35, dropoutFarmers: 10, revivalWilling: 8,  action: 'Strengthen seed continuity system → formalise buy-back → establish progressive farmer seed custodians', topBarriers: ['Seed continuity gaps', 'Market aggregation needed'], seedIndex: 'Medium', marketScore: 3, extScore: 3 },
  'Eastern West Khasi Hills': { zone: 'consolidation',  activeFarmers: 10, dropoutFarmers: 12, revivalWilling: 10, action: 'Scale up crop-stage guidance → establish cluster aggregation unit → add common drying support', topBarriers: ['Lack of technical guidance', 'Seed availability'], seedIndex: 'Medium', marketScore: 2, extScore: 2 },
  'Ri Bhoi':                  { zone: 'validate',       activeFarmers: 2,  dropoutFarmers: 15, revivalWilling: 12, action: 'Field-validate dropout reasons; pilot cluster only if suitability and willingness confirmed', topBarriers: ['Mixed barriers', 'Insufficient field data'], seedIndex: 'Unknown', marketScore: 1, extScore: 1 },
  'West Garo Hills':          { zone: 'validate',       activeFarmers: 0,  dropoutFarmers: 8,  revivalWilling: 6,  action: 'Assess connectivity and market access before any revival commitment', topBarriers: ['Market uncertainty', 'Distance to buyers'], seedIndex: 'Unknown', marketScore: 1, extScore: 1 },
  'East Jaintia Hills':       { zone: 'expand',         activeFarmers: 1,  dropoutFarmers: 5,  revivalWilling: 4,  action: 'Suitability-led expansion only; introduce complete seed + guidance + market package together', topBarriers: ['Limited programme reach'], seedIndex: 'Unknown', marketScore: 1, extScore: 1 },
  'South West Khasi Hills':   { zone: 'expand',         activeFarmers: 0,  dropoutFarmers: 5,  revivalWilling: 4,  action: 'High-suitability zone; do not introduce without confirmed buyer linkage in place first', topBarriers: ['No programme history'], seedIndex: 'Unknown', marketScore: 1, extScore: 1 },
  'North Garo Hills':         { zone: 'expand',         activeFarmers: 0,  dropoutFarmers: 2,  revivalWilling: 2,  action: 'Medium suitability; field validation needed before rollout', topBarriers: ['Limited programme reach'], seedIndex: 'Unknown', marketScore: 0, extScore: 0 },
  'East Garo Hills':          { zone: 'expand',         activeFarmers: 0,  dropoutFarmers: 2,  revivalWilling: 1,  action: 'Lower suitability; not a priority in current programme phase', topBarriers: ['Limited programme reach'], seedIndex: 'Unknown', marketScore: 0, extScore: 0 },
  'South Garo Hills':         { zone: 'expand',         activeFarmers: 0,  dropoutFarmers: 1,  revivalWilling: 1,  action: 'Low suitability; not recommended for current phase', topBarriers: ['Limited programme reach'], seedIndex: 'Unknown', marketScore: 0, extScore: 0 },
  'South West Garo Hills':    { zone: 'expand',         activeFarmers: 0,  dropoutFarmers: 1,  revivalWilling: 1,  action: 'Low suitability; not recommended for current phase', topBarriers: ['Limited programme reach'], seedIndex: 'Unknown', marketScore: 0, extScore: 0 },
};

const ZONE_META = {
  'revival-urgent': { label: 'Revival — Urgent',    color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA', desc: 'Highest dropout concentration; immediate multi-pronged intervention required' },
  'revival':        { label: 'Revival',             color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA', desc: 'Significant dropout; targeted seed + guidance + market package needed' },
  'consolidation':  { label: 'Consolidation',       color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', desc: 'Active farmers present; focus on retention, seed continuity and aggregation' },
  'validate':       { label: 'Field Validate',      color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', desc: 'Insufficient programme data; field-validate before committing resources' },
  'expand':         { label: 'Expansion Candidate', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', desc: 'Climate-suitable; only expand with complete seed + guidance + market package' },
};

const ZONE_LEGEND = [
  { color: '#B91C1C', label: 'Revival — Urgent' },
  { color: '#C2410C', label: 'Revival' },
  { color: '#1D4ED8', label: 'Consolidation' },
  { color: '#6B7280', label: 'Field Validate' },
  { color: '#15803D', label: 'Expansion Candidate' },
];

// ── Combined Priority Scoring ─────────────────────────────────────────────
// Land Suitability (MaxEnt baseline, 50%) + Programme Readiness (field survey, 50%)
const BASELINE_SUIT = {
  'East Khasi Hills': 87, 'West Khasi Hills': 82, 'West Jaintia Hills': 78,
  'South West Khasi Hills': 72, 'Eastern West Khasi Hills': 68, 'East Jaintia Hills': 65,
  'Ri Bhoi': 58, 'North Garo Hills': 48, 'East Garo Hills': 42,
  'West Garo Hills': 38, 'South Garo Hills': 35, 'South West Garo Hills': 32,
};

function getProgrammeScore(d) {
  // dropout willingness (40%) + active farmer presence (30%) + market+extension infra (30%)
  const revivalPct  = d.dropoutFarmers > 0 ? (d.revivalWilling / d.dropoutFarmers) * 100 : 0;
  const activeScore = Math.min((d.activeFarmers / 35) * 100, 100); // 35 = max active (West Khasi Hills)
  const infraScore  = ((d.marketScore + d.extScore) / 6) * 100;
  return Math.round(revivalPct * 0.4 + activeScore * 0.3 + infraScore * 0.3);
}

function getCombinedScore(districtName) {
  const suit = BASELINE_SUIT[districtName] ?? 0;
  const d    = DISTRICT_INTERVENTION[districtName];
  const prog = d ? getProgrammeScore(d) : 0;
  return { suit, prog, combined: Math.round(suit * 0.5 + prog * 0.5) };
}

function getPriorityTier(districtName) {
  const { combined } = getCombinedScore(districtName);
  if (combined >= 60) return 'p1';
  if (combined >= 45) return 'p2';
  return 'p3';
}

const PRIORITY_META = {
  p1: {
    label: 'Priority 1 — Invest Now',
    color: '#166534', bg: '#DCFCE7', border: '#86EFAC',
    desc: 'High return expected — land is suitable AND the farmer programme base is strong. Intervene in the current phase.',
  },
  p2: {
    label: 'Priority 2 — Prepare First',
    color: '#92400E', bg: '#FEF3C7', border: '#FCD34D',
    desc: 'Good suitability or programme potential, but critical gaps need closing before scaling. Build readiness now.',
  },
  p3: {
    label: 'Priority 3 — Hold',
    color: '#374151', bg: '#F3F4F6', border: '#D1D5DB',
    desc: 'Low suitability and/or very weak programme base. Investment in this phase is not recommended — revisit in 2–3 years.',
  },
};

const PRIORITY_LEGEND = [
  { color: '#166534', label: 'Priority 1 — Invest Now' },
  { color: '#92400E', label: 'Priority 2 — Prepare First' },
  { color: '#374151', label: 'Priority 3 — Hold' },
];

const PAGE_TABS = [
  { key: 'suitability', label: '🗺 Suitability Scenarios' },
  { key: 'farmers',     label: '👨‍🌾 Farmer Survey' },
  { key: 'bric',        label: '🏗 BRIC Infrastructure' },
];

function buildBuckwheatReportHTML(suitabilityData, scenarioScores) {
  const rows = suitabilityData
    .map(d => ({ ...d, baseline: scenarioScores.baseline[d.district] ?? 0, ssp126: scenarioScores.ssp126[d.district] ?? 0, ssp585: scenarioScores.ssp585[d.district] ?? 0 }))
    .sort((a, b) => b.baseline - a.baseline);

  const distRows = rows.map((d, i) => {
    const delta126 = d.ssp126 - d.baseline;
    const delta585 = d.ssp585 - d.baseline;
    const clr126 = delta126 < 0 ? '#C62828' : '#2E7D32';
    const clr585 = delta585 < 0 ? '#C62828' : '#2E7D32';
    return `<tr>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-weight:600">${i + 1}. ${d.district}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:${getSuitColor(d.baseline)}">${d.baseline}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#0277BD">${d.ssp126} <span style="font-size:0.75em;color:${clr126}">(${delta126 >= 0 ? '+' : ''}${delta126})</span></td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#C62828">${d.ssp585} <span style="font-size:0.75em;color:${clr585}">(${delta585 >= 0 ? '+' : ''}${delta585})</span></td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:0.8em;color:${getSuitColor(d.baseline)}">${getSuitClass(d.baseline)}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${d.aucScore.toFixed(3)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><title>Buckwheat Suitability Report — MFEC / DSAI</title>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:13px;color:#1F2937;padding:32px}
    h1{font-size:1.8rem;color:#1B5E20;margin-bottom:4px}
    h2{font-size:1.1rem;color:#166534;margin:20px 0 8px;border-bottom:2px solid #D1FAE5;padding-bottom:5px}
    .meta{font-size:0.78rem;color:#6B7280;margin-bottom:24px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
    .kpi{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;text-align:center}
    .kpi .num{font-size:1.6rem;font-weight:800;color:#1B5E20}
    .kpi .lbl{font-size:0.68rem;text-transform:uppercase;color:#6B7280;margin-top:3px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    th{background:#1B5E20;color:#fff;padding:8px 10px;font-size:0.78rem;text-align:left}
    th:not(:first-child){text-align:center}
    .drivers{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
    .driver{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:12px;text-align:center}
    .driver .pct{font-size:1.4rem;font-weight:800;color:#1E40AF}
    .insight{border:1px solid #E5E7EB;border-radius:8px;padding:14px 16px;margin-bottom:12px}
    .insight .urgency{font-size:0.68rem;font-weight:700;text-transform:uppercase;margin-bottom:6px}
    .insight .headline{font-size:0.95rem;font-weight:700;color:#1F2937;margin-bottom:8px}
    .insight .action{background:#F0FDF4;border-left:3px solid #166534;padding:8px 12px;font-size:0.82rem;color:#166534;margin-top:8px}
    .note{font-size:0.72rem;color:#6B7280;margin-top:4px;font-style:italic}
    @media print{body{padding:16px}}
  </style>
  </head><body>
  <h1>Buckwheat Habitat Suitability — Meghalaya</h1>
  <div class="meta">MFEC / DSAI Platform · MaxEnt Climate Model (AUC 0.992) · Generated ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>

  <h2>Model Performance Summary</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="num">0.992</div><div class="lbl">Overall AUC</div></div>
    <div class="kpi"><div class="num">87/100</div><div class="lbl">#1 East Khasi Hills</div></div>
    <div class="kpi"><div class="num">4</div><div class="lbl">High-Suitability Districts</div></div>
    <div class="kpi"><div class="num">22,429 km²</div><div class="lbl">Total Suitable Area</div></div>
  </div>

  <h2>Key Climate Drivers (MaxEnt Variable Importance)</h2>
  <div class="drivers">
    <div class="driver"><div class="pct">55.7%</div><div class="lbl" style="font-size:0.7rem;color:#1F2937;margin-top:4px">Rainfall, Wettest Month (BIO13)</div></div>
    <div class="driver"><div class="pct">21.5%</div><div class="lbl" style="font-size:0.7rem;color:#1F2937;margin-top:4px">Temp, Dry Quarter (BIO9)</div></div>
    <div class="driver"><div class="pct">14.7%</div><div class="lbl" style="font-size:0.7rem;color:#1F2937;margin-top:4px">Temp, Wet Quarter (BIO8)</div></div>
  </div>
  <p class="note">Remaining 8.1% across BIO1–BIO19 · BIO codes are WorldClim standard bioclimatic variables (e.g. BIO1 = Annual Mean Temp · BIO12 = Annual Precipitation · BIO13 = Precip of Wettest Month · BIO9 = Mean Temp of Driest Quarter) · Source: MaxEnt permutation importance</p>

  <h2>District Suitability Rankings — All Scenarios</h2>
  <p style="font-size:0.78rem;color:#374151;margin-bottom:10px;line-height:1.7;padding:8px 12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px">
    <strong style="color:#1B5E20">Baseline</strong> — current climate conditions (1970–2000 average) · what buckwheat farmers experience today. &nbsp;
    <strong style="color:#0277BD">SSP1-2.6</strong> — optimistic: emissions cut sharply, warming stays near +1.5°C by 2050 (Paris Agreement target). &nbsp;
    <strong style="color:#C62828">SSP5-8.5</strong> — worst case: fossil fuel use continues, warming reaches +2.8°C by 2050. &nbsp;
    SSP = Shared Socioeconomic Pathway (IPCC standardised global climate scenario).
  </p>
  <table>
    <thead><tr>
      <th>District</th><th>Baseline (Current)</th><th>SSP1-2.6 · 2050 (Low)</th>
      <th>SSP5-8.5 · 2050 (High)</th><th>Suitability Class</th><th>LODO AUC</th>
    </tr></thead>
    <tbody>${distRows}</tbody>
  </table>
  <p class="note">Scores are MaxEnt suitability index (0–100) · Climate-only model · LODO = Leave-One-District-Out cross-validation</p>

  <h2>Actionable Insights for Programme Officials</h2>
  <div class="insight" style="border-color:#FECACA">
    <div class="urgency" style="color:#B91C1C">ACT THIS SEASON — Anchor District</div>
    <div class="headline">East Khasi Hills is your safest investment — it remains viable across all climate scenarios</div>
    <p style="font-size:0.82rem;color:#374151;margin-bottom:4px">Score 87/100 (current) · Stays viable at 71/100 even under worst-case SSP5-8.5 · Highest per-district LODO AUC in the state</p>
    <div class="action">Launch all buckwheat programme activities first in East Khasi Hills. Use it as the demonstration hub before expanding to other districts.</div>
  </div>
  <div class="insight" style="border-color:#FCD34D">
    <div class="urgency" style="color:#92400E">CLIMATE RISK — Plan Now</div>
    <div class="headline">Under worst-case climate (SSP5-8.5): 7 of 12 districts fall below viable threshold (46/100)</div>
    <p style="font-size:0.82rem;color:#374151;margin-bottom:4px">Garo Hills districts: 14–28 under SSP5-8.5 (effectively unviable by 2050) · Even SSP1-2.6 causes avg −5 pt drop</p>
    <div class="action">Restrict long-term infrastructure investment to the 3 districts that remain High or Medium-High under all scenarios: East Khasi Hills, West Khasi Hills, West Jaintia Hills.</div>
  </div>
  <div class="insight" style="border-color:#BFDBFE">
    <div class="urgency" style="color:#1565C0">KEY DRIVER — Protect Watersheds</div>
    <div class="headline">Rainfall in wettest month (55.7% of model weight) is the single biggest suitability driver</div>
    <p style="font-size:0.82rem;color:#374151;margin-bottom:4px">West Khasi Hills: 3,200mm annual rainfall — natural advantage · Watershed integrity determines buckwheat viability</p>
    <div class="action">Integrate watershed conservation and water retention into the programme plan for West and East Khasi Hills — rainfall variability is the biggest suitability risk factor.</div>
  </div>

  <h2>Suitability Class Reference</h2>
  <table>
    <thead><tr><th>Class</th><th>Score Range</th><th>Interpretation</th></tr></thead>
    <tbody>
      <tr><td style="padding:6px 10px;background:#E8F5E9;color:#1B5E20;font-weight:700">High</td><td style="padding:6px 10px;text-align:center;border-bottom:1px solid #e5e7eb">86–100</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">Optimal bioclimatic conditions. Programme investment strongly recommended.</td></tr>
      <tr><td style="padding:6px 10px;background:#F1F8E9;color:#388E3C;font-weight:700">Medium-High</td><td style="padding:6px 10px;text-align:center;border-bottom:1px solid #e5e7eb">66–85</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">Good conditions. Suitable for expansion with full support package.</td></tr>
      <tr><td style="padding:6px 10px;background:#F9FBE7;color:#8BC34A;font-weight:700">Medium</td><td style="padding:6px 10px;text-align:center;border-bottom:1px solid #e5e7eb">46–65</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">Marginal. Field validation required before programme commitment.</td></tr>
      <tr><td style="padding:6px 10px;background:#FFF8E1;color:#E65100;font-weight:700">Low</td><td style="padding:6px 10px;text-align:center;border-bottom:1px solid #e5e7eb">26–45</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">Suboptimal. Not recommended for current programme phase.</td></tr>
      <tr><td style="padding:6px 10px;background:#FFEBEE;color:#C62828;font-weight:700">Very Low</td><td style="padding:6px 10px;text-align:center">0–25</td><td style="padding:6px 10px">Unsuitable. Investment not recommended.</td></tr>
    </tbody>
  </table>
  <p class="note">AUC: model discrimination ability. AUC &gt; 0.9 = Excellent. Values above 0.99 indicate very high predictive accuracy. LODO AUC = spatial leave-one-district-out cross-validation score per district.</p>
  </body></html>`;
}

function downloadBuckwheatReport(suitabilityData, scenarioScores) {
  const html = buildBuckwheatReportHTML(suitabilityData, scenarioScores);
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400);
    });
  }
}

function buildFarmerReportHTML() {
  const allDistricts = ['p1', 'p2', 'p3'].flatMap(tier =>
    Object.keys(DISTRICT_INTERVENTION)
      .filter(n => getPriorityTier(n) === tier)
      .map(n => {
        const cs = getCombinedScore(n);
        const d  = DISTRICT_INTERVENTION[n];
        const revPct = d.dropoutFarmers > 0 ? Math.round((d.revivalWilling / d.dropoutFarmers) * 100) : 0;
        return { name: n, tier, ...cs, ...d, revPct };
      })
      .sort((a, b) => b.combined - a.combined)
  );

  const tierMeta = {
    p1: { label: 'P1 — Invest Now',    color: '#166534', bg: '#DCFCE7' },
    p2: { label: 'P2 — Prepare First', color: '#92400E', bg: '#FEF3C7' },
    p3: { label: 'P3 — Hold',          color: '#374151', bg: '#F3F4F6' },
  };

  const distRows = allDistricts.map(d => `<tr>
    <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-weight:600">${d.name}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:0.75em;font-weight:700;color:${tierMeta[d.tier].color};background:${tierMeta[d.tier].bg}">${tierMeta[d.tier].label}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#166534">${d.suit}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#92400E">${d.prog}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:${tierMeta[d.tier].color}">${d.combined}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${d.activeFarmers}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#C62828;font-weight:600">${d.dropoutFarmers}</td>
    <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#1565C0;font-weight:700">${d.revivalWilling} (${d.revPct}%)</td>
  </tr>`).join('');

  return `<!DOCTYPE html><html><head><title>Farmer Survey Report — MFEC / DSAI</title>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:13px;color:#1F2937;padding:32px}
    h1{font-size:1.8rem;color:#1B5E20;margin-bottom:4px}
    h2{font-size:1.1rem;color:#166534;margin:20px 0 8px;border-bottom:2px solid #D1FAE5;padding-bottom:5px}
    .meta{font-size:0.78rem;color:#6B7280;margin-bottom:24px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
    .kpi{border-radius:8px;padding:14px;text-align:center}
    .kpi .num{font-size:1.8rem;font-weight:800}
    .kpi .lbl{font-size:0.68rem;text-transform:uppercase;color:#555;margin-top:3px;font-weight:600}
    .kpi .sub{font-size:0.65rem;color:#888;margin-top:2px}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    th{background:#1B5E20;color:#fff;padding:8px 10px;font-size:0.78rem;text-align:left}
    th:not(:first-child){text-align:center}
    .insight{border-radius:8px;padding:14px 16px;margin-bottom:12px;border-left:4px solid}
    .insight .urgency{font-size:0.65rem;font-weight:700;text-transform:uppercase;margin-bottom:6px}
    .insight .headline{font-size:0.95rem;font-weight:700;margin-bottom:6px}
    .insight .action{padding:8px 12px;border-radius:6px;font-size:0.82rem;margin-top:8px}
    .note{font-size:0.72rem;color:#6B7280;margin-top:4px;font-style:italic}
    @media print{body{padding:16px}}
  </style>
  </head><body>
  <h1>Buckwheat Farmer Survey — Meghalaya</h1>
  <div class="meta">MFEC / DSAI Platform · Field Survey · 235 Respondents across 12 Districts · June 2026</div>

  <h2>Programme Health Summary</h2>
  <div class="kpi-grid">
    <div class="kpi" style="background:#FEE2E2"><div class="num" style="color:#B91C1C">76.6%</div><div class="lbl">Dropout Rate</div><div class="sub">180 of 235 farmers discontinued</div></div>
    <div class="kpi" style="background:#DCFCE7"><div class="num" style="color:#166534">85%</div><div class="lbl">Will Return</div><div class="sub">153 of 180 dropouts — right conditions</div></div>
    <div class="kpi" style="background:#FEF9C3"><div class="num" style="color:#854D0E">12 kg</div><div class="lbl">Median Harvest</div><div class="sub">Too small to sell individually</div></div>
    <div class="kpi" style="background:#DBEAFE"><div class="num" style="color:#1E40AF">141</div><div class="lbl">Cited No Guidance</div><div class="sub">#1 dropout reason (of 180)</div></div>
  </div>
  <p class="note">Dropout = farmer who grew buckwheat in a prior season but did not continue. Revival = dropout who expressed willingness to return under the right conditions.</p>

  <h2>Actionable Insights for Programme Officials</h2>
  <div class="insight" style="background:#FEF2F2;border-color:#EF4444">
    <div class="urgency" style="color:#B91C1C">ACT THIS WEEK</div>
    <div class="headline" style="color:#1F2937">153 farmers are ready to return — but only if buyers are confirmed first</div>
    <p style="font-size:0.82rem;color:#374151">West Jaintia Hills: 81 dropouts, 69 willing to return (85%). #1 barrier: no guaranteed buyer. Without buyer confirmation, revival cannot begin.</p>
    <div class="action" style="background:#FEE2E2;color:#B91C1C">Secure committed buyers and communicate guaranteed MSP before restarting seed supply or any training programme — this is the single highest-leverage action available.</div>
  </div>
  <div class="insight" style="background:#FFFBEB;border-color:#F59E0B">
    <div class="urgency" style="color:#92400E">FIX THE TOP BARRIER — THIS SEASON</div>
    <div class="headline" style="color:#1F2937">Technical guidance is the #1 cited dropout reason — 141 of 180 farmers named it</div>
    <p style="font-size:0.82rem;color:#374151">Median harvest of 12 kg is too small to sell individually. Technical guidance directly increases yield — without it, dropout continues even after revival.</p>
    <div class="action" style="background:#FEF3C7;color:#92400E">Deploy crop-stage technical extension visits in all 4 Priority 1 districts simultaneously with seed distribution — never supply seeds without on-farm guidance.</div>
  </div>
  <div class="insight" style="background:#EFF6FF;border-color:#3B82F6">
    <div class="urgency" style="color:#1D4ED8">PROTECT WHAT WORKS</div>
    <div class="headline" style="color:#1F2937">West Khasi Hills is the only district with a self-sustaining programme base — it must not be neglected</div>
    <p style="font-size:0.82rem;color:#374151">35 active farmers — the largest active group in the state. Medium seed continuity index. Risk: if buy-back is not formalised, these farmers will also drop out.</p>
    <div class="action" style="background:#DBEAFE;color:#1D4ED8">Formalise buy-back agreements and establish progressive farmer seed custodians in West Khasi Hills before this season's sowing window (Oct–Nov 2026).</div>
  </div>

  <h2>District Priority Rankings — All 12 Districts</h2>
  <table>
    <thead><tr>
      <th>District</th><th>Priority Tier</th>
      <th>Suitability (50%)</th><th>Programme (50%)</th><th>Combined Score</th>
      <th>Active</th><th>Dropouts</th><th>Will Return</th>
    </tr></thead>
    <tbody>${distRows}</tbody>
  </table>
  <p class="note">Combined Score = Land Suitability (MaxEnt baseline, 50%) + Programme Readiness (field survey, 50%). Programme Readiness = dropout willingness (40%) + active farmer base (30%) + market &amp; extension infrastructure (30%). P1 ≥ 60 · P2 = 45–59 · P3 &lt; 45.</p>

  <h2>Score Reference</h2>
  <p style="font-size:0.82rem;color:#374151;line-height:1.7">
    <strong>Land Suitability:</strong> MaxEnt climate model score (0–100) — higher = better natural growing conditions. Based on 19 WorldClim bioclimatic variables.<br>
    <strong>Programme Readiness:</strong> Field-survey score (0–100) — reflects how ready the farmer base and infrastructure are to support programme expansion.<br>
    <strong>Combined Score:</strong> Equal-weighted average. Districts scoring ≥60 have both good land AND a programme-ready farmer base — these are the safest investments.
  </p>
  </body></html>`;
}

function downloadFarmerReport() {
  const html = buildFarmerReportHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400);
    });
  }
}

function buildBRICReportHTML() {
  const hubRows = BRIC_HUBS.map(hub => {
    const suit = BASELINE_SUIT[hub.district] ?? 0;
    const spokeList = hub.spokes.map(s => s.name).join(', ');
    const facility  = hub.type === 'primary' ? 'Processing + Cold Storage + Training Centre' : 'Aggregation Point + Cold Storage';
    const phase     = hub.type === 'primary' ? 'Phase 1 — activate immediately' : 'Phase 2 — begin feasibility now';
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#1B5E20">${hub.name}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb">${hub.district}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${hub.type === 'primary' ? '#1B5E20' : '#558B2F'}">${hub.type === 'primary' ? 'Primary' : 'Secondary'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#166534">${suit}/100</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${hub.spokes.length}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:0.8em;color:#374151">${spokeList}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:0.8em;color:#374151">${facility}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:0.8em;font-weight:600;color:${hub.type === 'primary' ? '#B91C1C' : '#0277BD'}">${phase}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><title>BRIC Infrastructure Report — MFEC / DSAI</title>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:13px;color:#1F2937;padding:32px}
    h1{font-size:1.8rem;color:#1B5E20;margin-bottom:4px}
    h2{font-size:1.1rem;color:#166534;margin:20px 0 8px;border-bottom:2px solid #D1FAE5;padding-bottom:5px}
    .meta{font-size:0.78rem;color:#6B7280;margin-bottom:24px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
    .kpi{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;text-align:center}
    .kpi .num{font-size:1.6rem;font-weight:800;color:#1B5E20}
    .kpi .lbl{font-size:0.68rem;text-transform:uppercase;color:#6B7280;margin-top:3px}
    .kpi .sub{font-size:0.65rem;color:#888;margin-top:2px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    th{background:#1B5E20;color:#fff;padding:8px 10px;font-size:0.78rem;text-align:left}
    .insight{border-radius:8px;padding:14px 16px;margin-bottom:12px;border-left:4px solid}
    .insight .urgency{font-size:0.65rem;font-weight:700;text-transform:uppercase;margin-bottom:5px}
    .insight .headline{font-size:0.95rem;font-weight:700;margin-bottom:6px}
    .insight .action{padding:8px 12px;border-radius:6px;font-size:0.82rem;margin-top:8px}
    .flow{display:flex;align-items:center;gap:0;margin:12px 0 20px;border:1px solid #D1FAE5;border-radius:8px;overflow:hidden}
    .flow-step{flex:1;padding:10px 8px;text-align:center;font-size:0.78rem;font-weight:700}
    .flow-arrow{font-size:1.1rem;color:#6B7280;flex-shrink:0}
    .note{font-size:0.72rem;color:#6B7280;margin-top:8px;font-style:italic}
    @media print{body{padding:16px}}
  </style></head><body>
  <h1>BRIC Hub & Spoke Infrastructure — Meghalaya Buckwheat Programme</h1>
  <div class="meta">MFEC / DSAI Platform · Proposed Infrastructure · Generated ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>

  <h2>Network Summary</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="num">3</div><div class="lbl">BRIC Hubs</div><div class="sub">1 Primary · 2 Secondary</div></div>
    <div class="kpi"><div class="num">12</div><div class="lbl">Collection Spokes</div><div class="sub">Across 3 anchor districts</div></div>
    <div class="kpi"><div class="num">82/100</div><div class="lbl">Avg Hub Suitability</div><div class="sub">EKH 87 · WKH 82 · WJH 78</div></div>
    <div class="kpi" style="background:#FEF9C3;border-color:#FCD34D"><div class="num" style="color:#92400E">Proposed</div><div class="lbl">Current Status</div><div class="sub">Subject to stakeholder validation</div></div>
  </div>

  <h2>Supply Chain Flow</h2>
  <div class="flow">
    <div class="flow-step" style="background:#E8F5E9;color:#1B5E20">🌾 Farmer<br/>Collection Point</div>
    <div class="flow-arrow">→</div>
    <div class="flow-step" style="background:#D1FAE5;color:#166534">📦 Spoke<br/>Aggregation</div>
    <div class="flow-arrow">→</div>
    <div class="flow-step" style="background:#A7F3D0;color:#065F46">🏭 BRIC Hub<br/>Processing</div>
    <div class="flow-arrow">→</div>
    <div class="flow-step" style="background:#6EE7B7;color:#064E3B">🧊 Cold<br/>Storage</div>
    <div class="flow-arrow">→</div>
    <div class="flow-step" style="background:#34D399;color:#fff">🛒 Market<br/>/ Buyer</div>
  </div>
  <p class="note">Spokes collect produce from individual farmers and carry it to the BRIC Hub, which handles primary processing (cleaning, grading, packaging) and cold storage before onward sale to buyers.</p>

  <h2>Actionable Insights for Programme Officials</h2>
  <div class="insight" style="background:#FFF7ED;border-color:#F97316">
    <div class="urgency" style="color:#C2410C">IMMEDIATE ACTION</div>
    <div class="headline" style="color:#1F2937">Activate Shillong BRIC Hub (H1) first — all programme throughput depends on it</div>
    <p style="font-size:0.82rem;color:#374151">East Khasi Hills is the highest-suitability district (87/100) with 4 active farmers and 35 dropout-willing farmers. H1 is the only Primary Hub and handles processing for the entire network. H2 and H3 cannot function without H1 operational.</p>
    <div class="action" style="background:#FEF3C7;color:#92400E">Initiate land identification and civil works tender for H1 immediately. Target operational date: Kharif 2027 season.</div>
  </div>
  <div class="insight" style="background:#EFF6FF;border-color:#3B82F6">
    <div class="urgency" style="color:#1D4ED8">PLAN NOW — ACTIVATE IN 12–18 MONTHS</div>
    <div class="headline" style="color:#1F2937">Begin feasibility studies for H2 (Nongstoin) and H3 (Jowai) in parallel with H1 construction</div>
    <p style="font-size:0.82rem;color:#374151">West Khasi Hills (82/100) and West Jaintia Hills (78/100) are both strong suitability districts. H2 serves 3 spokes across W. Khasi Hills; H3 serves 4 spokes in W. Jaintia Hills. Both districts remain Medium-High even under SSP5-8.5.</p>
    <div class="action" style="background:#DBEAFE;color:#1D4ED8">Commission feasibility assessments for H2 and H3 now. Time activation to coincide with 12–18 months after H1 is operational.</div>
  </div>
  <div class="insight" style="background:#F0FDF4;border-color:#22C55E">
    <div class="urgency" style="color:#166534">LONG-TERM PLANNING</div>
    <div class="headline" style="color:#1F2937">No new hubs in Garo Hills — infrastructure ROI is negative under all future climate scenarios</div>
    <p style="font-size:0.82rem;color:#374151">All Garo Hills districts score 14–48 under SSP5-8.5 (worst-case 2050). Even under SSP1-2.6, most fall below the 46-point viable threshold. Any fixed BRIC infrastructure built there within the next 5 years risks being stranded within 20 years of completion.</p>
    <div class="action" style="background:#DCFCE7;color:#166534">Redirect Garo Hills budget to mobile aggregation units (not permanent infrastructure). Revisit with updated climate data in 2029.</div>
  </div>

  <h2>Hub & Spoke Reference Table</h2>
  <table>
    <thead><tr>
      <th>Hub Name</th><th>District</th><th>Type</th><th>Suitability</th><th>Spokes</th><th>Collection Points</th><th>Facility</th><th>Phase</th>
    </tr></thead>
    <tbody>${hubRows}</tbody>
  </table>
  <p class="note">Suitability = MaxEnt Baseline score (0–100) for hub's district. Hub placement is proposed and subject to stakeholder validation and feasibility assessment.</p>
  </body></html>`;
}

function downloadBRICReport() {
  const html = buildBRICReportHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400);
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function terrainClassStyle(cls) {
  if (cls === 'Optimal')    return { background: '#E8F5E9', color: '#1B5E20', border: '1px solid #A5D6A7' };
  if (cls === 'Good')       return { background: '#E3F2FD', color: '#0D47A1', border: '1px solid #90CAF9' };
  if (cls === 'Marginal')   return { background: '#FFF8E1', color: '#E65100', border: '1px solid #FFD54F' };
  return { background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' };
}

// Ray-casting point-in-polygon test; works with GeoJSON Polygon and MultiPolygon
function pip([lng, lat], geometry) {
  const rings = geometry.type === 'MultiPolygon'
    ? geometry.coordinates.flat(1)
    : geometry.coordinates;
  let inside = false;
  for (const ring of rings) {
    let j = ring.length - 1;
    for (let i = 0; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
  }
  return inside;
}

export default function BuckwheatSuitability() {
  const {
    suitabilityData, dropoutReasons, returnConditions, yieldBands,
    seedSources, cropSubstitution, PROGRAMME_TOTALS, scenarioScores,
  } = useData();
  const [pageTab, setPageTab]           = useState('suitability');
  const [scenario, setScenario]         = useState('baseline');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [farmerDistrict, setFarmerDistrict] = useState(null);
  const [districtsGeo, setDistrictsGeo] = useState(null);
  const [mapMode, setMapMode] = useState('farmers');
  const [showBioCodes, setShowBioCodes] = useState(false);

  useEffect(() => {
    fetch('/geojson/districts.json').then(r => r.json()).then(setDistrictsGeo).catch(console.error);
  }, []);

  const activeScenarioScores = scenarioScores[scenario];
  const scenarioMeta   = SCENARIO_META[scenario];

  const sorted = suitabilityData
    .map(d => ({ ...d, score: activeScenarioScores[d.district] ?? d.buckwheat }))
    .sort((a, b) => b.score - a.score);

  const selected = selectedDistrict ? sorted.find(d => d.district === selectedDistrict) : null;

  const colorFn = feature => {
    const score = activeScenarioScores[feature.properties.district];
    return score != null ? getSuitColor(score) : '#ccc';
  };

  const popupFn = feature => {
    const p     = feature.properties;
    const score = activeScenarioScores[p.district] ?? 0;
    const base  = scenarioScores.baseline[p.district] ?? score;
    const delta = score - base;
    const deltaStr = scenario === 'baseline' ? '' : ` (${delta >= 0 ? '+' : ''}${delta} vs baseline)`;
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq || ''} · ${scenarioMeta.label}</p>
        <div class="popup-row"><span class="popup-label">Score</span><span class="popup-val" style="color:${getSuitColor(score)}">${score}/100${deltaStr}</span></div>
        <div class="popup-row"><span class="popup-label">Classification</span><span class="popup-val">${getSuitClass(score)} Suitability</span></div>
        <div class="popup-row"><span class="popup-label">Model AUC</span><span class="popup-val" style="color:#1B5E20;font-weight:700">0.992</span></div>
        <p style="font-size:0.68rem;color:#888;margin-top:6px">Climate-only · terrain/soil integration pending</p>
      </div>`;
  };

  const farmerColorFn = feature => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    return d ? getSuitColor(d.buckwheat) : '#ddd';
  };

  const interventionColorFn = feature => {
    const name = feature.properties.district;
    const tier = getPriorityTier(name);
    return PRIORITY_META[tier]?.color ?? '#9CA3AF';
  };

  const interventionPopupFn = feature => {
    const name = feature.properties.district;
    const d    = DISTRICT_INTERVENTION[name];
    if (!d) return `<div class="district-popup"><h3>${name}</h3><p style="font-size:0.75rem;color:#888">No programme data available</p></div>`;
    const { suit, prog, combined } = getCombinedScore(name);
    const tier = combined >= 60 ? 'p1' : combined >= 45 ? 'p2' : 'p3';
    const pm   = PRIORITY_META[tier];
    const zm   = ZONE_META[d.zone];
    const revPct = d.dropoutFarmers > 0 ? Math.round((d.revivalWilling / d.dropoutFarmers) * 100) : 0;
    const bar = (val, color) =>
      `<div style="height:5px;background:#E5E7EB;border-radius:3px;margin-top:3px;margin-bottom:6px">
         <div style="height:100%;width:${val}%;background:${color};border-radius:3px"></div>
       </div>`;
    return `
      <div class="district-popup">
        <h3>${name}</h3>
        <div style="display:inline-block;font-size:0.7rem;font-weight:700;background:${pm.bg};color:${pm.color};border:1.5px solid ${pm.border};padding:3px 10px;margin-bottom:10px">${pm.label}</div>
        <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#9CA3AF;margin-bottom:4px">Score Breakdown</div>
        <div style="font-size:0.72rem;color:#374151;display:flex;justify-content:space-between"><span>🌍 Land Suitability</span><strong style="color:#166534">${suit}/100</strong></div>
        ${bar(suit, '#166534')}
        <div style="font-size:0.72rem;color:#374151;display:flex;justify-content:space-between"><span>👨‍🌾 Programme Readiness</span><strong style="color:#92400E">${prog}/100</strong></div>
        ${bar(prog, '#92400E')}
        <div style="font-size:0.72rem;color:#374151;display:flex;justify-content:space-between"><span>⭐ Combined Priority</span><strong style="color:${pm.color}">${combined}/100</strong></div>
        ${bar(combined, pm.color)}
        <div style="border-top:1px solid #E5E7EB;margin:6px 0"></div>
        <div style="font-size:0.68rem;color:#6B7280;margin-bottom:4px">Field action type: <strong style="color:${zm.color}">${zm.label}</strong></div>
        <div class="popup-row"><span class="popup-label">Active / Dropout</span><span class="popup-val">${d.activeFarmers} / ${d.dropoutFarmers}</span></div>
        <div class="popup-row"><span class="popup-label">Will Return</span><span class="popup-val" style="color:#1D4ED8;font-weight:700">${d.revivalWilling} (${revPct}%)</span></div>
        <div style="margin-top:7px;padding:6px 9px;background:${pm.bg};border-left:3px solid ${pm.color};font-size:0.71rem;color:#374151;line-height:1.5">${d.action}</div>
      </div>`;
  };

  const activeCount  = farmerPoints.filter(f => f.status === 'active').length;
  const dropoutCount = farmerPoints.filter(f => f.status === 'dropout').length;
  const segCounts    = Object.keys(SEGMENT_META).reduce((acc, k) => {
    acc[k] = farmerPoints.filter(f => f.segment === k).length;
    return acc;
  }, {});

  // District-filtered stats: use point-in-polygon so stats match the visual dots on the map
  const districtFeature = farmerDistrict && districtsGeo
    ? districtsGeo.features.find(f => (f.properties.district || f.properties.name) === farmerDistrict)
    : null;
  const dFarmers = districtFeature
    ? farmerPoints.filter(f => pip([f.lon, f.lat], districtFeature.geometry))
    : farmerPoints;
  const dDropouts  = dFarmers.filter(f => f.status === 'dropout');
  const dActive    = dFarmers.filter(f => f.status === 'active');
  const dSegCounts = Object.keys(SEGMENT_META).reduce((acc, k) => {
    acc[k] = dDropouts.filter(f => f.segment === k).length;
    return acc;
  }, {});
  const dReturnCounts = { Yes: 0, Maybe: 0, No: 0 };
  dDropouts.filter(f => f.wouldReturn).forEach(f => { if (dReturnCounts[f.wouldReturn] !== undefined) dReturnCounts[f.wouldReturn]++; });
  const dReturnTotal = Object.values(dReturnCounts).reduce((a, b) => a + b, 0);
  const returnColors = { Yes: '#2E7D32', Maybe: '#F9A825', No: '#C62828' };

  const terrainEntry = farmerDistrict ? demData.find(d => d.district === farmerDistrict) : null;
  const lulcEntry    = farmerDistrict ? lulcData.find(d => d.district === farmerDistrict) : null;

  const AREA_DATA = [
    { name: 'High Suitability',   value: 5955 },
    { name: 'Medium Suitability', value: 7660 },
    { name: 'Low Suitability',    value: 8814 },
  ];

  const radarData = selected ? [
    { axis: 'Elevation Fit',  value: Math.min(100, selected.score * 1.05) },
    { axis: 'Rainfall',       value: 75 },
    { axis: 'Temperature',    value: selected.score > 75 ? 88 : selected.score > 60 ? 70 : 50 },
    { axis: 'Slope',          value: selected.score > 75 ? 80 : 60 },
    { axis: 'Soil Type',      value: selected.score > 75 ? 82 : 65 },
    { axis: 'Aspect',         value: selected.score > 75 ? 78 : 55 },
  ] : [];

  return (
    <div>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="page-header" style={{ background: "linear-gradient(135deg, rgba(240,248,220,0.65) 0%, rgba(245,250,225,0.65) 60%, rgba(250,255,235,0.65) 100%), url('/images/buckwheat-field.jpg') center/cover no-repeat", borderTop: '4px solid #2E7D32', position: 'relative' }}>
        <div className="container">
          <div className="badge">MaxEnt Model</div>
          <h1>🌾 Buckwheat Habitat Suitability</h1>
          <p>
            MaxEnt habitat suitability modelling across 12 Meghalaya districts, climate scenario projections
            (SSP1-2.6 / SSP5-8.5 to 2050), 234 real farmer survey locations, and proposed BRIC infrastructure.
          </p>
        </div>
        <button
          onClick={() => downloadBuckwheatReport(suitabilityData, scenarioScores)}
          style={{
            position: 'absolute', top: 24, right: 24,
            background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
            color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
            padding: '10px 18px', fontSize: '0.82rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
          }}
        >
          ⬇ Download Suitability Report
        </button>
      </div>

      {/* ── Page-level Tab Bar ───────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 60, zIndex: 100 }}>
        <div className="container">
          <div className="tab-bar" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            {PAGE_TABS.map(t => (
              <button
                key={t.key}
                className={`tab-btn${pageTab === t.key ? ' active' : ''}`}
                onClick={() => setPageTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1 — Suitability Scenarios                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {pageTab === 'suitability' && (
        <>
          {/* ── Key Findings Banner ──────────────────────────────────────── */}
          <div style={{ background: 'linear-gradient(135deg, #0F1F10, #1B3A22)', padding: '20px 0 18px' }}>
            <div className="container">
              <div style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#86EFAC', marginBottom: 12 }}>
                MaxEnt Habitat Model · AUC 0.992 · 19 WorldClim Variables · 3 Climate Scenarios
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.1)' }}>
                {[
                  { num: '0.992',   label: 'Model AUC',          sub: 'Excellent · Rare ≥0.99 threshold',       color: '#86EFAC' },
                  { num: 'EKH #1',  label: 'Top District',        sub: 'East Khasi Hills · 87/100 · High',       color: '#FCD34D' },
                  { num: '4',       label: 'High-Suitability',    sub: 'Districts above 66/100 threshold',       color: '#93C5FD' },
                  { num: '−16 pts', label: 'SSP5-8.5 Impact',     sub: '6 Khasi & Jaintia districts avg. score drop under +2.8°C warming scenario (2050)', color: '#F87171' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.22)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 700, color: item.color, lineHeight: 1, marginBottom: 6 }}>{item.num}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Map Section ──────────────────────────────────────────────── */}
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">

              {/* AUC badge + title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ background: 'linear-gradient(135deg, #1B5E20, #388E3C)', color: '#fff', borderRadius: 12, padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110, flexShrink: 0 }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>0.992</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.88, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Model AUC</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.75, marginTop: 2 }}>Excellent</div>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h2 className="section-title" style={{ marginBottom: 4 }}>District Suitability Map</h2>
                  <p className="section-subtitle" style={{ marginBottom: 6 }}>
                    MaxEnt choropleth using 19 WorldClim bioclimatic variables · select a scenario in the right panel to update the map.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 8, padding: '4px 10px', color: '#F57F17' }}>
                    ⚠ Climate-only model · DEM terrain + LULC 2025-26 shown in Farmer Survey tab
                  </div>
                </div>
              </div>

              {/* Cultivation context note */}
              <div style={{ marginBottom: 14, padding: '9px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.67rem', color: '#374151', lineHeight: 1.75 }}>
                <strong style={{ color: '#374151' }}>Why climate scenarios matter for cultivation:</strong>{' '}
                Buckwheat is highly sensitive to temperature at flowering and needs consistent moisture in its wettest growing month (July).
                As temperatures rise, districts at lower elevations — especially Garo Hills — lose viable growing windows first.
                Even the optimistic +1.5°C scenario causes a 3–5 point score drop across most districts.
                <strong style={{ color: '#C62828' }}> Only districts that hold their score across all 3 scenarios are safe for long-term programme investment.</strong>
                {' '}Use the scenario card on the right to switch — click any district for a side-by-side comparison.
              </div>

              {/* Map + Rankings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>
                <div>
                  <BuckwheatMap
                    scenarioKey={scenario}
                    colorFn={colorFn}
                    popupFn={popupFn}
                    legendItems={SUITABILITY_LEGEND}
                    legendTitle={`Buckwheat · ${scenarioMeta.sublabel}`}
                    showFarmers={false}
                    showBRIC={false}
                    bricHubs={BRIC_HUBS}
                    height="520px"
                  />
                  <p className="source-note" style={{ marginTop: 10 }}>
                    MaxEnt v3.4.4 · WorldClim v2.1 + CMIP6 (SSP1-2.6, SSP5-8.5) · AUC = 0.992 (climate-only)
                  </p>
                  <div style={{ marginTop: 6, padding: '6px 10px', background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 6, fontSize: '0.62rem', color: '#374151', lineHeight: 1.55 }}>
                    <strong style={{ color: '#166534' }}>AUC</strong> (Area Under the ROC Curve) measures how well the model distinguishes suitable from unsuitable areas — 0.992 is near-perfect (max = 1.0).{' '}
                    <strong style={{ color: '#166534' }}>LODO</strong> (Leave-One-District-Out) = per-district validation where each district's data is held out of training in turn, giving an honest estimate of how well the model predicts that specific district.
                  </div>

                  {/* Climate Drivers strip */}
                  <div style={{ marginTop: 14, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#1E40AF', marginBottom: 10 }}>
                      MaxEnt Variable Importance — What drives buckwheat suitability?
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {[
                        { pct: 55.7, label: 'Rainfall, Wettest Month', bio: 'BIO13', period: 'July — NE monsoon peak',      color: '#1E40AF', bg: '#DBEAFE' },
                        { pct: 21.5, label: 'Temp, Dry Quarter',       bio: 'BIO9',  period: 'Nov – Jan — post-monsoon',    color: '#0369A1', bg: '#E0F2FE' },
                        { pct: 14.7, label: 'Temp, Wet Quarter',       bio: 'BIO8',  period: 'Jun – Aug — monsoon season',  color: '#0E7490', bg: '#ECFEFF' },
                      ].map(driver => (
                        <div key={driver.bio} style={{ background: driver.bg, border: `1px solid ${driver.color}40`, borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: driver.color, lineHeight: 1 }}>{driver.pct}%</div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1F2937', marginTop: 4 }}>{driver.label}</div>
                          <div style={{ fontSize: '0.62rem', color: driver.color, fontWeight: 600, marginTop: 2 }}>{driver.period}</div>
                          <div style={{ fontSize: '0.58rem', color: '#6B7280', marginTop: 2 }}>{driver.bio} · Permutation importance</div>
                          <div style={{ marginTop: 6, height: 3, background: '#E5E7EB', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${driver.pct}%`, background: driver.color, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(30,64,175,0.07)', borderRadius: 6, borderLeft: '3px solid #BFDBFE' }}>
                      <div style={{ fontSize: '0.63rem', color: '#374151', lineHeight: 1.6 }}>
                        <strong style={{ color: '#1E40AF' }}>What are BIO codes?</strong> BIO1–BIO19 are the 19 WorldClim standard bioclimatic variables derived from monthly temperature and rainfall data.
                        Examples: BIO1 = Annual Mean Temperature · BIO12 = Annual Precipitation · BIO13 = Precipitation of Wettest Month · BIO9 = Mean Temp of Driest Quarter.
                      </div>
                      <div style={{ fontSize: '0.63rem', color: '#374151', marginTop: 5, lineHeight: 1.6 }}>
                        <strong style={{ color: '#1E40AF' }}>Remaining 8.1%</strong> is distributed across other BIO variables · West Khasi Hills: 3,200mm annual rainfall — highest natural advantage in the state.
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setShowBioCodes(v => !v)}
                          style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1E40AF', background: '#DBEAFE', border: '1px solid #BFDBFE', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}
                        >
                          {showBioCodes ? '▲ Hide BIO codes' : '▼ View all 19 BIO codes'}
                        </button>
                      </div>
                      {showBioCodes && (
                        <div style={{ marginTop: 10, borderTop: '1px solid #BFDBFE', paddingTop: 10 }}>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1E40AF', marginBottom: 8 }}>
                            All 19 WorldClim Bioclimatic Variables (BIO1–BIO19)
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
                            {[
                              { code: 'BIO1',  name: 'Annual Mean Temperature',                     cat: 'temp' },
                              { code: 'BIO2',  name: 'Mean Diurnal Range (max–min temp per month)', cat: 'temp' },
                              { code: 'BIO3',  name: 'Isothermality (BIO2 / BIO7 × 100)',           cat: 'temp' },
                              { code: 'BIO4',  name: 'Temperature Seasonality (std dev × 100)',     cat: 'temp' },
                              { code: 'BIO5',  name: 'Max Temp of Warmest Month',                  cat: 'temp' },
                              { code: 'BIO6',  name: 'Min Temp of Coldest Month',                  cat: 'temp' },
                              { code: 'BIO7',  name: 'Temperature Annual Range (BIO5 – BIO6)',     cat: 'temp' },
                              { code: 'BIO8',  name: 'Mean Temp of Wettest Quarter ★',             cat: 'temp', highlight: true },
                              { code: 'BIO9',  name: 'Mean Temp of Driest Quarter ★',              cat: 'temp', highlight: true },
                              { code: 'BIO10', name: 'Mean Temp of Warmest Quarter',               cat: 'temp' },
                              { code: 'BIO11', name: 'Mean Temp of Coldest Quarter',               cat: 'temp' },
                              { code: 'BIO12', name: 'Annual Precipitation',                       cat: 'rain' },
                              { code: 'BIO13', name: 'Precipitation of Wettest Month ★',           cat: 'rain', highlight: true },
                              { code: 'BIO14', name: 'Precipitation of Driest Month',              cat: 'rain' },
                              { code: 'BIO15', name: 'Precipitation Seasonality (CoV)',            cat: 'rain' },
                              { code: 'BIO16', name: 'Precipitation of Wettest Quarter',           cat: 'rain' },
                              { code: 'BIO17', name: 'Precipitation of Driest Quarter',            cat: 'rain' },
                              { code: 'BIO18', name: 'Precipitation of Warmest Quarter',           cat: 'rain' },
                              { code: 'BIO19', name: 'Precipitation of Coldest Quarter',           cat: 'rain' },
                            ].map(b => (
                              <div key={b.code} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '3px 0', borderBottom: '1px solid rgba(191,219,254,0.4)' }}>
                                <span style={{
                                  fontSize: '0.6rem', fontWeight: 800, flexShrink: 0, minWidth: 36,
                                  color: b.highlight ? '#fff' : (b.cat === 'temp' ? '#92400E' : '#1E40AF'),
                                  background: b.highlight ? '#1E40AF' : (b.cat === 'temp' ? '#FEF3C7' : '#DBEAFE'),
                                  padding: '1px 5px', borderRadius: 4,
                                }}>{b.code}</span>
                                <span style={{ fontSize: '0.6rem', color: b.highlight ? '#1E40AF' : '#374151', fontWeight: b.highlight ? 600 : 400, lineHeight: 1.4 }}>{b.name}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 8, fontSize: '0.58rem', color: '#6B7280' }}>
                            ★ = Top 3 drivers for buckwheat in Meghalaya (92% of model weight combined) · Source: WorldClim v2.1 · Fick & Hijmans, 2017
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rankings panel */}
                <div style={{ position: 'sticky', top: 110 }}>

                  {/* Compact scenario selector card */}
                  <div style={{ marginBottom: 10, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 11px' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px', color: '#9CA3AF', marginBottom: 7 }}>Climate Scenario</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Object.entries(SCENARIO_META).map(([key, meta]) => (
                        <button key={key} onClick={() => setScenario(key)} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 9px',
                          borderRadius: 7, border: `1.5px solid ${scenario === key ? meta.color : '#E5E7EB'}`,
                          background: scenario === key ? meta.bg : '#fff',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0, marginTop: 3 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ fontSize: '0.73rem', fontWeight: 700, color: scenario === key ? meta.color : '#374151' }}>{meta.label}</div>
                              {scenario === key && <div style={{ fontSize: '0.58rem', fontWeight: 700, color: meta.color, flexShrink: 0 }}>Active ✓</div>}
                            </div>
                            <div style={{ fontSize: '0.59rem', color: '#9CA3AF' }}>{meta.sublabel} · {meta.description}</div>
                            <div style={{ fontSize: '0.6rem', color: scenario === key ? meta.color : '#6B7280', marginTop: 2, lineHeight: 1.45 }}>{meta.meaning}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, paddingTop: 7, borderTop: '1px solid #E5E7EB', fontSize: '0.58rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                      SSP = Shared Socioeconomic Pathway (IPCC global standard). Scores are modelled by MaxEnt using WorldClim CMIP6 climate data.
                    </div>
                  </div>

                  {/* Score & delta key */}
                  <div style={{ marginBottom: 8, padding: '6px 10px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, fontSize: '0.59rem', color: '#78350F', lineHeight: 1.65 }}>
                    <strong style={{ color: '#92400E' }}>How to read the list:</strong><br/>
                    <span style={{ fontWeight: 600 }}>Score (0–100)</span> — habitat suitability for buckwheat. ≥66 High · 46–65 Medium · &lt;46 Low.<br/>
                    <span style={{ fontWeight: 600 }}>Baseline</span> — 1970–2000 average climate (the reference). All future scenario scores are compared against this.<br/>
                    {scenario !== 'baseline' && <span><span style={{ color: '#C62828', fontWeight: 600 }}>Red Δ</span> = pts lost vs Baseline (climate stress) · <span style={{ color: '#2E7D32', fontWeight: 600 }}>Green Δ</span> = pts gained vs Baseline (rare — indicates improving conditions).</span>}
                    {scenario === 'baseline' && <span style={{ color: '#92400E' }}>Switch to SSP1-2.6 or SSP5-8.5 to see projected 2050 score changes vs this Baseline.</span>}
                  </div>

                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>Districts</div>
                  <div style={{ fontSize: '0.63rem', color: '#6B7280', marginBottom: 8, lineHeight: 1.5 }}>
                    Ranked by {scenarioMeta.label} score · <span style={{ color: '#1B5E20', fontWeight: 600 }}>Click any district to compare all 3 scenarios</span>
                  </div>

                  <div style={{ maxHeight: 310, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 2 }}>
                    {sorted.map((d, i) => {
                      const base  = scenarioScores.baseline[d.district] ?? d.score;
                      const delta = d.score - base;
                      return (
                        <div key={d.district}
                          onClick={() => setSelectedDistrict(d.district === selectedDistrict ? null : d.district)}
                          style={{
                            borderLeft: `3px solid ${getSuitColor(d.score)}`,
                            padding: '7px 10px', cursor: 'pointer', borderRadius: '0 6px 6px 0',
                            background: selectedDistrict === d.district ? '#F0F7F0' : '#F9FAFB',
                            display: 'flex', alignItems: 'center', gap: 7,
                            transition: 'background 0.15s',
                          }}>
                          <span className={`rank-badge${i === 0 ? ' gold' : i === 1 ? ' silver' : i === 2 ? ' bronze' : ''}`} style={{ fontSize: '0.6rem', width: 18, height: 18, lineHeight: '18px', flexShrink: 0 }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: selectedDistrict === d.district ? 700 : 500, fontSize: '0.76rem', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.district}</div>
                            <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2, marginTop: 3 }}>
                              <div style={{ height: '100%', width: `${d.score}%`, background: getSuitColor(d.score), borderRadius: 2 }} />
                            </div>
                          </div>
                          <div style={{ flexShrink: 0, textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: getSuitColor(d.score), fontSize: '0.85rem', lineHeight: 1 }}>{d.score}</div>
                            {scenario !== 'baseline' && delta !== 0 && (
                              <div style={{ fontSize: '0.6rem', color: delta < 0 ? '#C62828' : '#2E7D32', fontWeight: 700 }}>{delta > 0 ? '+' : ''}{delta}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selected && (() => {
                    const baseScore = scenarioScores.baseline[selected.district] ?? 0;
                    const ssp126Score = scenarioScores.ssp126[selected.district] ?? 0;
                    const ssp585Score = scenarioScores.ssp585[selected.district] ?? 0;
                    const minScore = Math.min(baseScore, ssp126Score, ssp585Score);
                    const isResilient = ssp585Score >= 66;
                    const isVulnerable = ssp585Score < 46;
                    return (
                      <div style={{ marginTop: 10, borderTop: '2px solid #E8F5E9', paddingTop: 10 }}>
                        {/* District header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.82rem' }}>📍 {selected.district}</div>
                          <div style={{ fontSize: '0.58rem', color: '#9CA3AF' }}>LODO AUC: {selected.aucScore.toFixed(3)}</div>
                        </div>

                        {/* 3-scenario comparison cards */}
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9CA3AF', marginBottom: 6 }}>
                          Score across all 3 climate scenarios
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                          {Object.entries(SCENARIO_META).map(([key, meta]) => {
                            const sc = scenarioScores[key][selected.district] ?? 0;
                            const delta = sc - baseScore;
                            return (
                              <div key={key} style={{
                                background: scenario === key ? meta.bg : '#F9FAFB',
                                border: `1.5px solid ${scenario === key ? meta.color : '#E5E7EB'}`,
                                borderRadius: 8, padding: '8px 5px', textAlign: 'center',
                              }}>
                                <div style={{ fontSize: '0.56rem', fontWeight: 700, textTransform: 'uppercase', color: meta.color, marginBottom: 4, lineHeight: 1.3 }}>{meta.sublabel}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: getSuitColor(sc), lineHeight: 1 }}>{sc}</div>
                                <div style={{ fontSize: '0.55rem', color: '#6B7280', marginTop: 2 }}>{getSuitClass(sc)}</div>
                                {key !== 'baseline' && (
                                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: delta < 0 ? '#C62828' : '#2E7D32', marginTop: 3 }}>
                                    {delta > 0 ? '+' : ''}{delta} pts
                                  </div>
                                )}
                                <div style={{ marginTop: 5, height: 3, background: '#E5E7EB', borderRadius: 2 }}>
                                  <div style={{ height: '100%', width: `${sc}%`, background: getSuitColor(sc), borderRadius: 2 }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Score drop visualiser */}
                        <div style={{ marginTop: 8, padding: '7px 9px', borderRadius: 7, fontSize: '0.63rem', lineHeight: 1.55,
                          background: isResilient ? '#DCFCE7' : isVulnerable ? '#FEE2E2' : '#FEF9C3',
                          border: `1px solid ${isResilient ? '#86EFAC' : isVulnerable ? '#FECACA' : '#FDE68A'}`,
                          color: isResilient ? '#166534' : isVulnerable ? '#B91C1C' : '#92400E',
                        }}>
                          {isResilient
                            ? `✅ Climate-resilient — remains ${getSuitClass(ssp585Score)} even under worst-case +2.8°C warming. Safe for long-term programme investment.`
                            : isVulnerable
                            ? `⚠️ Climate-vulnerable — drops to ${getSuitClass(ssp585Score)} (${ssp585Score}/100) under worst case. Short-term investment only; do not build permanent infrastructure.`
                            : `⚡ Moderate climate risk — remains ${getSuitClass(ssp585Score)} under worst case but with significant score loss. Invest with climate adaptation measures.`
                          }
                        </div>
                        <div style={{ marginTop: 5, fontSize: '0.58rem', color: '#9CA3AF', textAlign: 'center' }}>
                          Highlighted border = currently selected map scenario
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </section>

          {/* ── Radar for selected district ───────────────────────────────── */}
          {selected && (
            <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
              <div className="container">
                <h2 className="section-title">Climate Factor Profile — {selected.district}</h2>
                <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 20px' }} />
                <div style={{ maxWidth: 480 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                      <Radar name={selected.district} dataKey="value" stroke={getSuitColor(selected.score)} fill={getSuitColor(selected.score)} fillOpacity={0.28} dot />
                    </RadarChart>
                  </ResponsiveContainer>
                  <p className="source-note">Climate-variable factor decomposition for {selected.district} under {scenarioMeta.label}.</p>
                </div>
              </div>
            </section>
          )}

          {/* ── Actionable Insights for Officials ────────────────────────── */}
          <section className="section-sm" style={{ background: '#F1F5F9' }}>
            <div className="container">
              <h2 className="section-title">What This Means for Programme Planning</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 20px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                {[
                  {
                    step: '01',
                    urgency: 'Act This Season',
                    urgencyColor: '#B91C1C', urgencyBg: '#FEE2E2', borderColor: '#FECACA',
                    headline: 'East Khasi Hills is your safest investment — it remains viable across all climate scenarios',
                    numbers: [
                      { v: '87',    u: 'Baseline Score',   n: 'Highest in the state' },
                      { v: '71',    u: 'SSP5-8.5 Score',   n: 'Still Medium-High in worst case' },
                      { v: '0.99+', u: 'LODO AUC',         n: 'Near-perfect per-district validation' },
                    ],
                    action: 'Launch all buckwheat programme activities first in East Khasi Hills. Use it as the demonstration hub before expanding to other districts.',
                  },
                  {
                    step: '02',
                    urgency: 'Plan Ahead',
                    urgencyColor: '#92400E', urgencyBg: '#FEF3C7', borderColor: '#FCD34D',
                    headline: '7 of 12 districts fall below viable threshold under worst-case climate — do not over-invest',
                    numbers: [
                      { v: '3',      u: 'Resilient Districts', n: 'High across all 3 scenarios' },
                      { v: '14–28',  u: 'Garo Hills SSP5-8.5', n: 'Effectively unviable by 2050' },
                      { v: '−5 pts', u: 'SSP1-2.6 avg drop',   n: 'Even low-emissions path costs' },
                    ],
                    action: 'Restrict long-term infrastructure investment to districts that remain High or Medium-High under all three scenarios: East Khasi Hills, West Khasi Hills, West Jaintia Hills.',
                  },
                  {
                    step: '03',
                    urgency: 'Key Driver',
                    urgencyColor: '#1565C0', urgencyBg: '#E3F2FD', borderColor: '#BFDBFE',
                    headline: 'Rainfall in wettest month drives 55.7% of suitability — watershed integrity is everything',
                    numbers: [
                      { v: '55.7%',  u: 'BIO13 Weight',    n: 'Rainfall, wettest month' },
                      { v: '3,200',  u: 'mm W. Khasi Rain', n: 'Highest annual in state' },
                      { v: '22K km²', u: 'Suitable Area',   n: 'High + Medium class combined' },
                    ],
                    action: 'Integrate watershed conservation and water retention into the programme plan for West and East Khasi Hills — rainfall variability is the biggest suitability risk.',
                  },
                ].map(ins => (
                  <div key={ins.step} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${ins.borderColor}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: ins.urgencyBg, color: ins.urgencyColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>{ins.step}</div>
                      <span style={{ background: ins.urgencyBg, color: ins.urgencyColor, fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ins.urgency}</span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1F2937', lineHeight: 1.4 }}>{ins.headline}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {ins.numbers.map(n => (
                        <div key={n.u} style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 6px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: ins.urgencyColor, lineHeight: 1 }}>{n.v}</div>
                          <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#374151', marginTop: 3, textTransform: 'uppercase' }}>{n.u}</div>
                          <div style={{ fontSize: '0.55rem', color: '#9CA3AF', marginTop: 2, lineHeight: 1.3 }}>{n.n}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: ins.urgencyBg, borderLeft: `4px solid ${ins.urgencyColor}`, borderRadius: '0 8px 8px 0', padding: '10px 12px', fontSize: '0.8rem', color: ins.urgencyColor, lineHeight: 1.5 }}>
                      {ins.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Charts + Insights ────────────────────────────────────────── */}
          <section className="section-sm" style={{ background: selected ? '#fff' : 'var(--bg-page)' }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 18, alignItems: 'start' }}>

                {/* Bar chart */}
                <div className="card" style={{ padding: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 2, fontSize: '0.95rem' }}>Suitability Scores by District</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 8, fontSize: '0.7rem' }}>MaxEnt index (0–100) · {scenarioMeta.label}</p>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={sorted} margin={{ top: 4, right: 6, bottom: 72, left: 22 }}>
                      <XAxis dataKey="district" angle={-38} textAnchor="end" interval={0} tick={{ fontSize: 9.5 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Score (0–100)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#666' } }} />
                      <Tooltip formatter={v => [`${v}/100`, 'Suitability Score']} />
                      <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                        {sorted.map(d => <Cell key={d.district} fill={getSuitColor(d.score)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Layman score guide */}
                  <div style={{ marginTop: 10, borderTop: '1px solid #E5E7EB', paddingTop: 8 }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6B7280', marginBottom: 6 }}>What does the score mean?</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { range: '86–100', color: '#1B5E20', bg: '#E8F5E9', label: 'Optimal', plain: 'Climate is ideal — nature fully supports buckwheat here.' },
                        { range: '66–85',  color: '#388E3C', bg: '#F1F8E9', label: 'Good',    plain: 'Good conditions with minor limitations — strong candidate.' },
                        { range: '46–65',  color: '#8BC34A', bg: '#F9FBE7', label: 'Marginal', plain: 'Some climate constraints — workable with the right support.' },
                        { range: '26–45',  color: '#E65100', bg: '#FFF8E1', label: 'Risky',   plain: 'Climate creates real barriers; not recommended without field validation.' },
                        { range: '0–25',   color: '#C62828', bg: '#FFEBEE', label: 'Unsuitable', plain: 'Climate conditions are unfavourable for buckwheat.' },
                      ].map(s => (
                        <div key={s.range} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: s.color, minWidth: 34 }}>{s.range}</span>
                          <span style={{ fontSize: '0.6rem', fontWeight: 600, background: s.bg, color: s.color, padding: '1px 6px', borderRadius: 10, flexShrink: 0 }}>{s.label}</span>
                          <span style={{ fontSize: '0.6rem', color: '#6B7280', lineHeight: 1.4 }}>{s.plain}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pie chart — donut with clean legend */}
                <div className="card" style={{ padding: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 2, fontSize: '0.95rem' }}>Area Under Suitability Classes</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 8, fontSize: '0.7rem' }}>Estimated km² across all 12 districts · Baseline</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={AREA_DATA}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={72}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {AREA_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v, name) => [`${v.toLocaleString()} km²`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom legend with km² values */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                    {AREA_DATA.map((item, i) => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i], flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '0.72rem', color: '#374151', fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: PIE_COLORS[i] }}>{item.value.toLocaleString()} km²</div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 6, marginTop: 2, display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#6B7280' }}>
                      <span>Total assessed area</span>
                      <span style={{ fontWeight: 700, color: '#1F2937' }}>{AREA_DATA.reduce((a, b) => a + b.value, 0).toLocaleString()} km²</span>
                    </div>
                  </div>
                </div>

                {/* Insights panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#166534' }}>Chart Insights</div>
                  {[
                    {
                      color: '#166534', bg: '#DCFCE7', border: '#86EFAC',
                      headline: '60.7% of assessed land is at least Medium suitable',
                      detail: '13,615 km² (High + Medium) is viable for buckwheat under current climate — only 8,814 km² is Low.',
                    },
                    {
                      color: '#0369A1', bg: '#E0F2FE', border: '#BAE6FD',
                      headline: 'Top 3 Khasi districts hold the majority of High suitability area',
                      detail: 'East Khasi Hills, West Khasi Hills, and West Jaintia Hills concentrate 5,955 km² of optimal-condition land.',
                    },
                    {
                      color: '#C62828', bg: '#FFEBEE', border: '#FFCDD2',
                      headline: 'Under SSP5-8.5, High suitability area shrinks to ~3,200 km²',
                      detail: 'Warming of +2.8°C by 2050 converts ~46% of currently High areas to Medium or Low — Garo Hills districts are most exposed.',
                    },
                  ].map((ins, i) => (
                    <div key={i} style={{ background: ins.bg, border: `1px solid ${ins.border}`, borderLeft: `3px solid ${ins.color}`, borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: ins.color, lineHeight: 1.35, marginBottom: 5 }}>{ins.headline}</div>
                      <div style={{ fontSize: '0.68rem', color: '#374151', lineHeight: 1.5 }}>{ins.detail}</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>

          {/* ── Model Validation ─────────────────────────────────────────── */}
          <section className="section-sm" style={{ background: '#fff' }}>
            <div className="container">
              <h2 className="section-title">Model Validation</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 24px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)', borderRadius: 16, padding: '24px 32px', marginBottom: 28, border: '1.5px solid #A5D6A7', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: 120 }}>
                  <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#1B5E20', lineHeight: 1 }}>0.992</div>
                  <div style={{ fontSize: '0.75rem', color: '#388E3C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Overall AUC</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ background: '#1B5E20', color: '#fff', fontSize: '0.7rem', padding: '3px 12px', borderRadius: 20, fontWeight: 700 }}>Excellent · &gt;0.99</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1B5E20', marginBottom: 10, fontSize: '1.05rem' }}>Climate-Only MaxEnt Model</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.83rem', color: '#374151', lineHeight: 1.8 }}>
                    <li>Variables: 19 WorldClim v2.1 bioclimatic layers (BIO1–BIO19)</li>
                    <li>Occurrence records: GBIF + MFEC field surveys</li>
                    <li>Validation: 10-fold cross-validation · 75:25 train/test split</li>
                    <li>Regularisation multiplier: 1.5 (RM-selected)</li>
                    <li>TSS = 0.94 · Omission rate at P10 = 0.06</li>
                  </ul>
                  <div style={{ marginTop: 10, padding: '8px 14px', background: '#FFF8E1', borderRadius: 8, border: '1px solid #FFE082', fontSize: '0.78rem', color: '#E65100', display: 'inline-block' }}>
                    <strong>⚠ Scope note:</strong> AUC reflects climate-only model. Terrain and soil variables are planned for the next iteration.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 16, padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7280', marginRight: 4 }}>Suitability tier:</span>
                {[
                  { label: 'High (86–100)',       color: '#1B5E20' },
                  { label: 'Medium-High (66–85)', color: '#388E3C' },
                  { label: 'Medium (46–65)',       color: '#8BC34A' },
                  { label: 'Low (26–45)',          color: '#E65100' },
                  { label: 'Very Low (<26)',       color: '#C62828' },
                ].map(t => (
                  <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.68rem', color: '#374151' }}>{t.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '9px 14px', marginBottom: 16, fontSize: '0.74rem', color: '#1E40AF', lineHeight: 1.55 }}>
                <strong>How per-district AUC is calculated:</strong> The overall MaxEnt model (AUC 0.992) was trained on all 12 districts. Per-district AUC is derived via spatial leave-one-district-out (LODO) cross-validation — each district's occurrence points are held out from training and the model's ability to predict that district's records is scored independently. Higher-suitability districts with dense occurrence clusters yield higher LODO AUC; districts at the margins of the predicted range (low suitability) tend to score lower.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 12 }}>
                {sorted.map(d => {
                  const sc  = getSuitColor(d.score);
                  const bs  = getSuitBadgeStyle(d.score);
                  const cls = getSuitClass(d.score);
                  return (
                    <div key={d.district} style={{ borderRadius: 10, textAlign: 'center', padding: '14px 10px', background: bs.background, border: `1px solid ${bs.border}`, borderTop: `4px solid ${sc}` }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: sc, lineHeight: 1 }}>{d.aucScore.toFixed(3)}</div>
                      <div style={{ fontSize: '0.62rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 3 }}>AUC (LODO)</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: 8, color: '#1F2937', lineHeight: 1.3 }}>{d.district}</div>
                      <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: sc }}>{d.score}</div>
                        <div style={{ fontSize: '0.62rem', color: '#6B7280', fontWeight: 600 }}>/100</div>
                      </div>
                      <div style={{ marginTop: 5, height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.score}%`, background: sc, borderRadius: 2 }} />
                      </div>
                      <div style={{ marginTop: 5, fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', background: sc, color: '#fff' }}>{cls}</div>
                    </div>
                  );
                })}
              </div>

              {/* Farmer Survey KPI strip — links suitability model to ground truth */}
              <div style={{ marginTop: 24, padding: '16px 20px', background: 'linear-gradient(90deg, #0F1F10, #1B3A22)', borderRadius: 12 }}>
                <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#86EFAC', marginBottom: 12 }}>
                  Field Survey Ground-Truth · {PROGRAMME_TOTALS.totalRespondents} farmers · {PROGRAMME_TOTALS.surveyYear} — see Farmer Survey tab for full analysis
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { num: PROGRAMME_TOTALS.activeFarmers,    label: 'Active Cultivators',    sub: 'Across all 12 districts',                        color: '#86EFAC' },
                    { num: PROGRAMME_TOTALS.dropoutFarmers,   label: 'Dropout Farmers',        sub: `${PROGRAMME_TOTALS.dropoutRate}% dropout rate`,  color: '#F87171' },
                    { num: `${((PROGRAMME_TOTALS.noGuidanceCount/PROGRAMME_TOTALS.dropoutFarmers)*100).toFixed(1)}%`, label: 'Guidance Gap', sub: `${PROGRAMME_TOTALS.noGuidanceCount} farmers lacked technical support`, color: '#FCD34D' },
                    { num: `${((PROGRAMME_TOTALS.processingSupport/PROGRAMME_TOTALS.dropoutFarmers)*100).toFixed(1)}%`, label: 'Want Processing', sub: `${PROGRAMME_TOTALS.processingSupport} farmers need BRIC-type support`, color: '#93C5FD' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', borderTop: `2px solid ${item.color}` }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: item.color, lineHeight: 1, marginBottom: 4 }}>{item.num}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2 — Farmer Survey                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {pageTab === 'farmers' && (
        <>
          {/* ── Programme Health Banner ────────────────────────────────── */}
          <div style={{ background: 'linear-gradient(135deg, #0F1F10, #1B3A22)', padding: '20px 0 18px', position: 'relative' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#86EFAC' }}>
                    Programme Health · Buckwheat Field Survey · 235 Respondents · June 2026
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                    Dropout = farmer who grew buckwheat in a prior season but did not continue. Revival = dropout willing to return under right conditions.
                  </div>
                </div>
                <button
                  onClick={downloadFarmerReport}
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#86EFAC', border: '1px solid rgba(134,239,172,0.4)', borderRadius: 8, padding: '8px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  ⬇ Download Field Report
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.1)' }}>
                {[
                  { num: `${PROGRAMME_TOTALS.dropoutRate}%`, label: 'Dropout Rate',     sub: `${PROGRAMME_TOTALS.dropoutFarmers} of ${PROGRAMME_TOTALS.totalRespondents} farmers discontinued`,      color: '#F87171' },
                  { num: `${PROGRAMME_TOTALS.revivalRate}%`, label: 'Will Return',      sub: `${PROGRAMME_TOTALS.revivalWilling}/${PROGRAMME_TOTALS.dropoutFarmers} — if buyer & guidance assured`, color: '#86EFAC' },
                  { num: `${PROGRAMME_TOTALS.medianHarvest_kg} kg`, label: 'Median Harvest', sub: 'Too small to sell individually',                                                              color: '#FCD34D' },
                  { num: `${PROGRAMME_TOTALS.noGuidanceCount}`,     label: 'No Guidance Given', sub: `#1 dropout reason — cited by ${((PROGRAMME_TOTALS.noGuidanceCount/PROGRAMME_TOTALS.dropoutFarmers)*100).toFixed(1)}% of ${PROGRAMME_TOTALS.dropoutFarmers}`, color: '#93C5FD' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.22)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 700, color: item.color, lineHeight: 1, marginBottom: 6 }}>{item.num}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Actionable Insights ───────────────────────────────────────── */}
          <div style={{ background: '#F1F5F9', padding: '20px 0' }}>
            <div className="container">
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#166534', marginBottom: 12 }}>
                What the survey tells programme officials — 3 priority actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  {
                    step: '01', urgency: 'Act This Week',
                    urgencyColor: '#B91C1C', urgencyBg: '#FEE2E2', borderColor: '#FECACA',
                    headline: '153 farmers are ready to return — but only if buyers are confirmed first',
                    numbers: [
                      { v: '180',  u: 'Dropped Out',     n: '76.6% of 235 surveyed' },
                      { v: '85%',  u: 'Will Return',      n: 'If right conditions met' },
                      { v: '81',   u: 'W. Jaintia Drops', n: '#1 district — no guaranteed buyer' },
                    ],
                    action: 'Secure committed buyers and communicate guaranteed MSP before restarting seed supply or any training programme.',
                    note: 'Revival without market confirmation = same dropout cycle repeating.',
                  },
                  {
                    step: '02', urgency: 'This Season',
                    urgencyColor: '#92400E', urgencyBg: '#FEF3C7', borderColor: '#FCD34D',
                    headline: 'Technical guidance is the #1 barrier — 141 of 180 dropouts named it',
                    numbers: [
                      { v: '141',  u: 'Cited Guidance Gap', n: '78% of all dropouts' },
                      { v: '12 kg', u: 'Median Harvest',    n: 'Too low to sell alone' },
                      { v: '53',   u: 'Still Active',        n: 'Across all 12 districts' },
                    ],
                    action: 'Deploy crop-stage technical visits in all Priority 1 districts. Never supply seeds without pairing on-farm guidance.',
                    note: 'Yield below ~30 kg makes individual sale unviable — guidance is what lifts farmers above that threshold.',
                  },
                  {
                    step: '03', urgency: 'Protect Now',
                    urgencyColor: '#1565C0', urgencyBg: '#E3F2FD', borderColor: '#BFDBFE',
                    headline: 'West Khasi Hills is the only district with a self-sustaining base — do not neglect it',
                    numbers: [
                      { v: '35',  u: 'Active Farmers',    n: 'Largest group in the state' },
                      { v: '4',   u: 'P1 Districts',       n: 'Need structured investment' },
                      { v: '80%', u: 'W. Khasi Revival',   n: '8/10 dropouts willing to return' },
                    ],
                    action: 'Formalise buy-back agreements and seed custodianship in West Khasi Hills before Oct–Nov 2026 sowing window.',
                    note: 'If buy-back is not formalised this season, West Khasi Hills will follow the same dropout trajectory as other districts.',
                  },
                ].map(ins => (
                  <div key={ins.step} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${ins.borderColor}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: ins.urgencyBg, color: ins.urgencyColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 900, flexShrink: 0 }}>{ins.step}</div>
                      <span style={{ background: ins.urgencyBg, color: ins.urgencyColor, fontSize: '0.62rem', fontWeight: 700, padding: '2px 9px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ins.urgency}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1F2937', lineHeight: 1.4 }}>{ins.headline}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                      {ins.numbers.map(n => (
                        <div key={n.u} style={{ background: '#F9FAFB', borderRadius: 7, padding: '7px 5px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 900, color: ins.urgencyColor, lineHeight: 1 }}>{n.v}</div>
                          <div style={{ fontSize: '0.57rem', fontWeight: 700, color: '#374151', marginTop: 2, textTransform: 'uppercase' }}>{n.u}</div>
                          <div style={{ fontSize: '0.54rem', color: '#9CA3AF', marginTop: 1, lineHeight: 1.3 }}>{n.n}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: ins.urgencyBg, borderLeft: `4px solid ${ins.urgencyColor}`, borderRadius: '0 7px 7px 0', padding: '8px 10px', fontSize: '0.78rem', color: ins.urgencyColor, lineHeight: 1.5 }}>
                      {ins.action}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280', background: '#F9FAFB', borderRadius: 6, padding: '5px 8px', lineHeight: 1.5, borderLeft: '2px solid #E5E7EB' }}>
                      💡 {ins.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="section" style={{ background: '#fff' }}>
            <div className="container">

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h2 className="section-title" style={{ marginBottom: 4 }}>
                    {mapMode === 'intervention' ? 'District Intervention Zones' : 'Farmer Survey Locations (n=234)'}
                  </h2>
                  <p className="section-subtitle" style={{ marginBottom: 0 }}>
                    {mapMode === 'intervention'
                      ? 'Districts coloured by intervention type required. Click any district for priority action and gap indicators.'
                      : '53 active (real GPS) · 181 dropout (geocoded). Click a district to filter analysis.'}
                  </p>
                </div>
                {/* Layer toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <div style={{ display: 'flex', border: '1.5px solid #D1D5DB', borderRadius: 8, overflow: 'hidden' }}>
                    {[
                      { key: 'farmers',      label: '👨‍🌾 Farmers' },
                      { key: 'intervention', label: '🗂 Zones' },
                    ].map((m, i) => (
                      <button key={m.key} onClick={() => setMapMode(m.key)}
                        style={{
                          padding: '6px 12px', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer',
                          border: 'none', borderRight: i === 0 ? '1.5px solid #D1D5DB' : 'none',
                          background: mapMode === m.key ? '#1B5E20' : '#fff',
                          color: mapMode === m.key ? '#fff' : '#374151',
                        }}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map mode toggle (hidden — replaced above) */}
                <div style={{ display: 'none' }}>
                {[
                    { key: 'farmers',      label: '👨‍🌾 Farmer Locations' },
                    { key: 'intervention', label: '🗂 Intervention Zones' },
                  ].map((m, i) => (
                    <button key={m.key} onClick={() => setMapMode(m.key)}
                      style={{
                        padding: '7px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        border: 'none', borderRight: i === 0 ? '1.5px solid #D1D5DB' : 'none',
                        background: mapMode === m.key ? '#1B5E20' : '#fff',
                        color: mapMode === m.key ? '#fff' : '#374151',
                        transition: 'all 0.18s',
                      }}>
                      {m.label}
                    </button>
                  ))}
                </div>
                {mapMode === 'farmers' && (
                  <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <div style={{ background: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: 10, padding: '6px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B5E20' }}>{activeCount}</div>
                      <div style={{ fontSize: '0.65rem', color: '#388E3C', fontWeight: 600 }}>Active</div>
                    </div>
                    <div style={{ background: '#FFF3E0', border: '1.5px solid #FFCC80', borderRadius: 10, padding: '6px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E65100' }}>{dropoutCount}</div>
                      <div style={{ fontSize: '0.65rem', color: '#EF6C00', fontWeight: 600 }}>Dropout</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear district filter */}
              {farmerDistrict && (
                <div style={{ marginBottom: 10 }}>
                  <button onClick={() => setFarmerDistrict(null)}
                    style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: 8, border: '1.5px solid #C62828', background: '#FFF5F5', color: '#C62828', cursor: 'pointer', fontWeight: 600 }}>
                    ✕ Clear: {farmerDistrict}
                  </button>
                </div>
              )}

              {/* MAP + ANALYSIS PANEL */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 20, alignItems: 'start' }}>

                {/* Left: map */}
                <div>
                  <BuckwheatMap
                    scenarioKey="farmer-view"
                    colorFn={mapMode === 'intervention' ? interventionColorFn : farmerColorFn}
                    popupFn={mapMode === 'intervention' ? interventionPopupFn : undefined}
                    legendItems={mapMode === 'intervention' ? PRIORITY_LEGEND : SUITABILITY_LEGEND}
                    legendTitle={mapMode === 'intervention' ? 'Investment Priority' : 'Baseline Suitability'}
                    showFarmers={mapMode === 'farmers'}
                    farmers={farmerPoints}
                    segmentMeta={SEGMENT_META}
                    showBRIC={false}
                    bricHubs={BRIC_HUBS}
                    cropPresence="buckwheat"
                    height="520px"
                    onDistrictClick={d => setFarmerDistrict(prev => prev === d ? null : d)}
                    selectedDistrict={farmerDistrict}
                  />
                  {mapMode === 'farmers' ? (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                      {Object.entries(SEGMENT_META).map(([seg, meta]) =>
                        segCounts[seg] > 0 && (
                          <div key={seg} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#374151' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.color, border: `1.5px solid ${meta.border}`, flexShrink: 0 }} />
                            {meta.label} <span style={{ color: '#9CA3AF' }}>({segCounts[seg]})</span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '8px 18px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>Combined priority (suitability + programme):</span>
                      {PRIORITY_LEGEND.map(z => (
                        <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#374151' }}>
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: z.color, flexShrink: 0 }} />
                          {z.label}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="source-note" style={{ marginTop: 8 }}>
                    {mapMode === 'farmers'
                      ? 'Click a district to filter the analysis panel · Click the same district again to reset · Click a farmer dot for details'
                      : 'Click any district to see its priority score, barriers, and recommended field action · Source: Final_Report_Buckwheat_v9.0, June 2026'}
                  </p>
                  {mapMode === 'farmers' && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 6, fontSize: '0.62rem', color: '#374151', lineHeight: 1.55 }}>
                      <strong style={{ color: '#1E40AF' }}>How to read the dots:</strong> Green dots = currently active farmers (GPS-verified locations).
                      Orange/red dots = dropout farmers whose locations were geocoded from village name — not exact GPS. Clusters indicate programme concentration zones.
                    </div>
                  )}
                  {mapMode === 'intervention' && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 6, fontSize: '0.62rem', color: '#374151', lineHeight: 1.55 }}>
                      <strong style={{ color: '#166534' }}>How the priority is calculated:</strong> Each district gets a Combined Score (0–100) = Land Suitability from the MaxEnt climate model (50%) + Programme Readiness from field survey data (50%). P1 ≥60 · P2 = 45–59 · P3 &lt;45.
                    </div>
                  )}
                </div>

                {/* Right: analysis panel */}
                <div style={{ position: 'sticky', top: 80 }}>
                  {mapMode === 'intervention' ? (
                    /* ── Investment Priority Panel ── */
                    <div style={{ background: 'var(--bg-page)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontSize: '0.95rem', marginBottom: 4 }}>
                        Investment Priority Analysis
                      </h3>
                      <p style={{ fontSize: '0.68rem', color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>
                        Combined score = Land Suitability (MaxEnt) × Programme Readiness (field survey)
                      </p>
                      {farmerDistrict && DISTRICT_INTERVENTION[farmerDistrict] ? (() => {
                        const d = DISTRICT_INTERVENTION[farmerDistrict];
                        const zm = ZONE_META[d.zone];
                        const { suit, prog, combined } = getCombinedScore(farmerDistrict);
                        const tier = combined >= 60 ? 'p1' : combined >= 45 ? 'p2' : 'p3';
                        const pm   = PRIORITY_META[tier];
                        const revPct = d.dropoutFarmers > 0 ? Math.round((d.revivalWilling / d.dropoutFarmers) * 100) : 0;
                        const gapColor = s => s <= 1 ? '#EF4444' : s === 2 ? '#F59E0B' : '#22C55E';
                        const ScoreBar = ({ val, color, label, sub }) => (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#374151' }}>{label}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color }}>{val}<span style={{ fontSize: '0.6rem', fontWeight: 400, color: '#9CA3AF' }}>/100</span></span>
                            </div>
                            <div style={{ height: 7, background: '#E5E7EB', borderRadius: 4 }}>
                              <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
                            </div>
                            {sub && <div style={{ fontSize: '0.6rem', color: '#9CA3AF', marginTop: 2 }}>{sub}</div>}
                          </div>
                        );
                        return (
                          <>
                            {/* District name + priority badge */}
                            <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.88rem', marginBottom: 7 }}>📍 {farmerDistrict}</div>
                              <div style={{ background: pm.bg, border: `1.5px solid ${pm.border}`, borderLeft: `5px solid ${pm.color}`, padding: '8px 12px', marginBottom: 6 }}>
                                <div style={{ fontWeight: 800, color: pm.color, fontSize: '0.85rem' }}>{pm.label}</div>
                                <div style={{ fontSize: '0.68rem', color: '#374151', marginTop: 4, lineHeight: 1.5 }}>{pm.desc}</div>
                              </div>
                            </div>

                            {/* Score breakdown */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>What drives this score?</div>
                              <ScoreBar val={suit} color="#166534" label="🌍 Land Suitability"    sub="MaxEnt climate model · WorldClim v2.1" />
                              <ScoreBar val={prog} color="#92400E" label="👨‍🌾 Programme Readiness" sub="Dropout willingness + active base + infrastructure" />
                              <div style={{ borderTop: '1.5px solid #E5E7EB', marginBottom: 8 }} />
                              <ScoreBar val={combined} color={pm.color} label="⭐ Combined Priority" />
                            </div>

                            {/* Farmer counts */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                              {[
                                { label: 'Active',         val: d.activeFarmers,  color: '#2E7D32', bg: '#E8F5E9' },
                                { label: 'Dropout',        val: d.dropoutFarmers, color: '#C62828', bg: '#FFEBEE' },
                                { label: `${revPct}% will return`, val: d.revivalWilling, color: '#1565C0', bg: '#E3F2FD' },
                              ].map(s => (
                                <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: '8px 5px', textAlign: 'center', borderTop: `2px solid ${s.color}` }}>
                                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                                  <div style={{ fontSize: '0.58rem', fontWeight: 600, color: s.color, marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
                                </div>
                              ))}
                            </div>

                            {/* Action + field type */}
                            <div style={{ background: '#fff', border: `1px solid ${zm.border}`, borderLeft: `3px solid ${zm.color}`, padding: '9px 12px', marginBottom: 10 }}>
                              <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 3 }}>
                                Field Action Type: <span style={{ color: zm.color }}>{zm.label}</span>
                              </div>
                              <p style={{ fontSize: '0.77rem', color: '#374151', lineHeight: 1.55, margin: 0 }}>{d.action}</p>
                            </div>

                            {/* Reported barriers */}
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 5 }}>Reported Barriers</div>
                              {d.topBarriers.map((b, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 0', borderBottom: '1px solid #F3F4F6' }}>
                                  <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#FFF3E0', color: '#E65100', fontSize: '0.58rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                                  <span style={{ fontSize: '0.74rem', color: '#374151' }}>{b}</span>
                                </div>
                              ))}
                            </div>

                            {/* Gap indicators */}
                            <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px' }}>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 4 }}>Infrastructure Gaps</div>
                              <div style={{ fontSize: '0.58rem', color: '#9CA3AF', marginBottom: 7, fontStyle: 'italic' }}>0 = critical gap · 1 = weak · 2 = partial · 3 = adequate</div>
                              {[
                                { label: 'Seed Continuity',   display: d.seedIndex, score: d.seedIndex === 'Medium' ? 2 : d.seedIndex === 'Low' ? 1 : d.seedIndex === 'Very Low' ? 0 : null },
                                { label: 'Market Access',     display: `${d.marketScore}/3`, score: d.marketScore },
                                { label: 'Extension Support', display: `${d.extScore}/3`,    score: d.extScore },
                              ].map(g => (
                                <div key={g.label} style={{ marginBottom: 7 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <span style={{ fontSize: '0.71rem', fontWeight: 600, color: '#374151' }}>{g.label}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: g.score !== null ? gapColor(g.score) : '#9CA3AF' }}>{g.display}</span>
                                  </div>
                                  {g.score !== null ? (
                                    <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3 }}>
                                      <div style={{ height: '100%', width: `${(g.score / 3) * 100}%`, background: gapColor(g.score), borderRadius: 3 }} />
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '0.61rem', color: '#9CA3AF', fontStyle: 'italic' }}>Field validation needed</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })() : (
                        /* No district selected — ranked overview */
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>
                            Click any district to see its full breakdown. All 12 districts ranked by combined priority below.
                          </p>
                          {(['p1', 'p2', 'p3']).map(tier => {
                            const pm = PRIORITY_META[tier];
                            const districts = Object.keys(DISTRICT_INTERVENTION)
                              .map(name => ({ name, ...getCombinedScore(name) }))
                              .filter(x => getPriorityTier(x.name) === tier)
                              .sort((a, b) => b.combined - a.combined);
                            return (
                              <div key={tier} style={{ marginBottom: 14 }}>
                                <div style={{ background: pm.bg, borderLeft: `4px solid ${pm.color}`, padding: '6px 10px', marginBottom: 6 }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: pm.color }}>{pm.label}</div>
                                  <div style={{ fontSize: '0.63rem', color: '#6B7280', marginTop: 2 }}>{districts.length} district{districts.length !== 1 ? 's' : ''}</div>
                                </div>
                                {districts.map(x => (
                                  <div key={x.name} style={{ padding: '5px 6px', borderBottom: '1px solid #F3F4F6' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                      <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#1F2937' }}>{x.name}</span>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: pm.color }}>{x.combined}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 3 }}>
                                      {[{ val: x.suit, color: '#166534', tip: 'Suit' }, { val: x.prog, color: '#92400E', tip: 'Prog' }].map(b => (
                                        <div key={b.tip} style={{ flex: 1 }}>
                                          <div style={{ fontSize: '0.54rem', color: '#9CA3AF', marginBottom: 1 }}>{b.tip} {b.val}</div>
                                          <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2 }}>
                                            <div style={{ height: '100%', width: `${b.val}%`, background: b.color, borderRadius: 2 }} />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── Original Farmer Segment Analysis Panel ── */
                    <div style={{ background: 'var(--bg-page)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)' }}>
                      <div style={{ marginBottom: 12 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontSize: '1rem', marginBottom: 4 }}>
                          District Farmer Analysis
                        </h3>
                        <div style={{ fontSize: '0.6rem', color: '#9CA3AF', marginBottom: 6, lineHeight: 1.5 }}>
                          Segments show WHY farmers dropped out. Select a district on the map to filter.
                        </div>
                        {farmerDistrict && (
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1B5E20', background: '#E8F5E9', display: 'inline-block', padding: '2px 10px', borderRadius: 20, border: '1px solid #A5D6A7', marginBottom: 8 }}>
                            📍 {farmerDistrict}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                          <div style={{ flex: 1, background: '#E8F5E9', borderRadius: 10, padding: '8px 10px', borderTop: '3px solid #2E7D32', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2E7D32', lineHeight: 1 }}>{dActive.length}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#388E3C', marginTop: 2 }}>Active</div>
                          </div>
                          <div style={{ flex: 1, background: '#FFF3E0', borderRadius: 10, padding: '8px 10px', borderTop: '3px solid #E65100', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#E65100', lineHeight: 1 }}>{dDropouts.length}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#BF360C', marginTop: 2 }}>Dropouts</div>
                          </div>
                          <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 10, padding: '8px 10px', borderTop: '3px solid #6B7280', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#374151', lineHeight: 1 }}>{dFarmers.length}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', marginTop: 2 }}>Total</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {Object.entries(SEGMENT_META).filter(([seg]) => seg !== 'active').map(([seg, meta]) => {
                          const count = dSegCounts[seg] || 0;
                          const pct = dDropouts.length > 0 ? ((count / dDropouts.length) * 100).toFixed(0) : 0;
                          return (
                            <div key={seg} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', borderLeft: `4px solid ${meta.color}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 12, height: 12, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {meta.label.replace('Dropout: ', '')}
                                </div>
                                <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, marginTop: 4 }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 2, transition: 'width 0.4s' }} />
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: meta.color, lineHeight: 1 }}>{count}</div>
                                <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{pct}%</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 3 }}>Would Dropout Farmers Return?</div>
                        <div style={{ fontSize: '0.6rem', color: '#9CA3AF', marginBottom: 8, lineHeight: 1.5 }}>
                          Asked of all 180 dropout farmers. "Yes" = committed return · "Maybe" = conditional on market or guidance · "No" = permanently exited.
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {Object.entries(dReturnCounts).map(([key, count]) => (
                            <div key={key} style={{ flex: 1, textAlign: 'center', background: '#fff', borderRadius: 10, padding: '8px 4px', borderTop: `3px solid ${returnColors[key]}` }}>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: returnColors[key] }}>{count}</div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#374151' }}>{key}</div>
                              <div style={{ fontSize: '0.62rem', color: '#9CA3AF' }}>{dReturnTotal > 0 ? ((count / dReturnTotal) * 100).toFixed(0) : 0}%</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {terrainEntry && (
                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1565C0', marginBottom: 8 }}>Terrain & Land Use · 2025-26</div>
                          <div style={{ background: '#F0F7FF', borderRadius: 8, padding: '8px 10px', marginBottom: 7 }}>
                            <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 2 }}>Elevation · SRTM DEM</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1565C0' }}>{terrainEntry.elevMean} m</span>
                              <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>{terrainEntry.elevMin}–{terrainEntry.elevMax} m range</span>
                            </div>
                            <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                              <span style={{ fontSize: '0.63rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, ...terrainClassStyle(terrainEntry.terrainClass) }}>{terrainEntry.terrainClass}</span>
                              <span style={{ fontSize: '0.63rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#E8F5E9', color: '#1B5E20', border: '1px solid #A5D6A7' }}>Elev Suit: {terrainEntry.buckwheatElevSuit}</span>
                            </div>
                          </div>
                          <div style={{ background: '#FFF3E0', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                            <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 2 }}>Mean Slope · {terrainEntry.slopeClass}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#E65100' }}>{terrainEntry.slopeMean}°</span>
                              <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>max {terrainEntry.slopeMax}°</span>
                            </div>
                            <div style={{ height: 5, background: '#FFE0B2', borderRadius: 3, marginTop: 5 }}>
                              <div style={{ height: '100%', width: `${Math.min(100, (terrainEntry.slopeMean / 45) * 100)}%`, background: '#FF6D00', borderRadius: 3 }} />
                            </div>
                          </div>
                          {lulcEntry && (
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 5 }}>Land Use / Land Cover 2025-26</div>
                              {[
                                { label: 'Forest',    value: lulcEntry.evergreenForestPct, color: '#2E7D32' },
                                { label: 'Shrubland', value: lulcEntry.shrublandPct,       color: '#8BC34A' },
                                { label: 'Cropland',  value: lulcEntry.croplandPct,        color: '#F9A825' },
                                { label: 'Built-up',  value: lulcEntry.builtupPct,         color: '#9E9E9E' },
                              ].map(({ label, value, color }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                  <div style={{ width: 54, fontSize: '0.63rem', color: '#374151', fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{label}</div>
                                  <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                                    <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
                                  </div>
                                  <div style={{ width: 36, fontSize: '0.63rem', color, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{value}%</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Dropout Reasons + Return Conditions ───────────────────────── */}
          <section className="section" style={{ background: '#F8FAFC', paddingTop: 40, paddingBottom: 40 }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

                {/* Dropout Reasons chart */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#DC2626', marginBottom: 4 }}>Why Farmers Stopped · n=180 dropouts</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2937' }}>Dropout Reasons (multi-select)</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>% of 180 dropout farmers citing each reason</div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={dropoutReasons} layout="vertical" margin={{ left: 4, right: 40, top: 0, bottom: 0 }}>
                      <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <YAxis type="category" dataKey="reason" width={200} tick={{ fontSize: 10, fill: '#374151' }} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Farmers citing']} contentStyle={{ fontSize: '0.78rem' }} />
                      <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                        {dropoutReasons.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, borderLeft: '3px solid #DC2626', fontSize: '0.72rem', color: '#B91C1C', lineHeight: 1.5 }}>
                    <strong>Key finding:</strong> {dropoutReasons[0].pct}% cited "{dropoutReasons[0].reason}" — the single most actionable barrier. Technical guidance must accompany every seed distribution.
                  </div>
                  <p className="source-note">Source: {PROGRAMME_TOTALS.dataSource} · {PROGRAMME_TOTALS.surveyYear} · {PROGRAMME_TOTALS.reportVersion} · Multiple responses allowed</p>
                </div>

                {/* Return Conditions chart */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#1B5E20', marginBottom: 4 }}>What Would Bring Them Back · n=153 revival-ready</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2937' }}>Revival Conditions (multi-select)</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>% of 153 willing-to-return farmers needing each condition</div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={returnConditions} layout="vertical" margin={{ left: 4, right: 40, top: 0, bottom: 0 }}>
                      <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <YAxis type="category" dataKey="condition" width={200} tick={{ fontSize: 10, fill: '#374151' }} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Farmers needing']} contentStyle={{ fontSize: '0.78rem' }} />
                      <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                        {returnConditions.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#F0FDF4', borderRadius: 8, borderLeft: '3px solid #166534', fontSize: '0.72rem', color: '#166534', lineHeight: 1.5 }}>
                    <strong>Programme sequence:</strong> {REVIVAL_INSIGHT.message}
                  </div>
                  <p className="source-note">Source: {PROGRAMME_TOTALS.dataSource} · {PROGRAMME_TOTALS.surveyYear} · Dropout farmers only · Multiple selections allowed</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Productivity Distribution + Seed System ───────────────────── */}
          <section className="section" style={{ background: '#fff', paddingTop: 40, paddingBottom: 40 }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

                {/* Yield Distribution */}
                <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '20px 22px', border: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#92400E', marginBottom: 4 }}>Harvest Per Farm · n=55 current farmers</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2937' }}>Yield Distribution</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Median: <strong style={{ color: '#E65100' }}>{PRODUCTIVITY_SUMMARY.medianYield_kg} kg</strong></span>
                      <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Viable threshold: <strong style={{ color: '#166534' }}>{PRODUCTIVITY_SUMMARY.viableThreshold_kg}+ kg</strong></span>
                      <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Above viable: <strong style={{ color: '#166534' }}>{PRODUCTIVITY_SUMMARY.pctAboveViable}%</strong></span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={yieldBands} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                      <XAxis dataKey="band" tick={{ fontSize: 10, fill: '#374151' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} label={{ value: 'Farmers', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip formatter={(v, n, p) => [v, 'Farmers']} contentStyle={{ fontSize: '0.78rem' }} />
                      <Bar dataKey="farmers" radius={[4, 4, 0, 0]}>
                        {yieldBands.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 10, padding: '8px 10px', background: '#FFF8E1', borderRadius: 7, fontSize: '0.68rem', color: '#92400E', lineHeight: 1.5 }}>
                    Only <strong>{PRODUCTIVITY_SUMMARY.pctAboveViable}%</strong> of active farmers harvest enough to sell individually. With MFEC improved variety + guidance, expected yield rises to ~{PRODUCTIVITY_SUMMARY.improvedSeedYield_kg} kg.
                  </div>
                  <p className="source-note">Dashed line at {PRODUCTIVITY_SUMMARY.viableThreshold_kg} kg = minimum viable for individual sale to trader</p>
                </div>

                {/* Seed System */}
                <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '20px 22px', border: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#0891B2', marginBottom: 4 }}>Seed System · n=55 current farmers</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2937' }}>Where Farmers Get Their Seed</div>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={seedSources} dataKey="farmersPct" nameKey="source" cx="50%" cy="50%" outerRadius={65} label={({ source, farmersPct }) => `${farmersPct}%`} labelLine>
                        {seedSources.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: '0.78rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                    {seedSources.map(s => (
                      <div key={s.source} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: '#fff', borderRadius: 8, border: `1px solid ${s.color}30` }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1F2937' }}>{s.source}</span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: s.color }}>{s.farmersPct}%</span>
                          </div>
                          <div style={{ fontSize: '0.63rem', color: '#6B7280', marginTop: 2, lineHeight: 1.4 }}>{s.riskNote}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="source-note">Source: {PROGRAMME_TOTALS.dataSource} · {PROGRAMME_TOTALS.surveyYear}</p>
                </div>
              </div>

              {/* Crop Substitution strip */}
              <div style={{ marginTop: 24, background: '#F1F5F9', borderRadius: 14, padding: '16px 20px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#374151', marginBottom: 12 }}>
                  What 180 Dropout Farmers Switched To (multi-select)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {cropSubstitution.map(s => (
                    <div key={s.crop} style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', border: `1px solid ${s.color}30`, borderTop: `3px solid ${s.color}` }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.pct}%</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1F2937', marginTop: 4 }}>{s.crop}</div>
                      <div style={{ fontSize: '0.62rem', color: '#6B7280', marginTop: 2 }}>{s.farmers} farmers</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: '7px 10px', background: '#FFF8E1', borderRadius: 7, fontSize: '0.68rem', color: '#92400E', lineHeight: 1.5 }}>
                  Broom grass and potato are the dominant alternatives — both require similar highland conditions. The platform competitive comparison (TAB 1 → Wine Fruits) shows buckwheat's economic advantage when value-chain support is in place.
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3 — BRIC Infrastructure                                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {pageTab === 'bric' && (
        <>
          {/* ── Banner ── */}
          <section style={{ background: 'linear-gradient(135deg, #0F1F10, #1B3A22)', padding: '28px 0 24px' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#86EFAC', marginBottom: 6 }}>MFEC / DSAI Platform · Proposed Infrastructure</div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>BRIC Hub & Spoke Network</h2>
                  <p style={{ fontSize: '0.8rem', color: '#A7F3D0', lineHeight: 1.6 }}>
                    Buckwheat Resource & Infrastructure Clusters — proposed processing and aggregation backbone connecting high-suitability districts to markets.
                  </p>
                </div>
                <button onClick={downloadBRICReport} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                  background: '#166534', border: '1.5px solid #22C55E', borderRadius: 8,
                  color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0,
                }}>
                  ⬇ Download Infrastructure Report
                </button>
              </div>

              {/* KPI cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { num: '3',       label: 'BRIC Hubs Proposed',     sub: '1 Primary (Shillong) · 2 Secondary (Nongstoin, Jowai)',  color: '#86EFAC' },
                  { num: '12',      label: 'Collection Spokes',        sub: '5 H1 · 3 H2 · 4 H3 — block-level aggregation points',   color: '#FCD34D' },
                  { num: '153',     label: 'Revival-Ready Farmers',    sub: `${PROGRAMME_TOTALS.revivalRate}% of ${PROGRAMME_TOTALS.dropoutFarmers} dropouts willing to return`, color: '#93C5FD' },
                  { num: '0.992',   label: 'MaxEnt Model AUC',         sub: 'Climate-only model · 19 WorldClim bioclim variables',    color: '#F9A8D4' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color, lineHeight: 1.1, marginBottom: 5 }}>{item.num}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#D1FAE5', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.62rem', color: '#86EFAC', lineHeight: 1.45 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Actionable Insights ── */}
          <section style={{ background: '#F1F5F9', padding: '24px 0' }}>
            <div className="container">
              <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748B', marginBottom: 14 }}>Actionable Insights for Officials</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  {
                    step: '01', urgency: 'IMMEDIATE', urgencyColor: '#B91C1C', urgencyBg: '#FEE2E2',
                    border: '#EF4444',
                    title: 'Activate Shillong Hub (H1) first',
                    body: 'East Khasi Hills (87/100) is the highest-suitability district in the state. H1 is the only Primary Hub — it handles processing for the entire network. H2 and H3 cannot function without H1 operational.',
                    nums: [{ v: '87/100', u: 'EKH Suitability', n: 'Highest in Meghalaya' }, { v: '5 spokes', u: 'H1 Coverage', n: 'Mawlai, Sohra, Mawsynram + 2 more' }, { v: 'Kharif 27', u: 'Target Date', n: 'Initiate land ID + tender now' }],
                    action: 'Initiate land identification and civil works tender for H1 immediately. All programme throughput depends on this hub being operational first.',
                    note: 'H1 (Primary Hub) handles cleaning, grading, packaging, and cold storage — functions that spokes cannot perform independently.',
                  },
                  {
                    step: '02', urgency: 'PLAN IN PARALLEL', urgencyColor: '#0277BD', urgencyBg: '#E1F5FE',
                    border: '#3B82F6',
                    title: 'Begin H2 & H3 feasibility now, activate 12–18 months after H1',
                    body: 'Nongstoin (WKH, 82/100) and Jowai (WJH, 78/100) are both strong secondary hubs. Both districts stay Medium-High even under worst-case +2.8°C warming — safe for long-term infrastructure.',
                    nums: [{ v: '82/100', u: 'H2 Suitability', n: 'West Khasi Hills · 3 spokes' }, { v: '78/100', u: 'H3 Suitability', n: 'West Jaintia Hills · 4 spokes' }, { v: '12–18 mo', u: 'After H1', n: 'Target activation window' }],
                    action: 'Commission feasibility assessments for H2 and H3 this quarter. Time construction to activate 12–18 months after H1 — they need H1 processing capacity to off-load.',
                    note: 'Secondary Hubs focus on aggregation and cold storage only. They truck to H1 for processing.',
                  },
                  {
                    step: '03', urgency: 'DO NOT BUILD', urgencyColor: '#374151', urgencyBg: '#F3F4F6',
                    border: '#9CA3AF',
                    title: 'No fixed hubs in Garo Hills — climate risk makes ROI negative',
                    body: 'All Garo Hills districts score 14–48 under SSP5-8.5 (+2.8°C). Even under the optimistic SSP1-2.6 path, most Garo districts fall below the 46/100 viable threshold by 2050. Infrastructure built there risks being stranded within its useful life.',
                    nums: [{ v: '14–28', u: 'Garo SSP5-8.5', n: 'Below viable threshold (46)' }, { v: '<20 yrs', u: 'Stranded Risk', n: 'Before asset is fully amortised' }, { v: '2029', u: 'Next Review', n: 'With updated CMIP7 data' }],
                    action: 'Redirect any Garo Hills infrastructure budget to mobile aggregation units (trucks + temporary storage). Revisit with updated CMIP7 climate data in 2029.',
                    note: 'Mobile aggregation units (not permanent buildings) can serve Garo farmers today without locking capital into climate-risky locations.',
                  },
                ].map(ins => (
                  <div key={ins.step} style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${ins.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: ins.urgencyBg, color: ins.urgencyColor, letterSpacing: '0.6px', textTransform: 'uppercase', flexShrink: 0 }}>{ins.urgency}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', lineHeight: 1.4 }}>{ins.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563', lineHeight: 1.65 }}>{ins.body}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ins.nums.map(n => (
                        <div key={n.u} style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 7px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1B5E20' }}>{n.v}</div>
                          <div style={{ fontSize: '0.57rem', fontWeight: 700, color: '#374151', marginTop: 1 }}>{n.u}</div>
                          <div style={{ fontSize: '0.55rem', color: '#9CA3AF', marginTop: 1, lineHeight: 1.3 }}>{n.n}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 7, padding: '8px 10px', fontSize: '0.7rem', color: '#166534', lineHeight: 1.6 }}>
                      <strong>Action:</strong> {ins.action}
                    </div>
                    <div style={{ fontSize: '0.63rem', color: '#9CA3AF', lineHeight: 1.5 }}>💡 {ins.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Map + Supply Chain Panel ── */}
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h2 className="section-title" style={{ marginBottom: 3 }}>Network Map</h2>
                  <p className="section-subtitle" style={{ marginBottom: 0 }}>Proposed hub locations overlaid on baseline suitability. Click any hub or spoke on the map for details.</p>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 8, padding: '5px 10px', color: '#F57F17' }}>
                  ⚠ Proposed overlay · not yet built · subject to feasibility assessment
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
                <div>
                  <BuckwheatMap
                    scenarioKey="bric-view"
                    colorFn={colorFn}
                    popupFn={popupFn}
                    legendItems={SUITABILITY_LEGEND}
                    legendTitle="Baseline Suitability"
                    showFarmers={false}
                    showBRIC
                    bricHubs={BRIC_HUBS}
                    height="500px"
                  />
                  {/* Map legend */}
                  <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.74rem', color: '#374151', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    {[
                      { dot: '#1B5E20', size: 16, label: 'Primary BRIC Hub (H1)' },
                      { dot: '#33691E', size: 12, label: 'Secondary Hub (H2, H3)' },
                      { dot: '#AED581', size: 8,  label: 'Collection Spoke' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: item.size, height: item.size, borderRadius: '50%', background: item.dot, border: '2px solid #fff', boxShadow: `0 0 0 1.5px ${item.dot}`, flexShrink: 0 }} />
                        {item.label}
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 22, height: 0, borderTop: '2px dashed #1B5E20', opacity: 0.7 }} />
                      Supply chain spoke
                    </div>
                  </div>
                  <p style={{ marginTop: 8, fontSize: '0.65rem', color: '#9CA3AF' }}>
                    Hub locations based on suitability scores, existing road access, and market connectivity.
                  </p>
                </div>

                {/* Right panel — supply chain flow + hub quick stats */}
                <div style={{ position: 'sticky', top: 110, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Supply chain flow */}
                  <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 10, padding: '12px' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px', color: '#166534', marginBottom: 10 }}>Supply Chain Flow</div>
                    {[
                      { icon: '🌾', label: 'Farmer', sub: 'Harvests buckwheat at field', color: '#E8F5E9', border: '#A5D6A7' },
                      { icon: '📦', label: 'Spoke / Collection Point', sub: 'Aggregates local produce from nearby farms', color: '#D1FAE5', border: '#6EE7B7' },
                      { icon: '🏭', label: 'BRIC Hub', sub: 'Cleans, grades, packs, stores in cold chain', color: '#A7F3D0', border: '#34D399' },
                      { icon: '🛒', label: 'Market / Buyer', sub: 'End buyer receives packaged product', color: '#6EE7B7', border: '#10B981' },
                    ].map((step, i, arr) => (
                      <div key={step.label}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 8px', background: step.color, border: `1px solid ${step.border}`, borderRadius: 7 }}>
                          <span style={{ fontSize: '1rem', lineHeight: 1 }}>{step.icon}</span>
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#064E3B' }}>{step.label}</div>
                            <div style={{ fontSize: '0.6rem', color: '#065F46', lineHeight: 1.4, marginTop: 1 }}>{step.sub}</div>
                          </div>
                        </div>
                        {i < arr.length - 1 && (
                          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6B7280', margin: '2px 0' }}>↓</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Hub quick stats */}
                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px', color: '#9CA3AF', marginBottom: 8 }}>Hub Quick Stats</div>
                    {BRIC_HUBS.map(hub => {
                      const suit = BASELINE_SUIT[hub.district] ?? 0;
                      return (
                        <div key={hub.id} style={{ padding: '8px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: hub.type === 'primary' ? 12 : 10, height: hub.type === 'primary' ? 12 : 10, borderRadius: '50%', background: hub.type === 'primary' ? '#1B5E20' : '#558B2F', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hub.name}</div>
                            <div style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{hub.district} · {hub.spokes.length} spokes</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1B5E20' }}>{suit}</div>
                            <div style={{ fontSize: '0.55rem', color: '#9CA3AF' }}>/ 100</div>
                          </div>
                        </div>
                      );
                    })}
                    <p style={{ marginTop: 8, fontSize: '0.59rem', color: '#9CA3AF', lineHeight: 1.5 }}>Score = MaxEnt Baseline suitability for the hub's district. All 3 hub districts remain Medium-High under SSP1-2.6 and SSP5-8.5.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Hub Detail Cards ── */}
          <section style={{ background: 'var(--bg-page)', padding: '24px 0 32px' }}>
            <div className="container">
              <h2 className="section-title" style={{ marginBottom: 4 }}>Hub Details</h2>
              <p className="section-subtitle" style={{ marginBottom: 18 }}>Each hub anchors a cluster of spoke collection points that aggregate produce for processing.</p>
              <div className="grid-3">
                {BRIC_HUBS.map(hub => {
                  const suit     = BASELINE_SUIT[hub.district] ?? 0;
                  const ssp585   = scenarioScores.ssp585[hub.district] ?? 0;
                  const hubColor = hub.type === 'primary' ? '#1B5E20' : '#558B2F';
                  const facility = hub.type === 'primary'
                    ? 'Processing · Grading · Packaging · Cold Storage · Training Centre'
                    : 'Aggregation Point · Cold Storage · Transport Link to H1';
                  const phase = hub.type === 'primary' ? 'Phase 1 — Activate immediately' : 'Phase 2 — 12–18 months after H1';
                  const phaseColor = hub.type === 'primary' ? '#B91C1C' : '#0277BD';
                  return (
                    <div key={hub.id} style={{ background: '#fff', borderRadius: 12, border: `1.5px solid #E5E7EB`, borderTop: `4px solid ${hubColor}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: hub.type === 'primary' ? 18 : 14, height: hub.type === 'primary' ? 18 : 14, borderRadius: '50%', background: hubColor, border: '3px solid #fff', boxShadow: `0 0 0 2px ${hubColor}`, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: hubColor }}>{hub.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>{hub.district} · {hub.type === 'primary' ? 'Primary Hub' : 'Secondary Hub'}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>{suit}</div>
                          <div style={{ fontSize: '0.55rem', color: '#9CA3AF' }}>Suitability</div>
                        </div>
                      </div>

                      {/* Climate resilience bar */}
                      <div style={{ fontSize: '0.6rem', color: '#6B7280', marginBottom: 2 }}>Climate resilience across scenarios</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[
                          { label: 'Base', score: suit,                                       color: '#1B5E20' },
                          { label: 'SSP1', score: scenarioScores.ssp126[hub.district] ?? 0, color: '#0277BD' },
                          { label: 'SSP5', score: ssp585,                                     color: '#C62828' },
                        ].map(sc => (
                          <div key={sc.label} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3, marginBottom: 2 }}>
                              <div style={{ height: '100%', width: `${sc.score}%`, background: sc.color, borderRadius: 3 }} />
                            </div>
                            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: sc.color }}>{sc.score}</div>
                            <div style={{ fontSize: '0.55rem', color: '#9CA3AF' }}>{sc.label}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.6rem', color: '#9CA3AF', lineHeight: 1.4, marginTop: -4 }}>
                        💡 All 3 scores stay Medium or above — safe for long-term infrastructure investment.
                      </p>

                      {/* Phase badge */}
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: hub.type === 'primary' ? '#FEE2E2' : '#DBEAFE', color: phaseColor, display: 'inline-block', alignSelf: 'flex-start' }}>
                        {phase}
                      </div>

                      {/* Facility */}
                      <div>
                        <div style={{ fontSize: '0.63rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Facility Functions</div>
                        <div style={{ fontSize: '0.65rem', color: '#6B7280', lineHeight: 1.6 }}>{facility}</div>
                      </div>

                      {/* Collection points */}
                      <div>
                        <div style={{ fontSize: '0.63rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>Collection Points ({hub.spokes.length} spokes)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {hub.spokes.map(sp => (
                            <div key={sp.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#555', padding: '4px 6px', background: '#F9FAFB', borderRadius: 5 }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8BC34A', flexShrink: 0 }} />
                              <span style={{ flex: 1 }}>{sp.name}</span>
                              <span style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{sp.lat.toFixed(2)}°N</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ marginTop: 16, fontSize: '0.68rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                BRIC hub placement is proposed based on MaxEnt suitability scores, existing road infrastructure, and market connectivity.
                Final placement is subject to stakeholder consultation and formal feasibility assessment.
                Spoke coordinates are indicative — precise boundaries require ground survey.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
