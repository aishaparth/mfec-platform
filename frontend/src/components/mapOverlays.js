import React, { useState, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { demData, lulcData } from '../data/districtData';

// ── Shared GeoJSON fetch cache (used by every map instance across the app) ──
const geoCache = {};
export function useGeoJSON(url) {
  const [data, setData] = useState(geoCache[url] || null);
  useEffect(() => {
    if (!url) return;
    if (geoCache[url]) { setData(geoCache[url]); return; }
    fetch(url).then(r => r.json()).then(json => { geoCache[url] = json; setData(json); }).catch(console.error);
  }, [url]);
  return data;
}

// ── Shared basemap tile definitions ──────────────────────────────────────────
export const TILES = {
  topo:      { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                             attribution: '© OpenTopoMap (CC-BY-SA)',     label: 'Topographic' },
  streets:   { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                           attribution: '© OpenStreetMap contributors', label: 'Street Map'  },
  carto:     { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',                               attribution: '© CartoDB',                    label: 'CartoDB Light' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© Esri World Imagery',        label: 'Satellite'   },
};

function districtName(feature) {
  return feature.properties?.district || feature.properties?.name;
}
function findDem(name)  { return demData.find(d => d.district === name); }
function findLulc(name) { return lulcData.find(d => d.district === name); }

// ── Elevation (DEM) ──────────────────────────────────────────────────────────
export function elevationColor(elevMean) {
  if (elevMean >= 1100) return '#4E342E';
  if (elevMean >= 800)  return '#795548';
  if (elevMean >= 500)  return '#A1887F';
  if (elevMean >= 250)  return '#C9B8AE';
  return '#E6DCD5';
}
export const ELEVATION_LEGEND = [
  { color: '#4E342E', label: '≥1,100 m' },
  { color: '#795548', label: '800–1,099 m' },
  { color: '#A1887F', label: '500–799 m' },
  { color: '#C9B8AE', label: '250–499 m' },
  { color: '#E6DCD5', label: '<250 m' },
];
export function styleElevation(feature) {
  const d = findDem(districtName(feature));
  return { fillColor: d ? elevationColor(d.elevMean) : '#ccc', weight: 1, color: '#fff', opacity: 0.85, fillOpacity: 0.6 };
}

// ── Slope ─────────────────────────────────────────────────────────────────────
export function slopeColor(slopeMean) {
  if (slopeMean >= 16) return '#B71C1C';
  if (slopeMean >= 13) return '#EF6C00';
  if (slopeMean >= 10) return '#F9A825';
  return '#7CB342';
}
export const SLOPE_LEGEND = [
  { color: '#7CB342', label: 'Gentle (<10°)' },
  { color: '#F9A825', label: 'Moderate (10–12.9°)' },
  { color: '#EF6C00', label: 'Steepish (13–15.9°)' },
  { color: '#B71C1C', label: 'Steep (≥16°)' },
];
export function styleSlope(feature) {
  const d = findDem(districtName(feature));
  return { fillColor: d ? slopeColor(d.slopeMean) : '#ccc', weight: 1, color: '#fff', opacity: 0.85, fillOpacity: 0.6 };
}

// ── Aspect ────────────────────────────────────────────────────────────────────
export const ASPECT_COLORS = {
  North: '#5C6BC0', Northeast: '#26A69A', East: '#66BB6A', Southeast: '#9CCC65',
  South: '#FFA726', Southwest: '#EF5350', West: '#AB47BC', Northwest: '#42A5F5',
};
export const ASPECT_LEGEND = Object.entries(ASPECT_COLORS).map(([label, color]) => ({ color, label }));
export function styleAspect(feature) {
  const d = findDem(districtName(feature));
  return { fillColor: d ? (ASPECT_COLORS[d.aspect] || '#ccc') : '#ccc', weight: 1, color: '#fff', opacity: 0.85, fillOpacity: 0.58 };
}

// ── Land Use / Land Cover ────────────────────────────────────────────────────
export function lulcDominantColor(entry) {
  if (!entry) return '#ccc';
  const { evergreenForestPct: f, shrublandPct: s, croplandPct: c, builtupPct: b } = entry;
  const max = Math.max(f, s, c, b);
  if (max === f) return '#1B5E20';
  if (max === s) return '#9CCC65';
  if (max === c) return '#D2A24C';
  return '#9E9E9E';
}
export const LULC_LEGEND = [
  { color: '#1B5E20', label: 'Evergreen Forest (dominant)' },
  { color: '#9CCC65', label: 'Shrubland (dominant)' },
  { color: '#D2A24C', label: 'Cropland (dominant)' },
  { color: '#9E9E9E', label: 'Built-up (dominant)' },
];
export function styleLULC(feature) {
  const d = findLulc(districtName(feature));
  return { fillColor: lulcDominantColor(d), weight: 1, color: '#fff', opacity: 0.85, fillOpacity: 0.6 };
}

// ── Popups for the new terrain/LULC overlays ─────────────────────────────────
export function terrainPopup(feature) {
  const name = districtName(feature);
  const d = findDem(name);
  if (!d) return `<div class="district-popup"><h3>${name}</h3></div>`;
  return `<div class="district-popup"><h3>${name}</h3>
    <div class="popup-row"><span class="popup-label">Mean Elevation</span><span class="popup-val">${d.elevMean} m</span></div>
    <div class="popup-row"><span class="popup-label">Elevation Range</span><span class="popup-val">${d.elevMin}–${d.elevMax} m</span></div>
    <div class="popup-row"><span class="popup-label">Mean Slope</span><span class="popup-val">${d.slopeMean}° (${d.slopeClass})</span></div>
    <div class="popup-row"><span class="popup-label">Dominant Aspect</span><span class="popup-val">${d.aspect}</span></div>
    <div class="popup-row"><span class="popup-label">Terrain Class</span><span class="popup-val">${d.terrainClass}</span></div>
  </div>`;
}
export function lulcPopup(feature) {
  const name = districtName(feature);
  const d = findLulc(name);
  if (!d) return `<div class="district-popup"><h3>${name}</h3></div>`;
  return `<div class="district-popup"><h3>${name}</h3>
    <div class="popup-row"><span class="popup-label">Evergreen Forest</span><span class="popup-val">${d.evergreenForestPct}%</span></div>
    <div class="popup-row"><span class="popup-label">Shrubland</span><span class="popup-val">${d.shrublandPct}%</span></div>
    <div class="popup-row"><span class="popup-label">Cropland</span><span class="popup-val">${d.croplandPct}%</span></div>
    <div class="popup-row"><span class="popup-label">Built-up</span><span class="popup-val">${d.builtupPct}%</span></div>
  </div>`;
}

// ── Roads / Blocks / Villages (shared styling, used by both map components) ─
export function styleState() {
  return { fill: false, weight: 3, color: '#71917A', opacity: 0.9 };
}
export function styleVillage() {
  return { fillColor: '#FFF9C4', fillOpacity: 0.45, weight: 0.5, color: '#F9A825', opacity: 0.7 };
}
export function styleRoad(feature) {
  const hw = feature?.properties?.highway || '';
  const colors = { trunk: '#C62828', primary: '#E65100', secondary: '#F9A825', tertiary: '#4CAF50', trunk_link: '#C62828', primary_link: '#E65100', secondary_link: '#F9A825', tertiary_link: '#4CAF50' };
  const widths = { trunk: 3, primary: 2.5, secondary: 2, tertiary: 1.5, trunk_link: 2, primary_link: 2, secondary_link: 1.5, tertiary_link: 1 };
  return { fill: false, weight: widths[hw] || 1.5, color: colors[hw] || '#9CA3AF', opacity: 0.85 };
}
export function styleBlock() {
  return { fillColor: 'transparent', weight: 1, opacity: 0.9, color: '#5F7D68', dashArray: '4,3', fillOpacity: 0 };
}
export function onEachVillage(feature, layer) {
  layer.bindTooltip(feature.properties?.name || feature.properties?.villagenam || 'Village', { sticky: true, className: 'district-tooltip' });
}
export function onEachRoad(feature, layer) {
  const p = feature.properties || {};
  layer.bindTooltip(`${(p.highway || 'road').toUpperCase()}${p.ref ? ' · ' + p.ref : ''}`, { sticky: true, className: 'district-tooltip' });
}
export function onEachBlock(feature, layer) {
  const p = feature.properties || {};
  layer.bindTooltip(`${p.block || 'Block'}${p.district ? ' (' + p.district + ')' : ''}`, { sticky: true, className: 'district-tooltip' });
}

// ── Crop-presence point layers (buckwheat / wine) ────────────────────────────
export function styleCropPresencePoint(feature) {
  const kind = feature.properties?.crop === 'wine' ? '#8E24AA' : '#2E7D32';
  return { radius: 5, weight: 1.2, color: '#fff', fillColor: kind, fillOpacity: 0.85 };
}
export const ROAD_LEGEND = [
  { color: '#C62828', label: 'Trunk' },
  { color: '#E65100', label: 'Primary' },
  { color: '#F9A825', label: 'Secondary' },
  { color: '#4CAF50', label: 'Tertiary' },
];
export const VILLAGE_LEGEND = [
  { color: '#FFF9C4', label: 'Village settlement' },
];
export const BLOCK_LEGEND = [
  { color: '#5F7D68', label: 'Block boundary' },
];
export const BUCKWHEAT_CROP_LEGEND = [
  { color: '#2E7D32', label: 'Active cultivation site' },
];
export const WINE_CROP_LEGEND = [
  { color: '#8E24AA', label: 'Winemaking enterprise' },
];

// ── Groundwater monitoring stations (real CGWB / India-WRIS station registry) ─
export const GROUNDWATER_AGENCY_COLORS = {
  CGWB:      '#1565C0',
  Meghalaya: '#8E24AA',
};
export function styleGroundwaterPoint(feature) {
  const p = feature.properties || {};
  const base = GROUNDWATER_AGENCY_COLORS[p.agency] || '#6B7280';
  return { radius: p.telemetric ? 7 : 5.5, weight: p.telemetric ? 2 : 1.2, color: p.telemetric ? '#FFD700' : '#fff', fillColor: base, fillOpacity: 0.9 };
}
export const GROUNDWATER_LEGEND = [
  { color: '#1565C0', label: 'CGWB station' },
  { color: '#8E24AA', label: 'State (Meghalaya) station' },
  { color: '#FFD700', label: 'Gold ring = telemetric (real-time)' },
];
export function groundwaterPopup(feature) {
  const p = feature.properties || {};
  return `<div class="district-popup"><h3>${p.name || 'Groundwater Station'}</h3>
    <div class="popup-row"><span class="popup-label">Station ID</span><span class="popup-val">${p.id || '—'}</span></div>
    <div class="popup-row"><span class="popup-label">District</span><span class="popup-val">${p.district || '—'}</span></div>
    <div class="popup-row"><span class="popup-label">Block</span><span class="popup-val">${p.block || '—'}</span></div>
    <div class="popup-row"><span class="popup-label">Agency</span><span class="popup-val">${p.agency || '—'}</span></div>
    <div class="popup-row"><span class="popup-label">Monitoring Mode</span><span class="popup-val">${p.telemetric ? 'Telemetric (real-time)' : 'Manual'}</span></div>
    <div class="popup-row"><span class="popup-label">River Basin</span><span class="popup-val">${p.basin || '—'}</span></div>
    <div class="popup-row"><span class="popup-label">Established</span><span class="popup-val">${p.established || '—'}</span></div>
    <div class="popup-row"><span class="popup-label">Geology Code (CGWB)</span><span class="popup-val" style="font-size:0.7rem">${p.geologyCode || '—'}</span></div>
  </div>`;
}

// Layer name (matches the `name` prop on <LayersControl.Overlay>) → its legend
export const OVERLAY_LEGENDS = {
  '🗺 Blocks':                   { title: 'Blocks',                 items: BLOCK_LEGEND },
  '🏘 Villages':                 { title: 'Villages',               items: VILLAGE_LEGEND },
  '🛣 Roads':                    { title: 'Road Class',             items: ROAD_LEGEND },
  '⛰ Elevation (DEM)':          { title: 'Elevation (DEM)',        items: ELEVATION_LEGEND },
  '📐 Slope':                    { title: 'Slope',                  items: SLOPE_LEGEND },
  '🧭 Aspect':                   { title: 'Aspect',                 items: ASPECT_LEGEND },
  '🌿 Land Use / Land Cover':    { title: 'Land Use / Land Cover',  items: LULC_LEGEND },
  '🌾 Buckwheat Crop Presence':  { title: 'Buckwheat Crop Presence', items: BUCKWHEAT_CROP_LEGEND },
  '🍇 Wine Crop Presence':       { title: 'Wine Crop Presence',     items: WINE_CROP_LEGEND },
  '💧 Groundwater Stations':     { title: 'Groundwater Stations',   items: GROUNDWATER_LEGEND },
};

export function cropPresencePopup(feature) {
  const p = feature.properties || {};
  if (p.crop === 'wine') {
    return `<div class="district-popup"><h3>${p.name || 'Winemaker'}</h3>
      <div class="popup-row"><span class="popup-label">District</span><span class="popup-val">${p.district || '—'}</span></div>
      <div class="popup-row"><span class="popup-label">Setup</span><span class="popup-val">${p.setup || '—'}</span></div>
      <div class="popup-row"><span class="popup-label">Capacity</span><span class="popup-val">${p.capacity ?? '—'} L</span></div>
    </div>`;
  }
  return `<div class="district-popup"><h3>${p.id || 'Buckwheat plot'}</h3>
    <div class="popup-row"><span class="popup-label">District</span><span class="popup-val">${p.district || '—'}</span></div>
    <div class="popup-row"><span class="popup-label">Block</span><span class="popup-val">${p.block || '—'}</span></div>
    <div class="popup-row"><span class="popup-label">Area</span><span class="popup-val">${p.area_ha ?? '—'} ha</span></div>
    <div class="popup-row"><span class="popup-label">Yield</span><span class="popup-val">${p.yield_kg ?? '—'} kg</span></div>
  </div>`;
}

// ── Legend system: tracks which toggleable overlays are checked, renders a ──
// ── single compact legend box combining the primary layer + any active overlays.
export function OverlayLegendTracker({ onChange }) {
  useMapEvents({
    overlayadd:    (e) => onChange(prev => { if (prev.has(e.name)) return prev; const n = new Set(prev); n.add(e.name); return n; }),
    overlayremove: (e) => onChange(prev => { if (!prev.has(e.name)) return prev; const n = new Set(prev); n.delete(e.name); return n; }),
  });
  return null;
}

function LegendSection({ title, items, size = 'normal' }) {
  const swatch = size === 'small' ? 10 : 13;
  const fontSize = size === 'small' ? '0.7rem' : '0.76rem';
  const titleSize = size === 'small' ? '0.62rem' : '0.7rem';
  return (
    <div>
      <div style={{ fontSize: titleSize, fontWeight: 700, color: size === 'small' ? '#5F7D68' : '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{title}</div>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, fontSize, color: size === 'small' ? '#4B5563' : '#374151' }}>
          <div style={{ width: swatch, height: swatch, borderRadius: 3, background: item.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
          <span style={{ lineHeight: 1.25 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * LegendBox – compact, content-sized legend. Shows the primary (colorFn) legend plus
 * a mini-section for every currently-checked selectable overlay (DEM/Slope/Aspect/LULC/
 * Roads/Blocks/Villages), and optionally an always-on extra (e.g. crop presence, which
 * defaults to checked so it isn't driven by the toggle-tracked activeOverlayNames).
 */
export function LegendBox({ title, items = [], activeOverlayNames = new Set(), extraLegends = [], hint }) {
  const overlaySections = [...activeOverlayNames].map(name => OVERLAY_LEGENDS[name]).filter(Boolean);
  const fixedExtras = (extraLegends || []).filter(Boolean);
  const hasPrimary = items.length > 0;
  if (!hasPrimary && overlaySections.length === 0 && fixedExtras.length === 0) return null;

  let seen = hasPrimary;
  return (
    <div style={{
      position: 'absolute', bottom: 40, left: 12, zIndex: 999,
      background: 'rgba(255,255,255,0.97)', borderRadius: 10,
      padding: '10px 13px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      width: 'fit-content', maxWidth: 205, maxHeight: '60%', overflowY: 'auto',
      border: '1px solid #e2e8f0',
    }}>
      {hasPrimary && <LegendSection title={title} items={items} />}
      {fixedExtras.map(legend => {
        const needsDivider = seen; seen = true;
        return (
          <div key={legend.title} style={{ marginTop: needsDivider ? 8 : 0, paddingTop: needsDivider ? 8 : 0, borderTop: needsDivider ? '1px solid #F0F0F0' : 'none' }}>
            <LegendSection title={legend.title} items={legend.items} size="small" />
          </div>
        );
      })}
      {overlaySections.map(legend => {
        const needsDivider = seen; seen = true;
        return (
          <div key={legend.title} style={{ marginTop: needsDivider ? 8 : 0, paddingTop: needsDivider ? 8 : 0, borderTop: needsDivider ? '1px solid #F0F0F0' : 'none' }}>
            <LegendSection title={legend.title} items={legend.items} size="small" />
          </div>
        );
      })}
      {hint && <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #F0F0F0', fontSize: '0.58rem', color: '#9CA3AF', lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}
