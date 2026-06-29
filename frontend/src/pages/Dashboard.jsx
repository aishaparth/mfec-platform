import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Legend, CartesianGrid } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { suitabilityData, climateData, ndviData, waterData, getSuitColor, getNDVIColor, getFrostColor, getWaterColor } from '../data/districtData';
import { MILESTONES, DELIVERABLES } from '../data/projectData';

const LAYER_OPTIONS = [
  { key: 'buckwheat', label: '🌾 Buckwheat', color: '#1B5E20' },
  { key: 'plum', label: '🫐 Plum', color: '#4A148C' },
  { key: 'peach', label: '🍑 Peach', color: '#BF360C' },
  { key: 'passionFruit', label: '🥭 Passion Fruit', color: '#E65100' },
  { key: 'ndvi', label: '🛰 NDVI', color: '#00695C' },
  { key: 'frost', label: '❄ Frost Risk', color: '#C62828' },
  { key: 'water', label: '💧 Water', color: '#1565C0' },
];

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState('buckwheat');

  const colorFn = (feature) => {
    const name = feature.properties.district;
    if (['buckwheat', 'plum', 'peach', 'passionFruit'].includes(activeLayer)) {
      const d = suitabilityData.find(s => s.district === name);
      return d ? getSuitColor(d[activeLayer]) : '#ccc';
    }
    if (activeLayer === 'ndvi') {
      const d = ndviData.find(n => n.district === name);
      return d ? getNDVIColor(d.ndvi) : '#ccc';
    }
    if (activeLayer === 'frost') {
      const d = climateData.find(c => c.district === name);
      return d ? getFrostColor(d.frostLevel) : '#ccc';
    }
    if (activeLayer === 'water') {
      const d = waterData.find(w => w.district === name);
      return d ? getWaterColor(d.waterClass) : '#ccc';
    }
    return '#ccc';
  };

  const popupFn = (feature) => {
    const name = feature.properties.district;
    const p = feature.properties;
    const s = suitabilityData.find(d => d.district === name);
    const n = ndviData.find(d => d.district === name);
    const c = climateData.find(d => d.district === name);
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq} · Overall Rank #${s?.overallRank || '–'}</p>
        <div class="popup-row"><span class="popup-label">🌾 Buckwheat</span><span class="popup-val">${s?.buckwheat || '–'}/100</span></div>
        <div class="popup-row"><span class="popup-label">🫐 Plum</span><span class="popup-val">${s?.plum || '–'}/100</span></div>
        <div class="popup-row"><span class="popup-label">🥭 Passion Fruit</span><span class="popup-val">${s?.passionFruit || '–'}/100</span></div>
        <div class="popup-row"><span class="popup-label">🛰 NDVI</span><span class="popup-val">${n?.ndvi || '–'}</span></div>
        <div class="popup-row"><span class="popup-label">🌡 Mean Temp</span><span class="popup-val">${c?.temp || '–'}°C</span></div>
        <div class="popup-row"><span class="popup-label">🌧 Rainfall</span><span class="popup-val">${c?.rainfall?.toLocaleString() || '–'} mm</span></div>
      </div>`;
  };

  // Radar chart data for all crops
  const radarData = suitabilityData.slice(0, 6).map(d => ({
    district: d.district.split(' ').slice(-2).join(' '),
    Buckwheat: d.buckwheat,
    Plum: d.plum,
    Peach: d.peach,
    'Passion Fruit': d.passionFruit,
  }));

  const milestoneProgress = [
    { name: 'M1 – Suitability Modelling', date: '30 Jun', complete: true },
    { name: 'M2 – Model Validation & Mapping', date: '17 Jul', complete: true },
    { name: 'M3 – Crop Health & Climate', date: '07 Aug', complete: false },
    { name: 'M4 – Priority Zones & Dashboard', date: '21 Aug', complete: false },
    { name: 'M5 – Final Submission', date: '31 Aug', complete: false },
  ];

  return (
    <div>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #0D1B0E 0%, #1B3A1F 50%, #0A2614 100%)' }}>
        <div className="container">
          <div className="badge">Interactive GIS Dashboard · Deliverable 9</div>
          <h1>📊 Analytics Dashboard</h1>
          <p>Consolidated view of all analytical outputs. Switch layers to explore suitability, vegetation health, climate risk, and water availability across Meghalaya's 12 districts.</p>
        </div>
      </div>

      {/* Key metrics */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {[
              { v: '#1', l: 'East Khasi Hills', sub: 'Top Buckwheat District', c: '#1B5E20', bg: '#E8F5E9' },
              { v: '12', l: 'Districts Analysed', sub: 'Districts_12 shapefile', c: '#1B5E20', bg: '#E8F5E9' },
              { v: '46', l: 'Blocks Mapped', sub: 'Blocks_46 shapefile', c: '#4A148C', bg: '#F3E5F5' },
              { v: '82', l: 'Best Passion Fruit', sub: 'Ri Bhoi District', c: '#E65100', bg: '#FBE9E7' },
              { v: '0.89', l: 'Peak AUC Score', sub: 'E. Khasi Hills Model', c: '#00695C', bg: '#E0F2F1' },
              { v: '25,030', l: 'Buckwheat Cover (ha)', sub: 'Sentinel-2 mapped · 12 districts', c: '#1565C0', bg: '#E3F2FD' },
              { v: '3,200mm', l: 'Highest Rainfall', sub: 'W. Khasi Hills', c: '#1565C0', bg: '#E3F2FD' },
              { v: '12', l: 'Max Frost Risk Days', sub: 'E. Khasi Hills', c: '#C62828', bg: '#FFEBEE' },
            ].map(s => (
              <div key={s.l} className="stat-card" style={{ borderTop: `4px solid ${s.c}`, background: s.bg }}>
                <div className="stat-value" style={{ color: s.c, fontSize: '1.6rem' }}>{s.v}</div>
                <div className="stat-label">{s.l}</div>
                <div className="stat-note" style={{ color: s.c }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive consolidated map */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Multi-Layer GIS Viewer</h2>
            <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 12px' }} />
            <p className="section-subtitle">Switch between analytical layers. Click any district for full data summary.</p>
          </div>

          {/* Layer switcher */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {LAYER_OPTIONS.map(l => (
              <button key={l.key} onClick={() => setActiveLayer(l.key)}
                style={{ padding: '8px 16px', borderRadius: 8, border: `2px solid ${activeLayer === l.key ? l.color : 'var(--border)'}`, background: activeLayer === l.key ? l.color + '18' : '#fff', color: activeLayer === l.key ? l.color : 'var(--text-mid)', fontWeight: activeLayer === l.key ? 700 : 500, fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="map-container">
            <MeghalayaMap
              colorFn={colorFn}
              popupFn={popupFn}
              height="580px"
              showLayerControl={true}
              defaultTile="topo"
              legendItems={[]}
              legendTitle=""
            />
          </div>
          <p className="source-note" style={{ marginTop: 10, textAlign: 'center' }}>
            Data: MaxEnt v3.4.4 · Sentinel-2 (ESA) · WorldClim v2.1 · SRTM DEM (NASA) · GBIF · IMD · Survey of India
          </p>
        </div>
      </section>

      {/* Analytics charts */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="grid-2">
            {/* All crops bar */}
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 4 }}>Suitability Scores – All Crops & Districts</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Buckwheat vs. Wine Fruits MaxEnt scores</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={suitabilityData} margin={{ top: 5, right: 10, bottom: 80, left: 25 }}>
                  <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 9 }} label={{ value: 'District', position: 'insideBottom', offset: -22, style: { fontSize: 11, fill: '#666' } }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Suitability Score (0–100)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="buckwheat" name="🌾 Buckwheat" fill="#1B5E20" radius={[2,2,0,0]} />
                  <Bar dataKey="plum" name="🫐 Plum" fill="#7B1FA2" radius={[2,2,0,0]} />
                  <Bar dataKey="passionFruit" name="🥭 Passion Fruit" fill="#E65100" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* NDVI vs Suitability */}
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#004D40', marginBottom: 4 }}>NDVI Health vs. Buckwheat Suitability</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Correlation between crop health index and suitability score</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={suitabilityData.map((s, i) => ({
                  name: s.district.split(' ').slice(-2).join(' '),
                  Suitability: s.buckwheat,
                  NDVI: (ndviData.find(n => n.district === s.district)?.ndvi || 0) * 100
                }))} margin={{ top: 5, right: 10, bottom: 5, left: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 9 }} height={75} label={{ value: 'District', position: 'insideBottom', offset: -25, style: { fontSize: 11, fill: '#666' } }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Suitability" stroke="#1B5E20" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="NDVI" stroke="#00695C" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Milestone progress */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Project Milestone Progress</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 24px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MILESTONES.map((m, i) => (
              <div key={m.id} className="card card-sm" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>{m.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: 2 }}>{m.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Deliverables {m.deliverables}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: m.color, fontSize: '0.88rem' }}>{m.date}</div>
                  <div style={{ fontSize: '0.72rem', color: i < 2 ? 'var(--primary)' : 'var(--text-light)', fontWeight: 600 }}>{i < 2 ? '✓ On Track' : '⏳ Upcoming'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick navigation */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <h2 className="section-title">Navigate Analytics Modules</h2>
          <div className="grid-3" style={{ marginTop: 24 }}>
            {[
              { icon: '🌾', title: 'Buckwheat Suitability', sub: 'MaxEnt · 9 Districts · Deliverable 1', path: '/buckwheat-suitability', c: '#1B5E20' },
              { icon: '🍷', title: 'Wine Fruits Analysis', sub: 'Plum · Peach · Passion Fruit · Del. 2', path: '/wine-fruits', c: '#4A148C' },
              { icon: '🛰', title: 'Crop Health (NDVI)', sub: 'Sentinel-2 · Rabi 2025 · Del. 5', path: '/crop-health', c: '#004D40' },
              { icon: '🌡', title: 'Climate Risk', sub: 'Frost · Rainfall · Temperature · Del. 6', path: '/climate-risk', c: '#C62828' },
              { icon: '💧', title: 'Water Management', sub: 'CWR · Rainfall Adequacy · Del. 7', path: '/water-management', c: '#1565C0' },
              { icon: '🏆', title: 'Priority Zones', sub: 'Top 5 Blocks per District · Del. 8', path: '/priority-zones', c: '#E65100' },
            ].map(m => (
              <Link to={m.path} key={m.path} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ borderTop: `4px solid ${m.c}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{m.icon}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: m.c, fontSize: '1rem', marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{m.sub}</div>
                  <div style={{ marginTop: 10, color: m.c, fontSize: '0.82rem', fontWeight: 600 }}>Open →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
