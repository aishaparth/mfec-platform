import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { suitabilityData, getSuitColor, getSuitClass } from '../data/districtData';

const CROPS = [
  { key: 'plum', label: 'Plum', emoji: '🫐', color: '#4A148C', bg: '#F3E5F5', desc: 'Cool-climate plum thrives in East and West Khasi Hills above 1,000m elevation. High chill-hour requirements met in higher elevation blocks.', optimalTemp: '12–20°C', rainfall: '1,800–3,500mm', elevation: '900–1,800m' },
  { key: 'peach', label: 'Peach', emoji: '🍑', color: '#BF360C', bg: '#FBE9E7', desc: 'Peach shows strong potential in Khasi Hills with adequate chill hours. Similar distribution to plum with slightly broader elevation tolerance.', optimalTemp: '13–22°C', rainfall: '1,500–3,000mm', elevation: '800–1,700m' },
  { key: 'passionFruit', label: 'Passion Fruit', emoji: '🥭', color: '#E65100', bg: '#FFF3E0', desc: 'Passion fruit excels at lower elevations with warmer temperatures. Ri Bhoi and East Garo Hills emerge as top districts with sub-tropical conditions.', optimalTemp: '20–30°C', rainfall: '1,500–2,500mm', elevation: '200–900m' },
];

