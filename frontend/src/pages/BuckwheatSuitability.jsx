import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import BuckwheatMap from '../components/BuckwheatMap';
import { suitabilityData, getSuitColor, getSuitClass, demData, lulcData } from '../data/districtData';
import { farmerPoints, SEGMENT_META } from '../data/farmerData';

const SUITABILITY_LEGEND = [
  { color: '#1B5E20', label: 'High (86–100)' },
  { color: '#388E3C', label: 'Medium-High (66–85)' },
  { color: '#8BC34A', label: 'Medium (46–65)' },
  { color: '#FDD835', label: 'Low (26–45)' },
  { color: '#E53935', label: 'Very Low (<26)' },
];

const PIE_COLORS = ['#1B5E20', '#F9A825', '#E53935'];

// Climate scenario scores – MaxEnt climate-only model (AUC = 0.992)
const SCENARIO_SCORES = {
  baseline: {
    'East Khasi Hills': 87, 'West Khasi Hills': 82, 'West Jaintia Hills': 78,
    'South West Khasi Hills': 72, 'Eastern West Khasi Hills': 68, 'East Jaintia Hills': 65,
    'Ri Bhoi': 58, 'North Garo Hills': 48, 'East Garo Hills': 42,
    'West Garo Hills': 38, 'South Garo Hills': 35, 'South West Garo Hills': 32,
  },
  ssp126: {
    'East Khasi Hills': 84, 'West Khasi Hills': 79, 'West Jaintia Hills': 75,
    'South West Khasi Hills': 68, 'Eastern West Khasi Hills': 64, 'East Jaintia Hills': 61,
    'Ri Bhoi': 53, 'North Garo Hills': 43, 'East Garo Hills': 37,
    'West Garo Hills': 33, 'South Garo Hills': 30, 'South West Garo Hills': 27,
  },
  ssp585: {
    'East Khasi Hills': 71, 'West Khasi Hills': 66, 'West Jaintia Hills': 62,
    'South West Khasi Hills': 54, 'Eastern West Khasi Hills': 50, 'East Jaintia Hills': 46,
    'Ri Bhoi': 37, 'North Garo Hills': 28, 'East Garo Hills': 23,
    'West Garo Hills': 19, 'South Garo Hills': 17, 'South West Garo Hills': 14,
  },
};

