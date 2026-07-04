import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { climateData, getFrostColor } from '../data/districtData';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RAINFALL_CFG = [
  { key: 'E. Khasi Hills',  color: '#1B5E20', annual: 2380, data: [20, 37,  97, 214, 348, 455, 415, 368, 254, 120, 37, 17] },
  { key: 'W. Khasi Hills',  color: '#0D47A1', annual: 3200, data: [27, 49, 130, 288, 467, 611, 557, 494, 341, 162, 49, 22] },
  { key: 'W. Jaintia Hills',color: '#6A1B9A', annual: 2600, data: [22, 40, 106, 234, 380, 497, 453, 402, 277, 132, 40, 18] },
  { key: 'SW Khasi Hills',  color: '#E65100', annual: 1950, data: [16, 30,  79, 175, 285, 373, 340, 301, 208,  99, 30, 14] },
  { key: 'EW Khasi Hills',  color: '#00838F', annual: 2100, data: [18, 32,  85, 189, 307, 401, 366, 324, 224, 106, 32, 15] },
  { key: 'E. Jaintia Hills',color: '#880E4F', annual: 1780, data: [15, 27,  72, 160, 260, 340, 310, 275, 190,  90, 27, 12] },
  { key: 'Ri Bhoi',         color: '#F57F17', annual: 1850, data: [16, 28,  75, 167, 270, 354, 323, 286, 197,  94, 28, 13] },
  { key: 'N. Garo Hills',   color: '#388E3C', annual: 2150, data: [15, 32,  97, 215, 323, 430, 387, 301, 215,  97, 28, 11] },
  { key: 'E. Garo Hills',   color: '#1565C0', annual: 2050, data: [14, 31,  92, 205, 308, 410, 369, 287, 205,  92, 27, 10] },
  { key: 'W. Garo Hills',   color: '#4527A0', annual: 2800, data: [20, 42, 126, 280, 420, 560, 504, 392, 280, 126, 36, 14] },
  { key: 'S. Garo Hills',   color: '#AD1457', annual: 2100, data: [15, 32,  95, 210, 315, 420, 378, 294, 210,  95, 27, 11] },
  { key: 'SW Garo Hills',   color: '#BF360C', annual: 1950, data: [14, 29,  88, 195, 293, 390, 351, 273, 195,  88, 25, 10] },
];

const rainfallChartData = MONTHS.map((m, i) => {
  const row = { month: m };
  RAINFALL_CFG.forEach(({ key, data }) => { row[key] = data[i]; });
  return row;
});

