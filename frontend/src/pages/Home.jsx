import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MeghalayaMap from '../components/MeghalayaMap';
import { getSuitColor } from '../data/districtData';
import { useData } from '../context/DataContext';

// ─── Static data ───────────────────────────────────────────────────────────

const CROP_CARDS = [
  { name: 'Buckwheat',     emoji: '🌾', path: '/buckwheat-suitability', score: 87, topDistrict: 'East Khasi Hills', districts: '4 Priority', desc: 'MaxEnt model across 12 districts. East Khasi Hills ranks #1 at 87%, ideal at 1,350m elevation.', color: '#1B5E20' },
  { name: 'Plum',         emoji: '🫐', path: '/wine-fruits',           score: 91, topDistrict: 'East Khasi Hills', districts: '4 Priority', desc: 'East Khasi Hills achieves 91% suitability with cool temperatures and well-drained Khasi soils.', color: '#4A148C' },
  { name: 'Peach',        emoji: '🍑', path: '/wine-fruits',           score: 88, topDistrict: 'East Khasi Hills', districts: '4 Priority', desc: 'Temperature-sensitive modelling reveals East Khasi (88%) and West Khasi Hills (82%) as top zones.', color: '#BF360C' },
  { name: 'Passion Fruit',emoji: '🥭', path: '/wine-fruits',           score: 82, topDistrict: 'Ri Bhoi',          districts: '3 Priority', desc: 'Thrives at lower elevations. Ri Bhoi emerges as the top passion fruit district (82%) with warm humid microclimate.', color: '#E65100' },
];

const INSIGHTS = [
  {
    step: '01', urgency: 'Act This Week',
    urgencyColor: '#B91C1C', urgencyBg: '#FEE2E2', borderColor: '#FECACA',
    headline: '153 farmers are ready to return — but only if buyers are confirmed first',
    numbers: [
      { v: '180', u: 'Dropout Farmers', n: '76.6% of 235 surveyed' },
      { v: '85%', u: 'Will Return',     n: 'If conditions are right' },
      { v: '81',  u: 'W. Jaintia Drops',n: '#1 barrier: no guaranteed buyer' },
    ],
    action: 'Secure committed buyers and communicate guaranteed MSP before restarting seed supply or any training programme',
  },
  {
    step: '02', urgency: 'This Season',
    urgencyColor: '#92400E', urgencyBg: '#FEF3C7', borderColor: '#FCD34D',
    headline: '4 districts justify investment now — do not spread budget across all 12',
    numbers: [
      { v: '4',    u: 'Priority 1 Districts', n: 'Combined score ≥60/100' },
      { v: '31–44',u: 'Garo Hills Score',     n: 'Below investment threshold' },
      { v: '≥70%', u: 'Budget to P1',         n: 'Recommended allocation' },
    ],
    action: 'Direct ≥70% of programme funds to West Khasi Hills, East Khasi Hills, E.W. Khasi Hills, and West Jaintia Hills only',
  },
  {
    step: '03', urgency: 'This Season',
    urgencyColor: '#1565C0', urgencyBg: '#E3F2FD', borderColor: '#BFDBFE',
    headline: 'East Khasi Hills leads every crop — it is the single safest programme investment',
    numbers: [
      { v: '91%',   u: 'Top Plum Score',     n: 'East Khasi Hills' },
      { v: '87%',   u: 'Top Buckwheat Score',n: 'East Khasi Hills' },
      { v: '0.992', u: 'Model AUC',          n: 'Highest predictive accuracy' },
    ],
    action: 'Launch all 4 crop programmes simultaneously in East Khasi Hills to maximise infrastructure synergy and economies of scale',
  },
  {
    step: '04', urgency: 'Plan Ahead',
    urgencyColor: '#166534', urgencyBg: '#DCFCE7', borderColor: '#86EFAC',
    headline: '10,000 ha of wasteland sits untapped within high-suitability zones',
    numbers: [
      { v: '52,200', u: 'ha Total Cropland',  n: 'ESRI LULC 2025-26' },
      { v: '10K',    u: 'ha Wasteland',        n: 'Conversion potential' },
      { v: '3,200mm',u: 'Rainfall, W. Khasi', n: 'Highest annual in state' },
    ],
    action: 'Commission wasteland feasibility study in the 4 Priority 1 districts before Rabi 2026 (sowing: Oct–Nov 2026 · harvest: Jan–Feb 2027) planning cycle begins',
  },
];

