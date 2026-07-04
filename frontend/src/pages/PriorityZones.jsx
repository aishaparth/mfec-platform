import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { suitabilityData, priorityBlocks, getSuitColor, getSuitClass, getSuitBadgeStyle } from '../data/districtData';

const DISTRICT_ORDER = ['East Khasi Hills', 'West Khasi Hills', 'West Jaintia Hills', 'South West Khasi Hills', 'Eastern West Khasi Hills', 'East Jaintia Hills', 'Ri Bhoi', 'North Garo Hills', 'East Garo Hills', 'West Garo Hills', 'South Garo Hills', 'South West Garo Hills'];

export default function PriorityZones() {
  const [selectedDistrict, setSelectedDistrict] = useState('East Khasi Hills');
  const selectedSuit = suitabilityData.find(d => d.district === selectedDistrict);
  const blocks = priorityBlocks[selectedDistrict] || [];

  const colorFn = (feature) => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    return d ? getSuitColor(d.buckwheat) : '#ccc';
  };

  const popupFn = (feature) => {
    const d = suitabilityData.find(s => s.district === feature.properties.district);
    const p = feature.properties;
    if (!d) return `<div class="district-popup"><h3>${p.district}</h3></div>`;
    const blks = priorityBlocks[p.district] || [];
    const blockList = blks.map((b, i) => `<div class="popup-row"><span class="popup-label">#${i + 1} ${b.block}</span><span class="popup-val">${b.score}/100</span></div>`).join('');
    return `
      <div class="district-popup">
        <h3>${p.district}</h3>
        <p class="hq">HQ: ${p.hq} · Overall Rank #${d.overallRank}</p>
        <p style="font-weight:700;font-size:0.78rem;color:var(--primary);margin:8px 0 4px">Top 5 Priority Blocks:</p>
        ${blockList}
      </div>`;
  };

  const legend = [
    { color: '#1B5E20', label: 'High Priority (Score ≥75)' },
    { color: '#388E3C', label: 'Good Priority (60–74)' },
    { color: '#8BC34A', label: 'Medium Priority (50–59)' },
    { color: '#FDD835', label: 'Low Priority (40–49)' },
    { color: '#E53935', label: 'Very Low (<40)' },
  ];

  // All blocks flattened for top 10 chart
  const allBlocks = DISTRICT_ORDER.flatMap(d =>
    (priorityBlocks[d] || []).map(b => ({ ...b, district: d, districtShort: d.split(' ').slice(-2).join(' ') }))
  ).sort((a, b) => b.score - a.score).slice(0, 15);

  return (
    <div>
      <div className="page-header" style={{ borderTop: '4px solid #F57C00', background: "linear-gradient(135deg, rgba(232,245,233,0.84) 0%, rgba(241,248,233,0.84) 60%, rgba(250,255,248,0.84) 100%), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=60&fit=crop&crop=center') center/cover no-repeat" }}>
        <div className="container">
          <div className="badge">Deliverable 8 · Priority Zone Report</div>
          <h1>🏆 Priority Zone Identification</h1>
          <p>Top 5 priority cultivation blocks per district ranked by buckwheat suitability potential. Area estimation under each suitability class. District-wise ranking based on MaxEnt model outputs and terrain analysis.</p>
        </div>
      </div>

      {/* Stats */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="stats-row">
            <div className="stat-card" style={{ borderTop: '4px solid var(--gold)' }}>
              <div className="stat-value" style={{ color: 'var(--gold)' }}>46</div>
              <div className="stat-label">Total Blocks Mapped</div>
              <div className="stat-note">Blocks_46 shapefile · 12 districts</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid var(--primary)' }}>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>Mawlai</div>
              <div className="stat-label">Highest Scoring Block</div>
              <div className="stat-note">E. Khasi Hills – Score 92/100</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #1565C0', background: '#E3F2FD' }}>
              <div className="stat-value" style={{ color: '#1565C0' }}>6,430</div>
              <div className="stat-label">High Suitability Area (km²)</div>
              <div className="stat-note">Score ≥75 across all blocks</div>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #7B1FA2', background: '#F3E5F5' }}>
              <div className="stat-value" style={{ color: '#7B1FA2' }}>5</div>
              <div className="stat-label">High Suitability Districts</div>
              <div className="stat-note">Score ≥70 for buckwheat</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
            {/* Map */}
            <div>
              <h2 className="section-title" style={{ marginBottom: 6 }}>Priority Zones Map</h2>
              <p className="section-subtitle" style={{ marginBottom: 12 }}>Click any district on the map or list to view its blocks. Color = buckwheat suitability.</p>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  showBlocks={true}
                  height="520px"
                  legendItems={legend}
                  legendTitle="Priority Level"
                  defaultTile="topo"
                  onDistrictClick={d => setSelectedDistrict(d)}
                />
              </div>
              <p className="source-note">Blocks_46 · Districts_12 · State_Boundary shapefiles · MaxEnt v3.4.4 · Click district to select</p>
            </div>

            {/* District selector + block list */}
            <div style={{ position: 'sticky', top: 70 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Select District</div>

              <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 2, marginBottom: 12 }}>
                {DISTRICT_ORDER.map(d => {
                  const suit = suitabilityData.find(s => s.district === d);
                  return (
                    <div key={d} onClick={() => setSelectedDistrict(d)}
                      style={{
                        borderLeft: `3px solid ${getSuitColor(suit?.buckwheat || 50)}`,
                        padding: '6px 10px', cursor: 'pointer', borderRadius: '0 6px 6px 0',
                        background: selectedDistrict === d ? '#F0F7F0' : '#F9FAFB',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'background 0.15s',
                      }}>
                      <span style={{ fontWeight: selectedDistrict === d ? 700 : 500, fontSize: '0.76rem', color: '#1F2937' }}>{d}</span>
                      <span style={{ fontWeight: 800, color: getSuitColor(suit?.buckwheat || 50), fontSize: '0.82rem' }}>{suit?.buckwheat}</span>
                    </div>
                  );
                })}
              </div>

              {/* All blocks for selected district */}
              <div style={{ background: '#F0F7F0', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.82rem' }}>All Blocks – {selectedDistrict}</div>
                  <span style={{ fontSize: '0.65rem', background: '#E8F5E9', color: '#1B5E20', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>{blocks.length} blocks</span>
                </div>
                <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {blocks.map((b, i) => (
                    <div key={b.block} style={{ background: '#fff', borderRadius: 7, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`rank-badge${i === 0 ? ' gold' : i === 1 ? ' silver' : i === 2 ? ' bronze' : ''}`} style={{ flexShrink: 0, fontSize: '0.6rem', width: 18, height: 18, lineHeight: '18px' }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.block}</div>
                        <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, marginTop: 3 }}>
                          <div style={{ height: '100%', width: `${b.score}%`, background: getSuitColor(b.score), borderRadius: 2 }} />
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: getSuitColor(b.score), fontSize: '0.85rem', flexShrink: 0 }}>{b.score}</span>
                    </div>
                  ))}
                </div>
                {selectedSuit && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #C8E6C9', fontSize: '0.68rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
                    Rank #{selectedSuit.overallRank} · Score {selectedSuit.buckwheat}/100 · AUC {selectedSuit.aucScore}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 15 blocks chart */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 4 }}>Top 15 Priority Blocks – All Districts</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Highest-scoring blocks across Meghalaya by buckwheat suitability index</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={allBlocks} layout="vertical" margin={{ top: 5, right: 30, bottom: 30, left: 120 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Suitability Score (0–100)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#666' } }} />
                <YAxis type="category" dataKey="block" tick={{ fontSize: 11 }} width={115} label={{ value: 'Block', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#666' }, offset: 10 }} />
                <Tooltip formatter={(v, n, p) => [`${v}/100`, `${p.payload.districtShort}`]} />
                <Bar dataKey="score" name="Priority Score" radius={[0, 4, 4, 0]}>
                  {allBlocks.map(b => <Cell key={b.block + b.district} fill={getSuitColor(b.score)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Full table */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Complete Priority Block Rankings</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--gold), var(--primary))', borderRadius: 2, margin: '10px 0 24px' }} />
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>District Rank</th><th>District</th><th>Block Rank</th><th>Block</th><th>Area (km²)</th><th>Score</th><th>Classification</th></tr>
              </thead>
              <tbody>
                {DISTRICT_ORDER.flatMap((d, di) => {
                  const suit = suitabilityData.find(s => s.district === d);
                  const blks = priorityBlocks[d] || [];
                  return blks.map((b, bi) => (
                    <tr key={`${d}-${bi}`}>
                      {bi === 0 && <td rowSpan={blks.length} style={{ fontWeight: 700, textAlign: 'center', verticalAlign: 'middle' }}><span className={`rank-badge${di < 3 ? [' gold', ' silver', ' bronze'][di] : ''}`}>{di + 1}</span></td>}
                      {bi === 0 && <td rowSpan={blks.length} style={{ fontWeight: 700, color: 'var(--primary)' }}>{d}</td>}
                      <td><span style={{ fontWeight: 600, color: 'var(--text-mid)' }}>#{bi + 1}</span></td>
                      <td>{b.block}</td>
                      <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{b.areaSqKm?.toFixed(0)} km²</td>
                      <td><span style={{ fontWeight: 700, color: getSuitColor(b.score) }}>{b.score}/100</span></td>
                      <td><span className="suit-badge" style={getSuitBadgeStyle(b.score)}>{getSuitClass(b.score)}</span></td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
          <p className="source-note" style={{ marginTop: 12 }}>Boundaries: Blocks_46 shapefile (Meghalaya GIS Cell) · Scores: MaxEnt v3.4.4 · WorldClim v2.1 · SRTM DEM 30m · GBIF</p>
        </div>
      </section>
    </div>
  );
}
