import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import MeghalayaMap from '../components/MeghalayaMap';
import { suitabilityData, priorityBlocks, getSuitColor, getSuitClass } from '../data/districtData';

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
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #E65100 0%, #F57C00 50%, #FF8F00 100%)' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>
            {/* Map */}
            <div>
              <h2 className="section-title" style={{ marginBottom: 8 }}>Priority Zones Map</h2>
              <p className="section-subtitle" style={{ marginBottom: 16 }}>Click any district to view its blocks in the panel. Toggle block overlay to see all 46 blocks. Color = buckwheat suitability.</p>
              <div className="map-container">
                <MeghalayaMap
                  colorFn={colorFn}
                  popupFn={popupFn}
                  showBlocks={true}
                  height="520px"
                  legendItems={legend}
                  legendTitle="Priority Level"
                  defaultTile="topo"
                />
              </div>
              <p className="source-note">Boundaries: Blocks_46 shapefile · Districts_12 shapefile · State_Boundary shapefile · Analysis: MaxEnt v3.4.4</p>
            </div>

            {/* District selector + block list */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 14 }}>Select District</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                {DISTRICT_ORDER.map(d => {
                  const suit = suitabilityData.find(s => s.district === d);
                  return (
                    <button key={d} onClick={() => setSelectedDistrict(d)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderRadius: 8, border: `2px solid ${selectedDistrict === d ? getSuitColor(suit?.buckwheat || 50) : 'var(--border)'}`, background: selectedDistrict === d ? '#F0F7F0' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: selectedDistrict === d ? 700 : 500, color: 'var(--text-dark)' }}>{d}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getSuitColor(suit?.buckwheat || 50) }}>{suit?.buckwheat}</span>
                    </button>
                  );
                })}
              </div>

              {/* All blocks for selected district */}
              <div style={{ background: '#F0F7F0', borderRadius: 12, padding: 16 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 12, fontSize: '0.95rem' }}>
                  All Blocks – {selectedDistrict} ({blocks.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {blocks.map((b, i) => (
                    <div key={b.block} style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`rank-badge${i === 0 ? ' gold' : i === 1 ? ' silver' : i === 2 ? ' bronze' : ''}`} style={{ flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.block}</div>
                        <div className="score-bar-wrap" style={{ marginTop: 4 }}>
                          <div className="score-bar" style={{ height: 6 }}>
                            <div className="score-bar-fill" style={{ width: `${b.score}%`, background: getSuitColor(b.score), height: '100%' }} />
                          </div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: getSuitColor(b.score), fontSize: '0.95rem' }}>{b.score}</span>
                    </div>
                  ))}
                </div>
                {selectedSuit && (
                  <div style={{ marginTop: 12, padding: 10, background: 'rgba(27,94,32,0.06)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
                    <strong>District Overview:</strong> Overall Rank #{selectedSuit.overallRank} · Buckwheat {selectedSuit.buckwheat}/100 · AUC {selectedSuit.aucScore}
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
              <BarChart data={allBlocks} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 120 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="block" tick={{ fontSize: 11 }} width={115} />
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
                      <td><span className="suit-badge" style={{ background: b.score >= 70 ? '#E8F5E9' : b.score >= 50 ? '#FFF8E1' : '#FFEBEE', color: b.score >= 70 ? 'var(--primary)' : b.score >= 50 ? '#E65100' : '#C62828', border: '1px solid currentColor' }}>{getSuitClass(b.score)}</span></td>
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
