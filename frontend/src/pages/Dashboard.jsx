import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeatherData } from '../hooks/useWeatherData';
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

function LiveWeatherStrip() {
  const { summary, loading, lastUpdated } = useWeatherData();
  if (loading && !summary) return null;
  if (!summary) return null;
  return (
    <div style={{ background: 'linear-gradient(90deg, #E3F2FD, #E8F5E9)', borderBottom: '1px solid #C8E6C9', padding: '10px 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1565C0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2E7D32', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          Live Weather
        </span>
        {[
          { icon: '🌡️', v: summary.avgTemp.toFixed(1) + '°C', l: 'Avg Temp' },
          { icon: '💧', v: Math.round(summary.avgHum) + '%', l: 'Humidity' },
          { icon: '🌧️', v: summary.maxRain.r.rain.toFixed(1) + ' mm', l: summary.maxRain.d.name },
          { icon: '🔥', v: summary.hottest.d.name, l: summary.hottest.r.temp.toFixed(1) + '°C' },
        ].map(s => (
          <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem' }}>
            <span>{s.icon}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{s.v}</span>
            <span style={{ color: 'var(--text-light)', fontSize: '0.74rem' }}>{s.l}</span>
          </div>
        ))}
        <Link to="/weather" style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
          Full weather →
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState('buckwheat');
  const [showMilestones, setShowMilestones] = useState(false);

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
      <LiveWeatherStrip />
      <div className="page-header" style={{ borderTop: '4px solid #1B5E20', background: "linear-gradient(135deg, rgba(232,245,233,0.68) 0%, rgba(241,248,233,0.68) 60%, rgba(250,255,248,0.68) 100%), url('/images/dashboard-farmers.jpg') center/cover no-repeat" }}>
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
              { v: '9,850', l: 'Buckwheat Cover (ha)', sub: 'LULC-corrected · 12 districts', c: '#1565C0', bg: '#E3F2FD' },
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, alignItems: 'start' }}>
            <div className="map-container">
              <MeghalayaMap
                colorFn={colorFn}
                popupFn={popupFn}
                height="500px"
                showLayerControl={true}
                defaultTile="topo"
                legendItems={[]}
                legendTitle=""
              />
            </div>

            {/* Legend panel */}
            <div style={{ background: 'var(--bg-page)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)', position: 'sticky', top: 80 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {LAYER_OPTIONS.find(l => l.key === activeLayer)?.label} Legend
              </div>

              {/* Suitability layers */}
              {['buckwheat', 'plum', 'peach', 'passionFruit'].includes(activeLayer) && [
                { color: '#1B5E20', label: 'High (86–100)' },
                { color: '#388E3C', label: 'Medium-High (66–85)' },
                { color: '#8BC34A', label: 'Medium (46–65)' },
                { color: '#FDD835', label: 'Low (26–45)' },
                { color: '#E53935', label: 'Very Low (<26)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: '0.78rem', color: '#374151' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
                  {item.label}
                </div>
              ))}

              {/* NDVI layer */}
              {activeLayer === 'ndvi' && [
                { color: '#1B5E20', label: 'Dense (≥0.70)' },
                { color: '#388E3C', label: 'Healthy (0.60–0.69)' },
                { color: '#8BC34A', label: 'Moderate (0.50–0.59)' },
                { color: '#FDD835', label: 'Sparse (0.40–0.49)' },
                { color: '#E53935', label: 'Bare (<0.40)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: '0.78rem', color: '#374151' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
                  {item.label}
                </div>
              ))}

              {/* Frost layer */}
              {activeLayer === 'frost' && [
                { color: '#B71C1C', label: 'High Risk' },
                { color: '#E64A19', label: 'Medium Risk' },
                { color: '#F57F17', label: 'Low Risk' },
                { color: '#8BC34A', label: 'Minimal Risk' },
                { color: '#1B5E20', label: 'No Risk' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: '0.78rem', color: '#374151' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
                  {item.label}
                </div>
              ))}

              {/* Water layer */}
              {activeLayer === 'water' && [
                { color: '#0D47A1', label: 'Very High Availability' },
                { color: '#1976D2', label: 'High Availability' },
                { color: '#64B5F6', label: 'Medium Availability' },
                { color: '#FFB74D', label: 'Low Availability' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: '0.78rem', color: '#374151' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
                  {item.label}
                </div>
              ))}

              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: '0.65rem', color: '#9CA3AF', lineHeight: 1.5 }}>
                Click any district for full data summary
              </div>
            </div>
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

      {/* Key Insights + collapsible Milestones */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Key Insights</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '8px 0 0' }} />
            </div>
            <button onClick={() => setShowMilestones(s => !s)} style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--primary)', background: '#F0F7F0', border: '1px solid #A5D6A7', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {showMilestones ? '▲ Hide Milestones' : '▼ Milestones'}
            </button>
          </div>

          {/* Insight cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 14, marginTop: 20 }}>
            {[
              {
                icon: '🌾', module: 'Buckwheat Suitability', c: '#1B5E20', bg: '#E8F5E9', border: '#A5D6A7',
                headline: 'East Khasi Hills — #1 district, score 88/100',
                bullets: ['AUC 0.89 — highest model confidence in the state', '6 districts classified High suitability (score ≥75)', 'Optimal elevation: 800–1,800m · Khasi & Jaintia Hills'],
              },
              {
                icon: '🍷', module: 'Wine Fruits', c: '#6A1B9A', bg: '#F3E5F5', border: '#CE93D8',
                headline: 'Ri Bhoi leads Passion Fruit cultivation (82/100)',
                bullets: ['East Khasi Hills best for Plum & Peach (cool climate)', 'Khasi Hills temperature 15–18°C — ideal for temperate fruits', '5 districts suitable for wine fruit diversification'],
              },
              {
                icon: '🛰', module: 'Crop Health (NDVI)', c: '#004D40', bg: '#E0F2F1', border: '#80CBC4',
                headline: '5 districts in Good or better crop health (Jan–Jun 2026)',
                bullets: ['West Khasi Hills: highest NDVI 0.72 (Very High)', '3 NDVI anomaly alerts in Garo Hills — monitoring needed', 'Total mapped buckwheat area: ~9,850 ha (LULC-corrected)'],
              },
              {
                icon: '🌡', module: 'Climate Risk', c: '#C62828', bg: '#FFEBEE', border: '#EF9A9A',
                headline: 'All 12 districts meet buckwheat temperature threshold',
                bullets: ['East Khasi Hills: 12 frost-risk days/yr — highest in state', 'West Khasi Hills: 3,200mm rainfall — exceptional water surplus', 'Garo Hills (>24°C) better suited for tropical wine fruits'],
              },
              {
                icon: '💧', module: 'Water Management', c: '#1565C0', bg: '#E3F2FD', border: '#90CAF9',
                headline: '7 districts rain-fed viable — no irrigation required',
                bullets: ['Max adequacy ratio 9.1× (W. Khasi Hills: 3,200÷350mm)', 'Buckwheat CWR (350mm) well below all-district average rainfall', 'Passion Fruit (1,400mm CWR) met only in Very High water districts'],
              },
              {
                icon: '🏆', module: 'Priority Zones', c: '#E65100', bg: '#FBE9E7', border: '#FFAB91',
                headline: 'Mawlai block tops all priorities at score 92/100',
                bullets: ['46 priority blocks mapped across all 12 districts', '6,430 km² identified as high-suitability cultivation area', 'Top 5 blocks in E. Khasi Hills score 82–92/100'],
              },
              {
                icon: '⛰', module: 'Terrain (DEM/Slope)', c: '#5D4037', bg: '#EFEBE9', border: '#BCAAA4',
                headline: 'Eastern West Khasi Hills — highest mean elevation (1,217m)',
                bullets: ['6 districts in optimal elevation range (>800m) for buckwheat', 'SW Garo Hills lowest (89m avg) — unsuitable for buckwheat', 'Slope analysis: all Khasi Hills districts have moderate–steep terrain'],
              },
              {
                icon: '🌿', module: 'LULC 2025-26 (ESRI 10m)', c: '#2E7D32', bg: '#F1F8E9', border: '#AED581',
                headline: 'Meghalaya 65–93% evergreen forest — highly vegetated state',
                bullets: ['South Garo Hills: peak forest cover at 92.7%', 'SW Garo Hills: highest cropland (13.7%) — agriculture hub', 'West Khasi Hills: minimal cropland (0.1%) — pristine forest'],
              },
            ].map(({ icon, module, c, bg, border, headline, bullets }) => (
              <div key={module} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px', borderTop: `3px solid ${c}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: c }}>{module}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1F2937', marginBottom: 8, lineHeight: 1.4 }}>{headline}</div>
                <ul style={{ margin: 0, paddingLeft: 14, listStyle: 'disc' }}>
                  {bullets.map(b => (
                    <li key={b} style={{ fontSize: '0.74rem', color: '#4B5563', lineHeight: 1.5, marginBottom: 2 }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Collapsible milestones */}
          {showMilestones && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>Project Milestone Progress</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MILESTONES.map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#F9FAFB', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>{m.id}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-dark)' }}>{m.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Deliverables {m.deliverables}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, color: m.color, fontSize: '0.82rem' }}>{m.date}</div>
                      <div style={{ fontSize: '0.68rem', color: i < 2 ? 'var(--primary)' : 'var(--text-light)', fontWeight: 600 }}>{i < 2 ? '✓ On Track' : '⏳ Upcoming'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
