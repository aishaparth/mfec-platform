import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Buckwheat', path: '/buckwheat-suitability' },
  { label: 'Wine Fruits', path: '/wine-fruits' },
  { label: 'Crop Health', path: '/crop-health' },
  { label: 'Climate Risk', path: '/climate-risk' },
  { label: 'Water', path: '/water-management' },
  { label: 'Priority Zones', path: '/priority-zones' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Data Sources', path: '/data-sources' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 'var(--nav-height)',
      background: scrolled ? 'rgba(27,94,32,0.97)' : '#1B5E20',
      backdropFilter: 'blur(10px)',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.25)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            🌿
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>MFEC Meghalaya</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Agricultural Analytics</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <Link key={link.path} to={link.path} style={{
              color: location.pathname === link.path ? '#fff' : 'rgba(255,255,255,0.75)',
              fontWeight: location.pathname === link.path ? 600 : 400,
              fontSize: '0.82rem', padding: '6px 11px', borderRadius: 6,
              background: location.pathname === link.path ? 'rgba(255,255,255,0.18)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none',
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(m => !m)}
          style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
          className="hamburger"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 'var(--nav-height)', left: 0, right: 0,
          background: '#1B5E20', padding: '12px 24px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV_LINKS.map(link => (
            <Link key={link.path} to={link.path} style={{
              color: location.pathname === link.path ? '#fff' : 'rgba(255,255,255,0.8)',
              fontWeight: location.pathname === link.path ? 600 : 400,
              fontSize: '0.9rem', padding: '10px 12px', borderRadius: 8,
              background: location.pathname === link.path ? 'rgba(255,255,255,0.15)' : 'transparent',
              textDecoration: 'none', display: 'block',
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
}
