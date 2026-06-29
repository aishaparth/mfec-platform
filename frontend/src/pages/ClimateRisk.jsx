import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { climateData, getFrostColor } from '../data/districtData';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SEASONAL_RAINFALL = {
  'East Khasi Hills':   [25, 45, 120, 280, 380, 520, 480, 420, 320, 150, 45, 20],
  'West Khasi Hills':   [30, 55, 145, 320, 520, 680, 620, 550, 380, 180, 55, 25],
  'West Jaintia Hills': [28, 48, 130, 290, 420, 560, 520, 440, 340, 160, 48, 22],
  'Ri Bhoi':            [18, 32, 88, 210, 320, 420, 390, 345, 252, 118, 38, 15],
  'West Garo Hills':    [20, 38, 105, 248, 395, 515, 498, 428, 322, 155, 42, 18],
};

const rainfallChartData = MONTHS.map((m, i) => ({
  month: m,
  'E. Khasi Hills': SEASONAL_RAINFALL['East Khasi Hills'][i],
  'W. Khasi Hills': SEASONAL_RAINFALL['West Khasi Hills'][i],
  'W. Jaintia Hills': SEASONAL_RAINFALL['West Jaintia Hills'][i],
  'Ri Bhoi': SEASONAL_RAINFALL['Ri Bhoi'][i],
  'W. Garo Hills': SEASONAL_RAINFALL['West Garo Hills'][i],
}));

export default function ClimateRisk() {
  const [activeLayer, setActiveLayer] = useState('frost');

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
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #B71C1C 0%, #C62828 50%, #8B0000 100%)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
            <div>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  height="500px"
                  legendItems={legendMap[activeLayer]}
                  legendTitle={titleMap[activeLayer]}
                  defaultTile="topo"
                />
              </div>
              <p className="source-note">Climate Data: WorldClim v2.1 (Fick & Hijmans, 2017) · IMD District Weather Stations · ICAR-RC NEH Region</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#C62828', marginBottom: 4 }}>District Climate Profile</h3>
              {[...climateData].sort((a, b) => a.frostDays - b.frostDays).map(d => (
                <div key={d.district} className="card card-sm" style={{ borderLeft: `4px solid ${getFrostColor(d.frostLevel)}`, padding: '10px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.83rem', marginBottom: 4 }}>{d.district}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-light)' }}>
                    <span>🌡 {d.temp}°C</span>
                    <span>🌧 {d.rainfall.toLocaleString()}mm</span>
                    <span style={{ color: getFrostColor(d.frostLevel), fontWeight: 600 }}>❄ {d.frostLevel}</span>
                  </div>
                </div>
              ))}
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
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1565C0', marginBottom: 4 }}>Monthly Rainfall (mm) – Select Districts</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Monthly distribution showing monsoon peak (June–August) and dry winter season</p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={rainfallChartData} margin={{ top: 5, right: 20, bottom: 30, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#666' } }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="W. Khasi Hills" stroke="#0D47A1" fill="#E3F2FD" strokeWidth={2} name="W. Khasi Hills (3,200mm)" />
                <Area type="monotone" dataKey="E. Khasi Hills" stroke="#1B5E20" fill="#E8F5E9" strokeWidth={2} name="E. Khasi Hills (2,380mm)" />
                <Area type="monotone" dataKey="W. Jaintia Hills" stroke="#6A1B9A" fill="#F3E5F5" strokeWidth={2} name="W. Jaintia Hills (2,600mm)" />
                <Area type="monotone" dataKey="Ri Bhoi" stroke="#E65100" fill="#FBE9E7" strokeWidth={2} name="Ri Bhoi (1,850mm)" />
              </AreaChart>
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