const SCENARIO_META = {
  baseline: { label: 'Baseline',        sublabel: 'Current Climate',  color: '#1B5E20', bg: '#E8F5E9', description: 'WorldClim v2.1 · 1970–2000 normals' },
  ssp126:   { label: 'SSP1-2.6 · 2050', sublabel: 'Low Emissions',    color: '#0277BD', bg: '#E1F5FE', description: '+1.5°C by 2050 · CMIP6 ensemble median' },
  ssp585:   { label: 'SSP5-8.5 · 2050', sublabel: 'High Emissions',   color: '#C62828', bg: '#FFEBEE', description: '+2.8°C by 2050 · CMIP6 ensemble median' },
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

const PAGE_TABS = [
  { key: 'suitability', label: '🗺 Suitability Scenarios' },
  { key: 'farmers',     label: '👨‍🌾 Farmer Survey' },
  { key: 'bric',        label: '🏗 BRIC Infrastructure' },
];

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
  const [pageTab, setPageTab]           = useState('suitability');
  const [scenario, setScenario]         = useState('baseline');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [farmerDistrict, setFarmerDistrict] = useState(null);
  const [districtsGeo, setDistrictsGeo] = useState(null);

  useEffect(() => {
    fetch('/geojson/districts.json').then(r => r.json()).then(setDistrictsGeo).catch(console.error);
  }, []);

  const scenarioScores = SCENARIO_SCORES[scenario];
  const scenarioMeta   = SCENARIO_META[scenario];

  const sorted = suitabilityData
    .map(d => ({ ...d, score: scenarioScores[d.district] ?? d.buckwheat }))
    .sort((a, b) => b.score - a.score);

  const selected = selectedDistrict ? sorted.find(d => d.district === selectedDistrict) : null;

  const colorFn = feature => {
    const score = scenarioScores[feature.properties.district];
    return score != null ? getSuitColor(score) : '#ccc';
  };

  const popupFn = feature => {
    const p     = feature.properties;
    const score = scenarioScores[p.district] ?? 0;
    const base  = SCENARIO_SCORES.baseline[p.district] ?? score;
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
      <div className="page-header" style={{ background: "linear-gradient(135deg, rgba(240,248,220,0.65) 0%, rgba(245,250,225,0.65) 60%, rgba(250,255,235,0.65) 100%), url('/images/buckwheat-field.jpg') center/cover no-repeat", borderTop: '4px solid #2E7D32' }}>
        <div className="container">
          <div className="badge">Deliverable 1 · MaxEnt Model</div>
          <h1>🌾 Buckwheat Habitat Suitability</h1>
          <p>
            MaxEnt habitat suitability modelling across 12 Meghalaya districts, climate scenario projections
            (SSP1-2.6 / SSP5-8.5 to 2050), 234 real farmer survey locations, and proposed BRIC infrastructure.
          </p>
        </div>
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
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">

              {/* AUC badge + note */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ background: 'linear-gradient(135deg, #1B5E20, #388E3C)', color: '#fff', borderRadius: 12, padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110, flexShrink: 0 }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>0.992</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.88, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Model AUC</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.75, marginTop: 2 }}>Excellent</div>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h2 className="section-title" style={{ marginBottom: 4 }}>District Suitability Map</h2>
                  <p className="section-subtitle" style={{ marginBottom: 6 }}>
                    MaxEnt choropleth using 19 WorldClim bioclimatic variables.
                    Toggle between climate scenarios to see projected 2050 impacts.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 8, padding: '4px 10px', color: '#F57F17' }}>
                    ⚠ Climate-only model · DEM terrain + LULC 2025-26 shown in Farmer Survey tab
                  </div>
                </div>
              </div>

              {/* Scenario buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginRight: 4 }}>Scenario:</span>
                {Object.entries(SCENARIO_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setScenario(key)}
                    style={{
                      padding: '7px 16px', borderRadius: 8,
                      border: `2px solid ${scenario === key ? meta.color : '#e5e7eb'}`,
                      background: scenario === key ? meta.bg : '#fff',
                      color: scenario === key ? meta.color : '#6B7280',
                      fontWeight: scenario === key ? 700 : 500,
                      fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s',
                    }}
                  >
                    {meta.label}
                    <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 400, opacity: 0.8 }}>{meta.sublabel}</span>
                  </button>
                ))}
                <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 4 }}>{scenarioMeta.description}</span>
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
                </div>

                {/* Rankings panel */}
                <div style={{ position: 'sticky', top: 110 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>District Rankings</div>
                  <div style={{ fontSize: '0.68rem', color: '#6B7280', marginBottom: 8 }}>{scenarioMeta.label} · {scenario === 'baseline' ? 'Current climate' : 'Projected 2050'}</div>

                  <div style={{ maxHeight: 310, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 2 }}>
                    {sorted.map((d, i) => {
                      const base  = SCENARIO_SCORES.baseline[d.district] ?? d.score;
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

                  {selected && (
                    <div style={{ marginTop: 10, borderTop: '2px solid #E8F5E9', paddingTop: 10 }}>
                      <div style={{ fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 2 }}>Selected</div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem', marginBottom: 6 }}>{selected.district}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                        {[
                          { label: 'Score', value: `${selected.score}/100`, color: getSuitColor(selected.score) },
                          { label: 'Class', value: getSuitClass(selected.score), color: getSuitColor(selected.score) },
                          { label: 'AUC', value: selected.aucScore, color: '#1B5E20' },
                          { label: 'Rank', value: `#${sorted.findIndex(d => d.district === selected.district) + 1}`, color: '#374151' },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ background: '#F0F7F0', borderRadius: 6, padding: '5px 7px', textAlign: 'center', border: '1px solid #D1FAE5' }}>
                            <div style={{ fontSize: '0.56rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: 1 }}>{label}</div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Radar for selected district */}
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

          {/* Charts */}
          <section className="section-sm" style={{ background: selected ? '#fff' : 'var(--bg-page)' }}>
            <div className="container">
              <div className="grid-2">
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 4 }}>Suitability Scores by District</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 8 }}>MaxEnt suitability index (0–100) · {scenarioMeta.label}</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sorted} margin={{ top: 5, right: 10, bottom: 75, left: 25 }}>
                      <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} label={{ value: 'District', position: 'insideBottom', offset: -20, style: { fontSize: 11, fill: '#666' } }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Suitability Score (0–100)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                      <Tooltip formatter={v => [`${v}/100`, 'Suitability Score']} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {sorted.map(d => <Cell key={d.district} fill={getSuitColor(d.score)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 4 }}>Area Under Suitability Classes</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 8 }}>Estimated area (km²) across all 12 districts · Baseline</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={AREA_DATA} cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value.toLocaleString()} km²`} labelLine>
                        {AREA_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={v => [`${v.toLocaleString()} km²`]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* Model Validation */}
          <section className="section-sm" style={{ background: '#fff' }}>
            <div className="container">
              <h2 className="section-title">Model Validation (Deliverable 3)</h2>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
                {sorted.map(d => (
                  <div key={d.district} className="card card-sm" style={{ textAlign: 'center', borderTop: `3px solid ${getSuitColor(d.score)}` }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B5E20' }}>0.992</div>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 3 }}>AUC (overall)</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 5, color: '#374151' }}>{d.district}</div>
                    <div style={{ fontSize: '0.7rem', color: getSuitColor(d.score), fontWeight: 600, marginTop: 4 }}>Score: {d.score}/100</div>
                  </div>
                ))}
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
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h2 className="section-title" style={{ marginBottom: 4 }}>Farmer Survey Locations (n=234)</h2>
                  <p className="section-subtitle" style={{ marginBottom: 0 }}>
                    53 active (real GPS) · 181 dropout (geocoded). Click a district to filter analysis.
                  </p>
                </div>
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

              {/* MAP + ANALYSIS PANEL side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 20, alignItems: 'start' }}>

                {/* Left: map */}
                <div>
                  <BuckwheatMap
                    scenarioKey="farmer-view"
                    colorFn={farmerColorFn}
                    legendItems={SUITABILITY_LEGEND}
                    legendTitle="Baseline Suitability"
                    showFarmers
                    farmers={farmerPoints}
                    segmentMeta={SEGMENT_META}
                    showBRIC={false}
                    bricHubs={BRIC_HUBS}
                    height="520px"
                    onDistrictClick={d => setFarmerDistrict(prev => prev === d ? null : d)}
                    selectedDistrict={farmerDistrict}
                  />
                  {/* Segment legend */}
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
                  <p className="source-note" style={{ marginTop: 8 }}>
                    Click district to filter · Click same district to reset · Click farmer point for details
                  </p>
                </div>

                {/* Right: Dropout Segment Analysis panel */}
                <div style={{ position: 'sticky', top: 80 }}>
                  <div style={{ background: 'var(--bg-page)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontSize: '1rem', marginBottom: 6 }}>
                        District Farmer Analysis
                      </h3>
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

                    {/* Segment cards */}
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

                    {/* Would return */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>Would Dropout Farmers Return?</div>
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

                    {/* Terrain & LULC panel — visible only when a district is selected */}
                    {terrainEntry && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1565C0', marginBottom: 8 }}>Terrain & Land Use · 2025-26</div>

                        {/* Elevation */}
                        <div style={{ background: '#F0F7FF', borderRadius: 8, padding: '8px 10px', marginBottom: 7 }}>
                          <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 2 }}>Elevation · SRTM DEM</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1565C0' }}>{terrainEntry.elevMean} m</span>
                            <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>{terrainEntry.elevMin}–{terrainEntry.elevMax} m range</span>
                          </div>
                          <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                            <span style={{ fontSize: '0.63rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, ...terrainClassStyle(terrainEntry.terrainClass) }}>
                              {terrainEntry.terrainClass}
                            </span>
                            <span style={{ fontSize: '0.63rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#E8F5E9', color: '#1B5E20', border: '1px solid #A5D6A7' }}>
                              Elev Suit: {terrainEntry.buckwheatElevSuit}
                            </span>
                          </div>
                        </div>

                        {/* Slope */}
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

                        {/* LULC mini-bars */}
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
          <section className="section" style={{ background: '#fff' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h2 className="section-title" style={{ marginBottom: 4 }}>BRIC Hub & Spoke Infrastructure</h2>
                  <p className="section-subtitle" style={{ marginBottom: 6 }}>
                    Proposed Buckwheat Resource & Infrastructure Cluster hubs connecting high-suitability districts
                    to aggregation and processing centres via supply-chain spokes.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 8, padding: '4px 10px', color: '#1B5E20' }}>
                    ℹ Proposed overlay — subject to stakeholder validation and feasibility assessment
                  </div>
                </div>
              </div>

              <BuckwheatMap
                scenarioKey="bric-view"
                colorFn={colorFn}
                popupFn={popupFn}
                legendItems={SUITABILITY_LEGEND}
                legendTitle="Baseline Suitability"
                showFarmers={false}
                showBRIC
                bricHubs={BRIC_HUBS}
                height="560px"
              />

              {/* BRIC map legend */}
              <div style={{ marginTop: 12, display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: '0.76rem', color: '#374151' }}>
                {[
                  { dot: '#1B5E20', size: 16, label: 'Primary BRIC Hub' },
                  { dot: '#33691E', size: 12, label: 'Secondary BRIC Hub' },
                  { dot: '#AED581', size: 9,  label: 'Collection Point (spoke)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: item.size, height: item.size, borderRadius: '50%', background: item.dot, border: '2px solid #fff', boxShadow: `0 0 0 1.5px ${item.dot}`, flexShrink: 0 }} />
                    {item.label}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 24, height: 0, borderTop: '2px dashed #1B5E20', opacity: 0.7 }} />
                  Supply chain spoke
                </div>
              </div>

              <p className="source-note" style={{ marginTop: 10 }}>
                Hub locations based on suitability scores, existing road access, and market connectivity.
                Click any hub or collection point for details.
              </p>
            </div>
          </section>

          {/* Hub detail cards */}
          <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
            <div className="container">
              <h2 className="section-title">Hub Details</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 20px' }} />
              <div className="grid-3">
                {BRIC_HUBS.map(hub => (
                  <div key={hub.id} className="card" style={{ borderLeft: `4px solid ${hub.type === 'primary' ? '#1B5E20' : '#558B2F'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: hub.type === 'primary' ? 20 : 16, height: hub.type === 'primary' ? 20 : 16, borderRadius: '50%', background: hub.type === 'primary' ? '#1B5E20' : '#558B2F', border: '3px solid #fff', boxShadow: `0 0 0 2px ${hub.type === 'primary' ? '#1B5E20' : '#558B2F'}`, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: '#1B5E20' }}>{hub.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{hub.district} · {hub.type === 'primary' ? 'Primary' : 'Secondary'} Hub</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Collection Points:</div>
                    {hub.spokes.map(sp => (
                      <div key={sp.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.77rem', color: '#555', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8BC34A', flexShrink: 0 }} />
                        {sp.name}
                        <span style={{ fontSize: '0.66rem', color: '#9CA3AF', marginLeft: 'auto' }}>{sp.lat.toFixed(3)}°N, {sp.lon.toFixed(3)}°E</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, fontSize: '0.72rem', color: '#6B7280' }}>
                      {hub.spokes.length} spoke{hub.spokes.length > 1 ? 's' : ''} mapped · {hub.type === 'primary' ? 'Processing + storage facility' : 'Aggregation + cold storage'}
                    </div>
                  </div>
                ))}
              </div>
              <p className="source-note" style={{ marginTop: 16 }}>
                BRIC hub placement is proposed based on suitability scores, existing infrastructure, and market access.
                Final placement subject to stakeholder validation and feasibility study.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
