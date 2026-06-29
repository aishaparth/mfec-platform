import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ComposedChart, Line, Legend, CartesianGrid, ReferenceLine } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { waterData, getWaterColor } from '../data/districtData';

export default function WaterManagement() {
  const [view, setView] = useState('availability');

  const chartData = waterData.map(d => ({
    district: d.district.split(' ').slice(-2).join(' '),
    fullDistrict: d.district,
    rainfall: d.rainfall,
    cwrBuckwheat: d.cwrBuckwheat,
    cwrPassionFruit: 1400,
    adequacyRatio: +(d.rainfall / d.cwrBuckwheat).toFixed(1),
    waterClass: d.waterClass,
    irrigation: d.irrigation,
  })).sort((a, b) => b.rainfall - a.rainfall);

  const colorFn = (feature) => {
    const d = waterData.find(w => w.district === feature.properties.district);
    return d ? getWaterColor(d.waterClass) : '#ccc';
  };

  const popupFn = (feature) => {
    const d = waterData.find(w => w.district === feature.properties.district);
    const p = feature.properties;
    if (!d) return `<div class="district-popup"><h3>${p.district}</h3></div>`;
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq}</p>
        <div class="popup-row"><span class="popup-label">Annual Rainfall</span><span class="popup-val">${d.rainfall.toLocaleString()} mm</span></div>
        <div class="popup-row"><span class="popup-label">CWR (Buckwheat)</span><span class="popup-val">${d.cwrBuckwheat} mm</span></div>
        <div class="popup-row"><span class="popup-label">Adequacy Ratio</span><span class="popup-val">${(d.rainfall / d.cwrBuckwheat).toFixed(1)}x</span></div>
        <div class="popup-row"><span class="popup-label">Water Class</span><span class="popup-val">${d.waterClass}</span></div>
        <div class="popup-row"><span class="popup-label">Irrigation Need</span><span class="popup-val">${d.irrigation}</span></div>
      </div>`;
  };

  const legend = [
    { color: '#0D47A1', label: 'Very High Availability' },
    { color: '#1976D2', label: 'High Availability' },
    { color: '#64B5F6', label: 'Medium Availability' },
    { color: '#FFB74D', label: 'Low Availability' },
  ];

  const seasonalData = ['Pre-Monsoon', 'Monsoon', 'Post-Monsoon', 'Winter'].map((season, si) => {
    const row = { season };
    waterData.forEach(d => {
      const vals = { 'Pre-Monsoon': { 'Very High': 85, High: 70, Medium: 45, Low: 25 }, Monsoon: { 'Very High': 100, High: 100, Medium: 95, Low: 80 }, 'Post-Monsoon': { 'Very High': 90, High: 80, Medium: 65, Low: 50 }, Winter: { 'Very High': 65, High: 45, Medium: 20, Low: 10 } };
      row[d.district.split(' ').slice(-2).join(' ')] = vals[season][d.waterClass] || 50;
    });
    return row;
  });

  return (
    <div>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #01579B 0%, #0277BD 50%, #0288D1 100%)' }}>
        <div className="container">
          <div className="badge">Deliverable 7 · Water Management</div>
          <h1>💧 Water Management Insights</h1>
          <p>Crop Water Requirement (CWR) estimation, rainfall adequacy assessment, and seasonal water availability analysis for buckwheat and wine fruit cultivation across Meghalaya.</p>
        </div>
      </div>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="stats-row">
            <div className="stat-card" style={{ borderTop: '4px solid #0D47A1', background: '#E3F2FD' }}>
              <div className="stat-value" style={{ color: '#0D47A1' }}>350mm</div>
              <div className="stat-label">Buckwheat CWR / Season</div>
              <div className="stat-note">Well below state average rainfall</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #1565C0', background: '#E3F2FD' }}>
              <div className="stat-value" style={{ color: '#1565C0' }}>720mm</div>
              <div className="stat-label">Plum CWR / Season</div>
              <div className="stat-note">Met in Khasi & Jaintia Hills</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #7B1FA2', background: '#F3E5F5' }}>
              <div className="stat-value" style={{ color: '#7B1FA2' }}>1,400mm</div>
              <div className="stat-label">Passion Fruit CWR / Year</div>
              <div className="stat-note">Requires consistent moisture</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #1B5E20', background: '#E8F5E9' }}>
              <div className="stat-value" style={{ color: '#1B5E20' }}>9.1x</div>
              <div className="stat-label">Max Adequacy Ratio</div>
              <div className="stat-note">W. Khasi Hills (3,200÷350)</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #E65100', background: '#FBE9E7' }}>
              <div className="stat-value" style={{ color: '#E65100' }}>5.3x</div>
              <div className="stat-label">Min Adequacy Ratio</div>
              <div className="stat-note">Ri Bhoi (1,850÷350)</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #00695C', background: '#E0F2F1' }}>
              <div className="stat-value" style={{ color: '#00695C' }}>7</div>
              <div className="stat-label">Districts – No Irrigation</div>
              <div className="stat-note">Rain-fed cultivation viable</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 8 }}>Water Availability Map</h2>
              <p className="section-subtitle" style={{ marginBottom: 16 }}>District-level water availability based on annual rainfall and crop water requirements.</p>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  height="480px"
                  legendItems={legend}
                  legendTitle="Water Availability"
                  defaultTile="topo"
                />
              </div>
              <p className="source-note">Data: IMD rainfall stations · Survey of India stream networks · WorldClim precipitation layers</p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1565C0', marginBottom: 14 }}>District Water Profile</h3>
              {waterData.map(d => (
                <div key={d.district} className="card card-sm" style={{ borderLeft: `4px solid ${getWaterColor(d.waterClass)}`, padding: '10px 14px', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.83rem', marginBottom: 4 }}>{d.district}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#1565C0', fontWeight: 600 }}>{d.rainfall.toLocaleString()}mm</span>
                    <span style={{ color: 'var(--text-light)' }}>·</span>
                    <span style={{ fontWeight: 600, color: getWaterColor(d.waterClass) }}>{d.waterClass}</span>
                    <span style={{ color: 'var(--text-light)' }}>·</span>
                    <span style={{ color: d.irrigation === 'None' ? 'var(--primary)' : '#E65100', fontWeight: 600 }}>Irrig: {d.irrigation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CWR vs Rainfall */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1565C0', marginBottom: 4 }}>Rainfall vs. Crop Water Requirements</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Annual rainfall vs buckwheat CWR (350mm) – all districts exceed minimum requirement</p>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="district" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} height={75} label={{ value: 'District', position: 'insideBottom', offset: -25, style: { fontSize: 11, fill: '#666' } }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={350} stroke="#C62828" strokeDasharray="6 3" label={{ value: 'Buckwheat CWR (350mm)', position: 'insideTopLeft', fill: '#C62828', fontSize: 11 }} />
                  <Bar dataKey="rainfall" name="Annual Rainfall (mm)" radius={[4, 4, 0, 0]}>
                    {chartData.map(d => <Cell key={d.district} fill={getWaterColor(d.waterClass)} />)}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1565C0', marginBottom: 4 }}>Rainfall Adequacy Ratio</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Ratio of annual rainfall to buckwheat CWR – higher = more surplus water</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="district" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} height={75} label={{ value: 'District', position: 'insideBottom', offset: -25, style: { fontSize: 11, fill: '#666' } }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'Adequacy Ratio (×)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                  <Tooltip formatter={(v) => [`${v}x`, 'Adequacy Ratio']} />
                  <ReferenceLine y={1} stroke="#C62828" strokeDasharray="4 2" label={{ value: 'Minimum (1x)', position: 'insideTopLeft', fill: '#C62828', fontSize: 10 }} />
                  <Bar dataKey="adequacyRatio" name="Adequacy Ratio" radius={[4, 4, 0, 0]}>
                    {chartData.map(d => <Cell key={d.district} fill={d.adequacyRatio >= 6 ? '#0D47A1' : d.adequacyRatio >= 4 ? '#1976D2' : '#64B5F6'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Water table */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Water Availability Summary</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #1565C0, #64B5F6)', borderRadius: 2, margin: '10px 0 24px' }} />
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>Rainfall (mm)</th>
                  <th>CWR Buckwheat</th>
                  <th>CWR Plum</th>
                  <th>CWR Passion Fruit</th>
                  <th>Adequacy</th>
                  <th>Irrigation Need</th>
                  <th>Water Class</th>
                </tr>
              </thead>
              <tbody>
                {[...waterData].sort((a, b) => b.rainfall - a.rainfall).map(d => (
                  <tr key={d.district}>
                    <td style={{ fontWeight: 600 }}>{d.district}</td>
                    <td style={{ fontWeight: 700, color: '#1565C0' }}>{d.rainfall.toLocaleString()} mm</td>
                    <td>350 mm</td>
                    <td>720 mm</td>
                    <td>1,400 mm</td>
                    <td><span className="suit-badge" style={{ background: '#E8F5E9', color: 'var(--primary)', border: '1px solid #A5D6A7' }}>{d.adequacy}</span></td>
                    <td><span style={{ fontWeight: 600, color: d.irrigation === 'None' ? 'var(--primary)' : d.irrigation === 'Minimal' ? '#E65100' : '#C62828' }}>{d.irrigation}</span></td>
                    <td><span style={{ fontWeight: 700, color: getWaterColor(d.waterClass) }}>{d.waterClass}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="source-note" style={{ marginTop: 12 }}>CWR values: Penman-Monteith method · Irrigation requirements: based on rainfall deficit analysis · Data: IMD, WorldClim v2.1</p>
        </div>
      </section>
    </div>
  );
}
