import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MeghalayaMap from '../components/MeghalayaMap';
import StatsCard from '../components/StatsCard';
import { suitabilityData, getSuitColor } from '../data/districtData';
import { DELIVERABLES, MILESTONES, PROJECT_INFO } from '../data/projectData';

const CROP_CARDS = [
  { name: 'Buckwheat', emoji: '🌾', path: '/buckwheat-suitability', districts: '4 High Suitability', desc: 'MaxEnt model across 12 districts. East Khasi Hills ranks #1 with 87% suitability score, ideal at 1,350m elevation.', color: '#1B5E20' },
  { name: 'Plum', emoji: '🫐', path: '/wine-fruits', districts: '4 High Suitability', desc: 'Excellent conditions in Khasi and Jaintia Hills. East Khasi Hills achieves 91% plum suitability with cool temperatures.', color: '#4A148C' },
  { name: 'Peach', emoji: '🍑', path: '/wine-fruits', districts: '4 High Suitability', desc: 'Temperature-sensitive modelling reveals strong potential in East Khasi (88%) and West Khasi Hills (82%).', color: '#BF360C' },
  { name: 'Passion Fruit', emoji: '🥭', path: '/wine-fruits', districts: '3 High Suitability', desc: 'Thrives at lower elevations. Ri Bhoi emerges as top passion fruit district (82%) with warm, humid microclimate.', color: '#E65100' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('buckwheat');

  const colorFn = (feature) => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    return d ? getSuitColor(d[activeTab === 'passionFruit' ? 'passionFruit' : activeTab]) : '#ccc';
  };

  const popupFn = (feature) => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    const props = feature.properties;
    if (!d) return `<div class="district-popup"><h3>${props.district}</h3></div>`;
    const scoreKey = activeTab === 'passionFruit' ? 'passionFruit' : activeTab;
    const score = d[scoreKey];
    const cls = score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low';
    return `
      <div class="district-popup">
        <h3>${props.district}</h3>
        <p class="hq">HQ: ${props.hq} · ${props.region}</p>
        <div class="popup-row"><span class="popup-label">Overall Rank</span><span class="popup-val">#${d.overallRank}</span></div>
        <div class="popup-row"><span class="popup-label">Buckwheat Score</span><span class="popup-val">${d.buckwheat}/100</span></div>
        <div class="popup-row"><span class="popup-label">Plum Score</span><span class="popup-val">${d.plum}/100</span></div>
        <div class="popup-row"><span class="popup-label">Passion Fruit</span><span class="popup-val">${d.passionFruit}/100</span></div>
        <div class="popup-row"><span class="popup-label">AUC Score</span><span class="popup-val">${d.aucScore}</span></div>
      </div>`;
  };

  const legendItems = [
    { color: '#1B5E20', label: 'High Suitability (75–100)' },
    { color: '#388E3C', label: 'Good Suitability (60–74)' },
    { color: '#8BC34A', label: 'Medium Suitability (50–59)' },
    { color: '#FDD835', label: 'Low Suitability (40–49)' },
    { color: '#E53935', label: 'Very Low (<40)' },
  ];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(160deg, #0D1B0E 0%, #1B3A1F 40%, #0A2614 70%, #122B15 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(102,187,106,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,168,37,0.06) 0%, transparent 70%)' }} />

        <div className="container" style={{ padding: '100px 24px 80px', width: '100%' }}>
          <div style={{ maxWidth: 780 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(102,187,106,0.15)', border: '1px solid rgba(102,187,106,0.3)', color: '#A5D6A7', fontSize: '0.72rem', fontWeight: 600, padding: '5px 14px', borderRadius: 50, letterSpacing: '0.6px', textTransform: 'uppercase' }}>PO-DS-AGRI-2026-27-01</span>
              <span style={{ background: 'rgba(249,168,37,0.12)', border: '1px solid rgba(249,168,37,0.25)', color: '#FFD54F', fontSize: '0.72rem', fontWeight: 600, padding: '5px 14px', borderRadius: 50, letterSpacing: '0.6px', textTransform: 'uppercase' }}>MaxEnt · AUC &gt; 0.70</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
              Meghalaya Agricultural<br />
              <span style={{ color: '#66BB6A' }}>Intelligence Platform</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, marginBottom: 16, maxWidth: 620 }}>
              Advanced geospatial analysis supporting the <strong style={{ color: '#A5D6A7' }}>MFEC Buckwheat and Fruit Wine Initiatives</strong>. Habitat suitability modelling, satellite crop health assessment, and climate-risk analytics across 12 districts of Meghalaya.
            </p>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', marginBottom: 36 }}>
              Client: Meghalaya Farmers' Empowerment Commission Development (MFEC) · Government of Meghalaya
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ background: '#2E7D32', fontSize: '0.92rem', padding: '13px 28px' }}>
                📊 Open Dashboard
              </Link>
              <Link to="/buckwheat-suitability" className="btn btn-outline" style={{ color: '#A5D6A7', border: '2px solid rgba(165,214,167,0.4)', padding: '13px 28px', fontSize: '0.92rem' }}>
                🗺 View Suitability Maps
              </Link>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 52 }}>
              {[
                { v: '9', l: 'Districts Analysed' },
                { v: '4', l: 'Crops Modelled' },
                { v: '45', l: 'Priority Blocks' },
                { v: '>0.70', l: 'Target AUC Score' },
              ].map(s => (
                <div key={s.l} style={{ borderLeft: '3px solid rgba(102,187,106,0.4)', paddingLeft: 14 }}>
                  <div style={{ color: '#66BB6A', fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{s.v}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== OVERVIEW MAP ===== */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <div className="badge" style={{ background: '#E8F5E9', color: 'var(--primary)', border: '1px solid #A5D6A7', padding: '4px 14px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'inline-block', marginBottom: 10 }}>Interactive Map</div>
            <h2 className="section-title">District Suitability Overview</h2>
            <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 12px' }} />
            <p className="section-subtitle">Click any district to zoom in. Switch the crop layer below to explore suitability across Buckwheat, Plum, Peach, and Passion Fruit.</p>
          </div>

          {/* Crop tabs */}
          <div className="tab-bar" style={{ maxWidth: 520 }}>
            {[['buckwheat', '🌾 Buckwheat'], ['plum', '🫐 Plum'], ['peach', '🍑 Peach'], ['passionFruit', '🥭 Passion Fruit']].map(([key, label]) => (
              <button key={key} className={`tab-btn${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
            ))}
          </div>

          <div className="map-container">
            <MeghalayaMap
              colorFn={colorFn}
              popupFn={popupFn}
              height="560px"
              legendItems={legendItems}
              legendTitle="Suitability Score"
              defaultTile="topo"
            />
          </div>
          <p className="source-note" style={{ textAlign: 'center', marginTop: 10 }}>
            Data: MaxEnt Habitat Suitability Model · Boundary source: Survey of India (simplified for visualization) · Satellite: Sentinel-2, ESA Copernicus
          </p>
        </div>
      </section>

      {/* ===== KEY STATS ===== */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="stats-row">
            <StatsCard value="22,429" label="Total Area (km²)" note="Meghalaya state" icon="🗺" color="#1565C0" bg="#E3F2FD" />
            <StatsCard value="87%" label="Top Buckwheat Score" note="East Khasi Hills" icon="🌾" />
            <StatsCard value="91%" label="Top Plum Score" note="East Khasi Hills" icon="🫐" color="#4A148C" bg="#F3E5F5" />
            <StatsCard value="82%" label="Top Passion Fruit Score" note="Ri Bhoi District" icon="🥭" color="#E65100" bg="#FBE9E7" />
            <StatsCard value="0.89" label="Highest AUC Score" note="E. Khasi Hills model" icon="📈" color="#1565C0" bg="#E3F2FD" />
            <StatsCard value="3,200mm" label="Highest Annual Rainfall" note="West Khasi Hills" icon="🌧" color="#00838F" bg="#E0F7FA" />
          </div>
        </div>
      </section>

      {/* ===== CROP CARDS ===== */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Crops Under Analysis</h2>
            <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 12px' }} />
            <p className="section-subtitle">Four crops modelled using MaxEnt, with terrain typology, climate suitability, and satellite health assessment.</p>
          </div>
          <div className="grid-2">
            {CROP_CARDS.map(c => (
              <div key={c.name} className="card" style={{ display: 'flex', gap: 20, borderLeft: `5px solid ${c.color}` }}>
                <div style={{ fontSize: '2.8rem', flexShrink: 0 }}>{c.emoji}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: c.color, marginBottom: 4 }}>{c.name}</h3>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#E8F5E9', color: 'var(--primary)', border: '1px solid #A5D6A7', borderRadius: 50, padding: '2px 10px', display: 'inline-block', marginBottom: 8 }}>{c.districts}</span>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>{c.desc}</p>
                  <Link to={c.path} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, color: c.color, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                    Explore map →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DELIVERABLES TIMELINE ===== */}
      <section className="section" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Project Timeline</h2>
            <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 12px' }} />
            <p className="section-subtitle">11 deliverables across 5 milestones · 22 May – 31 August 2026</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {MILESTONES.map(m => (
              <div key={m.id} className="card card-sm" style={{ borderTop: `4px solid ${m.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>{m.id}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: 1.3 }}>{m.title}</div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 6 }}>Deliverables {m.deliverables}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: m.color }}>{m.date}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link to="/dashboard" className="btn btn-primary">View Full Analytics Dashboard →</Link>
          </div>
        </div>
      </section>

      {/* ===== ANALYTICS MODULES ===== */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Analytics Modules</h2>
            <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 12px' }} />
          </div>
          <div className="grid-3">
            {[
              { icon: '🌾', title: 'Buckwheat Suitability', desc: 'MaxEnt modelling with terrain analysis and district rankings across 12 districts.', path: '/buckwheat-suitability', color: '#1B5E20' },
              { icon: '🍷', title: 'Wine Fruits Analysis', desc: 'Separate suitability models for Plum, Peach, and Passion Fruit with priority zones.', path: '/wine-fruits', color: '#4A148C' },
              { icon: '🛰', title: 'Crop Health (NDVI/NDWI)', desc: 'Sentinel-2 vegetation health and moisture stress assessment, Rabi 2025.', path: '/crop-health', color: '#00695C' },
              { icon: '🌡', title: 'Climate Risk Analysis', desc: 'Frost risk mapping, temperature suitability, and rainfall adequacy evaluation.', path: '/climate-risk', color: '#B71C1C' },
              { icon: '💧', title: 'Water Management', desc: 'Crop Water Requirement estimation and seasonal water availability analysis.', path: '/water-management', color: '#1565C0' },
              { icon: '🏆', title: 'Priority Zones', desc: 'Top 5 blocks per district ranked by suitability with area estimation.', path: '/priority-zones', color: '#F9A825' },
            ].map(m => (
              <Link to={m.path} key={m.path} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ borderTop: `4px solid ${m.color}`, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{m.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: m.color, marginBottom: 8 }}>{m.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.7 }}>{m.desc}</p>
                  <div style={{ marginTop: 14, color: m.color, fontWeight: 600, fontSize: '0.82rem' }}>Explore →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
