import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#26302A', color: 'rgba(255,255,255,0.75)', paddingTop: 48, marginTop: 'auto' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 36, paddingBottom: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: '1.6rem' }}>🌿</span>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>MFEC Meghalaya</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Agricultural Analytics Platform</div>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' }}>
              Advanced geospatial analysis, habitat suitability modelling, and agricultural intelligence for Buckwheat and Fruit Wine initiatives across Meghalaya.
            </p>
          </div>

          {/* Analytics Pages */}
          <div>
            <h4 style={{ color: '#B7C9BB', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Analytics Modules</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Buckwheat Suitability', '/buckwheat-suitability'],
                ['Wine Fruits Suitability', '/wine-fruits'],
                ['Crop Health (NDVI/NDWI)', '/crop-health'],
                ['Climate Risk Analysis', '/climate-risk'],
                ['Water Management', '/water-management'],
                ['Priority Zones', '/priority-zones'],
              ].map(([label, path]) => (
                <li key={path}><Link to={path} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#B7C9BB'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
                >{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Project Info */}
          <div>
            <h4 style={{ color: '#B7C9BB', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Project Details</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
              <li><span style={{ color: 'rgba(255,255,255,0.4)' }}>Client: </span>MFEC, Govt. of Meghalaya</li>
              <li><span style={{ color: 'rgba(255,255,255,0.4)' }}>Period: </span>May – August 2026</li>
              <li><span style={{ color: 'rgba(255,255,255,0.4)' }}>Districts: </span>12 districts of Meghalaya</li>
              <li><span style={{ color: 'rgba(255,255,255,0.4)' }}>Model: </span>MaxEnt (AUC target &gt; 0.70)</li>
              <li><span style={{ color: 'rgba(255,255,255,0.4)' }}>Deliverables: </span>11 outputs, 5 milestones</li>
              <li><Link to="/data-sources" style={{ color: '#9BB5A1', textDecoration: 'none', fontWeight: 500 }}>View Data Sources →</Link></li>
            </ul>
          </div>

          {/* Data Sources quick */}
          <div>
            <h4 style={{ color: '#B7C9BB', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Key Data Sources</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
              {['Sentinel-2 MSI (ESA Copernicus)', 'WorldClim v2.1', 'SRTM DEM 30m (NASA/USGS)', 'IMD Weather Stations', 'GBIF Occurrence Records', 'Survey of India Boundaries', 'MaxEnt v3.4.4', 'Google Earth Engine'].map(s => (
                <li key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: '#9BB5A1', marginTop: 1 }}>·</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
            © 2026 MFEC Buckwheat & Fruit Wine Initiatives · Government of Meghalaya · All rights reserved
          </p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
            Geospatial Analysis Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