export default function WineFruits() {
  const [activeCrop, setActiveCrop] = useState('plum');
  const crop = CROPS.find(c => c.key === activeCrop);
  const sorted = [...suitabilityData].sort((a, b) => b[activeCrop] - a[activeCrop]);

  const colorFn = (feature) => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    return d ? getSuitColor(d[activeCrop]) : '#ccc';
  };

  const popupFn = (feature) => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    const p = feature.properties;
    if (!d) return `<div class="district-popup"><h3>${p.district}</h3></div>`;
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq}</p>
        <div class="popup-row"><span class="popup-label">${crop.emoji} ${crop.label} Score</span><span class="popup-val" style="color:${getSuitColor(d[activeCrop])}">${d[activeCrop]}/100</span></div>
        <div class="popup-row"><span class="popup-label">Classification</span><span class="popup-val">${getSuitClass(d[activeCrop])}</span></div>
        <div class="popup-row"><span class="popup-label">Plum</span><span class="popup-val">${d.plum}/100</span></div>
        <div class="popup-row"><span class="popup-label">Peach</span><span class="popup-val">${d.peach}/100</span></div>
        <div class="popup-row"><span class="popup-label">Passion Fruit</span><span class="popup-val">${d.passionFruit}/100</span></div>
      </div>`;
  };

  const legendItems = [
    { color: '#1B5E20', label: 'High Suitability (75–100)' },
    { color: '#388E3C', label: 'Good Suitability (60–74)' },
    { color: '#8BC34A', label: 'Medium (50–59)' },
    { color: '#FDD835', label: 'Low (40–49)' },
    { color: '#E53935', label: 'Very Low (<40)' },
  ];

  // Multi-crop comparison radar
  const radarData = suitabilityData.slice(0, 6).map(d => ({
    district: d.district.split(' ').slice(-2).join(' '),
    Plum: d.plum, Peach: d.peach, 'Passion Fruit': d.passionFruit,
  }));

  return (
    <div>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #4A0072 0%, #6A1B9A 50%, #38006B 100%)' }}>
        <div className="container">
          <div className="badge">Deliverable 2 · Wine Fruits MaxEnt</div>
          <h1>🍷 Wine Fruits Suitability Modelling</h1>
          <p>Separate MaxEnt habitat suitability models for Plum, Peach, and Passion Fruit with terrain overlay and priority cultivation zone identification across Meghalaya.</p>
        </div>
      </div>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          {/* Crop selector */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            {CROPS.map(c => (
              <button key={c.key} onClick={() => setActiveCrop(c.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: `2px solid ${activeCrop === c.key ? c.color : 'var(--border)'}`, background: activeCrop === c.key ? c.bg : '#fff', color: activeCrop === c.key ? c.color : 'var(--text-mid)', fontWeight: activeCrop === c.key ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '1.4rem' }}>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>

          {/* Crop info banner */}
          <div style={{ background: crop.bg, border: `1px solid ${crop.color}22`, borderRadius: 12, padding: '16px 24px', marginBottom: 28, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>{crop.emoji}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: crop.color, fontFamily: 'var(--font-heading)', marginBottom: 6 }}>{crop.label} – Suitability Model</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: 580 }}>{crop.desc}</p>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['🌡', 'Temp', crop.optimalTemp], ['🌧', 'Rainfall', crop.rainfall], ['⛰', 'Elevation', crop.elevation]].map(([ic, lb, val]) => (
                <div key={lb} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem' }}>{ic}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{lb}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: crop.color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28 }}>
            <div>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  height="500px"
                  legendItems={legendItems}
                  legendTitle={`${crop.label} Suitability`}
                  defaultTile="topo"
                />
              </div>
              <p className="source-note">MaxEnt v3.4.4 · WorldClim v2.1 bioclim variables · SRTM DEM 30m · GBIF occurrence data</p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: crop.color, marginBottom: 14 }}>{crop.emoji} District Rankings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sorted.map((d, i) => (
                  <div key={d.district} className="card card-sm" style={{ borderLeft: `4px solid ${getSuitColor(d[activeCrop])}`, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`rank-badge${i < 3 ? [' gold', ' silver', ' bronze'][i] : ''}`}>{i + 1}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.83rem' }}>{d.district}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: getSuitColor(d[activeCrop]), fontSize: '0.92rem' }}>{d[activeCrop]}</span>
                    </div>
                    <div className="score-bar-wrap">
                      <div className="score-bar">
                        <div className="score-bar-fill" style={{ width: `${d[activeCrop]}%`, background: getSuitColor(d[activeCrop]) }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: getSuitColor(d[activeCrop]), fontWeight: 700 }}>{getSuitClass(d[activeCrop])}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-crop comparison bar chart */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <h2 className="section-title">Multi-Crop Comparison</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 24px' }} />
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 4 }}>Wine Fruits Suitability – All Districts</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Plum, Peach, and Passion Fruit scores side-by-side</p>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={suitabilityData} margin={{ top: 5, right: 10, bottom: 85, left: 25 }}>
                <XAxis dataKey="district" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10 }} label={{ value: 'District', position: 'insideBottom', offset: -22, style: { fontSize: 11, fill: '#666' } }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Suitability Score (0–100)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' } }} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="plum" name="🫐 Plum" fill="#7B1FA2" radius={[3,3,0,0]} />
                <Bar dataKey="peach" name="🍑 Peach" fill="#BF360C" radius={[3,3,0,0]} />
                <Bar dataKey="passionFruit" name="🥭 Passion Fruit" fill="#E65100" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Priority zones */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Priority Cultivation Zones</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 24px' }} />
          <div className="grid-3">
            {[
              { crop: '🫐 Plum', districts: ['East Khasi Hills (91)', 'West Khasi Hills (85)', 'East Jaintia Hills (78)', 'West Jaintia Hills (75)'], note: 'Cool-climate belt at 1,000–1,800m', color: '#4A148C' },
              { crop: '🍑 Peach', districts: ['East Khasi Hills (88)', 'West Khasi Hills (82)', 'East Jaintia Hills (75)', 'West Jaintia Hills (72)'], note: 'Khasi plateau preferred for chill hours', color: '#BF360C' },
              { crop: '🥭 Passion Fruit', districts: ['Ri Bhoi (82)', 'East Garo Hills (78)', 'West Jaintia Hills (72)', 'West Garo Hills (68)'], note: 'Lower elevation warm-belt preferred', color: '#E65100' },
            ].map(z => (
              <div key={z.crop} className="card" style={{ borderTop: `4px solid ${z.color}` }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: z.color, marginBottom: 14, fontSize: '1.05rem' }}>{z.crop}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {z.districts.map((d, i) => (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: z.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      {d}
                    </div>
                  ))}
                </div>
                <p className="source-note" style={{ marginTop: 12, fontStyle: 'normal', fontWeight: 500, color: z.color }}>{z.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
