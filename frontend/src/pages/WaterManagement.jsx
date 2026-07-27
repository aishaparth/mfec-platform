import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ComposedChart, Line, Legend, CartesianGrid, ReferenceLine } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { waterData, getWaterColor } from '../data/districtData';
import { useData } from '../context/DataContext';
import { GROUNDWATER_AGENCY_COLORS } from '../components/mapOverlays';

export default function WaterManagement() {
  const { groundwaterStations } = useData();
  const [selectedDistrict, setSelectedDistrict] = useState('West Khasi Hills');
  const selectedWater = waterData.find(d => d.district === selectedDistrict);

  const gwStations = Array.isArray(groundwaterStations) ? groundwaterStations : [];
  const gwCGWB = gwStations.filter(g => g.agency === 'CGWB').length;
  const gwTelemetric = gwStations.filter(g => g.telemetric).length;
  const gwDistrictsCovered = new Set(gwStations.map(g => g.district)).size;

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
      <div className="page-header" style={{ borderTop: '4px solid #0277BD', background: "linear-gradient(135deg, rgba(225,245,254,0.70) 0%, rgba(232,245,233,0.70) 60%, rgba(240,248,255,0.70) 100%), url('/images/water-stream.jpg') center/cover no-repeat" }}>
        <div className="container">
          <div className="badge">Water Management</div>
          <h1>💧 Water Management Insights</h1>
          <p>Crop Water Requirement (CWR) estimation, rainfall adequacy assessment, and seasonal water availability analysis for buckwheat and wine fruit cultivation across Meghalaya.</p>
        </div>
      </div>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'nowrap', overflowX: 'auto' }}>
            {[
              { v: '350mm',   l: 'Buckwheat CWR / Season',    c: '#0D47A1', bg: '#E3F2FD' },
              { v: '680mm',   l: 'Peach CWR / Season',        c: '#0288D1', bg: '#E1F5FE' },
              { v: '720mm',   l: 'Plum CWR / Season',         c: '#1565C0', bg: '#E3F2FD' },
              { v: '1,400mm', l: 'Passion Fruit CWR / Year',  c: '#7B1FA2', bg: '#F3E5F5' },
              { v: '9.1x',    l: 'Max Adequacy Ratio',        c: '#1B5E20', bg: '#E8F5E9' },
              { v: '5.3x',    l: 'Min Adequacy Ratio',        c: '#E65100', bg: '#FBE9E7' },
              { v: '7',       l: 'Districts – No Irrigation', c: '#00695C', bg: '#E0F2F1' },
            ].map(s => (
              <div key={s.l} style={{ flex: '1 1 0', minWidth: 118, borderTop: `3px solid ${s.c}`, background: s.bg, borderRadius: 8, padding: '9px 10px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: s.c, fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>{s.v}</div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-mid)', fontWeight: 500, marginTop: 3, lineHeight: 1.25 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#F7FAF7', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 24, fontSize: '0.78rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-dark)' }}>How to read these: </strong>
            The first four figures are each crop's <strong>Crop Water Requirement (CWR)</strong> — how much rainfall it needs across a season, calculated using the Penman-Monteith method. The <strong>Adequacy Ratio</strong> is a district's annual rainfall divided by buckwheat's 350mm requirement — e.g. West Khasi Hills gets 9.1× what buckwheat needs, so water is never the limiting factor there, while Ri Bhoi's 5.3× is the state's tightest margin (still well above the 1× minimum). <strong>7 districts need no irrigation at all</strong> for buckwheat, since their rainfall alone clears the requirement.
          </div>

          <h2 className="section-title" style={{ marginBottom: 4 }}>Water Availability Map</h2>
          <p className="section-subtitle" style={{ marginBottom: 12 }}>District-level water availability based on annual rainfall and crop water requirements.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            <div>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  height="520px"
                  legendItems={legend}
                  legendTitle="Water Availability"
                  defaultTile="topo"
                  onDistrictClick={d => setSelectedDistrict(d)}
                  groundwaterStations={gwStations}
                />
              </div>
              <p className="source-note">IMD rainfall stations · Survey of India stream networks · WorldClim precipitation layers · India-WRIS/CGWB groundwater station registry (real locations, see note below) · Click district to select</p>
            </div>

            <div style={{ position: 'sticky', top: 70 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1565C0', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>District Water Profile</div>

              <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 2 }}>
                {[...waterData].sort((a, b) => b.rainfall - a.rainfall).map(d => (
                  <div key={d.district}
                    onClick={() => setSelectedDistrict(d.district)}
                    style={{
                      borderLeft: `3px solid ${getWaterColor(d.waterClass)}`,
                      padding: '6px 10px', cursor: 'pointer', borderRadius: '0 6px 6px 0',
                      background: selectedDistrict === d.district ? '#E3F2FD' : '#F9FAFB',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background 0.15s',
                    }}>
                    <span style={{ fontWeight: selectedDistrict === d.district ? 700 : 500, fontSize: '0.76rem', color: '#1F2937' }}>{d.district}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.67rem', fontWeight: 600, color: '#1565C0' }}>{d.rainfall.toLocaleString()}mm</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, color: d.irrigation === 'None' ? '#1B5E20' : '#E65100' }}>{d.irrigation === 'None' ? '✓' : 'Irr'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedWater && (
                <div style={{ marginTop: 12, borderTop: '2px solid #BBDEFB', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'uppercase' }}>Selected</div>
                      <div style={{ fontWeight: 700, color: '#0D47A1', fontSize: '0.88rem' }}>{selectedWater.district}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, color: getWaterColor(selectedWater.waterClass), background: getWaterColor(selectedWater.waterClass) + '18', border: `1px solid ${getWaterColor(selectedWater.waterClass)}` }}>{selectedWater.waterClass}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                    {[
                      { label: 'Rainfall',  value: `${selectedWater.rainfall.toLocaleString()} mm`, color: '#1565C0' },
                      { label: 'Adequacy',  value: `${(selectedWater.rainfall / selectedWater.cwrBuckwheat).toFixed(1)}×`,  color: '#1B5E20' },
                      { label: 'Irrigation', value: selectedWater.irrigation,                        color: selectedWater.irrigation === 'None' ? '#1B5E20' : '#E65100' },
                      { label: 'Adequacy',   value: selectedWater.adequacy,                          color: '#0277BD' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: '#EFF6FF', borderRadius: 7, padding: '7px 8px', textAlign: 'center', border: '1px solid #BFDBFE' }}>
                        <div style={{ fontSize: '0.58rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#F0F9FF', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#6B7280', marginBottom: 4 }}>CWR vs Rainfall comparison</div>
                    {[
                      { crop: 'Buckwheat',    cwr: selectedWater.cwrBuckwheat,    color: '#1B5E20' },
                      { crop: 'Peach',        cwr: selectedWater.cwrPeach,        color: '#0288D1' },
                      { crop: 'Plum',         cwr: selectedWater.cwrPlum,         color: '#7B1FA2' },
                      { crop: 'Passion Fruit', cwr: selectedWater.cwrPassionFruit, color: '#E65100' },
                    ].map(({ crop, cwr, color }) => {
                      const pct = Math.min(100, (cwr / selectedWater.rainfall) * 100);
                      return (
                        <div key={crop} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <div style={{ width: 62, fontSize: '0.6rem', color, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{crop}</div>
                          <div style={{ flex: 1, height: 5, background: '#E0E7FF', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                          </div>
                          <div style={{ width: 34, fontSize: '0.6rem', color, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{cwr}mm</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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

      {/* Groundwater Monitoring */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: 4 }}>Groundwater Monitoring</h2>
          <p className="section-subtitle" style={{ marginBottom: 16 }}>Real CGWB / India-WRIS groundwater station registry — shown as the “💧 Groundwater Stations” layer on the map above (toggle it on via the layers icon).</p>

          <div className="stats-row" style={{ marginBottom: 24 }}>
            <div className="stat-card" style={{ borderTop: '4px solid #1565C0', background: '#E3F2FD' }}>
              <div className="stat-value" style={{ color: '#1565C0' }}>{gwStations.length}</div>
              <div className="stat-label">Monitoring Stations</div>
              <div className="stat-note">India-WRIS / CGWB registry</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #0288D1', background: '#E1F5FE' }}>
              <div className="stat-value" style={{ color: '#0288D1' }}>{gwDistrictsCovered}</div>
              <div className="stat-label">Districts Covered</div>
              <div className="stat-note">of 12 Meghalaya districts</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #1565C0', background: '#E3F2FD' }}>
              <div className="stat-value" style={{ color: '#1565C0' }}>{gwCGWB}</div>
              <div className="stat-label">CGWB Stations</div>
              <div className="stat-note">Central Ground Water Board</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #8E24AA', background: '#F3E5F5' }}>
              <div className="stat-value" style={{ color: '#8E24AA' }}>{gwStations.length - gwCGWB}</div>
              <div className="stat-label">State (Meghalaya) Stations</div>
              <div className="stat-note">Meghalaya state agency</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #F9A825', background: '#FFF8E1' }}>
              <div className="stat-value" style={{ color: '#B8860B' }}>{gwTelemetric}</div>
              <div className="stat-label">Telemetric Stations</div>
              <div className="stat-note">real-time automated monitoring</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>District</th>
                  <th>Block</th>
                  <th>Agency</th>
                  <th>Monitoring Mode</th>
                  <th>River Basin</th>
                  <th>Established</th>
                </tr>
              </thead>
              <tbody>
                {[...gwStations].sort((a, b) => (a.district || '').localeCompare(b.district || '')).map(st => (
                  <tr key={st.id}>
                    <td style={{ fontWeight: 600 }}>{st.name}</td>
                    <td>{st.district}</td>
                    <td>{st.block || '—'}</td>
                    <td><span style={{ fontWeight: 700, color: GROUNDWATER_AGENCY_COLORS[st.agency] || '#374151' }}>{st.agency}</span></td>
                    <td>{st.telemetric ? '📡 Telemetric' : 'Manual'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{st.basin || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{st.established || '—'}</td>
                  </tr>
                ))}
                {gwStations.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 20 }}>No groundwater stations loaded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="source-note" style={{ marginTop: 12 }}>Real station registry: 70 groundwater monitoring stations from the India-WRIS / Central Ground Water Board (CGWB) network for Meghalaya, including station location, operating agency, telemetry status, river basin, and CGWB hydrogeology classification codes. This registry does not include water-level readings or quality results (a separate WRIS time-series dataset, not yet integrated) — add or update stations, or attach reading data as it becomes available, via the Admin panel's Groundwater Stations tab.</p>
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
                  <th>CWR Peach</th>
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
                    <td>680 mm</td>
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
