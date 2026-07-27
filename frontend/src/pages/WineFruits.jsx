import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, CartesianGrid, LabelList } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { getSuitColor, getSuitClass, lulcData, waterData, climateData, ndviData, getNDVIColor, getWaterColor } from '../data/districtData';
import { useData } from '../context/DataContext';

const CROPS = [
  { key: 'plum',         label: 'Plum',          emoji: '🫐', color: '#4A148C', bg: '#F3E5F5', optimalTemp: '12–20°C', rainfall: '1,800–3,500mm', elevation: '900–1,800m',  desc: 'Cool-climate plum thrives in the Khasi & Jaintia Hills above 1,000m. High chill-hour requirements are met in higher-elevation blocks.' },
  { key: 'peach',        label: 'Peach',         emoji: '🍑', color: '#BF360C', bg: '#FBE9E7', optimalTemp: '13–22°C', rainfall: '1,500–3,000mm', elevation: '800–1,700m',  desc: 'Peach shows strong potential in the Khasi plateau with adequate chill hours and slightly broader elevation tolerance than Plum.' },
  { key: 'passionFruit', label: 'Passion Fruit', emoji: '🥭', color: '#E65100', bg: '#FFF3E0', optimalTemp: '20–30°C', rainfall: '1,500–2,500mm', elevation: '200–900m',   desc: 'Passion fruit excels at lower elevations with warmer temperatures. Ri Bhoi and East Garo Hills emerge as top districts.' },
];

// ── Map layer definitions ────────────────────────────────────────────────────
const LAYERS = [
  { key: 'suitability', label: 'Wine Suitability',  icon: '🍷', color: '#4A148C', desc: 'MaxEnt score for selected crop' },
  { key: 'water',       label: 'Water Adequacy',    icon: '💧', color: '#1565C0', desc: 'Annual rainfall vs crop water requirement' },
  { key: 'ndvi',        label: 'NDVI Vegetation',   icon: '🛰', color: '#2E7D32', desc: 'MODIS vegetation health (Jan–Jun 2026)' },
  { key: 'cropland',    label: 'Cropland (LULC)',   icon: '🌿', color: '#E65100', desc: 'ESRI 10m cropland % — expansion land proxy' },
];

const barriersData = [
  { barrier: 'Equipment',         count: 7 },
  { barrier: 'Licensing/Testing', count: 6 },
  { barrier: 'Finance',           count: 5 },
  { barrier: 'Fruit Supply',      count: 4 },
  { barrier: 'Storage/Water',     count: 4 },
  { barrier: 'Market Access',     count: 3 },
];

const TABS = [
  { key: 'suitability', label: '🗺 Suitability Analysis' },
  { key: 'survey',      label: '🍷 Winemakers Survey' },
];

// ── Report builders (module-level, no React state) ───────────────────────────
function buildSuitabilityReportHTML(suitabilityData) {
  const crops = [
    { key: 'plum',         label: 'Plum',         emoji: '🫐', topDistricts: [['East Khasi Hills',91],['West Khasi Hills',86],['West Jaintia Hills',80],['South West Khasi Hills',75]] },
    { key: 'peach',        label: 'Peach',        emoji: '🍑', topDistricts: [['East Khasi Hills',88],['West Khasi Hills',83],['West Jaintia Hills',76],['South West Khasi Hills',71]] },
    { key: 'passionFruit', label: 'Passion Fruit',emoji: '🥭', topDistricts: [['Ri Bhoi',82],['West Garo Hills',80],['East Garo Hills',78],['East Jaintia Hills',78]] },
  ];
  const distRows = suitabilityData
    .map(d => ({ ...d, best: Math.max(d.plum, d.peach, d.passionFruit) }))
    .sort((a, b) => b.best - a.best)
    .map((d, i) => `<tr>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-weight:600">${i+1}. ${d.district}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#7B1FA2">${d.plum}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#BF360C">${d.peach}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#E65100">${d.passionFruit}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800">${d.best}</td>
    </tr>`).join('');
  const zoneRows = crops.map(c => `
    <h3 style="font-size:1rem;margin:16px 0 6px;color:#4A148C">${c.emoji} ${c.label}</h3>
    <ol style="margin:0 0 0 20px;padding:0">
      ${c.topDistricts.map(([d, s]) => `<li style="font-size:0.85rem;margin-bottom:4px;color:#374151">${d} — <strong style="color:#6A1B9A">${s}/100</strong></li>`).join('')}
    </ol>`).join('');
  return `<!DOCTYPE html><html><head><title>Wine Fruits Suitability Report — MFEC / DSAI</title>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:13px;color:#1F2937;padding:32px}
    h1{font-size:1.8rem;color:#4A148C;margin-bottom:4px}
    h2{font-size:1.1rem;color:#6A1B9A;margin:20px 0 8px;border-bottom:2px solid #E1BEE7;padding-bottom:5px}
    .meta{font-size:0.78rem;color:#6B7280;margin-bottom:24px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
    .kpi{background:#F3E5F5;border:1px solid #CE93D8;border-radius:8px;padding:12px;text-align:center}
    .kpi .num{font-size:1.5rem;font-weight:800;color:#4A148C}
    .kpi .lbl{font-size:0.68rem;text-transform:uppercase;color:#6B7280;margin-top:3px}
    .kpi .sub{font-size:0.63rem;color:#9C27B0;margin-top:2px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    th{background:#4A148C;color:#fff;padding:8px 10px;font-size:0.78rem;text-align:left}
    th:not(:first-child){text-align:center}
    .insight{border-radius:8px;padding:14px 16px;margin-bottom:12px;border-left:4px solid}
    .insight .urgency{font-size:0.65rem;font-weight:700;text-transform:uppercase;margin-bottom:5px}
    .insight .headline{font-size:0.95rem;font-weight:700;margin-bottom:6px}
    .insight .action{padding:8px 12px;border-radius:6px;font-size:0.82rem;margin-top:8px}
    .note{font-size:0.72rem;color:#6B7280;margin-top:4px;font-style:italic}
    @media print{body{padding:16px}}
  </style></head><body>
  <h1>Wine Fruits Suitability Analysis — Meghalaya</h1>
  <div class="meta">MFEC / DSAI Platform · MaxEnt v3.4.4 · WorldClim v2.1 · LULC 2025-26 · Generated ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</div>
  <h2>Model Summary</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="num">91/100</div><div class="lbl">Top Plum Score</div><div class="sub">East Khasi Hills · High Suitability</div></div>
    <div class="kpi"><div class="num">88/100</div><div class="lbl">Top Peach Score</div><div class="sub">East Khasi Hills · High Suitability</div></div>
    <div class="kpi"><div class="num">82/100</div><div class="lbl">Top Passion Score</div><div class="sub">Ri Bhoi · High Suitability</div></div>
    <div class="kpi"><div class="num">AUC ≥0.97</div><div class="lbl">Model Quality</div><div class="sub">Excellent · 19 BIO variables</div></div>
  </div>
  <h2>Actionable Insights for Officials</h2>
  <div class="insight" style="background:#F3E5F5;border-color:#9C27B0">
    <div class="urgency" style="color:#6A1B9A">CONCENTRATE INVESTMENT — IMMEDIATE</div>
    <div class="headline" style="color:#1F2937">Focus Plum & Peach development on the high-elevation Khasi-Jaintia belt first</div>
    <p style="font-size:0.82rem;color:#374151">East Khasi Hills (Plum 91, Peach 88), West Khasi Hills (86, 83), and West Jaintia Hills (80, 76) form a continuous high-suitability belt above 900m. Multiple geo-layers (NDVI 0.62–0.72, rainfall >1,800mm, frost days) confirm natural conditions. These 3 districts represent the highest-certainty investment targets in the state.</p>
    <div class="action" style="background:#E8F5E9;color:#1B5E20">Prioritise orchard development support (seedlings, training, buy-back agreements) in East Khasi Hills, West Khasi Hills, and West Jaintia Hills for Plum and Peach — the geo-data is unambiguous.</div>
  </div>
  <div class="insight" style="background:#FFF3E0;border-color:#E65100">
    <div class="urgency" style="color:#BF360C">OPEN IN PARALLEL — COMPLEMENTARY ZONE</div>
    <div class="headline" style="color:#1F2937">Launch Passion Fruit in Ri Bhoi and Garo plains — different elevation, no crop competition</div>
    <p style="font-size:0.82rem;color:#374151">Ri Bhoi (82), West Garo Hills (80), and East Garo Hills (78) suit Passion Fruit's warm-belt requirement (>20°C, 200–900m). These districts have poor Plum/Peach scores, so they complement — not compete with — the Khasi-Jaintia belt. Dual-zone strategy maximises state-wide production without resource conflict.</p>
    <div class="action" style="background:#FFF8E1;color:#E65100">Start Passion Fruit pilot clusters in Ri Bhoi and West Garo Hills simultaneously with the Khasi belt programme. Use verified buyer linkage before rollout.</div>
  </div>
  <div class="insight" style="background:#E3F2FD;border-color:#1565C0">
    <div class="urgency" style="color:#0D47A1">PLANNING TOOL — USE THE COMPOSITE LAYER</div>
    <div class="headline" style="color:#1F2937">Use the multi-layer composite map to target specific blocks — not just districts</div>
    <p style="font-size:0.82rem;color:#374151">Stacking all 4 layers (Suitability + Water + NDVI + Cropland) identifies exact sub-district blocks where all conditions align. Even within East Khasi Hills, only certain blocks have the right NDVI (>0.60) + cropland expansion headroom. Block-level targeting is 3–4× more cost-efficient than district-wide rollout.</p>
    <div class="action" style="background:#E8EAF6;color:#3949AB">Enable all 4 map layers simultaneously (🍷 + 💧 + 🛰 + 🌿) before choosing specific block locations for orchard development.</div>
  </div>
  <h2>Multi-Crop Suitability by District</h2>
  <table>
    <thead><tr><th>District</th><th>🫐 Plum</th><th>🍑 Peach</th><th>🥭 Passion</th><th>Best Score</th></tr></thead>
    <tbody>${distRows}</tbody>
  </table>
  <p class="note">Scores are MaxEnt habitat suitability (0–100). ≥75 = High · 50–74 = Medium · &lt;50 = Low. Based on 19 WorldClim bioclimatic variables + SRTM DEM terrain.</p>
  <h2>Priority Cultivation Zones</h2>
  ${zoneRows}
  </body></html>`;
}

function downloadSuitabilityReport(suitabilityData) {
  const html = buildSuitabilityReportHTML(suitabilityData);
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) win.addEventListener('load', () => { setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400); });
}

