import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, ScaleControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:        require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:      require('leaflet/dist/images/marker-shadow.png'),
});

const CENTER   = [25.47, 91.37];
const ZOOM     = 8;

const TILES = {
  topo:      { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                                           attribution: '© OpenTopoMap (CC-BY-SA)',       label: 'Topographic' },
  streets:   { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                         attribution: '© OpenStreetMap contributors',   label: 'Street Map'  },
  carto:     { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',                                             attribution: '© CartoDB',                      label: 'CartoDB Light' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',              attribution: '© Esri World Imagery',           label: 'Satellite'   },
};

// Cache GeoJSON so repeated renders don't re-fetch
const geoCache = {};

function useGeoJSON(url) {
  const [data, setData] = useState(geoCache[url] || null);
  useEffect(() => {
    if (geoCache[url]) { setData(geoCache[url]); return; }
    fetch(url).then(r => r.json()).then(json => { geoCache[url] = json; setData(json); }).catch(console.error);
  }, [url]);
  return data;
}

/**
 * MeghalayaMap – reusable choropleth map using real shapefiles.
 * Props:
 *   colorFn(feature) → string      fill color for each district
 *   popupFn(feature) → HTML string popup content
 *   blockColorFn(feature) → string optional block-level coloring
 *   blockPopupFn(feature) → string optional block popup
 *   showBlocks    – show Blocks_46 overlay (default false)
 *   showState     – show State_Boundary outline (default true)
 *   height        – CSS height (default '520px')
 *   showLayerControl – tile switcher (default true)
 *   defaultTile   – 'topo'|'streets'|'carto'|'satellite'
 *   legendItems   – [{ color, label }]
 *   legendTitle
 */
export default function MeghalayaMap({
  colorFn,
  popupFn,
  blockColorFn,
  blockPopupFn,
  showBlocks = false,
  showState  = true,
  height = '520px',
  showLayerControl = true,
  defaultTile = 'topo',
  legendItems = [],
  legendTitle = 'Legend',
  onDistrictClick,
}) {
  const districts = useGeoJSON('/geojson/districts.json');
  const blocks    = useGeoJSON(showBlocks ? '/geojson/blocks.json' : null);
  const state     = useGeoJSON(showState  ? '/geojson/state.json'  : null);

  const districtKey = colorFn ? colorFn.toString().slice(0, 60) : 'default';

  const styleDistrict = (f) => ({
    fillColor: colorFn ? colorFn(f) : '#388E3C',
    weight: 1.8, opacity: 1, color: '#ffffff', fillOpacity: 0.78,
  });

  const styleBlock = (f) => ({
    fillColor: blockColorFn ? blockColorFn(f) : 'transparent',
    weight: 0.8, opacity: 1, color: '#ffffff88', fillOpacity: 0.5,
  });

  const styleState = () => ({
    fill: false, weight: 3, color: '#1B5E20', opacity: 0.9,
  });

  const onEachDistrict = (feature, layer) => {
    const p = feature.properties;
    layer.on({
      mouseover: e => { e.target.setStyle({ weight: 3, fillOpacity: 0.95 }); e.target.bringToFront(); },
      mouseout:  e => { e.target.setStyle({ weight: 1.8, fillOpacity: 0.78 }); },
      click:     e => {
        e.target._map.fitBounds(e.target.getBounds(), { padding: [40, 40] });
        if (onDistrictClick) onDistrictClick(p.district || p.name);
      },
    });
    const html = popupFn
      ? popupFn(feature)
      : `<div class="district-popup"><h3>${p.district || p.name}</h3><p class="hq">HQ: ${p.hq || ''}</p></div>`;
    layer.bindPopup(html, { maxWidth: 300, className: 'mfec-popup' });
    layer.bindTooltip(p.district || p.name, { permanent: false, sticky: true, className: 'district-tooltip' });
  };

  const onEachBlock = (feature, layer) => {
    const p = feature.properties;
    layer.on({
      mouseover: e => { e.target.setStyle({ weight: 2, fillOpacity: 0.85 }); e.target.bringToFront(); },
      mouseout:  e => { e.target.setStyle({ weight: 0.8, fillOpacity: 0.5 }); },
    });
    const html = blockPopupFn
      ? blockPopupFn(feature)
      : `<div class="district-popup"><h3>${p.block}</h3><p class="hq">${p.district} · ${p.area_sqkm?.toFixed(0)} km²</p></div>`;
    layer.bindPopup(html, { maxWidth: 280, className: 'mfec-popup' });
    layer.bindTooltip(`${p.block} (${p.district})`, { permanent: false, sticky: true, className: 'district-tooltip' });
  };

  const tile = TILES[defaultTile] || TILES.topo;

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={CENTER} zoom={ZOOM} style={{ height, width: '100%', borderRadius: '12px' }} zoomControl={false} scrollWheelZoom>
        {showLayerControl ? (
          <LayersControl position="topright">
            {Object.entries(TILES).map(([key, t]) => (
              <LayersControl.BaseLayer key={key} checked={key === defaultTile} name={t.label}>
                <TileLayer url={t.url} attribution={t.attribution} maxZoom={18} />
              </LayersControl.BaseLayer>
            ))}
          </LayersControl>
        ) : (
          <TileLayer url={tile.url} attribution={tile.attribution} maxZoom={18} />
        )}

        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />

        {/* State boundary outline */}
        {state && <GeoJSON key="state" data={state} style={styleState} />}

        {/* District choropleth */}
        {districts && (
          <GeoJSON key={`dist-${districtKey}`} data={districts} style={styleDistrict} onEachFeature={onEachDistrict} />
        )}

        {/* Block overlay */}
        {showBlocks && blocks && (
          <GeoJSON key={`blk-${districtKey}`} data={blocks} style={styleBlock} onEachFeature={onEachBlock} />
        )}

        {!districts && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 999, background: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600, color: '#1B5E20', fontSize: '0.9rem' }}>
            Loading map data…
          </div>
        )}
      </MapContainer>

      {legendItems.length > 0 && (
        <div style={{ position: 'absolute', bottom: 40, left: 12, zIndex: 999, background: 'rgba(255,255,255,0.96)', borderRadius: 10, padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 148, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{legendTitle}</div>
          {legendItems.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: '0.78rem', color: '#374151' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
              {item.label}
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: '0.65rem', color: '#9CA3AF', lineHeight: 1.4 }}>Click district to zoom · Hover for name</div>
        </div>
      )}

      <style>{`
        .district-tooltip { background: rgba(27,94,32,0.95) !important; border: none !important; color: white !important; font-size: 0.8rem !important; font-weight: 600 !important; border-radius: 6px !important; padding: 5px 10px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
        .district-tooltip::before { display: none !important; }
        .leaflet-popup-content-wrapper { padding: 0 !important; border-radius: 12px !important; overflow: hidden; }
        .leaflet-popup-content { margin: 0 !important; }
      `}</style>
    </div>
  );
}
