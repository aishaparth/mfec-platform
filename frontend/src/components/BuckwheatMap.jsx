import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Polyline, Popup, Tooltip, LayersControl, ZoomControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  useGeoJSON, TILES,
  styleElevation, styleSlope, styleAspect, styleLULC, terrainPopup, lulcPopup,
  styleState, styleVillage, styleRoad, styleBlock, onEachVillage, onEachRoad, onEachBlock,
  styleCropPresencePoint, cropPresencePopup,
  OverlayLegendTracker, LegendBox, BUCKWHEAT_CROP_LEGEND, WINE_CROP_LEGEND,
} from './mapOverlays';

const CENTER = [25.47, 91.37];
const ZOOM = 8;

/**
 * BuckwheatMap – specialised map for the suitability page.
 * Supports: choropleth by scenario, farmer points (color-coded), BRIC hub-and-spoke overlay,
 * plus the shared terrain/LULC/roads/blocks/villages/crop-presence overlay layers.
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
  cropPresence = null,
}) {
  const districts = useGeoJSON('/geojson/districts.json');
  const state     = useGeoJSON('/geojson/state.json');
  const villages  = useGeoJSON('/geojson/villages.json');
  const roads     = useGeoJSON('/geojson/roads.json');
  const blocks    = useGeoJSON('/geojson/blocks.json');
  const cropGeo   = useGeoJSON(cropPresence ? `/geojson/${cropPresence}_crop_presence.json` : null);
  const [activeOverlays, setActiveOverlays] = useState(new Set());

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

  const onEachTerrain = (popupFn2) => (feature, layer) => {
    layer.bindPopup(popupFn2(feature), { maxWidth: 280, className: 'mfec-popup' });
    layer.bindTooltip(feature.properties?.district || feature.properties?.name, { sticky: true, className: 'district-tooltip' });
  };

  const cropPointToLayer = (feature, latlng) => L.circleMarker(latlng, styleCropPresencePoint(feature));
  const onEachCropPoint = (feature, layer) => {
    layer.bindPopup(cropPresencePopup(feature), { maxWidth: 260, className: 'mfec-popup' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={CENTER} zoom={ZOOM}
        style={{ height, width: '100%', borderRadius: 12 }}
        zoomControl={false} scrollWheelZoom
      >
        <OverlayLegendTracker onChange={setActiveOverlays} />
        <LayersControl position="topright" collapsed={false}>
          {Object.entries(TILES).map(([key, t]) => (
            <LayersControl.BaseLayer key={key} checked={key === 'topo'} name={t.label}>
              <TileLayer url={t.url} attribution={t.attribution} maxZoom={18} />
            </LayersControl.BaseLayer>
          ))}

          {blocks && (
            <LayersControl.Overlay name="🗺 Blocks">
              <GeoJSON key="blocks" data={blocks} style={styleBlock} onEachFeature={onEachBlock} />
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
              <GeoJSON key={`dem-${distKey}`} data={districts} style={styleElevation} onEachFeature={onEachTerrain(terrainPopup)} />
            </LayersControl.Overlay>
          )}
          {districts && (
            <LayersControl.Overlay name="📐 Slope">
              <GeoJSON key={`slope-${distKey}`} data={districts} style={styleSlope} onEachFeature={onEachTerrain(terrainPopup)} />
            </LayersControl.Overlay>
          )}
          {districts && (
            <LayersControl.Overlay name="🧭 Aspect">
              <GeoJSON key={`aspect-${distKey}`} data={districts} style={styleAspect} onEachFeature={onEachTerrain(terrainPopup)} />
            </LayersControl.Overlay>
          )}
          {districts && (
            <LayersControl.Overlay name="🌿 Land Use / Land Cover">
              <GeoJSON key={`lulc-${distKey}`} data={districts} style={styleLULC} onEachFeature={onEachTerrain(lulcPopup)} />
            </LayersControl.Overlay>
          )}
          {cropGeo && (
            <LayersControl.Overlay name={cropPresence === 'wine' ? '🍇 Wine Crop Presence' : '🌾 Buckwheat Crop Presence'} checked>
              <GeoJSON key={`crop-${cropPresence}`} data={cropGeo} pointToLayer={cropPointToLayer} onEachFeature={onEachCropPoint} />
            </LayersControl.Overlay>
          )}
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
                  color: hub.type === 'primary' ? '#5F7D68' : '#8CA893',
                  weight: 2, dashArray: '7,5', opacity: 0.85,
                }}
              />
            ))}
            {hub.spokes.map(sp => (
              <CircleMarker
                key={`col-${sp.name}`}
                center={[sp.lat, sp.lon]}
                radius={5}
                pathOptions={{ color: '#fff', weight: 1.5, fillColor: hub.type === 'primary' ? '#8CA893' : '#B7C9BB', fillOpacity: 0.92 }}
              >
                <Tooltip sticky>{sp.name} (Collection Point)</Tooltip>
              </CircleMarker>
            ))}
            <CircleMarker
              center={[hub.lat, hub.lon]}
              radius={hub.type === 'primary' ? 13 : 10}
              pathOptions={{ color: '#fff', weight: 2.5, fillColor: hub.type === 'primary' ? '#5F7D68' : '#4B6352', fillOpacity: 1 }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', padding: '6px 4px', minWidth: 170 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5F7D68', marginBottom: 4 }}>{hub.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: 3 }}>{hub.district}</div>
                  <div style={{ display: 'inline-block', fontSize: '0.7rem', background: hub.type === 'primary' ? '#5F7D68' : '#8CA893', color: '#fff', padding: '2px 8px', borderRadius: 10, marginBottom: 6 }}>
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
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5F7D68', marginBottom: 3 }}>
                    {f.name || 'Farmer'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: 4 }}>
                    {[f.village, f.block, f.district].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{
                    display: 'inline-block', fontSize: '0.7rem',
                    background: isActive ? '#E6ECE4' : '#FFF3E0',
                    color: isActive ? '#5F7D68' : '#E65100',
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

      <LegendBox
        title={legendTitle}
        items={legendItems}
        activeOverlayNames={activeOverlays}
        extraLegends={[cropGeo ? { title: cropPresence === 'wine' ? 'Wine Crop Presence' : 'Buckwheat Crop Presence', items: cropPresence === 'wine' ? WINE_CROP_LEGEND : BUCKWHEAT_CROP_LEGEND } : null]}
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