function buildIntegratedReportHTML(suitabilityData) {
  const data = suitabilityData.map(s => {
    const best = Math.max(s.plum, s.peach, s.passionFruit);
    const bestCrop = s.plum >= s.peach && s.plum >= s.passionFruit ? '🫐 Plum'
      : s.peach >= s.passionFruit ? '🍑 Peach' : '🥭 Passion Fruit';
    const w = waterData.find(d => d.district === s.district);
    const n = ndviData.find(d => d.district === s.district);
    const c = climateData.find(d => d.district === s.district);
    const l = lulcData.find(d => d.district === s.district);
    return { ...s, best, bestCrop, w, n, c, l };
  }).sort((a, b) => b.best - a.best);

  const rows = data.map((d, i) => {
    const climateFit = d.c?.temp <= 21 ? 'Plum / Peach' : 'Passion Fruit';
    return `<tr style="background:${i % 2 === 0 ? '#fff' : '#FAFAFA'}">
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:0.82em">${d.district}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-weight:700;font-size:0.82em">${d.bestCrop} · ${d.best}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#7B1FA2">${d.plum}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#BF360C">${d.peach}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:#E65100">${d.passionFruit}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${d.l?.croplandPct ?? '—'}%</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#1565C0;font-weight:600">${d.w?.rainfall?.toLocaleString() ?? '—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600">${d.w?.waterClass ?? '—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#2E7D32;font-weight:700">${d.n?.ndvi ?? '—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${d.n?.ndwi ?? '—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${d.c?.temp ?? '—'}°C</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:0.78em;color:#374151">${climateFit}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><title>District Integrated Intelligence — MFEC / DSAI</title>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:12px;color:#1F2937;padding:28px}
    h1{font-size:1.6rem;color:#4A148C;margin-bottom:4px}
    h2{font-size:1rem;color:#6A1B9A;margin:18px 0 8px;border-bottom:2px solid #E1BEE7;padding-bottom:4px}
    .meta{font-size:0.75rem;color:#6B7280;margin-bottom:20px}
    table{width:100%;border-collapse:collapse;font-size:0.82em}
    th{background:#4A148C;color:#fff;padding:8px 10px;font-size:0.75rem;text-align:center;white-space:nowrap}
    th:first-child{text-align:left}
    .note{font-size:0.7rem;color:#6B7280;margin-top:10px;font-style:italic;line-height:1.6}
    @media print{body{padding:14px}@page{margin:1cm}}
  </style></head><body>
  <h1>District Integrated Intelligence — Wine Fruits</h1>
  <div class="meta">MFEC / DSAI Platform · MaxEnt v3.4.4 · ESRI LULC 10m 2025-26 · IMD/WorldClim · MODIS MOD13Q1 Jan–Jun 2026 · Generated ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</div>
  <h2>All 12 Districts — Sorted by Best Wine Crop Score</h2>
  <table>
    <thead><tr>
      <th style="text-align:left">District</th>
      <th>Best Crop · Score</th>
      <th>🫐 Plum</th>
      <th>🍑 Peach</th>
      <th>🥭 Passion</th>
      <th>🌿 Cropland%</th>
      <th>💧 Rainfall (mm)</th>
      <th>Water Class</th>
      <th>🛰 NDVI</th>
      <th>💦 NDWI</th>
      <th>🌡 Temp °C</th>
      <th>Climate Fit</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="note">
    <strong>Suitability scores</strong> (0–100): ≥75 High · 50–74 Medium · &lt;50 Low · MaxEnt habitat probability using 19 WorldClim bioclimatic variables.<br>
    <strong>Cropland %</strong>: ESRI 10m satellite — percentage of district area classified as cropland (expansion land proxy).<br>
    <strong>Water Class</strong>: Annual rainfall vs crop water requirement — Very High / High / Medium / Low.<br>
    <strong>NDVI</strong>: Vegetation health index (MODIS Jan–Jun 2026) — &gt;0.60 = excellent growing conditions.<br>
    <strong>NDWI</strong>: Moisture / water stress index — higher = less water stress.<br>
    <strong>Climate Fit</strong>: Which crop group the district temperature best supports.
  </p>
  </body></html>`;
}

function downloadIntegratedReport(suitabilityData) {
  const html = buildIntegratedReportHTML(suitabilityData);
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) win.addEventListener('load', () => { setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400); });
}

function buildSurveyReportHTML(winemakers) {
  const tRev  = winemakers.filter(w => w.revenue > 0).reduce((s, w) => s + w.revenue, 0);
  const tCap  = winemakers.reduce((s, w) => s + w.capacity, 0);
  const tAct  = winemakers.reduce((s, w) => s + w.actual, 0);
  const util  = Math.round(tAct / tCap * 100);
  const rows  = winemakers.map(w => {
    const u = w.capacity > 0 ? Math.round(w.actual / w.capacity * 100) : 0;
    return `<tr>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-weight:700">${w.name} <span style="font-size:0.7em;padding:1px 5px;border-radius:8px;background:${w.gender==='F'?'#FCE4EC':'#E3F2FD'};color:${w.gender==='F'?'#880E4F':'#1565C0'}">${w.gender}</span></td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:0.82em">${w.district}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:0.78em">${w.setup}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${w.exp} yr</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${w.capacity.toLocaleString()}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:${w.actual===0?'#C62828':'#1B5E20'}">${w.actual.toLocaleString()}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${u>=70?'#1B5E20':u>0?'#E65100':'#C62828'}">${u}%</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#1B5E20">${w.revenue!==null&&w.revenue>0?`₹${(w.revenue/100000).toFixed(1)}L`:'—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:${w.training?'#1B5E20':'#C62828'};font-weight:700">${w.training?'✓ Yes':'✗ No'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:0.75em;color:#374151">${w.barriers.join(', ') || '—'}</td>
    </tr>`;
  }).join('');
  return `<!DOCTYPE html><html><head><title>Wine Makers Survey Report — MFEC / DSAI</title>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:13px;color:#1F2937;padding:32px}
    h1{font-size:1.8rem;color:#4A148C;margin-bottom:4px}
    h2{font-size:1.1rem;color:#6A1B9A;margin:20px 0 8px;border-bottom:2px solid #E1BEE7;padding-bottom:5px}
    .meta{font-size:0.78rem;color:#6B7280;margin-bottom:24px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
    .kpi{border-radius:8px;padding:12px;text-align:center}
    .kpi .num{font-size:1.5rem;font-weight:800}
    .kpi .lbl{font-size:0.68rem;text-transform:uppercase;color:#6B7280;margin-top:3px}
    .kpi .sub{font-size:0.63rem;margin-top:2px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:0.85em}
    th{background:#4A148C;color:#fff;padding:8px 10px;font-size:0.78rem;text-align:left}
    th:not(:first-child){text-align:center}
    .insight{border-radius:8px;padding:14px 16px;margin-bottom:12px;border-left:4px solid}
    .insight .urgency{font-size:0.65rem;font-weight:700;text-transform:uppercase;margin-bottom:5px}
    .insight .headline{font-size:0.95rem;font-weight:700;margin-bottom:6px}
    .insight .action{padding:8px 12px;border-radius:6px;font-size:0.82rem;margin-top:8px}
    .note{font-size:0.72rem;color:#6B7280;margin-top:8px;font-style:italic}
    @media print{body{padding:16px}}
  </style></head><body>
  <h1>Wine Makers Survey — Meghalaya</h1>
  <div class="meta">MFEC / DSAI Platform · NEFWIC Survey 2026 · 10 Licensed Winemakers · Generated ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</div>
  <h2>Programme Health Summary</h2>
  <div class="kpi-grid">
    <div class="kpi" style="background:#F3E5F5;border:1px solid #CE93D8"><div class="num" style="color:#4A148C">10</div><div class="lbl">Licensed Winemakers</div><div class="sub" style="color:#7B1FA2">9 E. Khasi Hills · 1 W. Garo Hills</div></div>
    <div class="kpi" style="background:#FCE4EC;border:1px solid #F48FB1"><div class="num" style="color:#880E4F">60%</div><div class="lbl">Women-Led</div><div class="sub" style="color:#AD1457">6 of 10 female founders</div></div>
    <div class="kpi" style="background:#E8F5E9;border:1px solid #A5D6A7"><div class="num" style="color:#1B5E20">₹${(tRev/10000000).toFixed(2)} Cr</div><div class="lbl">Combined Revenue</div><div class="sub" style="color:#2E7D32">From ${winemakers.filter(w=>w.revenue>0).length} active producers (FY 2025)</div></div>
    <div class="kpi" style="background:#FBE9E7;border:1px solid #FFAB91"><div class="num" style="color:#E65100">${util}%</div><div class="lbl">Capacity Utilisation</div><div class="sub" style="color:#BF360C">${tAct.toLocaleString()} L of ${tCap.toLocaleString()} L</div></div>
  </div>
  <p class="note">68,000 L combined installed capacity — major scale-up headroom available with the right support.</p>
  <h2>Actionable Insights for Officials</h2>
  <div class="insight" style="background:#FFF8E1;border-color:#F57F17">
    <div class="urgency" style="color:#E65100">ACT IMMEDIATELY — BIGGEST BOTTLENECK</div>
    <div class="headline" style="color:#1F2937">Resolve the Pasteur Institute testing delay — it is costing winemakers 4–5 months of revenue</div>
    <p style="font-size:0.82rem;color:#374151">Every bottle must clear Pasteur Institute quality testing before it can be sold. The current wait time is 4–5 months — a period in which capital is tied up, market windows are missed, and cash flow collapses. This is the single most commonly cited operational barrier across multiple winemakers.</p>
    <div class="action" style="background:#FFF9C4;color:#F57F17">Establish an expedited testing protocol or a dedicated wine-sector testing lane at the Pasteur Institute. Target: reduce wait to &lt;4 weeks. Explore interim accreditation of a private lab as a short-term bridge.</div>
  </div>
  <div class="insight" style="background:#FEE2E2;border-color:#EF4444">
    <div class="urgency" style="color:#B91C1C">HIGH PRIORITY — UNLOCK SCALE</div>
    <div class="headline" style="color:#1F2937">Equipment access is the #1 barrier — 7 of 10 winemakers cannot scale without it</div>
    <p style="font-size:0.82rem;color:#374151">Equipment (fermenters, bottling lines, cold rooms) is cited by 7 of 10 winemakers. Most operate home-based setups with 500–5,000 L capacity — well below commercial viability. A shared equipment facility or government-backed equipment loan scheme could immediately unlock the 52% of idle capacity.</p>
    <div class="action" style="background:#FEF2F2;color:#B91C1C">Design a shared fermentation and bottling facility in East Khasi Hills (9/10 winemakers are here). Alternatively, launch a subsidised equipment loan fund for winemakers earning &lt;₹10L/year.</div>
  </div>
  <div class="insight" style="background:#EFF6FF;border-color:#3B82F6">
    <div class="urgency" style="color:#1D4ED8">PROGRAMME GAP — FINANCE ACCESS</div>
    <div class="headline" style="color:#1F2937">Finance access improved only 20% post-MFEC — far behind skills (80%) and market access (70%)</div>
    <p style="font-size:0.82rem;color:#374151">MFEC training has been highly effective for technical skills (80% improvement) and market access (70%). But only 20% of winemakers report better access to finance — meaning the programme is building skills without the capital to act on them. Without credit, winemakers cannot buy fruit in bulk, invest in packaging, or expand into premium markets.</p>
    <div class="action" style="background:#DBEAFE;color:#1D4ED8">Introduce a wine-sector specific credit guarantee scheme or link winemakers to SHG (Self-Help Group) credit facilities. Priority: winemakers with proven revenue (&gt;₹5L) but zero access to institutional finance.</div>
  </div>
  <h2>All Winemakers — Enterprise Profile</h2>
  <table>
    <thead><tr><th>Winemaker</th><th>District</th><th>Setup</th><th>Exp</th><th>Capacity (L)</th><th>Actual (L)</th><th>Utilisation</th><th>Revenue</th><th>MFEC</th><th>Barriers</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="note">NEFWIC Wine Makers Survey 2026. Revenue self-reported. MFEC = received NEFWIC/MFEC training. Utilisation = Actual/Capacity × 100.</p>
  </body></html>`;
}

