import React, { useState } from 'react';
import { DATA_SOURCES, PROJECT_INFO } from '../data/projectData';

export default function DataSources() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div className="badge">Data Provenance · Deliverables 3 & 11</div>
          <h1>🗂 Data Sources & Methodology</h1>
          <p>Complete transparency on all geospatial datasets, satellite imagery, climate data, modelling frameworks, and administrative boundaries used in the MFEC Meghalaya Agricultural Analytics Platform.</p>
        </div>
      </div>

      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { v: '6', l: 'Data Categories', c: '#1B5E20', bg: '#E8F5E9' },
              { v: '18', l: 'Primary Data Sources', c: '#1565C0', bg: '#E3F2FD' },
              { v: '10m', l: 'Best Spatial Resolution (Sentinel-2)', c: '#004D40', bg: '#E0F2F1' },
              { v: '30m', l: 'Terrain DEM Resolution', c: '#E65100', bg: '#FBE9E7' },
              { v: '1km', l: 'Climate Layer Resolution (WorldClim)', c: '#C62828', bg: '#FFEBEE' },
              { v: 'Open', l: 'Primary License (Most Sources)', c: '#4A148C', bg: '#F3E5F5' },
            ].map(s => (
              <div key={s.l} className="stat-card" style={{ borderTop: `4px solid ${s.c}`, background: s.bg }}>
                <div className="stat-value" style={{ color: s.c, fontSize: '1.8rem' }}>{s.v}</div>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Data Sources by Category</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 32px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {DATA_SOURCES.map((cat) => (
              <div key={cat.category} className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontSize: '1.15rem' }}>{cat.category}</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {cat.sources.map(src => (
                    <div key={src.name} style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '14px 18px', borderLeft: '3px solid var(--accent-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div>
                          <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem', marginBottom: 4 }}>{src.name}</h4>
                          <span style={{ fontSize: '0.72rem', background: '#E8F5E9', color: 'var(--primary)', padding: '2px 10px', borderRadius: 50, fontWeight: 700, border: '1px solid #A5D6A7' }}>Used for: {src.usedFor}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', background: src.access.includes('Open') ? '#E8F5E9' : '#FFF8E1', color: src.access.includes('Open') ? 'var(--primary)' : '#E65100', padding: '3px 12px', borderRadius: 50, fontWeight: 700, border: '1px solid', borderColor: src.access.includes('Open') ? '#A5D6A7' : '#FFD54F', flexShrink: 0 }}>
                          {src.access}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 6 }}>{src.description}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}><strong>Provider:</strong> {src.provider}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <h2 className="section-title">Analytical Methodology</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 32px' }} />
          <div className="grid-2">
            {[
              { title: 'MaxEnt Habitat Suitability Modelling', icon: '🤖', steps: ['Occurrence data: GBIF records + MFEC GPS field survey points', 'Environmental predictors: 19 WorldClim bioclim variables + SRTM terrain', 'Regularization multiplier: optimized via k-fold cross-validation', 'Background points: 10,000 random within Meghalaya extent', 'Evaluation: AUC (Area Under ROC Curve) – Target AUC > 0.70', 'Output classification: High (≥0.65), Medium (0.40–0.65), Low (<0.40)', 'Validation: Field survey ground-truth comparison per district block'], c: '#1B5E20' },
              { title: 'Sentinel-2 Vegetation Index Analysis', icon: '🛰', steps: ['Imagery: Sentinel-2 MSI Level-2A (surface reflectance, cloud <5%)', 'Platform: Google Earth Engine JavaScript API', 'NDVI = (NIR – Red) / (NIR + Red) using Bands B8 & B4', 'NDWI = (Green – NIR) / (Green + NIR) using Bands B3 & B8', 'Temporal window: Rabi 2025 (October–November 2025 composites)', 'Spatial resolution: 10m native, resampled to 30m for district summaries', 'Validation: MFEC field observations and crop calendar data'], c: '#004D40' },
              { title: 'Climate Risk Assessment', icon: '🌡', steps: ['Temperature: WorldClim v2.1 monthly min/max at 1km resolution', 'Rainfall: IMD gridded 0.25° × 0.25° interpolated (1991–2020 normals)', 'Frost risk: Days below 0°C from monthly minimum temperature rasters', 'Bioclimatic variables: Bio1–Bio19 WorldClim predictors for MaxEnt', 'Temperature suitability: Crop-specific optimal ranges from scientific literature', 'Chilling hours: Hours 0–7°C (dormancy requirement for plum/peach)'], c: '#C62828' },
              { title: 'Water Management Analysis', icon: '💧', steps: ['CWR method: Penman-Monteith FAO-56 (Allen et al., 1998)', 'Buckwheat CWR: 350mm per 90-day growing season', 'Plum/Peach CWR: 680–720mm per year for full orchard establishment', 'Rainfall adequacy ratio: Annual rainfall ÷ seasonal CWR', 'Groundwater depth: CGWB district-level depth-to-water table data', 'Stream density: Survey of India 1:50,000 hydrological maps', 'Seasonal classification: 4-season water availability per district'], c: '#1565C0' },
            ].map(m => (
              <div key={m.title} className="card" style={{ borderTop: `4px solid ${m.c}` }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{m.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: m.c, marginBottom: 14, fontSize: '1rem' }}>{m.title}</h3>
                <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {m.steps.map(s => (<li key={s} style={{ fontSize: '0.83rem', color: 'var(--text-mid)', lineHeight: 1.65 }}>{s}</li>))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Output Formats (Deliverable 10)</h2>
          <div className="divider" style={{ width: 56, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2, margin: '10px 0 24px' }} />
          <div className="grid-3">
            {[
              { format: 'GeoTIFF Rasters', ext: '.tif', desc: 'Suitability maps, NDVI, NDWI, climate layers at 30m spatial resolution', c: '#1B5E20', icon: '🗺' },
              { format: 'Vector Shapefiles', ext: '.shp', desc: 'District & block boundaries, cultivation sites, priority zones, expansion areas', c: '#1565C0', icon: '📐' },
              { format: 'High-Res PDF Maps', ext: '.pdf', desc: 'Cartographic exports at A3/A2, 300 DPI with legend and scale bar', c: '#C62828', icon: '🗒' },
              { format: 'Excel Summary Tables', ext: '.xlsx', desc: 'District suitability statistics, block rankings, area under suitability class', c: '#E65100', icon: '📊' },
              { format: 'Analytical Reports', ext: '.pdf', desc: 'Methodology documentation, model validation, ground truth findings, CWR analysis', c: '#4A148C', icon: '📝' },
              { format: 'Web GIS Dashboard', ext: 'HTML/JS', desc: 'Interactive browser-based viewer with layer switching, filtering, and download', c: '#004D40', icon: '🌐' },
            ].map(f => (
              <div key={f.format} className="card card-sm" style={{ borderLeft: `4px solid ${f.c}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{f.format}</div>
                    <code style={{ fontSize: '0.72rem', background: '#F0F7F0', color: f.c, padding: '1px 6px', borderRadius: 4 }}>{f.ext}</code>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div className="card" style={{ borderLeft: '5px solid var(--gold)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 14 }}>📋 Key References & Citations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Phillips, S.J., Anderson, R.P. & Schapire, R.E. (2006). Maximum entropy modeling of species geographic distributions. Ecological Modelling, 190, 231–259.',
                'Fick, S.E. & Hijmans, R.J. (2017). WorldClim 2: New 1km spatial resolution climate surfaces for global land areas. International Journal of Climatology, 37(12), 4302–4315.',
                'Allen, R.G. et al. (1998). Crop evapotranspiration – FAO Irrigation and Drainage Paper No. 56. FAO, Rome.',
                'European Space Agency (2022). Sentinel-2 Level-2A Products – Copernicus Programme. ESA, Paris.',
                'USGS/NASA (2000). SRTM 30m Digital Elevation Model. United States Geological Survey Earth Resources Observation and Science (EROS) Center.',
                'GBIF Secretariat (2023). GBIF Backbone Taxonomy. Checklist dataset via GBIF.org. CC BY 4.0.',
              ].map(r => (
                <div key={r} style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.7, padding: '8px 12px', background: 'var(--bg-page)', borderRadius: 6, borderLeft: '3px solid var(--accent-light)' }}>{r}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