export default function ClimateRisk() {
  const [activeLayer, setActiveLayer] = useState('frost');
  const [selectedDistrict, setSelectedDistrict] = useState('East Khasi Hills');
  const selectedClimate = climateData.find(d => d.district === selectedDistrict);

  const colorFn = (feature) => {
    const d = climateData.find(c => c.district === feature.properties.district);
    if (!d) return '#ccc';
    if (activeLayer === 'frost') return getFrostColor(d.frostLevel);
    if (activeLayer === 'rainfall') {
      const r = d.rainfall;
      if (r >= 3000) return '#0D47A1';
      if (r >= 2500) return '#1976D2';
      if (r >= 2000) return '#64B5F6';
      return '#FFB74D';
    }
    if (activeLayer === 'temperature') {
      const t = d.temp;
      if (t <= 18) return '#1B5E20';
      if (t <= 21) return '#F9A825';
      if (t <= 24) return '#E65100';
      return '#B71C1C';
    }
    return '#ccc';
  };

  const popupFn = (feature) => {
    const d = climateData.find(c => c.district === feature.properties.district);
    const p = feature.properties;
    if (!d) return `<div class="district-popup"><h3>${p.district}</h3></div>`;
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq}</p>
        <div class="popup-row"><span class="popup-label">Annual Rainfall</span><span class="popup-val">${d.rainfall.toLocaleString()} mm</span></div>
        <div class="popup-row"><span class="popup-label">Mean Temperature</span><span class="popup-val">${d.temp}°C</span></div>
        <div class="popup-row"><span class="popup-label">Frost Risk Days</span><span class="popup-val">${d.frostDays} days/year</span></div>
        <div class="popup-row"><span class="popup-label">Frost Risk Level</span><span class="popup-val" style="color:${getFrostColor(d.frostLevel)}">${d.frostLevel}</span></div>
        <div class="popup-row"><span class="popup-label">Water Class</span><span class="popup-val">${d.waterClass}</span></div>
      </div>`;
  };

  const frostLegend = [
    { color: '#B71C1C', label: 'High Frost Risk (>10 days)' },
    { color: '#E64A19', label: 'Medium (5–10 days)' },
    { color: '#F57F17', label: 'Low (1–4 days)' },
    { color: '#8BC34A', label: 'Minimal (≤2 days)' },
    { color: '#1B5E20', label: 'No Frost Risk' },
  ];
  const rainfallLegend = [
    { color: '#0D47A1', label: '≥3,000 mm (Very High)' },
    { color: '#1976D2', label: '2,500–2,999 mm' },
    { color: '#64B5F6', label: '2,000–2,499 mm' },
    { color: '#FFB74D', label: '<2,000 mm' },
  ];
  const tempLegend = [
    { color: '#1B5E20', label: '≤18°C (Cool – Optimal)' },
    { color: '#F9A825', label: '18–21°C (Warm)' },
    { color: '#E65100', label: '21–24°C (Hot)' },
    { color: '#B71C1C', label: '>24°C (Too Hot)' },
  ];

  const legendMap = { frost: frostLegend, rainfall: rainfallLegend, temperature: tempLegend };
  const titleMap = { frost: 'Frost Risk', rainfall: 'Annual Rainfall', temperature: 'Mean Temperature' };

  return (
    <div>
      <div className="page-header" style={{ borderTop: '4px solid #C62828', background: "linear-gradient(135deg, rgba(232,245,233,0.72) 0%, rgba(241,248,233,0.72) 60%, rgba(250,255,248,0.72) 100%), url('/images/climate-earth.jpg') center/cover no-repeat" }}>
        <div className="container">
          <div className="badge">Deliverable 6 · WorldClim · IMD</div>
          <h1>🌡 Climate Suitability & Risk Analysis</h1>
          <p>Historical climate assessment including frost risk mapping for buckwheat, temperature suitability for wine fruits, and rainfall adequacy evaluation using WorldClim v2.1 and IMD station data.</p>
        </div>
      </div>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          {/* Layer selector */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-mid)' }}>Climate Layer:</span>
            {[['frost', '❄ Frost Risk'], ['rainfall', '🌧 Rainfall'], ['temperature', '🌡 Temperature']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveLayer(key)}
                style={{ padding: '8px 18px', borderRadius: 8, border: `2px solid ${activeLayer === key ? '#C62828' : 'var(--border)'}`, background: activeLayer === key ? '#FFEBEE' : '#fff', color: activeLayer === key ? '#C62828' : 'var(--text-mid)', fontWeight: activeLayer === key ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            <div>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  height="520px"
                  legendItems={legendMap[activeLayer]}
                  legendTitle={titleMap[activeLayer]}
                  defaultTile="topo"
                  onDistrictClick={d => setSelectedDistrict(d)}
                />
              </div>
              <p className="source-note">WorldClim v2.1 · IMD Weather Stations · ICAR-RC NEH Region · Click district to select</p>
            </div>

            <div style={{ position: 'sticky', top: 70 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C62828', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>District Climate Profile</div>

              <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 2 }}>
                {[...climateData].sort((a, b) => a.frostDays - b.frostDays).map(d => (
                  <div key={d.district}
                    onClick={() => setSelectedDistrict(d.district)}
                    style={{
                      borderLeft: `3px solid ${getFrostColor(d.frostLevel)}`,
                      padding: '6px 10px', cursor: 'pointer', borderRadius: '0 6px 6px 0',
                      background: selectedDistrict === d.district ? '#FFF3F3' : '#F9FAFB',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background 0.15s',
                    }}>
                    <span style={{ fontWeight: selectedDistrict === d.district ? 700 : 500, fontSize: '0.76rem', color: '#1F2937' }}>{d.district}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.67rem', color: '#6B7280' }}>{d.temp}°C</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: getFrostColor(d.frostLevel) }}>❄{d.frostDays}d</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedClimate && (
                <div style={{ marginTop: 12, borderTop: '2px solid #FFCDD2', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'uppercase' }}>Selected</div>
                      <div style={{ fontWeight: 700, color: '#C62828', fontSize: '0.88rem' }}>{selectedClimate.district}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, color: getFrostColor(selectedClimate.frostLevel), background: getFrostColor(selectedClimate.frostLevel) + '18', border: `1px solid ${getFrostColor(selectedClimate.frostLevel)}` }}>❄ {selectedClimate.frostLevel}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { label: 'Mean Temp', value: `${selectedClimate.temp}°C`,               color: selectedClimate.temp <= 18 ? '#1B5E20' : selectedClimate.temp <= 21 ? '#F57F17' : '#C62828' },
                      { label: 'Rainfall',  value: `${selectedClimate.rainfall.toLocaleString()}mm`, color: '#1565C0' },
                      { label: 'Frost Days', value: `${selectedClimate.frostDays} days`,       color: getFrostColor(selectedClimate.frostLevel) },
                      { label: 'Water Class', value: selectedClimate.waterClass,               color: '#0277BD' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: '#FFF5F5', borderRadius: 7, padding: '7px 8px', textAlign: 'center', border: '1px solid #FFCDD2' }}>
                        <div style={{ fontSize: '0.58rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { label: 'Buckwheat',    value: selectedClimate.temp <= 20 ? 'Excellent' : selectedClimate.temp <= 23 ? 'Fair' : 'Poor',  color: selectedClimate.temp <= 20 ? '#1B5E20' : selectedClimate.temp <= 23 ? '#E65100' : '#C62828' },
                      { label: 'Plum',         value: selectedClimate.temp <= 18 ? 'Excellent' : selectedClimate.temp <= 21 ? 'Good' : 'Fair',  color: selectedClimate.temp <= 18 ? '#1B5E20' : selectedClimate.temp <= 21 ? '#E65100' : '#C62828' },
                      { label: 'Peach',        value: selectedClimate.temp <= 18 ? 'Excellent' : selectedClimate.temp <= 20 ? 'Good' : 'Fair',  color: selectedClimate.temp <= 18 ? '#1B5E20' : selectedClimate.temp <= 20 ? '#E65100' : '#C62828' },
                      { label: 'Passion Fruit', value: selectedClimate.temp >= 22 ? 'Excellent' : selectedClimate.temp >= 19 ? 'Good' : 'Fair', color: selectedClimate.temp >= 22 ? '#1B5E20' : selectedClimate.temp >= 19 ? '#E65100' : '#C62828' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: '#F9FAFB', borderRadius: 7, padding: '6px 8px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                        <div style={{ fontSize: '0.58rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="grid-2">
            {/* Frost risk bar */}
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#C62828', marginBottom: 4 }}>Frost Risk Days per Year</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Number of frost events per year by district</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={climateData} margin={{ top: 5, right: 10, bottom: 75, left: 25 }}>
                  <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10 }} label={{ value: 'District', position: 'insideBottom', offset: -20, style: { fontSize: 11, fill: '#666' } }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'Frost Risk Days / Year', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                  <Tooltip formatter={(v) => [`${v} days/year`, 'Frost Risk Days']} />
                  <Bar dataKey="frostDays" name="Frost Risk Days" radius={[4, 4, 0, 0]}>
                    {climateData.map(d => <Cell key={d.district} fill={getFrostColor(d.frostLevel)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Temperature vs Rainfall scatter */}
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#C62828', marginBottom: 4 }}>Annual Rainfall by District</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Total annual precipitation (mm)</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[...climateData].sort((a, b) => b.rainfall - a.rainfall)} margin={{ top: 5, right: 10, bottom: 75, left: 30 }}>
                  <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10 }} label={{ value: 'District', position: 'insideBottom', offset: -20, style: { fontSize: 11, fill: '#666' } }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'Annual Rainfall (mm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                  <Tooltip formatter={(v) => [`${v.toLocaleString()} mm`]} />
                  <Bar dataKey="rainfall" name="Rainfall (mm)" radius={[4, 4, 0, 0]}>
                    {[...climateData].sort((a, b) => b.rainfall - a.rainfall).map(d => (
                      <Cell key={d.district} fill={d.rainfall >= 3000 ? '#0D47A1' : d.rainfall >= 2500 ? '#1976D2' : '#64B5F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal rainfall area chart */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Seasonal Rainfall Distribution</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #C62828, #64B5F6)', borderRadius: 2, margin: '10px 0 24px' }} />
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1565C0', marginBottom: 4 }}>Monthly Rainfall (mm) – All 12 Districts</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Monthly distribution showing monsoon peak (June–August) and dry winter season</p>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={rainfallChartData} margin={{ top: 5, right: 20, bottom: 30, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#666' } }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '0.65rem', paddingTop: 4 }} />
                {RAINFALL_CFG.map(({ key, color, annual }) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={1.8} dot={false} name={`${key} (${annual.toLocaleString()}mm)`} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="source-note" style={{ marginTop: 8 }}>Source: IMD District Station Data · WorldClim v2.1 precipitation layers · 30-year climatological normals (1991–2020)</p>
        </div>
      </section>

      {/* Climate suitability table */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <h2 className="section-title">Temperature Suitability Summary</h2>
          <div style={{ overflowX: 'auto', marginTop: 24 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>Mean Temp (°C)</th>
                  <th>Annual Rainfall</th>
                  <th>Frost Risk</th>
                  <th>Buckwheat Suit.</th>
                  <th>Plum/Peach Suit.</th>
                  <th>Passion Fruit</th>
                </tr>
              </thead>
              <tbody>
                {climateData.map(d => (
                  <tr key={d.district}>
                    <td style={{ fontWeight: 600 }}>{d.district}</td>
                    <td>{d.temp}°C</td>
                    <td>{d.rainfall.toLocaleString()} mm</td>
                    <td><span style={{ color: getFrostColor(d.frostLevel), fontWeight: 700 }}>{d.frostLevel} ({d.frostDays}d)</span></td>
                    <td><span className="suit-badge" style={{ background: ['Excellent','Good'].includes(d.district === 'East Khasi Hills' ? 'Excellent' : 'Good') ? '#E8F5E9' : '#FFF8E1', color: 'var(--primary)', border: '1px solid #A5D6A7' }}>{d.temp <= 20 ? 'Excellent' : d.temp <= 23 ? 'Fair' : 'Poor'}</span></td>
                    <td><span className="suit-badge" style={{ background: d.temp <= 20 ? '#E8F5E9' : d.temp <= 22 ? '#FFF8E1' : '#FFEBEE', color: d.temp <= 20 ? 'var(--primary)' : d.temp <= 22 ? '#E65100' : '#C62828', border: '1px solid currentColor' }}>{d.temp <= 20 ? 'Very Good' : d.temp <= 22 ? 'Fair' : 'Poor'}</span></td>
                    <td><span className="suit-badge" style={{ background: d.temp >= 22 ? '#E8F5E9' : '#FFF8E1', color: d.temp >= 22 ? 'var(--primary)' : '#E65100', border: '1px solid currentColor' }}>{d.temp >= 22 ? 'Excellent' : d.temp >= 19 ? 'Good' : 'Fair'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="source-note" style={{ marginTop: 12 }}>Climate Data: WorldClim v2.1 · IMD Weather Stations · ICAR-RC NEH Region, Umiam</p>
        </div>
      </section>
    </div>
  );
}
