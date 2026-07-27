import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, CartesianGrid } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { ndviData, getNDVIColor, lulcData } from '../data/districtData';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTHLY_NDVI = {
  'E. Khasi Hills':  [0.42, 0.48, 0.58, 0.65, 0.70, 0.72, 0.74, 0.75, 0.71, 0.65, 0.52, 0.44],
  'W. Khasi Hills':  [0.38, 0.44, 0.54, 0.61, 0.66, 0.68, 0.70, 0.71, 0.67, 0.61, 0.48, 0.40],
  'W. Jaintia Hills':[0.40, 0.46, 0.55, 0.62, 0.65, 0.66, 0.68, 0.69, 0.65, 0.58, 0.46, 0.41],
  'E. Jaintia Hills':[0.38, 0.44, 0.52, 0.60, 0.63, 0.64, 0.66, 0.67, 0.63, 0.56, 0.44, 0.39],
  'SW Khasi Hills':  [0.35, 0.41, 0.50, 0.57, 0.60, 0.61, 0.63, 0.64, 0.60, 0.53, 0.41, 0.36],
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
    Object.keys(MONTHLY_NDVI).forEach(d => { row[d] = MONTHLY_NDVI[d][i]; });
    return row;
  });
  const districtKeys = Object.keys(MONTHLY_NDVI);

  const selectedData  = ndviData.find(d => d.district === selectedDistrict);
  const selectedLulc  = lulcData.find(d => d.district === selectedDistrict);
  const anomalyDistricts = ndviData.filter(d => d.anomalyFlag);
  const totalCoverHa = ndviData.reduce((sum, d) => sum + d.buckwheatCoverHa, 0);
  const goodOrBetterCount = ndviData.filter(d => d.healthStatus === 'Excellent' || d.healthStatus === 'Good').length;
  const highStressCount = ndviData.filter(d => d.moistureStress === 'High').length;

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header" style={{ borderTop: '4px solid #00897B', background: "linear-gradient(135deg, rgba(232,245,233,0.70) 0%, rgba(241,248,233,0.70) 60%, rgba(250,255,248,0.70) 100%), url('/images/crop-health-aerial.jpg') center/cover no-repeat" }}>
        <div className="container">
          <div className="badge">Sentinel-2 & MODIS · {ndviData[0]?.season}</div>
          <h1>🛰 Crop Health Assessment (NDVI & NDWI)</h1>
          <p>Sentinel-2 and MODIS multispectral analysis for vegetation health (NDVI) and moisture stress (NDWI) across Meghalaya's buckwheat cultivation areas.</p>
        </div>
      </div>

      {/* ── Summary KPI Cards ───────────────────────────────── */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { v: totalCoverHa.toLocaleString(), l: 'Total Buckwheat Cover (ha)', c: '#1B5E20', bg: '#E8F5E9' },
              { v: goodOrBetterCount, l: 'Districts — Good Health', c: '#00695C', bg: '#E0F2F1' },
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

      {/* ── Map + District Panel ────────────────────────────── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)' }}>Layer:</span>
            {[['ndvi', '🌿 NDVI'], ['ndwi', '💧 NDWI']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveLayer(key)} style={{
                padding: '6px 14px', borderRadius: 8,
                border: `2px solid ${activeLayer === key ? '#00695C' : 'var(--border)'}`,
                background: activeLayer === key ? '#E0F2F1' : '#fff',
                color: activeLayer === key ? '#004D40' : 'var(--text-mid)',
                fontWeight: activeLayer === key ? 700 : 500,
                fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
            {/* Map */}
            <div>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  height="520px"
                  legendItems={activeLayer === 'ndvi' ? ndviLegend : ndwiLegend}
                  legendTitle={activeLayer === 'ndvi' ? 'NDVI Index' : 'NDWI (Moisture)'}
                  defaultTile="satellite"
                  onDistrictClick={d => setSelectedDistrict(d)}
                />
              </div>
              <p className="source-note">Sentinel-2 MSI & MODIS MOD13Q1 · 10m · Google Earth Engine · {ndviData[0]?.season} · Click district to select</p>
            </div>

            {/* Right panel — sticky, district list + inline detail */}
            <div style={{ position: 'sticky', top: 70, display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* District list — compact, scrollable */}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00695C', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>District Health Status</div>
              <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 2 }}>
                {[...ndviData].sort((a, b) => b.ndvi - a.ndvi).map(d => (
                  <div key={d.district}
                    onClick={() => setSelectedDistrict(d.district)}
                    style={{
                      borderLeft: `3px solid ${getNDVIColor(d.ndvi)}`,
                      padding: '6px 10px', cursor: 'pointer', borderRadius: '0 6px 6px 0',
                      background: selectedDistrict === d.district ? '#E0F2F1' : '#F9FAFB',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background 0.15s',
                    }}>
                    <span style={{ fontWeight: selectedDistrict === d.district ? 700 : 500, fontSize: '0.76rem', color: '#1F2937' }}>{d.district}</span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                      {d.anomalyFlag && <span style={{ fontSize: '0.6rem', color: '#C62828' }}>⚠</span>}
                      <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: 20, background: (STRESS_COLORS[d.moistureStress] || '#999') + '22', color: STRESS_COLORS[d.moistureStress] || '#999', fontWeight: 600 }}>{d.moistureStress}</span>
                      <span style={{ fontWeight: 800, color: getNDVIColor(d.ndvi), fontSize: '0.82rem', minWidth: 28, textAlign: 'right' }}>{d.ndvi}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline district detail */}
              {selectedData ? (
                <div style={{ marginTop: 12, borderTop: '2px solid #E0F2F1', paddingTop: 12 }}>
                  {/* District name + health badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Selected</div>
                      <div style={{ fontWeight: 700, color: '#004D40', fontSize: '0.88rem', lineHeight: 1.2 }}>{selectedData.district}</div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: selectedData.healthStatus === 'Excellent' ? '#E8F5E9' : selectedData.healthStatus === 'Good' ? '#FFF8E1' : '#FFEBEE',
                      color: selectedData.healthStatus === 'Excellent' ? '#1B5E20' : selectedData.healthStatus === 'Good' ? '#E65100' : '#C62828',
                      border: '1px solid currentColor',
                    }}>{selectedData.healthStatus}{selectedData.anomalyFlag ? ' ⚠' : ''}</span>
                  </div>

                  {/* 3×2 metric tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                    {[
                      { label: 'NDVI',     value: selectedData.ndvi,                                         color: getNDVIColor(selectedData.ndvi) },
                      { label: 'NDWI',     value: selectedData.ndwi,                                         color: '#1565C0' },
                      { label: 'Stress',   value: selectedData.moistureStress,                               color: STRESS_COLORS[selectedData.moistureStress] || '#333' },
                      { label: 'Veg %',    value: `${selectedData.vegetationCoverPct}%`,                     color: '#2E7D32' },
                      { label: 'Crop ha',  value: selectedData.buckwheatCoverHa >= 1000
                                                    ? `${(selectedData.buckwheatCoverHa/1000).toFixed(1)}k`
                                                    : selectedData.buckwheatCoverHa,                          color: '#E65100' },
                      { label: 'Δ Season', value: `${selectedData.ndvi >= selectedData.prevSeasonNDVI ? '+' : ''}${(selectedData.ndvi - selectedData.prevSeasonNDVI).toFixed(2)}`,
                                                                                                              color: selectedData.ndvi >= selectedData.prevSeasonNDVI ? '#2E7D32' : '#C62828' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: '#F0FAF0', borderRadius: 7, padding: '6px 6px', textAlign: 'center', border: '1px solid #D1FAE5' }}>
                        <div style={{ fontSize: '0.58rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.2px', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* LULC 2025-26 */}
                  {selectedLulc && (
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 7 }}>LULC 2025-26 · ESRI 10m</div>
                      {[
                        { label: 'Forest',    value: selectedLulc.evergreenForestPct, color: '#2E7D32' },
                        { label: 'Shrubland', value: selectedLulc.shrublandPct,       color: '#8BC34A' },
                        { label: 'Cropland',  value: selectedLulc.croplandPct,        color: '#F9A825' },
                        { label: 'Built-up',  value: selectedLulc.builtupPct,         color: '#78909C' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <div style={{ width: 52, fontSize: '0.62rem', color: '#374151', fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{label}</div>
                          <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
                          </div>
                          <div style={{ width: 34, fontSize: '0.62rem', color, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{value}%</div>
                        </div>
                      ))}
                      {/* Stacked bar */}
                      <div style={{ display: 'flex', height: 7, borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
                        {[
                          { value: selectedLulc.evergreenForestPct, color: '#2E7D32' },
                          { value: selectedLulc.shrublandPct,       color: '#8BC34A' },
                          { value: selectedLulc.croplandPct,        color: '#F9A825' },
                          { value: selectedLulc.builtupPct,         color: '#78909C' },
                          { value: selectedLulc.otherPct,           color: '#BDBDBD' },
                        ].map(({ value, color }, i) => (
                          <div key={i} title={`${value}%`} style={{ width: `${value}%`, background: color }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 12, borderTop: '2px solid #E0F2F1', paddingTop: 14, textAlign: 'center', color: '#9CA3AF', fontSize: '0.76rem' }}>
                  Click a district on the map or list to see details
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Monthly NDVI variation · 2025-26 · MODIS MOD13Q1</p>
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
            Source: Sentinel-2 MSI (ESA Copernicus) & MODIS MOD13Q1 (NASA) · 10m spatial resolution · Google Earth Engine · {ndviData[0]?.season}
          </p>
        </div>
      </section>
    </div>
  );
}
