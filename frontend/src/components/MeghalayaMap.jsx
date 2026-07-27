import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, LayerGroup, CircleMarker, Popup, ScaleControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  useGeoJSON, TILES,
  styleElevation, styleSlope, styleAspect, styleLULC, terrainPopup, lulcPopup,
  styleState, styleVillage, styleRoad, onEachVillage, onEachRoad,
  styleCropPresencePoint, cropPresencePopup,
  styleGroundwaterPoint, groundwaterPopup, GROUNDWATER_LEGEND,
  OverlayLegendTracker, LegendBox, BUCKWHEAT_CROP_LEGEND, WINE_CROP_LEGEND,
} from './mapOverlays';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:        require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:      require('leaflet/dist/images/marker-shadow.png'),
});

const CENTER   = [25.47, 91.37];
const ZOOM     = 8;

/**
 * MeghalayaMap – reusable choropleth map using real shapefiles.
 * Props:
 *   colorFn(feature) → string      fill color for each district
 *   popupFn(feature) → HTML string popup content
 *   blockColorFn(feature) → string optional block-level coloring (used together with showBlocks fill)
 *   blockPopupFn(feature) → string optional block popup
 *   showState     – show State_Boundary outline (default true)
 *   height        – CSS height (default '520px')
 *   showLayerControl – tile switcher + overlay layers (default true)
 *   defaultTile   – 'topo'|'streets'|'carto'|'satellite'
 *   legendItems   – [{ color, label }]  (legend for the primary colorFn layer)
 *   legendTitle
 *   cropPresence  – 'buckwheat' | 'wine' | null — offers a selectable crop-presence points overlay
 */
