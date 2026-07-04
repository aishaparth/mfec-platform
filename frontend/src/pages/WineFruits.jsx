import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, CartesianGrid, LabelList } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { suitabilityData, getSuitColor, getSuitClass, lulcData, waterData, climateData, ndviData, getNDVIColor, getWaterColor } from '../data/districtData';

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

// ── Winemaker survey data ────────────────────────────────────────────────────
const WINEMAKERS = [
  { name: 'Kynjai Wine',       gender: 'M', age: 40, district: 'East Khasi Hills', exp: 7,  setup: 'Commercial', capacity: 20000, actual: 8000,  revenue: 1500000, profit: 600000,  margin: '>30%',   incBefore: 0,       incAfter: 300000,  training: true,  barriers: ['Finance','Equipment','Licensing','Market access','Fruit supply'] },
  { name: 'Jonghi Wines',      gender: 'F', age: 63, district: 'East Khasi Hills', exp: 4,  setup: 'Home-based', capacity: 5000,  actual: 0,     revenue: 700000,  profit: 252000,  margin: '>30%',   incBefore: 0,       incAfter: 250000,  training: true,  barriers: ['Memory/age','Language barrier'] },
  { name: 'Umpohliew Wines',   gender: 'M', age: 36, district: 'East Khasi Hills', exp: 4,  setup: 'Home-based', capacity: 5000,  actual: 4200,  revenue: 1450000, profit: 1150000, margin: '>30%',   incBefore: 400000,  incAfter: 1400000, training: true,  barriers: ['Finance','Equipment'] },
  { name: 'Asame Wines',       gender: 'F', age: 54, district: 'West Garo Hills',  exp: 25, setup: 'Home-based', capacity: 5000,  actual: 4000,  revenue: 1400000, profit: 420000,  margin: '>30%',   incBefore: null,    incAfter: null,    training: false, barriers: [] },
  { name: "Daly's Fruit Wine", gender: 'M', age: 79, district: 'East Khasi Hills', exp: 33, setup: 'Commercial', capacity: 6000,  actual: 0,     revenue: null,    profit: null,    margin: '—',      incBefore: null,    incAfter: null,    training: true,  barriers: [] },
  { name: 'KevEll Wine',       gender: 'F', age: 35, district: 'East Khasi Hills', exp: 5,  setup: 'Home-based', capacity: 5000,  actual: 5000,  revenue: 2000000, profit: 1400000, margin: '>30%',   incBefore: 1500000, incAfter: 3000000, training: true,  barriers: ['Finance','Equipment','Licensing','Market access','Fruit supply'] },
  { name: 'Khasi Wine',        gender: 'F', age: 35, district: 'East Khasi Hills', exp: 9,  setup: 'Home-based', capacity: 10000, actual: 8000,  revenue: 3000000, profit: 1000000, margin: '>30%',   incBefore: null,    incAfter: 3000000, training: true,  barriers: ['Equipment','Licensing','Market access','Water','Storage'] },
  { name: 'Emsan Wine',        gender: 'F', age: 35, district: 'East Khasi Hills', exp: 7,  setup: 'Home-based', capacity: 500,   actual: 0,     revenue: 0,       profit: 0,       margin: '10–20%', incBefore: null,    incAfter: null,    training: true,  barriers: ['Equipment','Licensing','Water','Storage'] },
  { name: 'Neski Wine',        gender: 'F', age: 44, district: 'East Khasi Hills', exp: 8,  setup: 'Home-based', capacity: 10000, actual: 3000,  revenue: 1120000, profit: 700000,  margin: '>30%',   incBefore: null,    incAfter: 1120000, training: true,  barriers: ['Finance','Equipment','Licensing'] },
  { name: 'Mannari Wine',      gender: 'M', age: 40, district: 'East Khasi Hills', exp: 14, setup: 'Home-based', capacity: 1500,  actual: 600,   revenue: 700000,  profit: 140000,  margin: '10–20%', incBefore: null,    incAfter: 500000,  training: true,  barriers: ['Finance','Equipment','Licensing','Market access','Fruit supply'] },
];

// Group winemakers by district for the enterprise map
const winemakersByDistrict = WINEMAKERS.reduce((acc, w) => {
  if (!acc[w.district]) acc[w.district] = [];
  acc[w.district].push(w);
  return acc;
}, {});

