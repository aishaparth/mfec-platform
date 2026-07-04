import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Polyline, Popup, Tooltip, LayersControl, ZoomControl, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER = [25.47, 91.37];
const ZOOM = 8;

const TILES = {
  topo:    { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                  attribution: '© OpenTopoMap (CC-BY-SA)',   label: 'Topographic' },
  streets: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                attribution: '© OpenStreetMap contributors', label: 'Street Map' },
  carto:   { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',                    attribution: '© CartoDB',                   label: 'CartoDB Light' },
  satellite:{ url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© Esri',        label: 'Satellite' },
};

const geoCache = {};
function useGeoJSON(url) {
  const [data, setData] = useState(geoCache[url] || null);
  useEffect(() => {
    if (!url) return;
    if (geoCache[url]) { setData(geoCache[url]); return; }
    fetch(url).then(r => r.json()).then(json => { geoCache[url] = json; setData(json); }).catch(console.error);
  }, [url]);
  return data;
}

/**
 * BuckwheatMap – specialised map for the suitability page.
 * Supports: choropleth by scenario, farmer points (color-coded), BRIC hub-and-spoke overlay.
 */
export default function BuckwheatMap({
  scenarioKey,
  colorFn,
  popupFn,
  legendItems,
  legendTitle = 'Suitability',
  showFarmers = false,
  farmers = [],
  segmentMeta = {},
  showBRIC = false,
  bricHubs = [],
  height = '540px',
  onDistrictClick,
  selectedDistrict: highlightedDistrict,
}) {
  const districts = useGeoJSON('/geojson/districts.json');
  const state     = useGeoJSON('/geojson/state.json');

  const distKey = `${scenarioKey}-${colorFn?.toString().slice(0, 50)}`;

  const styleDistrict = f => {
    const dName = f.properties?.district || f.properties?.name;
    const isSelected = highlightedDistrict && highlightedDistrict === dName;
    return {
      fillColor: colorFn ? colorFn(f) : '#388E3C',
      weight: isSelected ? 3 : 1.8,
      opacity: 1,
      color: isSelected ? '#FFD700' : '#ffffff',
      fillOpacity: isSelected ? 0.92 : 0.78,
    };
  };
  const styleState = () => ({ fill: false, weight: 3, color: '#1B5E20', opacity: 0.9 });

  const onEachDistrict = (feature, layer) => {
    const p = feature.properties;
    const dName = p.district || p.name;
    layer.on({
      mouseover: e => { e.target.setStyle({ weight: 3, fillOpacity: 0.92 }); },
      mouseout:  e => { e.target.setStyle({ weight: 1.8, fillOpacity: highlightedDistrict === dName ? 0.92 : 0.78 }); },
      click:     e => {
        e.target._map.fitBounds(e.target.getBounds(), { padding: [40, 40] });
        if (onDistrictClick) onDistrictClick(dName);
      },
    });
    const html = popupFn
      ? popupFn(feature)
      : `<div class="district-popup"><h3>${p.district || p.name}</h3><p class="hq">HQ: ${p.hq || ''}</p></div>`;
    layer.bindPopup(html, { maxWidth: 300, className: 'mfec-popup' });
    layer.bindTooltip(p.district || p.name, { permanent: false, sticky: true, className: 'district-tooltip' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={CENTER} zoom={ZOOM}
        style={{ height, width: '100%', borderRadius: 12 }}
        zoomControl={false} scrollWheelZoom
      >
        <LayersControl position="topright">
          {Object.entries(TILES).map(([key, t]) => (
            <LayersControl.BaseLayer key={key} checked={key === 'topo'} name={t.label}>
              <TileLayer url={t.url} attribution={t.attribution} maxZoom={18} />
            </LayersControl.BaseLayer>
          ))}
        </LayersControl>
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />

        {state     && <GeoJSON key="state"    data={state}     style={styleState} />}
        {districts && <GeoJSON key={distKey}  data={districts} style={styleDistrict} onEachFeature={onEachDistrict} />}

        {/* ── BRIC Hub-and-Spoke overlay ───────────────────────────────── */}
        {showBRIC && bricHubs.map(hub => (
          <React.Fragment key={hub.id}>
            {hub.spokes.map(sp => (
              <Polyline
                key={`spoke-${sp.name}`}
                positions={[[hub.lat, hub.lon], [sp.lat, sp.lon]]}
                pathOptions={{
                  color: hub.type === 'primary' ? '#1B5E20' : '#558B2F',
                  weight: 2, dashArray: '7,5', opacity: 0.85,
                }}
              />
            ))}
            {hub.spokes.map(sp => (
              <CircleMarker
                key={`col-${sp.name}`}
                center={[sp.lat, sp.lon]}
                radius={5}
                pathOptions={{ color: '#fff', weight: 1.5, fillColor: hub.type === 'primary' ? '#66BB6A' : '#AED581', fillOpacity: 0.92 }}
              >
                <Tooltip sticky>{sp.name} (Collection Point)</Tooltip>
              </CircleMarker>
            ))}
            <CircleMarker
              center={[hub.lat, hub.lon]}
              radius={hub.type === 'primary' ? 13 : 10}
              pathOptions={{ color: '#fff', weight: 2.5, fillColor: hub.type === 'primary' ? '#1B5E20' : '#33691E', fillOpacity: 1 }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', padding: '6px 4px', minWidth: 170 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>{hub.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: 3 }}>{hub.district}</div>
                  <div style={{ display: 'inline-block', fontSize: '0.7rem', background: hub.type === 'primary' ? '#1B5E20' : '#558B2F', color: '#fff', padding: '2px 8px', borderRadius: 10, marginBottom: 6 }}>
                    {hub.type === 'primary' ? 'Primary BRIC Hub' : 'Secondary BRIC Hub'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#777' }}>{hub.spokes.length} collection spokes</div>
                </div>
              </Popup>
              <Tooltip className="district-tooltip">{hub.name}</Tooltip>
            </CircleMarker>
          </React.Fragment>
        ))}

        {/* ── Farmer Points ─────────────────────────────────────────────── */}
        {showFarmers && farmers.map((f, i) => {
          const meta = segmentMeta[f.segment] || segmentMeta.other;
          const isActive = f.status === 'active';
          return (
            <CircleMarker
              key={i}
              center={[f.lat, f.lon]}
              radius={isActive ? 6 : 5}
              pathOptions={{
                color: meta.border,
                weight: isActive ? 1.5 : 1,
                fillColor: meta.color,
                fillOpacity: isActive ? 0.95 : 0.72,
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', padding: '6px 4px', minWidth: 170 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B5E20', marginBottom: 3 }}>
                    {f.name || 'Farmer'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: 4 }}>
                    {[f.village, f.block, f.district].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{
                    display: 'inline-block', fontSize: '0.7rem',
                    background: isActive ? '#E8F5E9' : '#FFF3E0',
                    color: isActive ? '#1B5E20' : '#E65100',
                    padding: '2px 8px', borderRadius: 10, marginBottom: isActive ? 0 : 4,
                  }}>
                    {meta.label}
                  </div>
                  {!isActive && f.wouldReturn && (
                    <div style={{ fontSize: '0.7rem', color: '#777', marginTop: 4 }}>
                      Would return: <strong>{f.wouldReturn}</strong>
                    </div>
                  )}
                  {!isActive && f.primaryReason && (
                    <div style={{ fontSize: '0.68rem', color: '#999', marginTop: 2 }}>
                      Reason: {f.primaryReason}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 40, left: 12, zIndex: 999,
        background: 'rgba(255,255,255,0.96)', borderRadius: 10,
        padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        minWidth: 152, border: '1px solid #e2e8f0',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {legendTitle}
        </div>
        {legendItems.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: '0.78rem', color: '#374151' }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
            {item.label}
          </div>
        ))}
        <div style={{ marginTop: 8, fontSize: '0.65rem', color: '#9CA3AF', lineHeight: 1.4 }}>
          Click district to zoom · Hover for name
        </div>
      </div>

      <style>{`
        .district-tooltip { background: rgba(27,94,32,0.95) !important; border: none !important; color: white !important; font-size: 0.8rem !important; font-weight: 600 !important; border-radius: 6px !important; padding: 5px 10px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
        .district-tooltip::before { display: none !important; }
        .leaflet-popup-content-wrapper { padding: 0 !important; border-radius: 12px !important; overflow: hidden; }
        .leaflet-popup-content { margin: 0 !important; }
      `}</style>
    </div>
  );
}