const MODULES = [
  { icon: '🌾', title: 'Buckwheat Suitability', desc: 'MaxEnt modelling with terrain analysis, district rankings, intervention zones, and farmer survey data.', path: '/buckwheat-suitability', color: '#1B5E20' },
  { icon: '🍷', title: 'Wine Fruits Analysis',  desc: 'Separate suitability models for Plum, Peach, and Passion Fruit with priority zone maps.',               path: '/wine-fruits',           color: '#4A148C' },
  { icon: '🛰', title: 'Crop Health (NDVI)',     desc: 'Sentinel-2 vegetation health and moisture stress assessment across Meghalaya — Rabi 2025.',              path: '/crop-health',           color: '#00695C' },
  { icon: '🌡', title: 'Climate Risk',           desc: 'Frost risk mapping, temperature suitability windows, and seasonal rainfall adequacy by district.',       path: '/climate-risk',          color: '#B71C1C' },
  { icon: '💧', title: 'Water Management',       desc: 'Crop water requirement estimation, groundwater stations, and seasonal water availability analysis.',      path: '/water-management',      color: '#1565C0' },
  { icon: '🏆', title: 'Priority Zones',         desc: 'Top 5 blocks per district ranked by combined suitability score with area estimation.',                    path: '/priority-zones',        color: '#F9A825' },
  { icon: '🌤', title: 'Live Weather',           desc: 'Real-time and historical weather monitoring across Meghalaya districts — temperature, rainfall, humidity.',path: '/weather',               color: '#0369A1' },
  { icon: '📊', title: 'Analytics Dashboard',   desc: 'Unified view of all crop models, climate indicators, and programme performance metrics.',                 path: '/dashboard',             color: '#374151' },
];

// ─── PDF report ─────────────────────────────────────────────────────────────