function downloadSurveyReport(winemakers) {
  const html = buildSurveyReportHTML(winemakers);
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) win.addEventListener('load', () => { setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400); });
}

function buildWinemakersProfileReportHTML(winemakers) {
  const rows = winemakers.map((w, i) => {
    const util = w.capacity > 0 ? Math.round(w.actual / w.capacity * 100) : 0;
    const utilColor = util >= 70 ? '#1B5E20' : util > 0 ? '#E65100' : '#C62828';
    return `<tr style="background:${i%2===0?'#fff':'#FAFAFA'}">
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:700;font-size:0.83em">${w.name} <span style="font-size:0.75em;padding:1px 5px;border-radius:8px;background:${w.gender==='F'?'#FCE4EC':'#E3F2FD'};color:${w.gender==='F'?'#880E4F':'#1565C0'}">${w.gender}</span></td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:0.82em">${w.district}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:0.78em"><span style="padding:2px 7px;border-radius:10px;background:${w.setup==='Commercial'?'#E8F5E9':'#F3F4F6'};color:${w.setup==='Commercial'?'#1B5E20':'#6B7280'};font-weight:600">${w.setup}</span></td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:0.82em">${w.exp} yr</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;font-size:0.82em">${w.capacity.toLocaleString()}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:${w.actual===0?'#C62828':'#1B5E20'};font-size:0.82em">${w.actual.toLocaleString()}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${utilColor};font-size:0.82em">${util}%</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#1B5E20;font-size:0.82em">${w.revenue!==null?`₹${(w.revenue/100000).toFixed(1)}L`:'—'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#388E3C;font-size:0.82em">${w.profit!==null?`₹${(w.profit/100000).toFixed(1)}L`:'—'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;color:${w.margin==='>30%'?'#1B5E20':w.margin==='—'?'#9CA3AF':'#E65100'};font-size:0.8em">${w.margin}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${w.training?'#1B5E20':'#C62828'}">${w.training?'✓':'✗'}</td>
    </tr>`;
  }).join('');
  return `<!DOCTYPE html><html><head><title>Winemakers Enterprise Profile — MFEC / NEFWIC</title>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:12px;color:#1F2937;padding:28px}
    h1{font-size:1.5rem;color:#4A148C;margin-bottom:4px}
    .meta{font-size:0.72rem;color:#6B7280;margin-bottom:20px}
    table{width:100%;border-collapse:collapse}
    th{background:#4A148C;color:#fff;padding:8px 10px;font-size:0.73rem;text-align:center;white-space:nowrap}
    th:first-child,th:nth-child(2){text-align:left}
    .note{font-size:0.68rem;color:#6B7280;margin-top:12px;font-style:italic;line-height:1.6}
    @media print{body{padding:14px}@page{margin:1cm;size:landscape}}
  </style></head><body>
  <h1>All Winemakers — Enterprise Profile</h1>
  <div class="meta">NEFWIC Wine Makers Survey 2026 · 10 licensed winemakers · MFEC GeoAI Platform · Revenue figures self-reported (₹ FY 2025) · Generated ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div>
  <table>
    <thead><tr>
      <th style="text-align:left">Winemaker</th><th style="text-align:left">District</th><th>Setup</th><th>Exp</th><th>Capacity (L)</th><th>Actual (L)</th><th>Utilisation</th><th>Revenue</th><th>Net Profit</th><th>Margin</th><th>MFEC</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="note">
    <strong>Setup:</strong> Commercial = registered business; Home-based = cottage enterprise.<br>
    <strong>Utilisation:</strong> Actual ÷ Capacity × 100 — green ≥70%, amber &gt;0%, red = no production this year.<br>
    <strong>MFEC ✓/✗:</strong> Whether the winemaker received NEFWIC / MFEC training support.<br>
    Revenue and profit are self-reported. "—" indicates data not provided by the winemaker.
  </p>
  </body></html>`;
}

function downloadWinemakersProfileReport(winemakers) {
  const html = buildWinemakersProfileReportHTML(winemakers);
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) win.addEventListener('load', () => { setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400); });
}

