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

const NDWI_COLORS = { Low: '#1B5E20', Moderate: '#F9A825', High: '#C62828' };

export default function CropHealth() {
  const [activeLayer, setActiveLayer] = useState('ndvi');
  const [selectedDistrict, setSelectedDistrict] = useState('East Khasi Hills');

  const colorFn = (feature) => {
    const d = ndviData.find(n => n.district === feature.properties.district);
    if (!d) return '#ccc';
    return activeLayer === 'ndvi' ? getNDVIColor(d.ndvi) : (d.ndwi >= 0.35 ? '#1565C0' : d.ndwi >= 0.28 ? '#64B5F6' : d.ndwi >= 0.22 ? '#FFB74D' : '#E53935');
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
        <div class="popup-row"><span class="popup-label">Buckwheat Cover</span><span class="popup-val">${d.cover.toLocaleString()} ha</span></div>
        <div class="popup-row"><span class="popup-label">Health Status</span><span class="popup-val">${d.status}</span></div>
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

  const DISTRICT_COLORS = ['#1B5E20', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
  const districtKeys = Object.keys(MONTHLY_NDVI).map(d => d.split(' ').slice(-2).join(' '));

  return (
    <div>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #004D40 0%, #00695C 50%, #00897B 100%)' }}>
        <div className="container">
          <div className="badge">Deliverable 5 · Sentinel-2</div>
          <h1>🛰 Crop Health Assessment (NDVI & NDWI)</h1>
          <p>Sentinel-2 multispectral analysis for vegetation health (NDVI) and moisture stress (NDWI) across Meghalaya's buckwheat cultivation areas. Season: Rabi 2025.</p>
        </div>
      </div>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          {/* Layer toggle */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-mid)' }}>Map Layer:</span>
            {[['ndvi', '🌿 NDVI – Vegetation Health'], ['ndwi', '💧 NDWI – Moisture Stress']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveLayer(key)}
                style={{ padding: '8px 18px', borderRadius: 8, border: `2px solid ${activeLayer === key ? '#00695C' : 'var(--border)'}`, background: activeLayer === key ? '#E0F2F1' : '#fff', color: activeLayer === key ? '#004D40' : 'var(--text-mid)', fontWeight: activeLayer === key ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {label}
              </button>
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
              <p className="source-note">Data: Sentinel-2 MSI Level-2A · 10m resolution · Processed via Google Earth Engine · Acquisition: Oct 2025 (Rabi 2025 pre-harvest)</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#00695C', marginBottom: 4 }}>District Health Status</h3>
              {[...ndviData].sort((a, b) => b.ndvi - a.ndvi).map(d => (
                <div key={d.district} className="card card-sm" style={{ borderLeft: `4px solid ${getNDVIColor(d.ndvi)}`, padding: '10px 14px', cursor: 'pointer', background: selectedDistrict === d.district ? '#E0F2F1' : '#fff' }}
                  onClick={() => setSelectedDistrict(d.district)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{d.district}</span>
                    <span style={{ fontWeight: 700, color: getNDVIColor(d.ndvi), fontSize: '0.9rem' }}>{d.ndvi}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, fontSize: '0.72rem' }}>
                    <span style={{ background: '#E0F2F1', color: '#004D40', padding: '1px 6px', borderRadius: 50, fontWeight: 600 }}>{d.status}</span>
                    <span style={{ background: NDWI_COLORS[d.moistureStress] + '20', color: NDWI_COLORS[d.moistureStress], padding: '1px 6px', borderRadius: 50, fontWeight: 600 }}>{d.moistureStress} Stress</span>
                    {d.anomalyFlag && <span style={{ background: '#FFEBEE', color: '#C62828', padding: '1px 6px', borderRadius: 50, fontWeight: 600 }}>⚠ Anomaly</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal NDVI chart */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#004D40', marginBottom: 4 }}>Seasonal NDVI Trend – Top 5 Districts</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Monthly NDVI variation (2025) · Sentinel-2 derived</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0.2, 0.9]} tick={{ fontSize: 11 }} />
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
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Mapped cultivation area (hectares) · Satellite-derived</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[...ndviData].sort((a, b) => b.cover - a.cover)} margin={{ top: 5, right: 10, bottom: 60, left: 0 }}>
                  <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v.toLocaleString()} ha`]} />
                  <Bar dataKey="cover" name="Area (ha)" radius={[4, 4, 0, 0]}>
                    {[...ndviData].sort((a, b) => b.cover - a.cover).map(d => <Cell key={d.district} fill={getNDVIColor(d.ndvi)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="source-note">Sentinel-2 LULC classification · MFEC field survey validation</p>
            </div>
          </div>
        </div>
      </section>

      {/* NDVI / NDWI comparison table */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">NDVI & NDWI Summary Table</h2>
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
                  <th>Health Status</th>
                </tr>
              </thead>
              <tbody>
                {[...ndviData].sort((a, b) => b.ndvi - a.ndvi).map(d => (
                  <tr key={d.district}>
                    <td style={{ fontWeight: 600 }}>{d.district}</td>
                    <td><span style={{ fontWeight: 700, color: getNDVIColor(d.ndvi) }}>{d.ndvi}</span></td>
                    <td><span className="suit-badge" style={{ background: d.ndvi >= 0.65 ? '#E8F5E9' : '#FFF8E1', color: d.ndvi >= 0.65 ? 'var(--primary)' : '#E65100', border: '1px solid', borderColor: d.ndvi >= 0.65 ? '#A5D6A7' : '#FFD54F' }}>{d.ndviClass}</span></td>
                    <td>{d.ndwi}</td>
                    <td><span style={{ fontWeight: 600, color: NDWI_COLORS[d.moistureStress] || '#333' }}>{d.moistureStress}</span></td>
                    <td>{d.vegetationCoverPct || (d.ndvi * 100).toFixed(0)}%</td>
                    <td>{d.cover.toLocaleString()}</td>
                    <td><span className="suit-badge" style={{ background: d.status === 'Excellent' || d.status === 'Very Good' ? '#E8F5E9' : d.status === 'Good' ? '#FFF8E1' : '#FFEBEE', color: d.status === 'Excellent' || d.status === 'Very Good' ? 'var(--primary)' : d.status === 'Good' ? '#E65100' : '#C62828', border: '1px solid currentColor' }}>{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="source-note" style={{ marginTop: 12 }}>Source: Sentinel-2 MSI (ESA Copernicus) · 10m spatial resolution · Google Earth Engine processing · Rabi 2025 season</p>
        </div>
      </section>
    </div>
  );
}