// ── Pre-computed chart data ──────────────────────────────────────────────────
const totalRevenue    = WINEMAKERS.filter(w => w.revenue > 0).reduce((s, w) => s + w.revenue, 0);
const totalCapacity   = WINEMAKERS.reduce((s, w) => s + w.capacity, 0);
const totalActual     = WINEMAKERS.reduce((s, w) => s + w.actual, 0);
const utilizationRate = Math.round(totalActual / totalCapacity * 100);

const productionChartData = WINEMAKERS.map(w => ({
  name: w.name.split(' ')[0],
  'Capacity (L)': w.capacity,
  'Actual (L)': w.actual,
}));

const revenueChartData = WINEMAKERS
  .filter(w => w.revenue !== null)
  .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
  .map(w => ({
    name: w.name.split(' ')[0],
    'Revenue (₹L)': +((w.revenue || 0) / 100000).toFixed(1),
    'Profit (₹L)':  +((w.profit  || 0) / 100000).toFixed(1),
  }));

const barriersData = [
  { barrier: 'Equipment',         count: 7 },
  { barrier: 'Licensing/Testing', count: 6 },
  { barrier: 'Finance',           count: 5 },
  { barrier: 'Fruit Supply',      count: 4 },
  { barrier: 'Storage/Water',     count: 4 },
  { barrier: 'Market Access',     count: 3 },
];

const impactData = WINEMAKERS
  .filter(w => w.incBefore !== null && w.incAfter !== null)
  .map(w => ({
    name:   w.name.split(' ')[0],
    Before: +((w.incBefore || 0) / 100000).toFixed(1),
    After:  +((w.incAfter  || 0) / 100000).toFixed(1),
  }));

const TABS = [
  { key: 'suitability', label: '🗺 Suitability Analysis' },
  { key: 'survey',      label: '🍷 Winemakers Survey' },
];