// ────────────────────────────────────────────────────────────────────────────
export default function WineFruits() {
  const { suitabilityData, winemakers } = useData();
  const [activeTab,                 setActiveTab]                 = useState('suitability');
  const [activeCrop,                setActiveCrop]                = useState('plum');
  const [selectedDistrict,          setSelectedDistrict]          = useState('East Khasi Hills');
  const [activeLayers,              setActiveLayers]              = useState(['suitability']);
  const [selectedEnterpriseDistrict, setSelectedEnterpriseDistrict] = useState('East Khasi Hills');

  // ── Winemaker survey derivations (reactive to admin edits) ────────────────
  const winemakersByDistrict = useMemo(() => winemakers.reduce((acc, w) => {
    if (!acc[w.district]) acc[w.district] = [];
    acc[w.district].push(w);
    return acc;
  }, {}), [winemakers]);

  const totalRevenue  = useMemo(() => winemakers.filter(w => w.revenue > 0).reduce((s, w) => s + w.revenue, 0), [winemakers]);
  const totalCapacity = useMemo(() => winemakers.reduce((s, w) => s + w.capacity, 0), [winemakers]);
  const totalActual   = useMemo(() => winemakers.reduce((s, w) => s + w.actual, 0), [winemakers]);
  const utilizationRate = totalCapacity > 0 ? Math.round(totalActual / totalCapacity * 100) : 0;

  const productionChartData = useMemo(() => winemakers.map(w => ({
    name: w.name.split(' ')[0],
    'Capacity (L)': w.capacity,
    'Actual (L)': w.actual,
  })), [winemakers]);

  const revenueChartData = useMemo(() => winemakers
    .filter(w => w.revenue !== null)
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    .map(w => ({
      name: w.name.split(' ')[0],
      'Revenue (₹L)': +((w.revenue || 0) / 100000).toFixed(1),
      'Profit (₹L)':  +((w.profit  || 0) / 100000).toFixed(1),
    })), [winemakers]);

  const impactData = useMemo(() => winemakers
    .filter(w => w.incBefore !== null && w.incAfter !== null && w.incBefore !== undefined && w.incAfter !== undefined)
    .map(w => ({
      name:   w.name.split(' ')[0],
      Before: +((w.incBefore || 0) / 100000).toFixed(1),
      After:  +((w.incAfter  || 0) / 100000).toFixed(1),
    })), [winemakers]);

  const crop   = CROPS.find(c => c.key === activeCrop);
  const sorted = [...suitabilityData].sort((a, b) => b[activeCrop] - a[activeCrop]);

  const selectedSuit    = suitabilityData.find(d => d.district === selectedDistrict);
  const selectedLulc    = lulcData.find(d => d.district === selectedDistrict);
  const selectedWater   = waterData.find(d => d.district === selectedDistrict);
  const selectedClimate = climateData.find(d => d.district === selectedDistrict);
  const selectedNdvi    = ndviData.find(d => d.district === selectedDistrict);

  // ── Layer score normalisation (all → 0–100) ──────────────────────────────
  const getLayerScore = (districtName, layerKey) => {
    if (layerKey === 'suitability') {
      const d = suitabilityData.find(s => s.district === districtName);
      return d ? d[activeCrop] : 0;
    }
    if (layerKey === 'water') {
      const d = waterData.find(s => s.district === districtName);
      return { 'Very High': 100, 'High': 75, 'Medium': 50, 'Low': 25 }[d?.waterClass] || 0;
    }
    if (layerKey === 'ndvi') {
      const d = ndviData.find(s => s.district === districtName);
      return Math.round((d?.ndvi || 0) * 100);
    }
    if (layerKey === 'cropland') {
      const d = lulcData.find(s => s.district === districtName);
      // Normalise: 0–15% cropland range → 0–100 score (higher = more expansion land)
      return Math.min(Math.round((d?.croplandPct || 0) / 15 * 100), 100);
    }
    return 0;
  };

  // Average of all active layers → composite score 0–100
  const getCompositeScore = (districtName) => {
    if (activeLayers.length === 0) return 0;
    const scores = activeLayers.map(l => getLayerScore(districtName, l));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // ── Suitability-tab map functions ─────────────────────────────────────────
  const colorFn = (feature) => {
    const name = feature.properties.district;
    if (activeLayers.length === 0) return '#E5E7EB';
    const score = getCompositeScore(name);
    return getSuitColor(score);
  };

  const popupFn = (feature) => {
    const name = feature.properties.district;
    const p    = feature.properties;
    const composite = getCompositeScore(name);
    const layerRows = activeLayers.map(lk => {
      const layer = LAYERS.find(l => l.key === lk);
      const score = getLayerScore(name, lk);
      const raw =
        lk === 'water'    ? waterData.find(d => d.district === name)?.waterClass
        : lk === 'ndvi'   ? ndviData.find(d => d.district === name)?.ndvi
        : lk === 'cropland' ? `${lulcData.find(d => d.district === name)?.croplandPct}%`
        : `${score}/100`;
      return `<div class="popup-row">
        <span class="popup-label">${layer.icon} ${layer.label}</span>
        <span class="popup-val" style="color:${getSuitColor(score)}">${raw} (${score}/100)</span>
      </div>`;
    }).join('');
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq}</p>
        ${activeLayers.length > 1 ? `<div class="popup-row"><span class="popup-label">⚡ Composite</span><span class="popup-val" style="color:${getSuitColor(composite)};font-weight:800">${composite}/100</span></div>` : ''}
        ${layerRows}
      </div>`;
  };

  const singleLayer = activeLayers.length === 1 ? LAYERS.find(l => l.key === activeLayers[0]) : null;
  const legendTitle = activeLayers.length === 0 ? 'No layer selected'
    : activeLayers.length === 1 ? `${singleLayer.icon} ${singleLayer.label}`
    : `⚡ Composite · ${activeLayers.length} layers`;

  const legendItems = [
    { color: '#1B5E20', label: activeLayers.length > 1 ? 'Excellent on all layers (80–100)' : 'High (75–100)' },
    { color: '#388E3C', label: activeLayers.length > 1 ? 'Strong composite (60–79)'         : 'Good (60–74)' },
    { color: '#8BC34A', label: activeLayers.length > 1 ? 'Moderate (50–59)'                 : 'Medium (50–59)' },
    { color: '#FDD835', label: activeLayers.length > 1 ? 'Weak on 1+ layers (40–49)'        : 'Low (40–49)' },
    { color: '#E53935', label: activeLayers.length > 1 ? 'Poor — fails on multiple (<40)'   : 'Very Low (<40)' },
  ];

  // ── Enterprise map functions ──────────────────────────────────────────────
  const enterpriseColorFn = (feature) => {
    const ws = winemakersByDistrict[feature.properties.district] || [];
    if (ws.length >= 8) return '#4A148C';
    if (ws.length >= 4) return '#7B1FA2';
    if (ws.length >= 1) return '#CE93D8';
    return '#EEEEEE';
  };

  const enterprisePopupFn = (feature) => {
    const district = feature.properties.district;
    const p = feature.properties;
    const ws = winemakersByDistrict[district] || [];
    const totalRev = ws.reduce((s, w) => s + (w.revenue || 0), 0);
    const totalCap = ws.reduce((s, w) => s + w.capacity, 0);
    const totalAct = ws.reduce((s, w) => s + w.actual, 0);
    const util = totalCap > 0 ? Math.round(totalAct / totalCap * 100) : 0;
    if (ws.length === 0) {
      return `<div class="district-popup"><h3>${district}</h3><p class="hq">No licensed winemakers surveyed</p></div>`;
    }
    return `<div class="district-popup">
      <h3>${district}</h3>
      <p class="hq">HQ: ${p.hq}</p>
      <div class="popup-row"><span class="popup-label">🍷 Winemakers</span><span class="popup-val">${ws.length}</span></div>
      <div class="popup-row"><span class="popup-label">💰 Revenue</span><span class="popup-val">₹${(totalRev / 100000).toFixed(1)}L</span></div>
      <div class="popup-row"><span class="popup-label">⚗️ Capacity</span><span class="popup-val">${totalCap.toLocaleString()}L</span></div>
      <div class="popup-row"><span class="popup-label">📊 Utilisation</span><span class="popup-val">${util}%</span></div>
      <div style="margin-top:6px;font-size:0.72rem;color:#6B7280;line-height:1.5">${ws.map(w => `→ ${w.name}`).join('<br>')}</div>
    </div>`;
  };

  const enterpriseLegendItems = [
    { color: '#4A148C', label: '8–10 Winemakers (dominant cluster)' },
    { color: '#7B1FA2', label: '4–7 Winemakers' },
    { color: '#CE93D8', label: '1–3 Winemakers' },
    { color: '#EEEEEE', label: 'No winemakers surveyed' },
  ];

  // Integrated cross-district table
  const integratedData = suitabilityData.map(s => {
    const best = Math.max(s.plum, s.peach, s.passionFruit);
    const bestCrop = s.plum >= s.peach && s.plum >= s.passionFruit ? '🫐 Plum'
      : s.peach >= s.passionFruit ? '🍑 Peach' : '🥭 Passion';
    return {
      ...s, best, bestCrop,
      w: waterData.find(d => d.district === s.district),
      c: climateData.find(d => d.district === s.district),
      n: ndviData.find(d => d.district === s.district),
      l: lulcData.find(d => d.district === s.district),
    };
  }).sort((a, b) => b.best - a.best);

  // Enterprise right-panel data
  const enterpriseWs    = winemakersByDistrict[selectedEnterpriseDistrict] || [];
  const entRev  = enterpriseWs.reduce((s, w) => s + (w.revenue || 0), 0);
  const entCap  = enterpriseWs.reduce((s, w) => s + w.capacity, 0);
  const entAct  = enterpriseWs.reduce((s, w) => s + w.actual, 0);
  const entUtil = entCap > 0 ? Math.round(entAct / entCap * 100) : 0;

  const toggleLayer = (key) =>
    setActiveLayers(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="page-header" style={{ background: "linear-gradient(135deg, rgba(74,20,140,0.88) 0%, rgba(126,50,133,0.88) 100%), url('https://images.unsplash.com/photo-1474722883778-792e7990302f?w=1600&q=60&fit=crop&crop=center') center/cover no-repeat" }}>
        <div className="container">
          <div className="badge" style={{ color: '#E77D22', borderColor: '#E77D22', background: 'rgba(231,125,34,0.15)' }}>MaxEnt Suitability · NEFWIC Winemakers Survey</div>
          <h1 style={{ color: '#E77D22' }}>🍷 Wine Fruits — Suitability & Enterprise Analysis</h1>
          <p style={{ color: '#E77D22' }}>MaxEnt suitability models for Plum, Peach & Passion Fruit · Multi-layer geo-intelligence (LULC, NDVI/NDWI, Water, Climate) · Insights from 10 licensed winemakers under MFEC.</p>
        </div>
      </div>

      {/* ── Tab navigation ──────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '2px solid var(--border)', position: 'sticky', top: 60, zIndex: 40 }}>
        <div className="container" style={{ display: 'flex', gap: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '14px 26px', border: 'none', background: 'none', fontWeight: activeTab === t.key ? 700 : 500, fontSize: '0.9rem', color: activeTab === t.key ? '#4A148C' : 'var(--text-mid)', borderBottom: activeTab === t.key ? '3px solid #4A148C' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', marginBottom: -2 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════ TAB 1 — SUITABILITY ═════════════════════════ */}
      {activeTab === 'suitability' && (
        <>
          {/* ── Dark Banner ── */}
          <section style={{ background: 'linear-gradient(135deg, #1A0533, #2D1B4E)', padding: '28px 0 22px' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#CE93D8', marginBottom: 6 }}>MaxEnt · WorldClim v2.1 · LULC · NDVI · Water</div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Wine Fruit Suitability Analysis</h2>
                  <p style={{ fontSize: '0.8rem', color: '#E1BEE7', lineHeight: 1.6, maxWidth: 520 }}>
                    MaxEnt models for Plum, Peach & Passion Fruit overlaid with LULC, water adequacy, NDVI and climate data across all 12 districts. Select a crop and stack map layers to find your optimal growing zones.
                  </p>
                </div>
                <button onClick={() => downloadSuitabilityReport(suitabilityData)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#6A1B9A', border: '1.5px solid #CE93D8', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0 }}>
                  ⬇ Download Suitability Report
                </button>
              </div>

              {/* Crop selector in banner */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#CE93D8', flexShrink: 0 }}>Select Crop:</span>
                {CROPS.map(c => (
                  <button key={c.key} onClick={() => setActiveCrop(c.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: `2px solid ${activeCrop === c.key ? '#CE93D8' : 'rgba(255,255,255,0.18)'}`, background: activeCrop === c.key ? 'rgba(206,147,216,0.2)' : 'transparent', color: activeCrop === c.key ? '#E1BEE7' : 'rgba(255,255,255,0.55)', fontWeight: activeCrop === c.key ? 700 : 400, fontSize: '0.86rem', cursor: 'pointer', transition: 'all 0.18s' }}>
                    <span>{c.emoji}</span>{c.label}{activeCrop === c.key && <span style={{ fontSize: '0.6rem', color: '#CE93D8' }}>✓</span>}
                  </button>
                ))}
              </div>

              {/* KPI cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { num: `${sorted[0]?.[activeCrop]}`, label: `Top ${crop.label} Score`, sub: `${sorted[0]?.district} · ${getSuitClass(sorted[0]?.[activeCrop])}`, color: '#CE93D8' },
                  { num: sorted.filter(d => d[activeCrop] >= 75).length, label: 'High-Suitability Districts', sub: `Districts scoring ≥75 for ${crop.label}`, color: '#FCD34D' },
                  { num: crop.optimalTemp, label: 'Optimal Temperature', sub: `${crop.elevation} elevation · ${crop.rainfall} rainfall`, color: '#93C5FD' },
                  { num: 'AUC ≥0.97', label: 'MaxEnt Model Quality', sub: 'Excellent · 19 BIO variables · SRTM 30m', color: '#86EFAC' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: item.color, lineHeight: 1.1, marginBottom: 5 }}>{item.num}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#E1BEE7', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.62rem', color: '#CE93D8', lineHeight: 1.45 }}>{item.sub}</div>
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
                    urgency: 'CONCENTRATE INVESTMENT', urgencyColor: '#6A1B9A', urgencyBg: '#F3E5F5', border: '#9C27B0',
                    title: 'Focus Plum & Peach on the high-elevation Khasi-Jaintia belt first',
                    body: 'East Khasi Hills (Plum 91, Peach 88), West Khasi Hills (86, 83), and West Jaintia Hills (80, 76) form a continuous high-suitability corridor above 900m. NDVI 0.62–0.72, rainfall >1,800mm, and frost-day profiles all confirm naturally ideal conditions across multiple independent data layers.',
                    nums: [{ v: '91/100', u: 'EKH Plum', n: 'Highest score in state' }, { v: '3', u: 'Top Districts', n: 'EKH · WKH · WJH' }, { v: '0.69', u: 'Avg NDVI', n: 'Excellent vegetation health' }],
                    action: 'Prioritise orchard development support (seedlings, training, buy-back agreements) in East Khasi Hills, West Khasi Hills, and West Jaintia Hills. These 3 districts are the highest-certainty investment targets.',
                    note: 'MaxEnt score ≥75 = High Suitability. All 3 districts exceed this on both Plum and Peach.',
                  },
                  {
                    urgency: 'OPEN IN PARALLEL', urgencyColor: '#BF360C', urgencyBg: '#FBE9E7', border: '#E65100',
                    title: 'Launch Passion Fruit in Ri Bhoi and Garo plains — no competition with Khasi belt',
                    body: 'Ri Bhoi (82), West Garo Hills (80), East Garo Hills (78) suit Passion Fruit\'s warm-belt requirement (>20°C, 200–900m). These districts score poorly for Plum/Peach — so they complement, not compete. A dual-zone strategy maximises state-wide production without resource conflict.',
                    nums: [{ v: '82/100', u: 'Ri Bhoi', n: 'Top Passion Fruit district' }, { v: '>20°C', u: 'Temp Fit', n: 'Warm-belt below 900m' }, { v: '3+', u: 'Suitable Districts', n: 'Ri Bhoi · W Garo · E Garo' }],
                    action: 'Start Passion Fruit pilot clusters in Ri Bhoi and West Garo Hills simultaneously with the Khasi belt programme. Establish verified buyer linkage before rollout.',
                    note: 'Passion Fruit and Plum/Peach occupy different elevation bands — no land competition. Programme them as two parallel tracks.',
                  },
                  {
                    urgency: 'PRECISION TOOL', urgencyColor: '#1565C0', urgencyBg: '#E3F2FD', border: '#3B82F6',
                    title: 'Stack all 4 map layers to identify specific blocks, not just districts',
                    body: 'Selecting all 4 layers (Suitability + Water + NDVI + Cropland) shows which sub-district blocks have all conditions aligned simultaneously. Even within East Khasi Hills, only specific blocks have the right NDVI (>0.60), water surplus and expansion cropland. Block-level targeting is 3–4× more cost-efficient than district-wide rollout.',
                    nums: [{ v: '4', u: 'Map Layers', n: 'Suitability · Water · NDVI · LULC' }, { v: '⚡', u: 'Composite Score', n: 'Average across active layers' }, { v: '3–4×', u: 'Efficiency Gain', n: 'Block vs district investment' }],
                    action: 'Enable all 4 map layers simultaneously (🍷 + 💧 + 🛰 + 🌿) before choosing specific block locations for orchard development or extension deployment.',
                    note: 'NDVI = vegetation health (MODIS 2026). LULC cropland % = expansion land proxy from ESRI 10m satellite data.',
                  },
                ].map(ins => (
                  <div key={ins.title} style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${ins.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: ins.urgencyBg, color: ins.urgencyColor, letterSpacing: '0.6px', textTransform: 'uppercase', alignSelf: 'flex-start' }}>{ins.urgency}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', lineHeight: 1.4 }}>{ins.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563', lineHeight: 1.65 }}>{ins.body}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ins.nums.map(n => (
                        <div key={n.u} style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 7px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4A148C' }}>{n.v}</div>
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

          {/* ── Crop info + layer toggle + map ── */}
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">
              {/* Crop info banner */}
              <div style={{ background: crop.bg, border: `1px solid ${crop.color}22`, borderRadius: 12, padding: '12px 18px', marginBottom: 14, display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ fontSize: '1.8rem' }}>{crop.emoji}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: crop.color, fontFamily: 'var(--font-heading)', marginBottom: 3, fontSize: '0.94rem' }}>{crop.label} – MaxEnt Suitability Model</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>{crop.desc}</p>
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                  {[['🌡', 'Temp', crop.optimalTemp], ['🌧', 'Rainfall', crop.rainfall], ['⛰', 'Elevation', crop.elevation]].map(([ic, lb, val]) => (
                    <div key={lb} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem' }}>{ic}</div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>{lb}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: crop.color }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer toggle */}
              <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 12, padding: '11px 15px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Map Layers</span>
                  {LAYERS.map(l => {
                    const active = activeLayers.includes(l.key);
                    return (
                      <button key={l.key} onClick={() => toggleLayer(l.key)} title={l.desc}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 13px', borderRadius: 20, border: `2px solid ${l.color}`, background: active ? l.color : 'transparent', color: active ? '#fff' : l.color, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.18s' }}>
                        <span>{l.icon}</span><span>{l.label}</span><span style={{ opacity: 0.75, fontSize: '0.7rem', marginLeft: 1 }}>{active ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
                {activeLayers.length === 0 && <div style={{ marginTop: 8, fontSize: '0.76rem', color: '#C62828', padding: '4px 8px', background: '#FFEBEE', borderRadius: 6, display: 'inline-block' }}>Select at least one layer</div>}
                {activeLayers.length > 1 && (
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.5 }}>
                    <span style={{ background: '#E0E7FF', color: '#3730A3', fontWeight: 700, padding: '1px 7px', borderRadius: 10, marginRight: 6 }}>⚡ Composite view — {activeLayers.length} layers</span>
                    Districts coloured by average score across all selected layers. Darker green = strong on <em>all</em> criteria simultaneously.
                    <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: '0.7rem' }}>💡 Stack all 4 layers to pinpoint the best investment blocks within a district.</span>
                  </div>
                )}
                {activeLayers.length === 1 && <div style={{ marginTop: 6, fontSize: '0.74rem', color: '#6B7280' }}>{LAYERS.find(l => l.key === activeLayers[0])?.desc} · Add more layers to see composite overlap</div>}
              </div>

              {/* Map + right panel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
                <div>
                  <div className="map-container">
                    <MeghalayaMap colorFn={colorFn} popupFn={popupFn} height="520px" legendItems={legendItems} legendTitle={legendTitle} defaultTile="topo" onDistrictClick={d => setSelectedDistrict(d)} />
                  </div>
                  <p className="source-note">MaxEnt v3.4.4 · WorldClim v2.1 · SRTM DEM 30m · ESRI LULC 10m · MODIS MOD13Q1 Jan–Jun 2026 · Click district for geo-intelligence breakdown</p>
                </div>

                {/* Right panel */}
                <div style={{ position: 'sticky', top: 110 }}>
                  {/* Score guide */}
                  <div style={{ marginBottom: 10, padding: '7px 10px', background: '#F9F0FF', border: '1px solid #E1BEE7', borderRadius: 8, fontSize: '0.6rem', color: '#4A148C', lineHeight: 1.65 }}>
                    <strong>Score guide:</strong> ≥75 High · 50–74 Medium · &lt;50 Low suitability for the selected crop. Score is MaxEnt habitat probability (0–100).
                  </div>

                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: crop.color, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>{crop.emoji} District Rankings</div>
                  <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 2, marginBottom: 12 }}>
                    {sorted.map((d, i) => (
                      <div key={d.district} onClick={() => setSelectedDistrict(d.district)}
                        style={{ borderLeft: `3px solid ${getSuitColor(d[activeCrop])}`, padding: '5px 10px', cursor: 'pointer', borderRadius: '0 6px 6px 0', background: selectedDistrict === d.district ? crop.bg : '#F9FAFB', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}>
                        <span className={`rank-badge${i < 3 ? [' gold',' silver',' bronze'][i] : ''}`} style={{ fontSize: '0.6rem', width: 18, height: 18, lineHeight: '18px' }}>{i + 1}</span>
                        <span style={{ flex: 1, fontWeight: selectedDistrict === d.district ? 700 : 500, fontSize: '0.75rem', color: '#1F2937' }}>{d.district}</span>
                        <span style={{ fontWeight: 800, color: getSuitColor(d[activeCrop]), fontSize: '0.8rem', flexShrink: 0 }}>{d[activeCrop]}</span>
                      </div>
                    ))}
                  </div>

                  {selectedSuit && (
                    <div style={{ background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: 10, padding: '11px 13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: '0.57rem', color: '#9CA3AF', textTransform: 'uppercase' }}>Selected district</div>
                          <div style={{ fontWeight: 700, color: crop.color, fontSize: '0.86rem' }}>{selectedSuit.district}</div>
                        </div>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, color: getSuitColor(selectedSuit[activeCrop]), background: getSuitColor(selectedSuit[activeCrop]) + '18', border: `1px solid ${getSuitColor(selectedSuit[activeCrop])}` }}>{getSuitClass(selectedSuit[activeCrop])}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 7 }}>
                        {CROPS.map(c => (
                          <div key={c.key} style={{ background: c.bg, borderRadius: 7, padding: '6px 4px', textAlign: 'center', border: `1px solid ${c.color}22`, outline: activeCrop === c.key ? `2px solid ${c.color}` : 'none' }}>
                            <div style={{ fontSize: '0.64rem' }}>{c.emoji}</div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: getSuitColor(selectedSuit[c.key]) }}>{selectedSuit[c.key]}</div>
                            <div style={{ fontSize: '0.5rem', color: '#6B7280', textTransform: 'uppercase' }}>{c.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${selectedSuit[activeCrop]}%`, background: getSuitColor(selectedSuit[activeCrop]), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.68rem', color: getSuitColor(selectedSuit[activeCrop]), fontWeight: 700, flexShrink: 0 }}>{selectedSuit[activeCrop]}/100</span>
                      </div>
                      <div style={{ borderTop: '1px dashed #D1D5DB', paddingTop: 8 }}>
                        <div style={{ fontSize: '0.57rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 7 }}>Geo Intelligence · All layers</div>
                        {selectedLulc && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.57rem', color: '#6B7280', fontWeight: 600 }}>🌿 LULC 2025-26 · ESRI 10m</span>
                              <span style={{ fontSize: '0.56rem', padding: '1px 5px', borderRadius: 8, background: activeLayers.includes('cropland') ? '#FFF3E0' : '#F3F4F6', color: activeLayers.includes('cropland') ? '#E65100' : '#9CA3AF', fontWeight: 600 }}>{activeLayers.includes('cropland') ? '● Active' : '○ Off'}</span>
                            </div>
                            {[{ l: 'Forest', v: selectedLulc.evergreenForestPct, c: '#2E7D32' }, { l: 'Shrubland', v: selectedLulc.shrublandPct, c: '#8BC34A' }, { l: 'Cropland', v: selectedLulc.croplandPct, c: '#F9A825' }, { l: 'Built-up', v: selectedLulc.builtupPct, c: '#78909C' }].map(({ l, v, c }) => (
                              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                <div style={{ width: 44, fontSize: '0.55rem', color: '#374151', textAlign: 'right', flexShrink: 0 }}>{l}</div>
                                <div style={{ flex: 1, height: 4, background: '#F3F4F6', borderRadius: 2 }}>
                                  <div style={{ height: '100%', width: `${Math.min(v, 100)}%`, background: c, borderRadius: 2 }} />
                                </div>
                                <div style={{ width: 30, fontSize: '0.55rem', color: c, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{v}%</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedWater && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.57rem', color: '#6B7280', fontWeight: 600 }}>💧 Water Availability</span>
                              <span style={{ fontSize: '0.56rem', padding: '1px 5px', borderRadius: 8, background: activeLayers.includes('water') ? '#E3F2FD' : '#F3F4F6', color: activeLayers.includes('water') ? '#1565C0' : '#9CA3AF', fontWeight: 600 }}>{activeLayers.includes('water') ? '● Active' : '○ Off'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#1565C0' }}>{selectedWater.rainfall.toLocaleString()}mm/yr</span>
                              <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: 8, background: getWaterColor(selectedWater.waterClass) + '18', color: getWaterColor(selectedWater.waterClass), fontWeight: 600 }}>{selectedWater.waterClass}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                              {[{l:'Plum 720mm',ok:selectedWater.rainfall>=720},{l:'Peach 680mm',ok:selectedWater.rainfall>=680},{l:'Passion 1400mm',ok:selectedWater.rainfall>=1400}].map(({l,ok}) => (
                                <span key={l} style={{ fontSize: '0.52rem', padding: '1px 4px', borderRadius: 6, background: ok ? '#E8F5E9' : '#FFEBEE', color: ok ? '#1B5E20' : '#C62828', fontWeight: 600 }}>{ok?'✓':'✗'} {l}</span>
                              ))}
                            </div>
                            <div style={{ marginTop: 4, fontSize: '0.58rem', color: '#9CA3AF' }}>💡 Min annual rainfall needed for each crop to fruit reliably.</div>
                          </div>
                        )}
                        {selectedClimate && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: '0.57rem', color: '#6B7280', fontWeight: 600, marginBottom: 3 }}>🌡 Climate · {selectedClimate.temp}°C avg · {selectedClimate.frostDays} frost days/yr</div>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {[{l:'Plum',ok:selectedClimate.temp<=21},{l:'Peach',ok:selectedClimate.temp<=22},{l:'Passion',ok:selectedClimate.temp>=19}].map(({l,ok}) => (
                                <span key={l} style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: ok ? '#E8F5E9' : '#FFEBEE', color: ok ? '#1B5E20' : '#C62828', border: `1px solid ${ok ? '#A5D6A7' : '#EF9A9A'}` }}>{ok?'✓':'✗'} {l}</span>
                              ))}
                            </div>
                            <div style={{ marginTop: 4, fontSize: '0.58rem', color: '#9CA3AF' }}>💡 ✓ = temperature within optimal range · ✗ = outside range for that crop.</div>
                          </div>
                        )}
                        {selectedNdvi && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.57rem', color: '#6B7280', fontWeight: 600 }}>🛰 NDVI/NDWI · MODIS Jan–Jun 2026</span>
                              <span style={{ fontSize: '0.56rem', padding: '1px 5px', borderRadius: 8, background: activeLayers.includes('ndvi') ? '#E8F5E9' : '#F3F4F6', color: activeLayers.includes('ndvi') ? '#2E7D32' : '#9CA3AF', fontWeight: 600 }}>{activeLayers.includes('ndvi') ? '● Active' : '○ Off'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {[{ label: 'NDVI', val: selectedNdvi.ndvi, color: getNDVIColor(selectedNdvi.ndvi), sub: selectedNdvi.healthStatus, bg: '#F0FAF0' }, { label: 'NDWI', val: selectedNdvi.ndwi, color: '#1565C0', sub: `${selectedNdvi.moistureStress} Stress`, bg: '#EFF6FF' }, { label: 'Veg %', val: `${selectedNdvi.vegetationCoverPct}%`, color: '#6A1B9A', sub: 'Cover', bg: '#F3E5F5' }].map(({ label, val, color, sub, bg }) => (
                                <div key={label} style={{ background: bg, borderRadius: 6, padding: '5px 7px', textAlign: 'center', flex: 1 }}>
                                  <div style={{ fontSize: '0.53rem', color: '#6B7280' }}>{label}</div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color }}>{val}</div>
                                  <div style={{ fontSize: '0.5rem', color, fontWeight: 600 }}>{sub}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: 4, fontSize: '0.58rem', color: '#9CA3AF', lineHeight: 1.4 }}>💡 NDVI = greenness/vegetation health (0–1). NDWI = moisture stress. &gt;0.60 NDVI = excellent growing conditions.</div>
                          </div>
                        )}
                        {activeLayers.length > 1 && (
                          <div style={{ marginTop: 8, background: '#E0E7FF', borderRadius: 8, padding: '7px 10px' }}>
                            <div style={{ fontSize: '0.57rem', color: '#3730A3', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>⚡ Composite Breakdown</div>
                            {activeLayers.map(lk => {
                              const layer = LAYERS.find(l => l.key === lk);
                              const score = getLayerScore(selectedDistrict, lk);
                              return (
                                <div key={lk} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                  <span style={{ fontSize: '0.56rem', width: 88, color: '#374151', flexShrink: 0 }}>{layer.icon} {layer.label}</span>
                                  <div style={{ flex: 1, height: 4, background: '#C7D2FE', borderRadius: 2 }}>
                                    <div style={{ height: '100%', width: `${score}%`, background: getSuitColor(score), borderRadius: 2 }} />
                                  </div>
                                  <span style={{ fontSize: '0.58rem', fontWeight: 700, color: getSuitColor(score), width: 28, textAlign: 'right', flexShrink: 0 }}>{score}</span>
                                </div>
                              );
                            })}
                            <div style={{ borderTop: '1px solid #A5B4FC', marginTop: 5, paddingTop: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#3730A3' }}>Average Composite</span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: getSuitColor(getCompositeScore(selectedDistrict)) }}>{getCompositeScore(selectedDistrict)}/100</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Multi-crop chart + insights panel ── */}
          <section style={{ background: 'var(--bg-page)', padding: '24px 0' }}>
            <div className="container">
              <h2 className="section-title" style={{ marginBottom: 4 }}>Multi-Crop Comparison — All Districts</h2>
              <p className="section-subtitle" style={{ marginBottom: 16 }}>Plum, Peach & Passion Fruit scores side-by-side. The chart reveals two distinct growing zones — cool Khasi-Jaintia belt for Plum/Peach, and warm Garo/Ri Bhoi belt for Passion Fruit.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
                <div className="card">
                  <ResponsiveContainer width="100%" height={310}>
                    <BarChart data={suitabilityData} margin={{ top: 5, right: 10, bottom: 85, left: 25 }}>
                      <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 9 }} label={{ value: 'District', position: 'insideBottom', offset: -22, style: { fontSize: 11, fill: '#666' } }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Suitability Score (0–100)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                      <Tooltip />
                      <Legend verticalAlign="top" />
                      <Bar dataKey="plum"         name="🫐 Plum"          fill="#7B1FA2" radius={[3,3,0,0]} />
                      <Bar dataKey="peach"        name="🍑 Peach"         fill="#BF360C" radius={[3,3,0,0]} />
                      <Bar dataKey="passionFruit" name="🥭 Passion Fruit"  fill="#E65100" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p style={{ marginTop: 8, fontSize: '0.63rem', color: '#9CA3AF' }}>Score = MaxEnt habitat suitability (0–100). ≥75 High · 50–74 Medium · &lt;50 Low.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { color: '#7B1FA2', bg: '#F3E5F5', crop: '🫐 Plum', note: 'East Khasi Hills dominates (91). Restricted to cool-climate belt >900m. Drop-off is steep below South West Khasi Hills.' },
                    { color: '#BF360C', bg: '#FBE9E7', crop: '🍑 Peach', note: 'Closely tracks Plum scores. Slightly broader temperature tolerance — 4 districts score >70. Strong Khasi plateau fit.' },
                    { color: '#E65100', bg: '#FFF3E0', crop: '🥭 Passion Fruit', note: 'Inverse of Plum — Ri Bhoi and Garo districts lead. Shows the complementary geographic opportunity for lower-elevation warm-belt cropping.' },
                  ].map(c => (
                    <div key={c.crop} style={{ background: c.bg, border: `1.5px solid ${c.color}33`, borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: c.color, fontSize: '0.82rem', marginBottom: 6 }}>{c.crop}</div>
                      <div style={{ fontSize: '0.72rem', color: '#4B5563', lineHeight: 1.6 }}>{c.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Priority zones ── */}
          <section style={{ background: 'var(--bg-page)', padding: '24px 0 32px' }}>
            <div className="container">
              <h2 className="section-title" style={{ marginBottom: 4 }}>Priority Cultivation Zones</h2>
              <p className="section-subtitle" style={{ marginBottom: 18 }}>Top 4 districts per crop — ranked by MaxEnt suitability score. Invest first in districts that appear in the top tier for your target crop.</p>
              <div className="grid-3">
                {[
                  { crop: '🫐 Plum',          districts: ['East Khasi Hills (91)', 'West Khasi Hills (86)', 'West Jaintia Hills (80)', 'South West Khasi Hills (75)'], note: 'Cool-climate belt · 1,000–1,800m elevation · NDVI 0.62–0.72 · Rainfall >2,000mm', color: '#4A148C', insight: 'All 4 districts remain viable under SSP1-2.6. Focus long-term orchard investment here.' },
                  { crop: '🍑 Peach',          districts: ['East Khasi Hills (88)', 'West Khasi Hills (83)', 'West Jaintia Hills (76)', 'South West Khasi Hills (71)'], note: 'Khasi plateau · 800–1,700m · 12–22°C · slight frost in winter (chilling requirement met)', color: '#BF360C', insight: 'Peach slightly broader in elevation tolerance than Plum. Can expand into South West Khasi Hills with good return.' },
                  { crop: '🥭 Passion Fruit',  districts: ['Ri Bhoi (82)', 'West Garo Hills (80)', 'East Garo Hills (78)', 'East Jaintia Hills (78)'],                  note: 'Lower elevation warm-belt · 200–900m · >20°C · 1,500–2,500mm annual rainfall',        color: '#E65100', insight: 'No overlap with Plum/Peach zones — this is the complementary crop track for the warm-belt districts.' },
                ].map(z => (
                  <div key={z.crop} style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #E5E7EB', borderTop: `4px solid ${z.color}`, padding: '16px' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: z.color, marginBottom: 12, fontSize: '0.96rem' }}>{z.crop}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {z.districts.map((d, i) => (
                        <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem' }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: z.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                          {d}
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: z.color, fontWeight: 600, marginBottom: 6 }}>{z.note}</p>
                    <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 9px', fontSize: '0.65rem', color: '#374151', lineHeight: 1.5 }}>
                      💡 {z.insight}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Integrated intelligence — download card ── */}
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, background: 'linear-gradient(135deg, #F3E5F5, #EDE7F6)', border: '1.5px solid #CE93D8', borderRadius: 14, padding: '20px 24px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#4A148C', marginBottom: 4 }}>District Integrated Intelligence</h2>
                  <p style={{ fontSize: '0.75rem', color: '#6A1B9A', lineHeight: 1.6, maxWidth: 520 }}>
                    Full cross-referenced report — wine suitability scores for all 12 districts, combined with ESRI cropland %, IMD rainfall, water classification, MODIS NDVI, temperature, and climate-fit guidance. Sorted by best wine crop score.
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#9C4FA0', marginTop: 6 }}>
                    Sources: MaxEnt v3.4.4 · ESRI LULC 10m 2025-26 · IMD/WorldClim · MODIS MOD13Q1 Jan–Jun 2026
                  </p>
                </div>
                <button
                  onClick={() => downloadIntegratedReport(suitabilityData)}
                  style={{ background: 'linear-gradient(135deg, #4A148C, #6A1B9A)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px #4A148C44' }}
                >
                  ⬇ Download District Integrated Intelligence
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════ TAB 2 — WINEMAKERS SURVEY ═══════════════════ */}
      {activeTab === 'survey' && (
        <>
          {/* ── Dark Banner ── */}
          <section style={{ background: 'linear-gradient(135deg, #1A0533, #2D1B4E)', padding: '28px 0 24px' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#CE93D8', marginBottom: 6 }}>NEFWIC Survey 2026 · 10 Licensed Winemakers · MFEC Programme</div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Winemakers Survey — Enterprise Health</h2>
                  <p style={{ fontSize: '0.8rem', color: '#E1BEE7', lineHeight: 1.6, maxWidth: 520 }}>
                    Field survey of 10 licensed winemakers across 2 districts. Covers production capacity, revenue, barriers, and the impact of MFEC training on livelihoods.
                  </p>
                </div>
                <button onClick={() => downloadSurveyReport(winemakers)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#6A1B9A', border: '1.5px solid #CE93D8', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0 }}>
                  ⬇ Download Survey Report
                </button>
              </div>

              {/* KPI cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {[
                  { v: '10',      l: 'Winemakers',         sub: '9 EKH · 1 WGH',                              color: '#CE93D8' },
                  { v: '60%',     l: 'Women-Led',           sub: '6 of 10 female founders',                     color: '#F9A8D4' },
                  { v: `₹${(totalRevenue/10000000).toFixed(2)} Cr`, l: 'Revenue', sub: `${winemakers.filter(w=>w.revenue>0).length} active producers · FY 2025`, color: '#86EFAC' },
                  { v: `${utilizationRate}%`, l: 'Capacity Used', sub: `${totalActual.toLocaleString()} of ${totalCapacity.toLocaleString()} L`, color: '#FCD34D' },
                  { v: '100%',    l: 'Plan to Expand',      sub: 'All 10 respondents want to scale',            color: '#93C5FD' },
                  { v: '90%',     l: 'MFEC Training',       sub: '9 of 10 received NEFWIC training',            color: '#6EE7B7' },
                ].map(item => (
                  <div key={item.l} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: item.color, lineHeight: 1.1, marginBottom: 4 }}>{item.v}</div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: '#E1BEE7', marginBottom: 2 }}>{item.l}</div>
                    <div style={{ fontSize: '0.57rem', color: '#CE93D8', lineHeight: 1.4 }}>{item.sub}</div>
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
                    urgency: 'ACT THIS WEEK', urgencyColor: '#B91C1C', urgencyBg: '#FEE2E2', border: '#EF4444',
                    title: 'Resolve the Pasteur testing bottleneck — it\'s costing 4–5 months of revenue per batch',
                    body: 'Every bottle must clear Pasteur Institute quality testing before sale. The current wait is 4–5 months — tying up capital, missing market windows, and collapsing cash flow. This is the most consistently cited operational barrier across multiple winemakers.',
                    nums: [{ v: '4–5 mo', u: 'Testing Delay', n: 'Pasteur Institute wait time' }, { v: '#1', u: 'Barrier Cited', n: 'Most common across winemakers' }, { v: '48%', u: 'Capacity Used', n: 'Idleness partly due to testing lag' }],
                    action: 'Establish an expedited testing lane at Pasteur Institute for MFEC-registered winemakers. Target: &lt;4 weeks. Explore interim accreditation of a private lab as a bridge.',
                    note: 'While bottles wait for clearance, winemakers cannot collect payment, reducing cash available for the next harvest cycle.',
                  },
                  {
                    urgency: 'HIGH PRIORITY — UNLOCK SCALE', urgencyColor: '#C2410C', urgencyBg: '#FFF7ED', border: '#F97316',
                    title: 'Launch shared equipment programme — 7 of 10 winemakers cite it as #1 growth barrier',
                    body: 'Equipment (fermenters, bottling lines, cold rooms) blocks 7 of 10 winemakers from scaling. Most operate home-based setups with 500–5,000 L capacity. Combined installed capacity is 68,000 L but only 48% is used — the idle 52% is largely locked by equipment limitations, not lack of demand.',
                    nums: [{ v: '7/10', u: 'Equipment Barrier', n: 'Largest barrier by count' }, { v: '68,000 L', u: 'Total Capacity', n: '52% currently idle' }, { v: '9/10', u: 'East Khasi Hills', n: 'Shared facility makes sense here' }],
                    action: 'Design a shared fermentation and bottling facility in East Khasi Hills (9/10 winemakers are here). Alternatively, launch a subsidised equipment loan fund for winemakers earning &lt;₹10L/year.',
                    note: 'A shared facility benefits all 9 EKH winemakers without each bearing the full capital cost individually.',
                  },
                  {
                    urgency: 'PROGRAMME GAP — FIX FINANCE', urgencyColor: '#1D4ED8', urgencyBg: '#EFF6FF', border: '#3B82F6',
                    title: 'Finance access improved only 20% post-MFEC — far behind skills (80%) and markets (70%)',
                    body: 'MFEC training delivered strong results for technical skills (80% improvement) and market access (70%). But only 20% report better access to finance — meaning skills were built without the capital to act on them. Without credit, winemakers cannot buy fruit in bulk, invest in packaging, or enter premium markets.',
                    nums: [{ v: '80%', u: 'Skills Improved', n: 'Post-MFEC training uplift' }, { v: '70%', u: 'Market Access', n: 'Improved post-MFEC' }, { v: '20%', u: 'Finance Access', n: 'Critically low — needs action' }],
                    action: 'Introduce a wine-sector credit guarantee scheme or link winemakers to SHG credit facilities. Priority: winemakers with proven revenue (&gt;₹5L) but zero access to institutional finance.',
                    note: 'Umpohliew Wines grew from ₹4L to ₹14L income (3.5× uplift) post-MFEC — with finance access, similar results are replicable across all 10.',
                  },
                ].map(ins => (
                  <div key={ins.title} style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${ins.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: ins.urgencyBg, color: ins.urgencyColor, letterSpacing: '0.6px', textTransform: 'uppercase', alignSelf: 'flex-start' }}>{ins.urgency}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', lineHeight: 1.4 }}>{ins.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563', lineHeight: 1.65 }}>{ins.body}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ins.nums.map(n => (
                        <div key={n.u} style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 7px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4A148C' }}>{n.v}</div>
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

          {/* Key findings strip */}
          <div style={{ background: '#2D1B4E', padding: '12px 0' }}>
            <div className="container">
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E77D22', flexShrink: 0 }}>Key Findings</span>
                {['📍 E. Khasi Hills cluster — 9/10 winemakers, rain-fed 2,380mm, NDVI 0.69', '💸 80% cite no improvement in finance access despite revenue growth', '⏱ Pasteur Institute testing: 4–5 month delay — biggest bottleneck', '📈 Umpohliew: ₹4L → ₹14L income after MFEC training (3.5× uplift)', '🚀 68,000L combined capacity — 48% utilised; major scale-up headroom'].map(f => (
                  <span key={f} style={{ fontSize: '0.76rem', color: '#D1D5DB' }}>{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Enterprise geography map ──────────────────────────────────── */}
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">
              <h2 className="section-title">Wine Enterprise Geography</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #4A148C, #CE93D8)', borderRadius: 2, margin: '10px 0 8px' }} />
              <p className="section-subtitle" style={{ marginBottom: 18 }}>Spatial distribution of licensed winemakers across Meghalaya. Districts are coloured by winemaker density — click any district to explore its enterprise profile.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
                <div>
                  <div className="map-container">
                    <MeghalayaMap
                      colorFn={enterpriseColorFn}
                      popupFn={enterprisePopupFn}
                      height="480px"
                      legendItems={enterpriseLegendItems}
                      legendTitle="🍷 Wine Enterprise Density"
                      defaultTile="topo"
                      onDistrictClick={d => setSelectedEnterpriseDistrict(d)}
                      cropPresence="wine"
                    />
                  </div>
                  <p className="source-note">Source: NEFWIC Wine Makers Survey 2026 · 10 licensed winemakers across 2 districts · Click district to explore</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
                    {[
                      { icon: '📍', val: '9 / 10', label: 'East Khasi Hills', sub: 'dominant winemaking cluster' },
                      { icon: '💧', val: '2,380 mm', label: 'Annual Rainfall', sub: 'Very High water availability' },
                      { icon: '🛰', val: 'NDVI 0.69', label: 'Vegetation Health', sub: 'Excellent growing conditions' },
                      { icon: '🫐', val: '91 / 100', label: 'Plum Suitability', sub: 'Highest-scoring wine crop' },
                    ].map(c => (
                      <div key={c.label} style={{ background: 'linear-gradient(135deg, #F3E5F5, #EDE7F6)', border: '1px solid #CE93D8', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.78rem', marginBottom: 2 }}>{c.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#4A148C', lineHeight: 1.1 }}>{c.val}</div>
                        <div style={{ fontSize: '0.58rem', color: '#6A1B9A', fontWeight: 700, marginTop: 2 }}>{c.label}</div>
                        <div style={{ fontSize: '0.54rem', color: '#9C4FA0', lineHeight: 1.3, marginTop: 1 }}>{c.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enterprise right panel */}
                <div style={{ position: 'sticky', top: 110, maxHeight: 604, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4A148C', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>🍷 District Enterprise Profile</div>

                  <div style={{ background: enterpriseWs.length > 0 ? '#F3E5F5' : '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, color: '#4A148C', fontSize: '0.9rem', marginBottom: 6 }}>{selectedEnterpriseDistrict}</div>

                    {enterpriseWs.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: 0 }}>No licensed winemakers surveyed in this district.</p>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                          {[
                            { l: 'Winemakers',  v: enterpriseWs.length,                        c: '#4A148C' },
                            { l: 'Revenue',     v: entRev > 0 ? `₹${(entRev/100000).toFixed(1)}L` : '—', c: '#1B5E20' },
                            { l: 'Capacity',    v: `${entCap.toLocaleString()} L`,               c: '#1565C0' },
                            { l: 'Utilisation', v: `${entUtil}%`,                                c: entUtil >= 60 ? '#1B5E20' : '#E65100' },
                          ].map(({ l, v, c }) => (
                            <div key={l} style={{ background: '#fff', borderRadius: 7, padding: '7px 10px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                              <div style={{ fontSize: '1rem', fontWeight: 800, color: c }}>{v}</div>
                              <div style={{ fontSize: '0.6rem', color: '#6B7280', textTransform: 'uppercase' }}>{l}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 5 }}>Winemakers</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {enterpriseWs.map(w => {
                            const util = w.capacity > 0 ? Math.round(w.actual / w.capacity * 100) : 0;
                            return (
                              <div key={w.name} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #E5E7EB' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1F2937' }}>{w.name}</span>
                                  <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 8, background: w.gender === 'F' ? '#FCE4EC' : '#E3F2FD', color: w.gender === 'F' ? '#880E4F' : '#1565C0', fontWeight: 600 }}>{w.gender}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.62rem', color: '#6B7280' }}>{w.setup}</span>
                                  <span style={{ fontSize: '0.62rem', color: '#1B5E20', fontWeight: 600 }}>{w.revenue !== null ? `₹${(w.revenue/100000).toFixed(1)}L rev` : 'No data'}</span>
                                  <span style={{ fontSize: '0.62rem', color: '#1565C0' }}>{w.capacity.toLocaleString()}L cap</span>
                                </div>
                                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <div style={{ flex: 1, height: 4, background: '#F3F4F6', borderRadius: 2 }}>
                                    <div style={{ height: '100%', width: `${util}%`, background: util >= 60 ? '#1B5E20' : util > 0 ? '#F9A825' : '#EF5350', borderRadius: 2 }} />
                                  </div>
                                  <span style={{ fontSize: '0.58rem', color: '#6B7280', flexShrink: 0 }}>{util}% util</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Geo context for selected enterprise district */}
                  {(() => {
                    const w = waterData.find(d => d.district === selectedEnterpriseDistrict);
                    const n = ndviData.find(d => d.district === selectedEnterpriseDistrict);
                    const s = suitabilityData.find(d => d.district === selectedEnterpriseDistrict);
                    if (!w || !n || !s) return null;
                    return (
                      <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 13px' }}>
                        <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 7 }}>Why this district? Geo context</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {[
                            { icon: '🫐', label: 'Plum suitability', val: `${s.plum}/100`, color: getSuitColor(s.plum) },
                            { icon: '🍑', label: 'Peach suitability', val: `${s.peach}/100`, color: getSuitColor(s.peach) },
                            { icon: '💧', label: `Rainfall`, val: `${w.rainfall.toLocaleString()}mm · ${w.waterClass}`, color: getWaterColor(w.waterClass) },
                            { icon: '🛰', label: `NDVI`, val: `${n.ndvi} (${n.healthStatus})`, color: getNDVIColor(n.ndvi) },
                          ].map(({ icon, label, val, color }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '0.72rem', flexShrink: 0 }}>{icon}</span>
                              <span style={{ fontSize: '0.62rem', color: '#6B7280', flex: 1 }}>{label}</span>
                              <span style={{ fontSize: '0.66rem', fontWeight: 700, color }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </section>

          {/* Production + Revenue charts */}
          <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Production chart + insight sidebar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 236px', gap: 16, alignItems: 'start' }}>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#4A148C', marginBottom: 4 }}>Production: Capacity vs Actual Output</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 6 }}>Annual litres — installed capacity vs actual production</p>
                  <p style={{ fontSize: '0.63rem', color: '#9CA3AF', marginBottom: 10, lineHeight: 1.5 }}>💡 <strong>Gap = idle capacity.</strong> When Actual = 0 the winemaker did not produce that year. Combined 52% idle capacity = significant untapped potential if barriers are resolved.</p>
                  <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={productionChartData} margin={{ top: 5, right: 10, bottom: 30, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={48} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: 'Litres / Year', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                      <Tooltip formatter={(v, n) => [v.toLocaleString() + ' L', n]} />
                      <Legend verticalAlign="top" />
                      <Bar dataKey="Capacity (L)" fill="#CE93D8" radius={[3,3,0,0]} />
                      <Bar dataKey="Actual (L)"   fill="#4A148C" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7280', marginBottom: 2 }}>Key Takeaways</div>
                  {[
                    { color: '#4A148C', bg: '#F3E5F5', title: 'Kynjei Wines — largest producer', body: '19,000L installed capacity; highest in the cohort. Strong base for the shared facility anchor.' },
                    { color: '#C62828', bg: '#FEE2E2', title: '2 winemakers at 0 actual output', body: 'No production this year — fruit supply failure or testing delay. Immediate field follow-up needed.' },
                    { color: '#E65100', bg: '#FFF3E0', title: '52% combined idle capacity', body: '68,000L installed; only 33,000L produced. Full capacity = 2× current output with same equipment.' },
                    { color: '#1B5E20', bg: '#F0FDF4', title: 'Nao\'ki: 500L capacity', body: 'Smallest producer — targeted equipment support would meaningfully raise output.' },
                  ].map(c => (
                    <div key={c.title} style={{ background: c.bg, border: `1.5px solid ${c.color}33`, borderRadius: 9, padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: c.color, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: '0.67rem', color: '#4B5563', lineHeight: 1.55 }}>{c.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue chart + insight sidebar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 236px', gap: 16, alignItems: 'start' }}>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1B5E20', marginBottom: 4 }}>Revenue & Net Profit by Winemaker</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 12 }}>Annual figures in ₹ Lakhs — sorted by revenue (highest first)</p>
                  <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={revenueChartData} margin={{ top: 5, right: 10, bottom: 30, left: 38 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={48} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: 'Amount (₹ Lakhs)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                      <Tooltip formatter={(v) => [`₹${v}L`]} />
                      <Legend verticalAlign="top" />
                      <Bar dataKey="Revenue (₹L)" fill="#1B5E20" radius={[3,3,0,0]} />
                      <Bar dataKey="Profit (₹L)"  fill="#66BB6A" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7280', marginBottom: 2 }}>Key Takeaways</div>
                  {[
                    { color: '#1B5E20', bg: '#F0FDF4', title: 'Khasi Wines — ₹30L revenue', body: 'Commercial setup, highest earner. Proof that the wine sector is commercially viable at scale.' },
                    { color: '#1565C0', bg: '#EFF6FF', title: 'KevEll: ₹25L — strong growth', body: 'Post-MFEC revenue uplift. Demonstrates what skills + market access training delivers.' },
                    { color: '#C62828', bg: '#FEE2E2', title: '3 winemakers below ₹5L', body: 'Struggling with market reach — need direct linkage to premium buyers and hospitality sector.' },
                    { color: '#7B5E00', bg: '#FFFBEB', title: '~35% average profit margin', body: 'Strong margins where revenue is reported. Finance access to invest would compound returns.' },
                  ].map(c => (
                    <div key={c.title} style={{ background: c.bg, border: `1.5px solid ${c.color}33`, borderRadius: 9, padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: c.color, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: '0.67rem', color: '#4B5563', lineHeight: 1.55 }}>{c.body}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Barriers + MFEC Impact */}
          <section className="section-sm" style={{ background: '#fff' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Barriers chart + insight sidebar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 236px', gap: 16, alignItems: 'start' }}>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#C62828', marginBottom: 4 }}>Key Barriers to Business Growth</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 6 }}>Number of winemakers citing each challenge (n = 10)</p>
                  <p style={{ fontSize: '0.63rem', color: '#9CA3AF', marginBottom: 10, lineHeight: 1.5 }}>💡 Each winemaker could cite multiple barriers. Equipment (7/10) and Licensing/Testing (6/10) are structural — they require programme-level intervention.</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={barriersData} layout="vertical" margin={{ top: 5, right: 44, bottom: 5, left: 110 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} label={{ value: 'No. of Winemakers', position: 'insideBottom', offset: -3, style: { fontSize: 10, fill: '#666' } }} />
                      <YAxis type="category" dataKey="barrier" tick={{ fontSize: 11 }} width={105} />
                      <Tooltip formatter={(v) => [`${v} winemakers`]} />
                      <Bar dataKey="count" name="Winemakers" radius={[0,4,4,0]}>
                        {barriersData.map((_, i) => (
                          <Cell key={i} fill={['#B71C1C','#C62828','#D32F2F','#E64A19','#F57F17','#FB8C00'][i]} />
                        ))}
                        <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7280', marginBottom: 2 }}>Key Takeaways</div>
                  {[
                    { color: '#B71C1C', bg: '#FEE2E2', title: 'Equipment — 7 / 10 (structural)', body: 'Top barrier. Shared facility in East Khasi Hills would serve all 9 EKH winemakers without individual capital burden.' },
                    { color: '#C62828', bg: '#FFF3F3', title: 'Licensing / Testing — 6 / 10', body: 'Pasteur Institute delay = 4–5 months per batch. Expedited testing lane needed for MFEC-registered producers.' },
                    { color: '#E64A19', bg: '#FFF7ED', title: 'Finance — 5 / 10 winemakers', body: 'Skills were built, but capital to act on them is missing. Credit guarantee scheme or SHG link required.' },
                    { color: '#374151', bg: '#F9FAFB', title: 'Compound effect', body: 'Most winemakers face 2–3 simultaneous barriers. Solving equipment alone unlocks latent output immediately.' },
                  ].map(c => (
                    <div key={c.title} style={{ background: c.bg, border: `1.5px solid ${c.color}33`, borderRadius: 9, padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: c.color, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: '0.67rem', color: '#4B5563', lineHeight: 1.55 }}>{c.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MFEC Impact chart + insight sidebar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 236px', gap: 16, alignItems: 'start' }}>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1565C0', marginBottom: 4 }}>MFEC Impact — Income Before vs After</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 12 }}>Annual income (₹ Lakhs) for winemakers with before/after data available</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={impactData} margin={{ top: 5, right: 20, bottom: 5, left: 36 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: 'Income (₹L)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                      <Tooltip formatter={(v) => [`₹${v}L`]} />
                      <Legend verticalAlign="top" />
                      <Bar dataKey="Before" name="Before MFEC" fill="#90CAF9" radius={[3,3,0,0]} />
                      <Bar dataKey="After"  name="After MFEC"  fill="#1565C0" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Market Access',    pct: 70, color: '#1B5E20' },
                      { label: 'Technical Skills', pct: 80, color: '#1565C0' },
                      { label: 'Finance Access',   pct: 20, color: '#C62828' },
                    ].map(({ label, pct, color }) => (
                      <div key={label} style={{ textAlign: 'center', background: '#F9FAFB', borderRadius: 8, padding: '8px 6px', border: '1px solid #F3F4F6' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{pct}%</div>
                        <div style={{ fontSize: '0.62rem', color: '#374151', fontWeight: 600, marginTop: 2 }}>{label}</div>
                        <div style={{ fontSize: '0.56rem', color: '#6B7280' }}>improved post-MFEC</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7280', marginBottom: 2 }}>Key Takeaways</div>
                  {[
                    { color: '#1565C0', bg: '#EFF6FF', title: 'Umpohliew: ₹4L → ₹14L', body: '3.5× income uplift post-MFEC. This result is replicable — finance access was the difference.' },
                    { color: '#1B5E20', bg: '#F0FDF4', title: '80% improved technical skills', body: 'Training quality is high. Foundation is in place for scaling production quality.' },
                    { color: '#2563EB', bg: '#EFF6FF', title: '70% improved market access', body: 'Connections to buyers, hotels, and retail channels expanded significantly after training.' },
                    { color: '#C62828', bg: '#FEE2E2', title: '20% finance access — critical gap', body: 'Skills without capital stalls growth. A credit guarantee or SHG link is the missing piece.' },
                  ].map(c => (
                    <div key={c.title} style={{ background: c.bg, border: `1.5px solid ${c.color}33`, borderRadius: 9, padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: c.color, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: '0.67rem', color: '#4B5563', lineHeight: 1.55 }}>{c.body}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Winemakers enterprise profile — download card */}
          <section className="section" style={{ background: 'var(--bg-page)' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, background: 'linear-gradient(135deg, #1A0533, #2D1B4E)', border: '1.5px solid #6A1B9A', borderRadius: 14, padding: '22px 28px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#E1BEE7', marginBottom: 4 }}>All Winemakers — Enterprise Profile</h2>
                  <p style={{ fontSize: '0.75rem', color: '#CE93D8', lineHeight: 1.6, maxWidth: 540 }}>
                    Detailed operational profile for all 10 surveyed winemakers — setup type, production capacity, actual output, utilisation rate, revenue, net profit, margin, and MFEC training status. Landscape print-optimised for briefing use.
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                    {[
                      { v: '10', l: 'Winemakers' }, { v: '68,000 L', l: 'Total Capacity' }, { v: '48%', l: 'Utilised' }, { v: '60%', l: 'Women-led' },
                    ].map(k => (
                      <div key={k.l} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{k.v}</div>
                        <div style={{ fontSize: '0.6rem', color: '#CE93D8', fontWeight: 600 }}>{k.l}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.6rem', color: '#9C4FA0', marginTop: 8 }}>NEFWIC Wine Makers Survey 2026 · Revenue figures self-reported (₹ FY 2025) · Sections A–K</p>
                </div>
                <button
                  onClick={() => downloadWinemakersProfileReport(winemakers)}
                  style={{ background: 'linear-gradient(135deg, #6A1B9A, #9C27B0)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 22px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px #6A1B9A66' }}
                >
                  ⬇ Download Enterprise Profile
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}