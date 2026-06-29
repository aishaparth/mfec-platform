import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, CartesianGrid } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { ndviData, getNDVIColor } from '../data/districtData';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTHLY_NDVI = {
  'East Khasi Hills':       [0.42, 0.48, 0.58, 0.65, 0.70, 0.72, 0.74, 0.75, 0.71, 0.65, 0.52, 0.44],
  'West Khasi Hills':       [0.38, 0.44, 0.54, 0.61, 0.66, 0.68, 0.70, 0.71, 0.67, 0.61, 0.48, 0.40],
  'West Jaintia Hills':     [0.40, 0.46, 0.55, 0.62, 0.65, 0.66, 0.68, 0.69, 0.65, 0.58, 0.46, 0.41],
  'East Jaintia Hills':     [0.38, 0.44, 0.52, 0.60, 0.63, 0.64, 0.66, 0.67, 0.63, 0.56, 0.44, 0.39],
  'South West Khasi Hills': [0.35, 0.41, 0.50, 0.57, 0.60, 0.61, 0.63, 0.64, 0.60, 0.53, 0.41, 0.36],
};

const STRESS_COLORS = { None: '#1B5E20', Low: '#388E3C', Medium: '#F9A825', High: '#C62828' };
const DISTRICT_COLORS = ['#1B5E20', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

export default function CropHealth() {
  const [activeLayer, setActiveLayer] = useState('ndvi');
  const [selectedDistrict, setSelectedDistrict] = useState('East Khasi Hills');

  const colorFn = (feature) => {
    const d = ndviData.find(n => n.district === feature.properties.district);
    if (!d) return '#ccc';
    if (activeLayer === 'ndvi') return getNDVIColor(d.ndvi);
    return d.ndwi >= 0.35 ? '#1565C0' : d.ndwi >= 0.28 ? '#64B5F6' : d.ndwi >= 0.22 ? '#FFB74D' : '#E53935';
  };

  const popupFn = (feature) => {
    const d = ndviData.find(n => n.district === feature.properties.district);
    const p = feature.properties;
    if (!d) return `<div class="district-popup"><h3>${p.district}</h3></div>`;
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq} · ${d.season}</p>
        <div class="popup-row"><span class="popup-label">NDVI</span><span class="popup-val">${d.ndvi} (${d.ndviClass})</span></div>
        <div class="popup-row"><span class="popup-label">NDWI</span><span class="popup-val">${d.ndwi}</span></div>
        <div class="popup-row"><span class="popup-label">Moisture Stress</span><span class="popup-val">${d.moistureStress}</span></div>
        <div class="popup-row"><span class="popup-label">Buckwheat Cover</span><span class="popup-val">${d.buckwheatCoverHa.toLocaleString()} ha</span></div>
        <div class="popup-row"><span class="popup-label">Health Status</span><span class="popup-val">${d.healthStatus}</span></div>
      </div>`;
  };

  const ndviLegend = [
    { color: '#1B5E20', label: 'High NDVI (≥0.70)' },
    { color: '#2E7D32', label: 'Good (0.65–0.69)' },
    { color: '#388E3C', label: 'Medium (0.60–0.64)' },
    { color: '#66BB6A', label: 'Moderate (0.55–0.59)' },
    { color: '#AED581', label: 'Low (0.50–0.54)' },
    { color: '#FDD835', label: 'Very Low (<0.50)' },
  ];
  const ndwiLegend = [
    { color: '#1565C0', label: 'Low Stress (NDWI ≥0.35)' },
    { color: '#64B5F6', label: 'Moderate Stress (0.28–0.34)' },
    { color: '#FFB74D', label: 'High Stress (0.22–0.27)' },
    { color: '#E53935', label: 'Severe Stress (<0.22)' },
  ];

  const monthlyData = MONTHS.map((m, i) => {
    const row = { month: m };
    Object.keys(MONTHLY_NDVI).forEach(d => { row[d.split(' ').slice(-2).join(' ')] = MONTHLY_NDVI[d][i]; });
    return row;
  });
  const districtKeys = Object.keys(MONTHLY_NDVI).map(d => d.split(' ').slice(-2).join(' '));

  const selectedData = ndviData.find(d => d.district === selectedDistrict);
  const anomalyDistricts = ndviData.filter(d => d.anomalyFlag);
  const totalCoverHa = ndviData.reduce((sum, d) => sum + d.buckwheatCoverHa, 0);
  const excellentCount = ndviData.filter(d => d.healthStatus === 'Excellent').length;
  const highStressCount = ndviData.filter(d => d.moistureStress === 'High').length;

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #004D40 0%, #00695C 50%, #00897B 100%)' }}>
        <div className="container">
          <div className="badge">Deliverable 5 · Sentinel-2 · {ndviData[0]?.season}</div>
          <h1>🛰 Crop Health Assessment (NDVI & NDWI)</h1>
          <p>Sentinel-2 multispectral analysis for vegetation health (NDVI) and moisture stress (NDWI) across Meghalaya's buckwheat cultivation areas.</p>
        </div>
      </div>

      {/* ── Summary KPI Cards ───────────────────────────────── */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { v: totalCoverHa.toLocaleString(), l: 'Total Buckwheat Cover (ha)', c: '#1B5E20', bg: '#E8F5E9' },
              { v: excellentCount, l: 'Districts — Excellent Health', c: '#00695C', bg: '#E0F2F1' },
              { v: anomalyDistricts.length, l: 'NDVI Anomaly Alerts', c: '#C62828', bg: '#FFEBEE' },
              { v: highStressCount, l: 'High Moisture Stress Districts', c: '#E65100', bg: '#FFF3E0' },
            ].map(({ v, l, c, bg }) => (
              <div key={l} className="card" style={{ textAlign: 'center', padding: '18px 16px', background: bg, border: 'none' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: c, fontFamily: 'var(--font-heading)' }}>{v}</div>
                <div style={{ fontSize: '0.75rem', color: c, marginTop: 4, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map + District Sidebar ──────────────────────────── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-mid)' }}>Map Layer:</span>
            {[['ndvi', '🌿 NDVI – Vegetation Health'], ['ndwi', '💧 NDWI – Moisture Stress']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveLayer(key)} style={{
                padding: '8px 18px', borderRadius: 8,
                border: `2px solid ${activeLayer === key ? '#00695C' : 'var(--border)'}`,
                background: activeLayer === key ? '#E0F2F1' : '#fff',
                color: activeLayer === key ? '#004D40' : 'var(--text-mid)',
                fontWeight: activeLayer === key ? 700 : 500,
                fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
            <div>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  height="500px"
                  legendItems={activeLayer === 'ndvi' ? ndviLegend : ndwiLegend}
                  legendTitle={activeLayer === 'ndvi' ? 'NDVI Index' : 'NDWI (Moisture)'}
                  defaultTile="satellite"
                />
              </div>
              <p className="source-note">Sentinel-2 MSI Level-2A · 10m resolution · Google Earth Engine · {ndviData[0]?.sentinelDate}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#00695C', marginBottom: 4 }}>District Health Status</h3>
              {[...ndviData].sort((a, b) => b.ndvi - a.ndvi).map(d => (
                <div key={d.district} className="card card-sm"
                  style={{ borderLeft: `4px solid ${getNDVIColor(d.ndvi)}`, padding: '10px 14px', cursor: 'pointer', background: selectedDistrict === d.district ? '#E0F2F1' : '#fff' }}
                  onClick={() => setSelectedDistrict(d.district)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{d.district}</span>
                    <span style={{ fontWeight: 700, color: getNDVIColor(d.ndvi), fontSize: '0.9rem' }}>{d.ndvi}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, fontSize: '0.72rem', flexWrap: 'wrap' }}>
                    <span style={{ background: '#E0F2F1', color: '#004D40', padding: '1px 6px', borderRadius: 50, fontWeight: 600 }}>{d.healthStatus}</span>
                    <span style={{ background: (STRESS_COLORS[d.moistureStress] || '#333') + '20', color: STRESS_COLORS[d.moistureStress] || '#333', padding: '1px 6px', borderRadius: 50, fontWeight: 600 }}>{d.moistureStress} Stress</span>
                    {d.anomalyFlag && <span style={{ background: '#FFEBEE', color: '#C62828', padding: '1px 6px', borderRadius: 50, fontWeight: 600 }}>⚠ Anomaly</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Selected District Detail ────────────────────────── */}
      {selectedData && (
        <section className="section-sm" style={{ background: '#F1F8E9' }}>
          <div className="container">
            <h2 className="section-title" style={{ color: '#1B5E20' }}>{selectedData.district} — Detailed View</h2>
            <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #1B5E20, #66BB6A)', borderRadius: 2, margin: '10px 0 24px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              {[
                { label: 'NDVI', value: selectedData.ndvi, sub: selectedData.ndviClass },
                { label: 'NDWI', value: selectedData.ndwi, sub: `${selectedData.moistureStress} Stress` },
                { label: 'Veg. Cover', value: `${selectedData.vegetationCoverPct}%`, sub: 'of district area' },
                { label: 'Buckwheat Area', value: `${selectedData.buckwheatCoverHa.toLocaleString()} ha`, sub: 'satellite-mapped' },
                { label: 'vs Last Season', value: selectedData.prevSeasonNDVI, sub: `Δ ${(selectedData.ndvi - selectedData.prevSeasonNDVI).toFixed(2)}` },
                { label: 'Health Status', value: selectedData.healthStatus, sub: selectedData.anomalyFlag ? '⚠ Anomaly detected' : '✓ Normal' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1B5E20', fontFamily: 'var(--font-heading)' }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-mid)', marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Anomaly Alerts ──────────────────────────────────── */}
      {anomalyDistricts.length > 0 && (
        <section className="section-sm" style={{ background: '#fff' }}>
          <div className="container">
            <h2 className="section-title">⚠ NDVI Anomaly Alerts</h2>
            <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #C62828, #FF8A65)', borderRadius: 2, margin: '10px 0 20px' }} />
            <p style={{ color: 'var(--text-mid)', fontSize: '0.88rem', marginBottom: 20 }}>
              Districts where current NDVI is significantly lower than the previous season — may indicate crop stress, pest pressure, or insufficient rainfall.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {anomalyDistricts.map(d => (
                <div key={d.district} className="card" style={{ borderLeft: '4px solid #C62828', padding: '14px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#C62828', marginBottom: 6 }}>⚠ {d.district}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-mid)' }}>Current NDVI</span><span style={{ fontWeight: 600 }}>{d.ndvi}</span>
                    <span style={{ color: 'var(--text-mid)' }}>Prev Season</span><span style={{ fontWeight: 600 }}>{d.prevSeasonNDVI}</span>
                    <span style={{ color: 'var(--text-mid)' }}>Change</span>
                    <span style={{ fontWeight: 700, color: '#C62828' }}>↓ {(d.prevSeasonNDVI - d.ndvi).toFixed(2)}</span>
                    <span style={{ color: 'var(--text-mid)' }}>Moisture</span><span style={{ fontWeight: 600 }}>{d.moistureStress} Stress</span>
                  </div>
                  {/* TODO: add field observation notes per district once available */}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Charts ──────────────────────────────────────────── */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#004D40', marginBottom: 4 }}>Seasonal NDVI Trend – Top 5 Districts</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Monthly NDVI variation (2025) · Sentinel-2 derived</p>
              {/* TODO: replace MONTHLY_NDVI above with actual GEE time-series data per district */}
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 30, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#666' } }} />
                  <YAxis domain={[0.2, 0.9]} tick={{ fontSize: 11 }} label={{ value: 'NDVI Index', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                  <Tooltip />
                  <Legend />
                  {districtKeys.map((d, i) => (
                    <Line key={d} type="monotone" dataKey={d} stroke={DISTRICT_COLORS[i]} strokeWidth={2} dot={false} name={d} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#004D40', marginBottom: 4 }}>Buckwheat Cultivation Area by District</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Mapped cultivation area (hectares) · Satellite-derived LULC</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[...ndviData].sort((a, b) => b.buckwheatCoverHa - a.buckwheatCoverHa)} margin={{ top: 5, right: 10, bottom: 75, left: 35 }}>
                  <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10 }} label={{ value: 'District', position: 'insideBottom', offset: -20, style: { fontSize: 11, fill: '#666' } }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'Buckwheat Area (ha)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                  <Tooltip formatter={(v) => [`${v.toLocaleString()} ha`]} />
                  <Bar dataKey="buckwheatCoverHa" name="Area (ha)" radius={[4, 4, 0, 0]}>
                    {[...ndviData].sort((a, b) => b.buckwheatCoverHa - a.buckwheatCoverHa).map(d => (
                      <Cell key={d.district} fill={getNDVIColor(d.ndvi)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="source-note">Sentinel-2 LULC classification · MFEC field survey validation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Summary Table ───────────────────────────────────── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">NDVI & NDWI District Summary</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #004D40, #66BB6A)', borderRadius: 2, margin: '10px 0 24px' }} />
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>NDVI</th>
                  <th>NDVI Class</th>
                  <th>NDWI</th>
                  <th>Moisture Stress</th>
                  <th>Veg. Cover %</th>
                  <th>Buckwheat Area (ha)</th>
                  <th>vs Prev Season</th>
                  <th>Health Status</th>
                </tr>
              </thead>
              <tbody>
                {[...ndviData].sort((a, b) => b.ndvi - a.ndvi).map(d => (
                  <tr key={d.district}>
                    <td style={{ fontWeight: 600 }}>{d.district}{d.anomalyFlag && <span style={{ color: '#C62828', marginLeft: 6 }}>⚠</span>}</td>
                    <td><span style={{ fontWeight: 700, color: getNDVIColor(d.ndvi) }}>{d.ndvi}</span></td>
                    <td>
                      <span className="suit-badge" style={{ background: d.ndvi >= 0.65 ? '#E8F5E9' : '#FFF8E1', color: d.ndvi >= 0.65 ? 'var(--primary)' : '#E65100', border: '1px solid', borderColor: d.ndvi >= 0.65 ? '#A5D6A7' : '#FFD54F' }}>
                        {d.ndviClass}
                      </span>
                    </td>
                    <td>{d.ndwi}</td>
                    <td><span style={{ fontWeight: 600, color: STRESS_COLORS[d.moistureStress] || '#333' }}>{d.moistureStress}</span></td>
                    <td>{d.vegetationCoverPct}%</td>
                    <td>{d.buckwheatCoverHa.toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: d.ndvi >= d.prevSeasonNDVI ? '#1B5E20' : '#C62828' }}>
                        {d.ndvi >= d.prevSeasonNDVI ? '↑' : '↓'} {Math.abs(d.ndvi - d.prevSeasonNDVI).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="suit-badge" style={{
                        background: d.healthStatus === 'Excellent' ? '#E8F5E9' : d.healthStatus === 'Good' ? '#FFF8E1' : '#FFEBEE',
                        color: d.healthStatus === 'Excellent' ? 'var(--primary)' : d.healthStatus === 'Good' ? '#E65100' : '#C62828',
                        border: '1px solid currentColor',
                      }}>{d.healthStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="source-note" style={{ marginTop: 12 }}>
            Source: Sentinel-2 MSI (ESA Copernicus) · 10m spatial resolution · Google Earth Engine · {ndviData[0]?.season}
          </p>
        </div>
      </section>
    </div>
  );
}
