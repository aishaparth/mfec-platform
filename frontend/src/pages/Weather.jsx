import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, GeoJSON, ZoomControl, ScaleControl } from 'react-leaflet';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import { useWeatherData, WEATHER_DISTRICTS } from '../hooks/useWeatherData';

function weatherEmoji(id) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return '☀️';
  if (id > 800) return '⛅';
  return '🌡️';
}

function statusColor(id, temp) {
  if (id < 700) return { color: '#1565C0', bg: '#E3F2FD', label: 'Rainy' };
  if (temp >= 32) return { color: '#C62828', bg: '#FFEBEE', label: 'Hot' };
  if (temp >= 25) return { color: '#E65100', bg: '#FBE9E7', label: 'Warm' };
  return { color: '#2E7D32', bg: '#E8F5E9', label: 'Pleasant' };
}

function windDir(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function tempColor(temp) {
  if (temp >= 32) return '#C62828';
  if (temp >= 28) return '#E65100';
  if (temp >= 24) return '#F9A825';
  if (temp >= 20) return '#388E3C';
  return '#1565C0';
}

function makeMarkerIcon(r, selected) {
  const col = selected ? '#1B5E20' : '#2E7D32';
  const border = selected ? '3px solid #FFD700' : '2px solid ' + col;
  const bg = selected ? '#E8F5E9' : '#fff';
  return L.divIcon({
    className: '',
    html: `<div style="background:${bg};border:${border};border-radius:16px;padding:3px 9px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);line-height:1.5;cursor:pointer">${weatherEmoji(r.id)} ${r.temp.toFixed(1)}°</div>`,
    iconSize: [82, 26],
    iconAnchor: [41, 13],
  });
}

const CHART_CONFIGS = [
  { key: 'temp',  title: 'Temperature (°C)',        unit: '°C',   color: '#C62828', getVal: r => +r.temp.toFixed(1) },
  { key: 'hum',   title: 'Humidity (%)',             unit: '%',    color: '#1565C0', getVal: r => r.hum },
  { key: 'rain',  title: 'Rainfall – last 1h (mm)', unit: 'mm',   color: '#2F5266', getVal: r => +r.rain.toFixed(1) },
  { key: 'wind',  title: 'Wind Speed (km/h)',        unit: 'km/h', color: '#2E7D32', getVal: r => r.wind },
];

const HIST_KEY = 'mfec_wx_trend_v1';
const MAX_PTS  = 288; // 24h @ 5-min intervals

function loadTrend() {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch { return []; }
}

const RANK_CATS = [
  { key: 'hottest',  label: 'Hottest',   icon: '🔥', color: '#C62828', bg: '#FFEBEE', sort: (a, b) => b.r.temp - a.r.temp,  fmt: r => r.temp.toFixed(1) + '°C' },
  { key: 'coolest',  label: 'Coolest',   icon: '❄️', color: '#1565C0', bg: '#E3F2FD', sort: (a, b) => a.r.temp - b.r.temp,  fmt: r => r.temp.toFixed(1) + '°C' },
  { key: 'wettest',  label: 'Wettest',   icon: '🌧️', color: '#00695C', bg: '#E0F2F1', sort: (a, b) => b.r.rain - a.r.rain,  fmt: r => r.rain.toFixed(1) + ' mm' },
  { key: 'windiest', label: 'Windiest',  icon: '💨', color: '#4527A0', bg: '#EDE7F6', sort: (a, b) => b.r.wind - a.r.wind,  fmt: r => r.wind.toFixed(1) + ' km/h' },
  { key: 'humid',    label: 'Most Humid',icon: '💧', color: '#0277BD', bg: '#E1F5FE', sort: (a, b) => b.r.hum  - a.r.hum,   fmt: r => r.hum + '%' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Weather() {
  const { valid, loading, error, lastUpdated, refresh, summary } = useWeatherData();
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [districtsGeo, setDistrictsGeo] = useState(null);
  const geoJsonRef = useRef(null);
  const [trend, setTrend] = useState(() => loadTrend());

  useEffect(() => {
    fetch('/geojson/districts.json').then(r => r.json()).then(setDistrictsGeo).catch(console.error);
  }, []);

  // Append a snapshot every time live data refreshes
  useEffect(() => {
    if (!summary || !valid.length) return;
    const avgRain = valid.reduce((s, x) => s + x.r.rain, 0) / valid.length;
    const snap = {
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      temp: +summary.avgTemp.toFixed(1),
      hum:  Math.round(summary.avgHum),
      rain: +avgRain.toFixed(2),
      wind: +(valid.reduce((s, x) => s + x.r.wind, 0) / valid.length).toFixed(1),
    };
    setTrend(prev => {
      const next = [...prev, snap].slice(-MAX_PTS);
      try { localStorage.setItem(HIST_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [summary]);

  // Live rankings — top 3 per category
  const rankings = RANK_CATS.map(cat => ({
    ...cat,
    top: [...valid].sort(cat.sort).slice(0, 3),
  }));

  const selEntry = selectedIdx !== null ? valid.find(x => x.i === selectedIdx) : null;

  const styleDistrict = useCallback((feature) => {
    const geoName = feature.properties?.district || feature.properties?.name || '';
    const isSelected = selEntry && selEntry.d.region.replace(' (Sub)', '') === geoName;
    const match = valid.find(x => x.d.region.replace(' (Sub)', '') === geoName);
    const fill = match ? tempColor(match.r.temp) : '#9E9E9E';
    return {
      fillColor: fill,
      fillOpacity: isSelected ? 0.78 : 0.35,
      weight: isSelected ? 3 : 1.2,
      color: isSelected ? '#FFD700' : '#fff',
      opacity: 1,
    };
  }, [selEntry, valid]);

  // Update district fill/border when selection changes without remounting the GeoJSON layer
  useEffect(() => {
    if (geoJsonRef.current) geoJsonRef.current.setStyle(styleDistrict);
  }, [styleDistrict]);

  // Click on any district polygon to select it
  const onEachDistrict = useCallback((feature, layer) => {
    const geoName = feature.properties?.district || feature.properties?.name || '';
    layer.on('click', () => {
      const idx = WEATHER_DISTRICTS.findIndex(d =>
        d.region.replace(' (Sub)', '') === geoName || d.region === geoName
      );
      if (idx !== -1) setSelectedIdx(prev => prev === idx ? null : idx);
    });
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(135deg, rgba(200,225,255,0.68) 0%, rgba(210,230,255,0.68) 60%, rgba(220,240,255,0.68) 100%), url('/images/weather-sky.jpg') center/cover no-repeat", borderTop: '4px solid #0277BD' }}>
        <div className="container">
          <div className="badge">Live · OpenWeatherMap API · 12 Districts</div>
          <h1>🌤️ Live Weather</h1>
          <p>Real-time temperature, humidity, rainfall and wind across all 12 districts of Meghalaya. Auto-refreshes every 5 minutes.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {lastUpdated && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
              </span>
            )}
            <button onClick={refresh} disabled={loading}
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Refreshing…' : '⟳ Refresh Now'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: 10, padding: '16px 20px', margin: '24px auto', maxWidth: 600, color: '#C62828', textAlign: 'center', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI row */}
      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
            {loading && !summary
              ? Array(6).fill(null).map((_, i) => <div key={i} className="stat-card loading-pulse" style={{ minHeight: 100, background: '#EEF2EE' }} />)
              : summary && [
                  { icon: '🌡️', value: summary.avgTemp.toFixed(1) + '°C', label: 'Avg Temperature',     sub: 'Across 12 districts' },
                  { icon: '💧', value: Math.round(summary.avgHum) + '%',   label: 'Avg Humidity',        sub: 'Relative humidity' },
                  { icon: '🌧️', value: summary.maxRain.r.rain.toFixed(1) + ' mm', label: 'Max Rainfall (1h)', sub: summary.maxRain.d.name },
                  { icon: '🌬️', value: summary.maxWind.r.wind.toFixed(1) + ' km/h', label: 'Highest Wind',  sub: summary.maxWind.d.name },
                  { icon: '🔥', value: summary.hottest.d.name,             label: 'Hottest District',    sub: summary.hottest.r.temp.toFixed(1) + '°C' },
                  { icon: '❄️', value: summary.coolest.d.name,             label: 'Coolest District',    sub: summary.coolest.r.temp.toFixed(1) + '°C' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ borderTop: '3px solid var(--primary)' }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{s.icon}</div>
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Side-by-side: Map + District Detail ─────────────────────────── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">District Weather Map</h2>
            <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 12px' }} />
            <p className="section-subtitle">Click any district marker to see full weather details.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

            {/* Left: Map */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <MapContainer center={[25.55, 91.2]} zoom={8} style={{ height: 520 }} scrollWheelZoom zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="© CartoDB" />
                <ZoomControl position="bottomright" />
                <ScaleControl position="bottomleft" />

                {districtsGeo && (
                  <GeoJSON
                    ref={geoJsonRef}
                    data={districtsGeo}
                    style={styleDistrict}
                    onEachFeature={onEachDistrict}
                  />
                )}

                {valid.map(({ d, r, i }) => (
                  <Marker
                    key={d.name}
                    position={[d.lat, d.lon]}
                    icon={makeMarkerIcon(r, selectedIdx === i)}
                    eventHandlers={{ click: () => setSelectedIdx(prev => prev === i ? null : i) }}
                  />
                ))}
              </MapContainer>

              {/* Temp legend */}
              <div style={{ background: '#F8FAFB', borderTop: '1px solid var(--border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Temperature</span>
                {[
                  { color: '#C62828', label: '≥32°C Hot' },
                  { color: '#E65100', label: '28–31°C Warm' },
                  { color: '#F9A825', label: '24–27°C Mild' },
                  { color: '#388E3C', label: '20–23°C Cool' },
                  { color: '#1565C0', label: '<20°C Cold' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: '#374151' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Detail panel */}
            <div style={{ position: 'sticky', top: 80 }}>
              {selEntry ? (() => {
                const { d, r } = selEntry;
                const { color, bg, label } = statusColor(r.id, r.temp);
                return (
                  <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${color}40`, borderTop: `4px solid ${color}`, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                    {/* District header */}
                    <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{d.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{d.region}</div>
                        </div>
                        <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>{weatherEmoji(r.id)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '14px 0 4px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 700, color: color, lineHeight: 1 }}>{r.temp.toFixed(1)}°</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Feels {r.feels.toFixed(1)}°C</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', textTransform: 'capitalize', marginBottom: 10 }}>{r.desc}</div>
                      <span style={{ background: bg, color, padding: '3px 12px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>{label}</span>
                    </div>

                    {/* Metric cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
                      {[
                        { icon: '💧', lbl: 'Humidity',     v: r.hum + '%',                              bg: '#E3F2FD', col: '#1565C0' },
                        { icon: '🌬️', lbl: 'Wind',         v: `${r.wind.toFixed(1)} km/h`,              bg: '#E8F5E9', col: '#2E7D32' },
                        { icon: '🌧️', lbl: 'Rainfall (1h)', v: r.rain.toFixed(1) + ' mm',               bg: '#E0F7FA', col: '#00695C' },
                        { icon: '🧭', lbl: 'Wind Dir',     v: windDir(r.windDeg) + ` (${r.windDeg}°)`,  bg: '#FFF8E1', col: '#E65100' },
                      ].map(m => (
                        <div key={m.lbl} style={{ background: m.bg + '66', padding: '14px 16px' }}>
                          <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{m.icon}</div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{m.lbl}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: m.col }}>{m.v}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <button onClick={() => setSelectedIdx(null)}
                        style={{ fontSize: '0.72rem', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}>
                        ✕ Clear selection
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div style={{ background: 'var(--bg-page)', borderRadius: 14, border: '1px dashed var(--border)', padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗺️</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-mid)', marginBottom: 6 }}>No district selected</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
                    Click any temperature marker on the map to view humidity, wind, rainfall and condition details.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 24-Hour Statewide Trends ────────────────────────────────────── */}
      {trend.length > 0 && (
        <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0277BD,#00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>24h</div>
              <div>
                <h2 className="section-title" style={{ marginBottom: 2 }}>Statewide Trends</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: 0 }}>
                  {trend.length < 4
                    ? `${trend.length} snapshot${trend.length > 1 ? 's' : ''} collected — chart fills as data refreshes every 5 min`
                    : `${trend.length} snapshots · ${trend[0].time} → ${trend[trend.length - 1].time}`}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[
                { key: 'temp', label: 'Avg Temperature', unit: '°C',   color: '#C62828', bg: '#FFEBEE' },
                { key: 'hum',  label: 'Avg Humidity',    unit: '%',    color: '#1565C0', bg: '#E3F2FD' },
                { key: 'rain', label: 'Avg Rainfall',    unit: ' mm',  color: '#00695C', bg: '#E0F2F1' },
                { key: 'wind', label: 'Avg Wind Speed',  unit: ' km/h',color: '#4527A0', bg: '#EDE7F6' },
              ].map(cfg => {
                const latest = trend[trend.length - 1]?.[cfg.key];
                const prev   = trend[trend.length - 2]?.[cfg.key];
                const delta  = prev != null ? (latest - prev).toFixed(1) : null;
                return (
                  <div key={cfg.key} className="card" style={{ padding: '14px 16px', borderTop: `3px solid ${cfg.color}` }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{cfg.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{latest}{cfg.unit}</span>
                      {delta !== null && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: +delta >= 0 ? '#C62828' : '#1565C0' }}>
                          {+delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
                        </span>
                      )}
                    </div>
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={trend} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ fontSize: '0.72rem', borderRadius: 8, border: `1px solid ${cfg.color}40` }}
                          formatter={v => [v + cfg.unit, cfg.label]}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Area type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={2}
                          fill={`url(#grad-${cfg.key})`} dot={false} activeDot={{ r: 4, fill: cfg.color }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Live Rankings ────────────────────────────────────────────────── */}
      {valid.length > 0 && (
        <section className="section-sm" style={{ background: '#fff' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#E65100,#C62828)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏆</div>
              <div>
                <h2 className="section-title" style={{ marginBottom: 2 }}>Live Rankings</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: 0 }}>Top 3 districts by each weather parameter, updated every refresh cycle.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
              {rankings.map(cat => (
                <div key={cat.key} style={{ background: cat.bg, borderRadius: 14, padding: '14px 16px', border: `1px solid ${cat.color}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{cat.label}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cat.top.map(({ d, r }, ri) => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '7px 10px' }}>
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>{MEDAL[ri]}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                          <div style={{ fontSize: '0.62rem', color: '#6B7280', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.region}</div>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: cat.color, flexShrink: 0 }}>{cat.fmt(r)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bar charts */}
      {valid.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-page)' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">District Comparison</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 12px' }} />
              <p className="section-subtitle">Live readings ranked highest to lowest across all 12 districts.</p>
            </div>
            <div className="grid-2">
              {CHART_CONFIGS.map(cfg => {
                const data = [...valid]
                  .sort((a, b) => cfg.getVal(b.r) - cfg.getVal(a.r))
                  .map(x => ({ name: x.d.name, value: cfg.getVal(x.r) }));
                return (
                  <div key={cfg.key} className="card">
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 16 }}>{cfg.title}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 72 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }}
                          label={{ value: cfg.unit, position: 'insideRight', offset: 12, style: { fontSize: 11, fill: '#666' } }}
                        />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                        <Tooltip formatter={v => [v + ' ' + cfg.unit, cfg.title]} />
                        <Bar dataKey="value" fill={cfg.color} radius={[0, 4, 4, 0]} barSize={13} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Parameter table */}
      {valid.length > 0 && (
        <section className="section-sm" style={{ background: '#fff' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Parameter Table</h2>
              <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 12px' }} />
              <p className="section-subtitle">All districts side-by-side for quick comparison.</p>
            </div>
            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table className="data-table" style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Region</th>
                    <th style={{ textAlign: 'center' }}>Temp (°C)</th>
                    <th style={{ textAlign: 'center' }}>Humidity (%)</th>
                    <th style={{ textAlign: 'center' }}>Rainfall 1h (mm)</th>
                    <th style={{ textAlign: 'center' }}>Wind (km/h)</th>
                    <th style={{ textAlign: 'center' }}>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {valid.map(({ d, r, i }) => {
                    const { color, bg, label } = statusColor(r.id, r.temp);
                    return (
                      <tr key={d.name} style={{ cursor: 'pointer', background: selectedIdx === i ? '#F0F7F0' : undefined }}
                        onClick={() => setSelectedIdx(prev => prev === i ? null : i)}>
                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{d.region}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: tempColor(r.temp) }}>{r.temp.toFixed(1)}</td>
                        <td style={{ textAlign: 'center' }}>{r.hum}</td>
                        <td style={{ textAlign: 'center' }}>{r.rain.toFixed(1)}</td>
                        <td style={{ textAlign: 'center' }}>{r.wind.toFixed(1)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 600 }}>{label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="source-note" style={{ marginTop: 10 }}>
              Source: OpenWeatherMap Current Weather API · Updates every 5 minutes
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