// ────────────────────────────────────────────────────────────────────────────
export default function WineFruits() {
  const [activeTab,                 setActiveTab]                 = useState('suitability');
  const [activeCrop,                setActiveCrop]                = useState('plum');
  const [selectedDistrict,          setSelectedDistrict]          = useState('East Khasi Hills');
  const [activeLayers,              setActiveLayers]              = useState(['suitability']);
  const [selectedEnterpriseDistrict, setSelectedEnterpriseDistrict] = useState('East Khasi Hills');

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
          <div className="badge" style={{ color: '#E77D22', borderColor: '#E77D22', background: 'rgba(231,125,34,0.15)' }}>Deliverable 2 · MaxEnt Suitability · NEFWIC Winemakers Survey</div>
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
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">

              {/* Crop selector */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                {CROPS.map(c => (
                  <button key={c.key} onClick={() => setActiveCrop(c.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, border: `2px solid ${activeCrop === c.key ? c.color : 'var(--border)'}`, background: activeCrop === c.key ? c.bg : '#fff', color: activeCrop === c.key ? c.color : 'var(--text-mid)', fontWeight: activeCrop === c.key ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '1.3rem' }}>{c.emoji}</span>{c.label}
                  </button>
                ))}
              </div>

              {/* Crop info banner */}
              <div style={{ background: crop.bg, border: `1px solid ${crop.color}22`, borderRadius: 12, padding: '13px 20px', marginBottom: 18, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>{crop.emoji}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: crop.color, fontFamily: 'var(--font-heading)', marginBottom: 3, fontSize: '0.96rem' }}>{crop.label} – MaxEnt Suitability Model</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>{crop.desc}</p>
                </div>
                <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
                  {[['🌡', 'Temp', crop.optimalTemp], ['🌧', 'Rainfall', crop.rainfall], ['⛰', 'Elevation', crop.elevation]].map(([ic, lb, val]) => (
                    <div key={lb} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem' }}>{ic}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>{lb}</div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: crop.color }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Layer toggle ──────────────────────────────────────────── */}
              <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Map Layers</span>
                  {LAYERS.map(l => {
                    const active = activeLayers.includes(l.key);
                    return (
                      <button key={l.key} onClick={() => toggleLayer(l.key)}
                        title={l.desc}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 13px', borderRadius: 20, border: `2px solid ${l.color}`, background: active ? l.color : 'transparent', color: active ? '#fff' : l.color, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.18s', letterSpacing: '0.01em' }}>
                        <span>{l.icon}</span>
                        <span>{l.label}</span>
                        <span style={{ opacity: 0.75, fontSize: '0.7rem', marginLeft: 1 }}>{active ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
                {activeLayers.length === 0 && (
                  <div style={{ marginTop: 8, fontSize: '0.76rem', color: '#C62828', padding: '4px 8px', background: '#FFEBEE', borderRadius: 6, display: 'inline-block' }}>Select at least one layer</div>
                )}
                {activeLayers.length > 1 && (
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.5 }}>
                    <span style={{ background: '#E0E7FF', color: '#3730A3', fontWeight: 700, padding: '1px 7px', borderRadius: 10, marginRight: 6 }}>⚡ Composite view — {activeLayers.length} layers</span>
                    Districts are coloured by the average score across all selected layers. Darker green = strong on <em>all</em> criteria simultaneously. Click a district for the full layer breakdown.
                  </div>
                )}
                {activeLayers.length === 1 && (
                  <div style={{ marginTop: 6, fontSize: '0.74rem', color: '#6B7280' }}>
                    {LAYERS.find(l => l.key === activeLayers[0])?.desc} · Add more layers to see composite overlap
                  </div>
                )}
              </div>

              {/* Map + right panel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

                {/* Map */}
                <div>
                  <div className="map-container">
                    <MeghalayaMap
                      colorFn={colorFn}
                      popupFn={popupFn}
                      height="520px"
                      legendItems={legendItems}
                      legendTitle={legendTitle}
                      defaultTile="topo"
                      onDistrictClick={d => setSelectedDistrict(d)}
                    />
                  </div>
                  <p className="source-note">MaxEnt v3.4.4 · WorldClim v2.1 · SRTM DEM 30m · ESRI LULC 10m · MODIS MOD13Q1 Jan–Jun 2026 · Click district for geo-intelligence</p>
                </div>

                {/* Right panel */}
                <div style={{ position: 'sticky', top: 110 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: crop.color, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>{crop.emoji} District Rankings</div>

                  <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 2, marginBottom: 12 }}>
                    {sorted.map((d, i) => (
                      <div key={d.district} onClick={() => setSelectedDistrict(d.district)}
                        style={{ borderLeft: `3px solid ${getSuitColor(d[activeCrop])}`, padding: '5px 10px', cursor: 'pointer', borderRadius: '0 6px 6px 0', background: selectedDistrict === d.district ? crop.bg : '#F9FAFB', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}>
                        <span className={`rank-badge${i < 3 ? [' gold', ' silver', ' bronze'][i] : ''}`} style={{ fontSize: '0.6rem', width: 18, height: 18, lineHeight: '18px' }}>{i + 1}</span>
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

                      {/* 3-crop tiles */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 7 }}>
                        {CROPS.map(c => (
                          <div key={c.key} style={{ background: c.bg, borderRadius: 7, padding: '6px 4px', textAlign: 'center', border: `1px solid ${c.color}22`, outline: activeCrop === c.key ? `2px solid ${c.color}` : 'none' }}>
                            <div style={{ fontSize: '0.64rem' }}>{c.emoji}</div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: getSuitColor(selectedSuit[c.key]) }}>{selectedSuit[c.key]}</div>
                            <div style={{ fontSize: '0.5rem', color: '#6B7280', textTransform: 'uppercase' }}>{c.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Score bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${selectedSuit[activeCrop]}%`, background: getSuitColor(selectedSuit[activeCrop]), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.68rem', color: getSuitColor(selectedSuit[activeCrop]), fontWeight: 700, flexShrink: 0 }}>{selectedSuit[activeCrop]}/100</span>
                      </div>

                      {/* Geo-Intelligence breakdown */}
                      <div style={{ borderTop: '1px dashed #D1D5DB', paddingTop: 8 }}>
                        <div style={{ fontSize: '0.57rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 7 }}>Geo Intelligence · All layers</div>

                        {/* LULC */}
                        {selectedLulc && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.57rem', color: '#6B7280', fontWeight: 600 }}>🌿 LULC 2025-26 · ESRI 10m</span>
                              <span style={{ fontSize: '0.56rem', padding: '1px 5px', borderRadius: 8, background: activeLayers.includes('cropland') ? '#FFF3E0' : '#F3F4F6', color: activeLayers.includes('cropland') ? '#E65100' : '#9CA3AF', fontWeight: 600 }}>{activeLayers.includes('cropland') ? '● Active layer' : '○ Not in composite'}</span>
                            </div>
                            {[
                              { l: 'Forest',    v: selectedLulc.evergreenForestPct, c: '#2E7D32' },
                              { l: 'Shrubland', v: selectedLulc.shrublandPct,       c: '#8BC34A' },
                              { l: 'Cropland',  v: selectedLulc.croplandPct,        c: '#F9A825' },
                              { l: 'Built-up',  v: selectedLulc.builtupPct,         c: '#78909C' },
                            ].map(({ l, v, c }) => (
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

                        {/* Water */}
                        {selectedWater && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.57rem', color: '#6B7280', fontWeight: 600 }}>💧 Water Availability</span>
                              <span style={{ fontSize: '0.56rem', padding: '1px 5px', borderRadius: 8, background: activeLayers.includes('water') ? '#E3F2FD' : '#F3F4F6', color: activeLayers.includes('water') ? '#1565C0' : '#9CA3AF', fontWeight: 600 }}>{activeLayers.includes('water') ? '● Active layer' : '○ Not in composite'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#1565C0' }}>{selectedWater.rainfall.toLocaleString()}mm/yr</span>
                              <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: 8, background: getWaterColor(selectedWater.waterClass) + '18', color: getWaterColor(selectedWater.waterClass), fontWeight: 600 }}>{selectedWater.waterClass}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                              {[{l:'Plum 720mm',ok:selectedWater.rainfall>=720},{l:'Peach 680mm',ok:selectedWater.rainfall>=680},{l:'Passion 1400mm',ok:selectedWater.rainfall>=1400}].map(({l,ok})=>(
                                <span key={l} style={{ fontSize: '0.52rem', padding: '1px 4px', borderRadius: 6, background: ok ? '#E8F5E9' : '#FFEBEE', color: ok ? '#1B5E20' : '#C62828', fontWeight: 600 }}>{ok?'✓':'✗'} {l}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Climate */}
                        {selectedClimate && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: '0.57rem', color: '#6B7280', fontWeight: 600, marginBottom: 3 }}>🌡 Climate · {selectedClimate.temp}°C · {selectedClimate.frostDays} frost days/yr</div>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {[{l:'Plum',ok:selectedClimate.temp<=21},{l:'Peach',ok:selectedClimate.temp<=22},{l:'Passion',ok:selectedClimate.temp>=19}].map(({l,ok})=>(
                                <span key={l} style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: ok ? '#E8F5E9' : '#FFEBEE', color: ok ? '#1B5E20' : '#C62828', border: `1px solid ${ok ? '#A5D6A7' : '#EF9A9A'}` }}>{ok?'✓':'✗'} {l}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* NDVI */}
                        {selectedNdvi && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.57rem', color: '#6B7280', fontWeight: 600 }}>🛰 NDVI/NDWI · MODIS Jan–Jun 2026</span>
                              <span style={{ fontSize: '0.56rem', padding: '1px 5px', borderRadius: 8, background: activeLayers.includes('ndvi') ? '#E8F5E9' : '#F3F4F6', color: activeLayers.includes('ndvi') ? '#2E7D32' : '#9CA3AF', fontWeight: 600 }}>{activeLayers.includes('ndvi') ? '● Active layer' : '○ Not in composite'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {[
                                { label: 'NDVI', val: selectedNdvi.ndvi, color: getNDVIColor(selectedNdvi.ndvi), sub: selectedNdvi.healthStatus, bg: '#F0FAF0' },
                                { label: 'NDWI', val: selectedNdvi.ndwi, color: '#1565C0', sub: `${selectedNdvi.moistureStress} Stress`, bg: '#EFF6FF' },
                                { label: 'Veg %', val: `${selectedNdvi.vegetationCoverPct}%`, color: '#6A1B9A', sub: 'Cover', bg: '#F3E5F5' },
                              ].map(({ label, val, color, sub, bg }) => (
                                <div key={label} style={{ background: bg, borderRadius: 6, padding: '5px 7px', textAlign: 'center', flex: 1 }}>
                                  <div style={{ fontSize: '0.53rem', color: '#6B7280' }}>{label}</div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color }}>{val}</div>
                                  <div style={{ fontSize: '0.5rem', color, fontWeight: 600 }}>{sub}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Layer composite score summary */}
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

          {/* Multi-crop bar chart */}
          <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
            <div className="container">
              <h2 className="section-title">Multi-Crop Comparison — All Districts</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #4A148C, #E65100)', borderRadius: 2, margin: '10px 0 20px' }} />
              <div className="card">
                <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Plum, Peach & Passion Fruit suitability scores side-by-side across all 12 districts</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={suitabilityData} margin={{ top: 5, right: 10, bottom: 85, left: 25 }}>
                    <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 9 }} label={{ value: 'District', position: 'insideBottom', offset: -22, style: { fontSize: 11, fill: '#666' } }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Suitability Score (0–100)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="plum"         name="🫐 Plum"         fill="#7B1FA2" radius={[3,3,0,0]} />
                    <Bar dataKey="peach"        name="🍑 Peach"        fill="#BF360C" radius={[3,3,0,0]} />
                    <Bar dataKey="passionFruit" name="🥭 Passion Fruit" fill="#E65100" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Integrated intelligence table */}
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">
              <h2 className="section-title">District Integrated Intelligence</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #4A148C, #1565C0)', borderRadius: 2, margin: '10px 0 8px' }} />
              <p className="section-subtitle" style={{ marginBottom: 20 }}>Wine suitability cross-referenced with LULC, water, NDVI/NDWI and climate — sorted by best wine score. Click any row to select that district on the map above.</p>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>District</th>
                      <th>Best Wine Crop</th>
                      <th>🫐 Plum</th>
                      <th>🍑 Peach</th>
                      <th>🥭 Passion</th>
                      <th>🌿 Cropland %</th>
                      <th>💧 Rainfall (mm)</th>
                      <th>Water Class</th>
                      <th>🛰 NDVI</th>
                      <th>🌡 Temp °C</th>
                      <th>Climate Fit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {integratedData.map(d => (
                      <tr key={d.district} onClick={() => setSelectedDistrict(d.district)} style={{ cursor: 'pointer', background: selectedDistrict === d.district ? '#F3E5F5' : undefined }}>
                        <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{d.district}</td>
                        <td><span style={{ fontWeight: 700 }}>{d.bestCrop}</span><span style={{ marginLeft: 5, fontWeight: 800, color: getSuitColor(d.best), fontSize: '0.78rem' }}>{d.best}</span></td>
                        <td><span style={{ fontWeight: 700, color: getSuitColor(d.plum) }}>{d.plum}</span></td>
                        <td><span style={{ fontWeight: 700, color: getSuitColor(d.peach) }}>{d.peach}</span></td>
                        <td><span style={{ fontWeight: 700, color: getSuitColor(d.passionFruit) }}>{d.passionFruit}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 34, height: 5, background: '#F3F4F6', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: `${Math.min((d.l?.croplandPct || 0) * 5, 100)}%`, background: '#F9A825', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: '0.76rem', color: '#92400E' }}>{d.l?.croplandPct}%</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: '#1565C0', fontSize: '0.82rem' }}>{d.w?.rainfall.toLocaleString()}</td>
                        <td><span style={{ fontWeight: 600, fontSize: '0.76rem', color: getWaterColor(d.w?.waterClass) }}>{d.w?.waterClass}</span></td>
                        <td><span style={{ fontWeight: 700, color: getNDVIColor(d.n?.ndvi || 0) }}>{d.n?.ndvi}</span></td>
                        <td style={{ fontSize: '0.82rem' }}>{d.c?.temp}°C</td>
                        <td style={{ fontSize: '0.75rem' }}>
                          {d.c?.temp <= 21 ? <span style={{ color: '#1B5E20', fontWeight: 600 }}>✓ Plum/Peach</span> : <span style={{ color: '#E65100', fontWeight: 600 }}>✓ Passion</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="source-note" style={{ marginTop: 10 }}>MaxEnt v3.4.4 · ESRI LULC 10m 2025-26 · IMD/WorldClim · MODIS MOD13Q1 Jan–Jun 2026</p>
            </div>
          </section>

          {/* Priority zones */}
          <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
            <div className="container">
              <h2 className="section-title">Priority Cultivation Zones</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 20px' }} />
              <div className="grid-3">
                {[
                  { crop: '🫐 Plum',         districts: ['East Khasi Hills (91)', 'West Khasi Hills (86)', 'West Jaintia Hills (80)', 'South West Khasi Hills (75)'], note: 'Cool-climate belt · 1,000–1,800m · NDVI 0.62–0.72', color: '#4A148C' },
                  { crop: '🍑 Peach',        districts: ['East Khasi Hills (88)', 'West Khasi Hills (83)', 'West Jaintia Hills (76)', 'South West Khasi Hills (71)'], note: 'Khasi plateau · 800–1,700m · 12–22°C',             color: '#BF360C' },
                  { crop: '🥭 Passion Fruit',districts: ['Ri Bhoi (82)', 'West Garo Hills (80)', 'East Garo Hills (78)', 'East Jaintia Hills (78)'],                  note: 'Lower elevation warm-belt · 200–900m · >20°C',     color: '#E65100' },
                ].map(z => (
                  <div key={z.crop} className="card" style={{ borderTop: `4px solid ${z.color}` }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: z.color, marginBottom: 12, fontSize: '1rem' }}>{z.crop}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {z.districts.map((d, i) => (
                        <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem' }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: z.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                          {d}
                        </div>
                      ))}
                    </div>
                    <p className="source-note" style={{ marginTop: 12, fontStyle: 'normal', fontWeight: 500, color: z.color }}>{z.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════ TAB 2 — WINEMAKERS SURVEY ═══════════════════ */}
      {activeTab === 'survey' && (
        <>
          {/* KPI banner */}
          <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
                {[
                  { v: '10',    l: 'Licensed Winemakers',   sub: '9 East Khasi Hills · 1 West Garo Hills', c: '#4A148C', bg: '#F3E5F5' },
                  { v: '60%',   l: 'Women-Led Enterprises', sub: '6 female founders of 10 surveyed',       c: '#880E4F', bg: '#FCE4EC' },
                  { v: `₹${(totalRevenue/10000000).toFixed(2)} Cr`, l: 'Combined Revenue', sub: 'From 8 active producers (FY 2025)', c: '#1B5E20', bg: '#E8F5E9' },
                  { v: `${utilizationRate}%`, l: 'Capacity Utilisation', sub: `${totalActual.toLocaleString()} L of ${totalCapacity.toLocaleString()} L`, c: '#E65100', bg: '#FBE9E7' },
                  { v: '100%',  l: 'Plan to Expand',        sub: 'All 10 respondents',                      c: '#1565C0', bg: '#E3F2FD' },
                  { v: '90%',   l: 'MFEC Training',         sub: '9 of 10 received NEFWIC training',        c: '#00695C', bg: '#E0F2F1' },
                ].map(s => (
                  <div key={s.l} className="stat-card" style={{ borderTop: `4px solid ${s.c}`, background: s.bg }}>
                    <div className="stat-value" style={{ color: s.c, fontSize: '1.5rem' }}>{s.v}</div>
                    <div className="stat-label">{s.l}</div>
                    <div className="stat-note" style={{ color: s.c + 'BB' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Key findings strip */}
          <div style={{ background: '#2D1B4E', padding: '14px 0' }}>
            <div className="container">
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E77D22', flexShrink: 0 }}>Key Findings</span>
                {[
                  '📍 E. Khasi Hills cluster — 9/10 winemakers, rain-fed 2,380mm, NDVI 0.69',
                  '💸 80% cite no improvement in finance access despite revenue growth',
                  '⏱ Pasteur Institute testing: 4–5 month delay — biggest bottleneck',
                  '📈 Umpohliew: ₹4L → ₹14L income after MFEC training (3.5× uplift)',
                  '🚀 68,000L combined capacity — 48% utilised; major scale-up headroom',
                ].map(f => <span key={f} style={{ fontSize: '0.78rem', color: '#D1D5DB' }}>{f}</span>)}
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
                    />
                  </div>
                  <p className="source-note">Source: NEFWIC Wine Makers Survey 2026 · 10 licensed winemakers across 2 districts · Click district to explore</p>
                </div>

                {/* Enterprise right panel */}
                <div style={{ position: 'sticky', top: 110 }}>
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
            <div className="container">
              <div className="grid-2">
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#4A148C', marginBottom: 4 }}>Production: Capacity vs Actual Output</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Annual litres — installed capacity vs actual production</p>
                  <ResponsiveContainer width="100%" height={300}>
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

                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1B5E20', marginBottom: 4 }}>Revenue & Net Profit by Winemaker</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Annual figures in ₹ Lakhs — sorted by revenue (highest first)</p>
                  <ResponsiveContainer width="100%" height={300}>
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
              </div>
            </div>
          </section>

          {/* Barriers + MFEC Impact */}
          <section className="section-sm" style={{ background: '#fff' }}>
            <div className="container">
              <div className="grid-2">
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#C62828', marginBottom: 4 }}>Key Barriers to Business Growth</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Number of winemakers citing each challenge (n = 10)</p>
                  <ResponsiveContainer width="100%" height={260}>
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

                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1565C0', marginBottom: 4 }}>MFEC Impact — Income Before vs After</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Annual income (₹ Lakhs) for winemakers with before/after data available</p>
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
                  <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
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
              </div>
            </div>
          </section>

          {/* Full winemakers table */}
          <section className="section" style={{ background: 'var(--bg-page)' }}>
            <div className="container">
              <h2 className="section-title">All Winemakers — Enterprise Profile</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #4A148C, #E65100)', borderRadius: 2, margin: '10px 0 20px' }} />
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Winemaker</th>
                      <th>District</th>
                      <th>Setup</th>
                      <th>Exp</th>
                      <th>Capacity (L)</th>
                      <th>Actual (L)</th>
                      <th>Utilisation</th>
                      <th>Revenue</th>
                      <th>Net Profit</th>
                      <th>Margin</th>
                      <th>MFEC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WINEMAKERS.map(w => {
                      const util = w.capacity > 0 ? Math.round(w.actual / w.capacity * 100) : 0;
                      return (
                        <tr key={w.name}>
                          <td style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                            {w.name}
                            <span style={{ marginLeft: 6, fontSize: '0.62rem', padding: '1px 5px', borderRadius: 8, background: w.gender === 'F' ? '#FCE4EC' : '#E3F2FD', color: w.gender === 'F' ? '#880E4F' : '#1565C0', fontWeight: 600 }}>{w.gender}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{w.district}</td>
                          <td><span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: 10, background: w.setup === 'Commercial' ? '#E8F5E9' : '#F3F4F6', color: w.setup === 'Commercial' ? '#1B5E20' : '#6B7280', fontWeight: 600 }}>{w.setup}</span></td>
                          <td style={{ textAlign: 'center', fontSize: '0.82rem' }}>{w.exp} yr</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.82rem' }}>{w.capacity.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.82rem', color: w.actual === 0 ? '#C62828' : '#1B5E20' }}>{w.actual.toLocaleString()}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <div style={{ width: 38, height: 5, background: '#F3F4F6', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${util}%`, background: util >= 70 ? '#1B5E20' : util > 0 ? '#F9A825' : '#C62828', borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{util}%</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#1B5E20', fontSize: '0.82rem' }}>{w.revenue !== null ? `₹${(w.revenue/100000).toFixed(1)}L` : '—'}</td>
                          <td style={{ fontWeight: 700, color: '#388E3C', fontSize: '0.82rem' }}>{w.profit !== null ? `₹${(w.profit/100000).toFixed(1)}L` : '—'}</td>
                          <td><span style={{ fontSize: '0.72rem', fontWeight: 600, color: w.margin === '>30%' ? '#1B5E20' : w.margin === '—' ? '#9CA3AF' : '#E65100' }}>{w.margin}</span></td>
                          <td style={{ textAlign: 'center' }}><span style={{ color: w.training ? '#1B5E20' : '#C62828', fontWeight: 700 }}>{w.training ? '✓' : '✗'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="source-note" style={{ marginTop: 12 }}>NEFWIC Wine Makers Survey 2026 · 10 licensed winemakers · MFEC GeoAI Platform · Revenue figures self-reported (₹) · Sections A–K</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}