export default function MeghalayaMap({
  colorFn,
  popupFn,
  blockColorFn,
  blockPopupFn,
  showState     = true,
  height = '520px',
  showLayerControl = true,
  defaultTile = 'topo',
  legendItems = [],
  legendTitle = 'Legend',
  onDistrictClick,
  cropPresence = null,
  groundwaterStations = null,
}) {
  const districts = useGeoJSON('/geojson/districts.json');
  const blocks    = useGeoJSON('/geojson/blocks.json');
  const state     = useGeoJSON(showState ? '/geojson/state.json' : null);
  const villages  = useGeoJSON('/geojson/villages.json');
  const roads     = useGeoJSON('/geojson/roads.json');
  const cropGeo   = useGeoJSON(cropPresence ? `/geojson/${cropPresence}_crop_presence.json` : null);
  const [activeOverlays, setActiveOverlays] = useState(new Set());

  const districtKey = colorFn ? colorFn.toString().slice(0, 60) : 'default';

  const styleDistrict = (f) => ({
    fillColor: colorFn ? colorFn(f) : '#388E3C',
    weight: 1.8, opacity: 1, color: '#ffffff', fillOpacity: 0.78,
  });

  const styleBlockFill = (f) => ({
    fillColor: blockColorFn ? blockColorFn(f) : 'transparent',
    weight: 0.8, opacity: 1, color: '#ffffff88', fillOpacity: blockColorFn ? 0.5 : 0,
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

  const onEachBlockFill = (feature, layer) => {
    const p = feature.properties;
    layer.on({
      mouseover: e => { e.target.setStyle({ weight: 2, fillOpacity: blockColorFn ? 0.85 : 0.15 }); e.target.bringToFront(); },
      mouseout:  e => { e.target.setStyle({ weight: 0.8, fillOpacity: blockColorFn ? 0.5 : 0 }); },
    });
    const html = blockPopupFn
      ? blockPopupFn(feature)
      : `<div class="district-popup"><h3>${p.block}</h3><p class="hq">${p.district} · ${p.area_sqkm?.toFixed(0)} km²</p></div>`;
    layer.bindPopup(html, { maxWidth: 280, className: 'mfec-popup' });
    layer.bindTooltip(`${p.block} (${p.district})`, { permanent: false, sticky: true, className: 'district-tooltip' });
  };

  const onEachTerrain = (label, popupFn2) => (feature, layer) => {
    layer.bindPopup(popupFn2(feature), { maxWidth: 280, className: 'mfec-popup' });
    layer.bindTooltip(feature.properties?.district || feature.properties?.name, { sticky: true, className: 'district-tooltip' });
  };

  const cropPointToLayer = (feature, latlng) => L.circleMarker(latlng, styleCropPresencePoint(feature));
  const onEachCropPoint = (feature, layer) => {
    layer.bindPopup(cropPresencePopup(feature), { maxWidth: 260, className: 'mfec-popup' });
  };

  const tile = TILES[defaultTile] || TILES.topo;

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={CENTER} zoom={ZOOM} style={{ height, width: '100%', borderRadius: '12px' }} zoomControl={false} scrollWheelZoom>
        <OverlayLegendTracker onChange={setActiveOverlays} />
        {showLayerControl ? (
          <LayersControl position="topright" collapsed={false}>
            {Object.entries(TILES).map(([key, t]) => (
              <LayersControl.BaseLayer key={key} checked={key === defaultTile} name={t.label}>
                <TileLayer url={t.url} attribution={t.attribution} maxZoom={18} />
              </LayersControl.BaseLayer>
            ))}

            {blocks && (
              <LayersControl.Overlay name="🗺 Blocks">
                <GeoJSON key={`blk-outline-${districtKey}`} data={blocks} style={styleBlockFill} onEachFeature={onEachBlockFill} />
              </LayersControl.Overlay>
            )}
            {villages && (
              <LayersControl.Overlay name="🏘 Villages">
                <GeoJSON key="villages" data={villages} style={styleVillage} onEachFeature={onEachVillage} />
              </LayersControl.Overlay>
            )}
            {roads && (
              <LayersControl.Overlay name="🛣 Roads">
                <GeoJSON key="roads" data={roads} style={styleRoad} onEachFeature={onEachRoad} />
              </LayersControl.Overlay>
            )}
            {districts && (
              <LayersControl.Overlay name="⛰ Elevation (DEM)">
                <GeoJSON key={`dem-${districtKey}`} data={districts} style={styleElevation} onEachFeature={onEachTerrain('dem', terrainPopup)} />
              </LayersControl.Overlay>
            )}
            {districts && (
              <LayersControl.Overlay name="📐 Slope">
                <GeoJSON key={`slope-${districtKey}`} data={districts} style={styleSlope} onEachFeature={onEachTerrain('slope', terrainPopup)} />
              </LayersControl.Overlay>
            )}
            {districts && (
              <LayersControl.Overlay name="🧭 Aspect">
                <GeoJSON key={`aspect-${districtKey}`} data={districts} style={styleAspect} onEachFeature={onEachTerrain('aspect', terrainPopup)} />
              </LayersControl.Overlay>
            )}
            {districts && (
              <LayersControl.Overlay name="🌿 Land Use / Land Cover">
                <GeoJSON key={`lulc-${districtKey}`} data={districts} style={styleLULC} onEachFeature={onEachTerrain('lulc', lulcPopup)} />
              </LayersControl.Overlay>
            )}
            {cropGeo && (
              <LayersControl.Overlay name={cropPresence === 'wine' ? '🍇 Wine Crop Presence' : '🌾 Buckwheat Crop Presence'} checked>
                <GeoJSON key={`crop-${cropPresence}`} data={cropGeo} pointToLayer={cropPointToLayer} onEachFeature={onEachCropPoint} />
              </LayersControl.Overlay>
            )}
            {groundwaterStations && groundwaterStations.length > 0 && (
              <LayersControl.Overlay name="💧 Groundwater Stations" checked>
                <LayerGroup>
                  {groundwaterStations.map(st => (
                    <CircleMarker key={st.id} center={[st.lat, st.lon]} pathOptions={styleGroundwaterPoint({ properties: st })}>
                      <Popup>
                        <div dangerouslySetInnerHTML={{ __html: groundwaterPopup({ properties: st }) }} />
                      </Popup>
                    </CircleMarker>
                  ))}
                </LayerGroup>
              </LayersControl.Overlay>
            )}
          </LayersControl>
        ) : (
          <TileLayer url={tile.url} attribution={tile.attribution} maxZoom={18} />
        )}

        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />

        {/* State boundary outline */}
        {state && <GeoJSON key="state" data={state} style={styleState} />}

        {/* District choropleth (primary data layer) */}
        {districts && (
          <GeoJSON key={`dist-${districtKey}`} data={districts} style={styleDistrict} onEachFeature={onEachDistrict} />
        )}

        {!districts && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 999, background: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600, color: '#71917A', fontSize: '0.9rem' }}>
            Loading map data…
          </div>
        )}
      </MapContainer>

      <LegendBox
        title={legendTitle}
        items={legendItems}
        activeOverlayNames={activeOverlays}
        extraLegends={[
          cropGeo ? { title: cropPresence === 'wine' ? 'Wine Crop Presence' : 'Buckwheat Crop Presence', items: cropPresence === 'wine' ? WINE_CROP_LEGEND : BUCKWHEAT_CROP_LEGEND } : null,
          groundwaterStations && groundwaterStations.length > 0 ? { title: 'Groundwater Stations', items: GROUNDWATER_LEGEND } : null,
        ]}
        hint="Click district to zoom · Layers icon (top right) for terrain, LULC, roads, blocks & villages"
      />

      <style>{`
        .district-tooltip { background: rgba(95,125,104,0.95) !important; border: none !important; color: white !important; font-size: 0.8rem !important; font-weight: 600 !important; border-radius: 6px !important; padding: 5px 10px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
        .district-tooltip::before { display: none !important; }
        .leaflet-popup-content-wrapper { padding: 0 !important; border-radius: 12px !important; overflow: hidden; }
        .leaflet-popup-content { margin: 0 !important; }
      `}</style>
    </div>
  );
}
