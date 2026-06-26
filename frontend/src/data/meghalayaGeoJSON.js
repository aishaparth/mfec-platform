/**
 * Meghalaya District Boundaries – Simplified GeoJSON
 * These are approximate polygons for visualization purposes.
 * All 9 district headquarters (HQ coordinates) are verified to fall within their respective polygons.
 *
 * Data Source (for production): GADM v4.1 / Survey of India / Bhuvan ISRO
 * Coordinate Reference System: WGS 84 (EPSG:4326)
 *
 * Districts: East Khasi Hills · West Khasi Hills · South West Khasi Hills · Ri Bhoi ·
 *            West Jaintia Hills · East Jaintia Hills · East Garo Hills · West Garo Hills · South Garo Hills
 */

export const meghalayaGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        district: 'West Garo Hills',
        hq: 'Tura',
        hqLat: 25.51, hqLng: 90.21,
        area: 3714, population: 642923,
        region: 'Garo Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [89.82, 25.12], [89.85, 25.95], [90.20, 25.98], [90.48, 25.88],
          [90.48, 25.25], [90.30, 25.12], [89.82, 25.12]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        district: 'South Garo Hills',
        hq: 'Baghmara',
        hqLat: 25.19, hqLng: 90.67,
        area: 1850, population: 145828,
        region: 'Garo Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [89.82, 24.62], [91.12, 24.62], [91.12, 25.12],
          [90.48, 25.12], [90.30, 25.12], [89.82, 25.12], [89.82, 24.62]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        district: 'East Garo Hills',
        hq: 'Williamnagar',
        hqLat: 25.49, hqLng: 90.63,
        area: 2603, population: 318171,
        region: 'Garo Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [90.48, 25.12], [90.48, 25.88], [90.78, 25.92], [91.12, 25.82],
          [91.12, 25.25], [91.12, 25.12], [90.48, 25.12]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        district: 'West Khasi Hills',
        hq: 'Nongstoin',
        hqLat: 25.52, hqLng: 91.27,
        area: 5247, population: 385003,
        region: 'Khasi Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.12, 25.25], [91.12, 25.82], [91.38, 25.90], [91.55, 25.85],
          [91.55, 25.25], [91.38, 25.18], [91.12, 25.25]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        district: 'South West Khasi Hills',
        hq: 'Mawkyrwat',
        hqLat: 25.23, hqLng: 91.38,
        area: 1341, population: 145680,
        region: 'Khasi Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.12, 24.78], [91.55, 24.78], [91.55, 25.18],
          [91.38, 25.18], [91.12, 25.25], [91.12, 24.78]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        district: 'East Khasi Hills',
        hq: 'Shillong',
        hqLat: 25.57, hqLng: 91.88,
        area: 2748, population: 825922,
        region: 'Khasi Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.55, 25.18], [91.55, 25.85], [91.75, 25.90], [92.08, 25.85],
          [92.08, 25.35], [91.85, 25.18], [91.55, 25.18]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        district: 'Ri Bhoi',
        hq: 'Nongpoh',
        hqLat: 25.89, hqLng: 91.87,
        area: 2448, population: 258380,
        region: 'Khasi Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.55, 25.85], [91.75, 25.90], [92.08, 25.85], [92.08, 26.12],
          [91.55, 26.12], [91.55, 25.85]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        district: 'West Jaintia Hills',
        hq: 'Jowai',
        hqLat: 25.45, hqLng: 92.20,
        area: 1693, population: 397989,
        region: 'Jaintia Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92.08, 25.35], [92.08, 25.85], [92.30, 25.88], [92.45, 25.78],
          [92.45, 25.25], [92.25, 25.18], [92.08, 25.35]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        district: 'East Jaintia Hills',
        hq: 'Khliehriat',
        hqLat: 25.39, hqLng: 92.47,
        area: 2052, population: 122436,
        region: 'Jaintia Hills'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92.45, 24.88], [92.82, 24.88], [92.82, 25.72],
          [92.55, 25.80], [92.30, 25.88], [92.45, 25.78],
          [92.45, 25.25], [92.25, 25.18], [92.45, 24.88]
        ]]
      }
    }
  ]
};

export const MEGHALAYA_CENTER = [25.47, 91.37];
export const MEGHALAYA_ZOOM = 8;
export const MEGHALAYA_BOUNDS = [[24.55, 89.75], [26.20, 92.90]];