function buildReportHTML() {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>MFEC GeoAI — Executive Actionable Brief</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;padding:36px 40px;color:#1F2937;font-size:12px;line-height:1.5}
h1{font-size:19px;color:#14532D;margin-bottom:4px}
.meta{font-size:10px;color:#6B7280;padding-bottom:12px;border-bottom:3px solid #14532D;margin-bottom:20px}
.sh{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#14532D;border-left:4px solid #14532D;padding-left:8px;margin:22px 0 10px}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.kpi{border:1px solid #D1FAE5;border-top:3px solid #14532D;padding:8px 10px}
.kpi-v{font-size:20px;font-weight:800;color:#14532D}.kpi-l{font-size:10px;color:#374151;font-weight:600;margin-top:2px}.kpi-n{font-size:9px;color:#9CA3AF}
.ins{border:1px solid #E5E7EB;border-left:5px solid #ccc;padding:12px 14px;margin-bottom:12px;page-break-inside:avoid}
.ins-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.ins-step{background:#F3F4F6;color:#374151;font-size:9px;font-weight:700;text-transform:uppercase;padding:2px 8px}
.ins-u{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;padding:2px 10px}
.ins-hl{font-size:13px;font-weight:700;color:#1F2937;margin-bottom:8px}
.ins-nums{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px}
.ins-num{text-align:center;padding:6px 4px;border:1px solid #F3F4F6;background:#FAFAFA}
.ins-num-v{font-size:17px;font-weight:800}.ins-num-u{font-size:9px;font-weight:600;color:#374151;margin-top:2px}.ins-num-n{font-size:9px;color:#9CA3AF}
.ins-action{padding:7px 10px;font-size:11px}.ins-action-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#14532D;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
td{padding:5px 8px;border-bottom:1px solid #F3F4F6}
tr:nth-child(even) td{background:#F9FAFB}
.p1{color:#166534;font-weight:700}.p2{color:#92400E;font-weight:700}.p3{color:#374151;font-weight:700}
.footer{margin-top:24px;padding-top:10px;border-top:1px solid #E5E7EB;font-size:9px;color:#9CA3AF}
@page{margin:18mm 14mm}
</style></head><body>
<h1>MFEC GeoAI Platform — Executive Actionable Brief</h1>
<div class="meta">
Meghalaya Farmers' Empowerment Commission Development · Government of Meghalaya · Generated: ${date}<br>
Sources: Buckwheat Report v9.0 (June 2026) · MaxEnt v3.4.4 · WorldClim v2.1 · ESRI LULC 2025-26 · Field Survey n=235
</div>

<div class="sh">KEY PROGRAMME STATISTICS</div>
<div class="kpi-row">
<div class="kpi"><div class="kpi-v">235</div><div class="kpi-l">Farmers Surveyed</div><div class="kpi-n">Buckwheat, June 2026</div></div>
<div class="kpi"><div class="kpi-v">76.6%</div><div class="kpi-l">Dropout Rate</div><div class="kpi-n">180 of 235 farmers</div></div>
<div class="kpi"><div class="kpi-v">85%</div><div class="kpi-l">Will Return</div><div class="kpi-n">153 dropout farmers</div></div>
<div class="kpi"><div class="kpi-v">0.992</div><div class="kpi-l">Model AUC</div><div class="kpi-n">MaxEnt accuracy score</div></div>
</div>

<div class="sh">4 ACTIONABLE INSIGHTS FOR OFFICIALS</div>
${INSIGHTS.map(ins => `
<div class="ins" style="border-left-color:${ins.urgencyColor}">
<div class="ins-top">
  <span class="ins-step">${ins.step}</span>
  <span class="ins-u" style="background:${ins.urgencyBg};color:${ins.urgencyColor}">${ins.urgency}</span>
</div>
<div class="ins-hl">${ins.headline}</div>
<div class="ins-nums">
  ${ins.numbers.map(n => `<div class="ins-num"><div class="ins-num-v" style="color:${ins.urgencyColor}">${n.v}</div><div class="ins-num-u">${n.u}</div><div class="ins-num-n">${n.n}</div></div>`).join('')}
</div>
<div class="ins-action" style="background:${ins.urgencyBg};border:1px solid ${ins.borderColor}">
  <div class="ins-action-lbl" style="color:${ins.urgencyColor}">Recommended Action</div>
  ${ins.action}
</div>
</div>`).join('')}

<div class="sh">DISTRICT INVESTMENT PRIORITY RANKING</div>
<table>
<tr><th>#</th><th>District</th><th>Priority Tier</th><th>Land Suitability</th><th>Programme Ready</th><th>Combined</th><th>Action Type</th></tr>
<tr><td>1</td><td>West Khasi Hills</td><td class="p1">P1 — Invest Now</td><td>82/100</td><td>92/100</td><td><strong>87</strong></td><td>Consolidate &amp; Scale</td></tr>
<tr><td>2</td><td>East Khasi Hills</td><td class="p1">P1 — Invest Now</td><td>87/100</td><td>53/100</td><td><strong>70</strong></td><td>Revive — High ROI</td></tr>
<tr><td>3</td><td>E. West Khasi Hills</td><td class="p1">P1 — Invest Now</td><td>68/100</td><td>62/100</td><td><strong>65</strong></td><td>Revive &amp; Consolidate</td></tr>
<tr><td>4</td><td>West Jaintia Hills</td><td class="p1">P1 — Invest Now</td><td>78/100</td><td>47/100</td><td><strong>63</strong></td><td>Revival — Urgent</td></tr>
<tr><td>5</td><td>South West Khasi Hills</td><td class="p2">P2 — Prepare</td><td>72/100</td><td>42/100</td><td><strong>57</strong></td><td>Pilot Only</td></tr>
<tr><td>6</td><td>East Jaintia Hills</td><td class="p2">P2 — Prepare</td><td>65/100</td><td>43/100</td><td><strong>54</strong></td><td>Pilot Only</td></tr>
<tr><td>7</td><td>Ri Bhoi</td><td class="p2">P2 — Prepare</td><td>58/100</td><td>44/100</td><td><strong>51</strong></td><td>Field Validate First</td></tr>
<tr><td>8</td><td>North Garo Hills</td><td class="p3">P3 — Hold</td><td>48/100</td><td>40/100</td><td><strong>44</strong></td><td>No investment now</td></tr>
<tr><td>9</td><td>West Garo Hills</td><td class="p3">P3 — Hold</td><td>38/100</td><td>40/100</td><td><strong>39</strong></td><td>No investment now</td></tr>
<tr><td>10</td><td>South Garo Hills</td><td class="p3">P3 — Hold</td><td>35/100</td><td>40/100</td><td><strong>38</strong></td><td>No investment now</td></tr>
<tr><td>11</td><td>South West Garo Hills</td><td class="p3">P3 — Hold</td><td>32/100</td><td>40/100</td><td><strong>36</strong></td><td>No investment now</td></tr>
<tr><td>12</td><td>East Garo Hills</td><td class="p3">P3 — Hold</td><td>42/100</td><td>20/100</td><td><strong>31</strong></td><td>No investment now</td></tr>
</table>

<div class="sh">CROP SUITABILITY SUMMARY (MAXENT)</div>
<table>
<tr><th>Crop</th><th>Top District</th><th>Top Score</th><th>AUC</th><th>High Suitability Districts (≥66)</th></tr>
<tr><td>Buckwheat</td><td>East Khasi Hills</td><td>87/100</td><td>0.992</td><td>4</td></tr>
<tr><td>Plum</td><td>East Khasi Hills</td><td>91/100</td><td>0.89</td><td>4</td></tr>
<tr><td>Peach</td><td>East Khasi Hills</td><td>88/100</td><td>0.87</td><td>4</td></tr>
<tr><td>Passion Fruit</td><td>Ri Bhoi</td><td>82/100</td><td>0.84</td><td>3</td></tr>
</table>
<div style="margin-top:8px;padding:8px 12px;background:#F0FDF4;border:1px solid #D1FAE5;font-size:10px;color:#374151;line-height:1.7">
  <strong style="color:#14532D">How to read this table:</strong>&nbsp;
  <strong>Top Score</strong> — Suitability score out of 100; reflects how well a district's climate, elevation, and rainfall match the ideal growing conditions for that crop. A score of 66+ is considered High Suitability.&nbsp;
  <strong>AUC (Area Under the Curve)</strong> — A measure of how accurate the MaxEnt prediction model is: 1.0 = perfect, 0.5 = random chance. Any value above 0.70 is scientifically reliable; scores above 0.90 are considered excellent.&nbsp;
  <strong>High Suitability Districts</strong> — Number of districts (out of 12) that score ≥66 and are recommended for active programme investment for that crop.
</div>

<div class="footer">
MFEC GeoAI Platform · 22 May – 31 August 2026 · MaxEnt v3.4.4 · WorldClim v2.1 · MODIS MOD13Q1 · Sentinel-2 · ESRI LULC 2025-26
</div>
</body></html>`;
}

function downloadReport() {
  const html = buildReportHTML();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500);
    });
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  const { suitabilityData } = useData();
  const [activeTab, setActiveTab] = useState('buckwheat');

  const colorFn = feature => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    return d ? getSuitColor(d[activeTab === 'passionFruit' ? 'passionFruit' : activeTab]) : '#ccc';
  };

  const popupFn = feature => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    const p = feature.properties;
    if (!d) return `<div class="district-popup"><h3>${p.district}</h3></div>`;
    const score = d[activeTab === 'passionFruit' ? 'passionFruit' : activeTab];
    const cls   = score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low';
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq} · ${p.region}</p>
        <div class="popup-row"><span class="popup-label">Overall Rank</span><span class="popup-val">#${d.overallRank}</span></div>
        <div class="popup-row"><span class="popup-label">Buckwheat</span><span class="popup-val">${d.buckwheat}/100</span></div>
        <div class="popup-row"><span class="popup-label">Plum</span><span class="popup-val">${d.plum}/100</span></div>
        <div class="popup-row"><span class="popup-label">Passion Fruit</span><span class="popup-val">${d.passionFruit}/100</span></div>
        <div class="popup-row"><span class="popup-label">AUC (LODO)</span><span class="popup-val">${d.aucScore}</span></div>
      </div>`;
  };

  const legendItems = [
    { color: '#5F7D68', label: 'High (75–100)' },
    { color: '#388E3C', label: 'Good (60–74)' },
    { color: '#8BC34A', label: 'Medium (50–59)' },
    { color: '#FDD835', label: 'Low (40–49)' },
    { color: '#E53935', label: 'Very Low (<40)' },
  ];


  return (
    <div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO — two-column: headline + right intelligence panel             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section style={{
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(160deg, #1E2420 0%, #2C362E 40%, #1A231C 70%, #212B22 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,168,147,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,168,37,0.05) 0%, transparent 70%)' }} />

        {/* Download button — top right */}
        <button onClick={downloadReport} style={{
          position: 'absolute', top: 24, right: 24, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(183,201,187,0.4)',
          color: '#B7C9BB', borderRadius: 8, padding: '8px 16px', fontSize: '0.78rem',
          fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(6px)',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ↓ Download Executive Brief
        </button>

        <div className="container" style={{ padding: '52px 24px 44px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 52, alignItems: 'center' }}>

            {/* LEFT: headline + CTAs + quick stats */}
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(249,168,37,0.12)', border: '1px solid rgba(249,168,37,0.25)', color: '#FFD54F', fontSize: '0.72rem', fontWeight: 600, padding: '5px 14px', borderRadius: 50, letterSpacing: '0.6px', textTransform: 'uppercase' }}>MaxEnt · AUC 0.992</span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', color: '#fff', lineHeight: 1.2, marginBottom: 18 }}>
                Meghalaya Agricultural<br />
                <span style={{ color: '#8CA893' }}>Intelligence Platform</span>
              </h1>

              <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 12, maxWidth: 600 }}>
                Advanced geospatial analysis supporting the <strong style={{ color: '#B7C9BB' }}>MFEC Buckwheat and Fruit Wine Initiatives</strong>. Habitat suitability modelling, satellite crop health, and climate-risk analytics across all 12 districts.
              </p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
                Client: Meghalaya Farmers' Empowerment Commission Development (MFEC) · Government of Meghalaya
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                <Link to="/dashboard" className="btn btn-primary" style={{ background: '#2E7D32', fontSize: '0.9rem', padding: '12px 26px' }}>
                  📊 Open Dashboard
                </Link>
                <Link to="/buckwheat-suitability" className="btn btn-outline" style={{ color: '#B7C9BB', border: '2px solid rgba(183,201,187,0.4)', padding: '12px 26px', fontSize: '0.9rem' }}>
                  🗺 Suitability Maps
                </Link>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { v: '12',    l: 'Districts Analysed' },
                  { v: '4',     l: 'Crops Modelled' },
                  { v: '46',    l: 'Priority Blocks' },
                  { v: '>0.70', l: 'Target AUC Score' },
                ].map(s => (
                  <div key={s.l} style={{ borderLeft: '3px solid rgba(140,168,147,0.4)', paddingLeft: 14 }}>
                    <div style={{ color: '#8CA893', fontSize: '1.55rem', fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{s.v}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Latest Intelligence panel */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(140,168,147,0.18)', borderRadius: 16, padding: '24px 22px', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#A8C4AC', marginBottom: 18 }}>
                Latest Field Intelligence · June 2026
              </div>

              {[
                { v: '235',   l: 'Farmers Surveyed',    n: 'Buckwheat field survey',          c: '#A8C4AC' },
                { v: '76.6%', l: 'Dropout Rate',         n: '180 of 235 farmers discontinued', c: '#FCA5A5' },
                { v: '85%',   l: 'Will Return',           n: 'Given the right conditions',      c: '#6EE7B7' },
                { v: '0.992', l: 'Model AUC Accuracy',   n: 'MaxEnt climate model — excellent', c: '#93C5FD' },
              ].map(item => (
                <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: item.c, lineHeight: 1, minWidth: 68 }}>{item.v}</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2 }}>{item.l}</div>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{item.n}</div>
                  </div>
                </div>
              ))}

              <button onClick={downloadReport} style={{
                width: '100%', marginTop: 18, padding: '11px 0',
                background: 'rgba(140,168,147,0.15)', border: '1.5px solid rgba(140,168,147,0.35)',
                color: '#A8C4AC', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(140,168,147,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(140,168,147,0.15)'}
              >
                ↓ Download Executive PDF Brief
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3 DECISIONS THIS SEASON — action strip                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ background: 'linear-gradient(90deg, #141713, #1E241C, #141713)', borderTop: '1px solid rgba(140,168,147,0.15)', borderBottom: '1px solid rgba(140,168,147,0.15)' }}>
        <div className="container" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#A8C4AC', marginBottom: 5 }}>3 Decisions Needed</div>
              <div style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>This Programme Season</div>
            </div>
            {[
              { icon: '🛒', label: 'Secure Buyers First', note: 'Lock confirmed buyers before restarting seed supply in West Jaintia Hills — this was the #1 dropout reason' },
              { icon: '📍', label: 'Focus on 4 Districts', note: 'Do not spread budget across 12. West Khasi, East Khasi, E.W. Khasi, W. Jaintia only — combined score ≥63' },
              { icon: '🌱', label: 'East Khasi = Anchor', note: 'Leads all 4 crops. Start all programmes here together to maximise shared infrastructure and buyer linkage' },
            ].map((a, i) => (
              <div key={i} style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 22 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.3rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{a.icon}</span>
                  <div>
                    <div style={{ color: '#8CA893', fontWeight: 700, fontSize: '0.8rem', marginBottom: 5 }}>{a.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.72rem', lineHeight: 1.6 }}>{a.note}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DISTRICT SUITABILITY MAP + STATS                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div className="badge" style={{ background: '#E6ECE4', color: 'var(--primary)', border: '1px solid #B7C9BB', padding: '4px 14px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'inline-block', marginBottom: 8 }}>Interactive Map</div>
              <h2 className="section-title" style={{ marginBottom: 6 }}>District Suitability Overview</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '8px 0 10px' }} />
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Click any district to inspect crop scores. Toggle crops to compare suitability across all 4 programmes.</p>
            </div>
            <div className="tab-bar" style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
              {[['buckwheat', '🌾 Buckwheat'], ['plum', '🫐 Plum'], ['peach', '🍑 Peach'], ['passionFruit', '🥭 Passion Fruit']].map(([key, label]) => (
                <button key={key} className={`tab-btn${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start' }}>
            {/* Left: map */}
            <div>
              <div className="map-container">
                <MeghalayaMap colorFn={colorFn} popupFn={popupFn} height="490px" legendItems={legendItems} legendTitle="Suitability Score" defaultTile="topo" />
              </div>
              <p className="source-note" style={{ marginTop: 8 }}>
                MaxEnt Habitat Suitability Model · Survey of India boundaries · Sentinel-2, ESA Copernicus
              </p>

              {/* Glossary */}
              <div style={{ background: '#F0F2EF', border: '1px solid #BBF7D0', borderRadius: 10, padding: '13px 15px', marginTop: 12 }}>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#3F5A47', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 10 }}>📖 What do these numbers mean?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
                  {[
                    { icon: '🎯', term: 'Suitability Score (0–100)', def: 'How well a district matches ideal growing conditions — climate, elevation, rainfall. 90+ = near-perfect fit. Think of it as a "crop happiness index".' },
                    { icon: '📊', term: 'AUC Score (0–1)',            def: 'Model accuracy. 0.992 = 99.2% correct at predicting where crops grow. Above 0.70 is scientifically reliable; ours is excellent.' },
                    { icon: '🏆', term: 'Top District Score',         def: 'The highest score any single district achieved for that crop — showing exactly where farmers and policymakers should invest first.' },
                  ].map(({ icon, term, def }, i, arr) => (
                    <div key={term} style={{ paddingRight: i < arr.length - 1 ? 20 : 0, borderRight: i < arr.length - 1 ? '1px solid #E1E8E2' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.68rem', color: '#3F5A47', marginBottom: 3 }}>{icon} {term}</div>
                      <div style={{ fontSize: '0.66rem', color: '#374151', lineHeight: 1.55 }}>{def}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: '0.6rem', color: '#6B7280', fontStyle: 'italic', borderTop: '1px solid #E1E8E2', paddingTop: 8 }}>
                  Model: MaxEnt v3.4.4 · Climate: WorldClim v2.1 bioclim variables · Satellite: MODIS MOD13Q1, Sentinel-2
                </div>
              </div>
            </div>

            {/* Right: key stats */}
            <div style={{ position: 'sticky', top: 76 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                {[
                  { v: '22,429',    l: 'State Area (km²)',       n: 'Meghalaya total',          icon: '🗺', color: '#1565C0', bg: '#E3F2FD' },
                  { v: '87/100',    l: 'Top Buckwheat Score',    n: 'East Khasi Hills',         icon: '🌾', color: '#5F7D68', bg: '#E6ECE4' },
                  { v: '91/100',    l: 'Top Plum Score',         n: 'East Khasi Hills',         icon: '🫐', color: '#4A148C', bg: '#F3E5F5' },
                  { v: '88/100',    l: 'Top Peach Score',        n: 'East Khasi Hills',         icon: '🍑', color: '#BF360C', bg: '#FBE9E7' },
                  { v: '82/100',    l: 'Top Passion Fruit',      n: 'Ri Bhoi District',         icon: '🥭', color: '#E65100', bg: '#FFF3E0' },
                  { v: '0.992',     l: 'Model AUC (Buckwheat)',  n: 'Excellent accuracy',       icon: '📈', color: '#1565C0', bg: '#E3F2FD' },
                  { v: '52,200 ha', l: 'Total Cropland',         n: '42K cultivable · 10K waste',icon: '🌱', color: '#558B2F', bg: '#F1F8E9' },
                  { v: '3,200 mm',  l: 'Peak Annual Rainfall',   n: 'West Khasi Hills',         icon: '🌧', color: '#00838F', bg: '#E0F7FA' },
                ].map(s => (
                  <div key={s.l} style={{ background: s.bg, borderRadius: 9, padding: '9px 10px', border: `1px solid ${s.color}22` }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: 2 }}>{s.icon}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: s.color, fontSize: '1rem', lineHeight: 1.1 }}>{s.v}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#374151', marginTop: 2, lineHeight: 1.3 }}>{s.l}</div>
                    <div style={{ fontSize: '0.55rem', color: '#6B7280', marginTop: 1 }}>{s.n}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ACTIONABLE INSIGHTS — 4 decisions for officials                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F1F5F9', padding: '56px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5F7D68', marginBottom: 7 }}>Evidence-Based · For Officials</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0F172A', lineHeight: 1.2, margin: 0 }}>
                4 Decisions That <span style={{ color: '#5F7D68' }}>Cannot Wait</span>
              </h2>
            </div>
            <button onClick={downloadReport} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#5F7D68', color: '#fff', border: 'none',
              borderRadius: 9, padding: '11px 22px', fontSize: '0.85rem',
              fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#4B6352'}
              onMouseLeave={e => e.currentTarget.style.background = '#5F7D68'}
            >
              ↓ Download PDF Brief
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {INSIGHTS.map(ins => (
              <div key={ins.step} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', borderTop: `4px solid ${ins.urgencyColor}` }}>
                <div style={{ padding: '22px 24px 16px' }}>
                  {/* Step + urgency tag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: ins.urgencyBg, color: ins.urgencyColor, fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${ins.borderColor}` }}>
                      {ins.step}
                    </div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: ins.urgencyColor, background: ins.urgencyBg, padding: '3px 11px', borderRadius: 20, border: `1px solid ${ins.borderColor}` }}>
                      {ins.urgency}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#0F172A', lineHeight: 1.4, marginBottom: 18 }}>
                    {ins.headline}
                  </h3>

                  {/* Evidence numbers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {ins.numbers.map(n => (
                      <div key={n.u} style={{ textAlign: 'center', padding: '10px 6px', background: '#F8FAFC', borderRadius: 9, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: ins.urgencyColor, lineHeight: 1 }}>{n.v}</div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#374151', marginTop: 4, lineHeight: 1.3 }}>{n.u}</div>
                        <div style={{ fontSize: '0.57rem', color: '#9CA3AF', marginTop: 2, lineHeight: 1.3 }}>{n.n}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action box */}
                <div style={{ background: ins.urgencyBg, borderTop: `1px solid ${ins.borderColor}`, padding: '14px 24px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: ins.urgencyColor, marginBottom: 5 }}>
                    Recommended Action
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#1F2937', fontWeight: 500, lineHeight: 1.65, margin: 0 }}>
                    {ins.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CROPS FEATURE BAND                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(160deg, #1E2420 0%, #2C362E 50%, #1A231C 100%)', padding: '52px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B7C9BB', marginBottom: 8 }}>MaxEnt · WorldClim v2.1 · GBIF Occurrences</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#fff', margin: 0, lineHeight: 1.2 }}>
                Crops Under <span style={{ color: '#8CA893' }}>Analysis</span>
              </h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', maxWidth: 380, lineHeight: 1.65, margin: 0 }}>
              Four crops modelled using habitat suitability analysis — terrain, climate, and satellite health across all 12 districts.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {CROP_CARDS.map(c => (
              <Link key={c.name} to={c.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.color}44`,
                  borderTop: `4px solid ${c.color}`, borderRadius: 14, padding: '24px 20px',
                  height: '100%', display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = `0 12px 32px ${c.color}33`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{c.emoji}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: c.color, lineHeight: 1 }}>{c.score}%</div>
                      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>top score</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: `${c.color}cc`, marginBottom: 5 }}>{c.topDistrict}</div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>{c.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, flex: 1, marginBottom: 16 }}>{c.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: c.color, fontWeight: 700, fontSize: '0.8rem' }}>
                    Explore suitability map <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PLATFORM MODULES + TIMELINE (combined)                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-page)' }}>
        <div className="container">

          {/* Analytics modules */}
          <h2 className="section-title" style={{ marginBottom: 6 }}>All Available Modules</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '6px 0 20px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {MODULES.map(m => (
              <Link to={m.path} key={m.path} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ borderTop: `4px solid ${m.color}`, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{m.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: m.color, marginBottom: 7 }}>{m.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.7, flex: 1 }}>{m.desc}</p>
                  <div style={{ marginTop: 12, color: m.color, fontWeight: 600, fontSize: '0.8rem' }}>Open →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}