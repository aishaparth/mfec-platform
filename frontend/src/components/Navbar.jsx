import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CROP_LINKS = [
  { label: 'Buckwheat', path: '/buckwheat-suitability' },
  { label: 'Wine Fruits', path: '/wine-fruits' },
];

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Crop Health', path: '/crop-health' },
  { label: 'Climate Risk', path: '/climate-risk' },
  { label: 'Water', path: '/water-management' },
  { label: 'Priority Zones', path: '/priority-zones' },
  { label: 'Live Weather', path: '/weather' },
  { label: 'Dashboard', path: '/dashboard' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cropsOpen, setCropsOpen] = useState(false);
  const cropsRef = useRef(null);

  const isCropActive = CROP_LINKS.some(l => l.path === location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setCropsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cropsRef.current && !cropsRef.current.contains(e.target)) {
        setCropsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkStyle = (active) => ({
    color: active ? '#2E7D32' : '#374151',
    fontWeight: active ? 600 : 400,
    fontSize: '0.82rem', padding: '6px 11px', borderRadius: 6,
    background: active ? '#E8F5E9' : 'transparent',
    transition: 'all 0.2s', textDecoration: 'none', cursor: 'pointer',
  });

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 'var(--nav-height)',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(10px)',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : '0 1px 0 #E4EBE4',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            🌿
          </div>
          <div>
            <div style={{ color: '#2E7D32', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>MFEC Meghalaya</div>
            <div style={{ color: '#6B7280', fontSize: '0.68rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Agricultural Analytics</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }} className="desktop-nav">
          <Link to="/" style={linkStyle(location.pathname === '/')}>Home</Link>

          {/* Crops dropdown */}
          <div ref={cropsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setCropsOpen(o => !o)}
              style={{
                ...linkStyle(isCropActive),
                border: 'none', background: isCropActive ? '#E8F5E9' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Crops
              <span style={{ fontSize: '0.6rem', opacity: 0.8, marginTop: 1 }}>{cropsOpen ? '▲' : '▼'}</span>
            </button>
            {cropsOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                background: '#fff', borderRadius: 8, minWidth: 160,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid #E4EBE4',
                overflow: 'hidden', zIndex: 10,
              }}>
                {CROP_LINKS.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      display: 'block',
                      color: location.pathname === link.path ? '#2E7D32' : '#374151',
                      fontWeight: location.pathname === link.path ? 600 : 400,
                      fontSize: '0.82rem', padding: '10px 16px',
                      background: location.pathname === link.path ? '#E8F5E9' : 'transparent',
                      textDecoration: 'none', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (location.pathname !== link.path) e.currentTarget.style.background = '#F7FAF7'; }}
                    onMouseLeave={e => { if (location.pathname !== link.path) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {NAV_LINKS.filter(l => l.path !== '/').map(link => (
            <Link key={link.path} to={link.path} style={linkStyle(location.pathname === link.path)}>
              {link.label}
            </Link>
          ))}

          {session && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 10, paddingLeft: 10, borderLeft: '1px solid #E4EBE4' }}>
              {session.role === 'admin' && (
                <Link to="/admin/dashboard" style={{ ...linkStyle(location.pathname === '/admin/dashboard'), fontWeight: 600 }}>
                  Admin Panel
                </Link>
              )}
              <span style={{ fontSize: '0.72rem', color: '#6B7280', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 20, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                {session.name} · {session.role === 'admin' ? 'Admin' : 'Governance'}
              </span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{ fontSize: '0.78rem', fontWeight: 600, color: '#C62828', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(m => !m)}
          style={{ display: 'none', background: 'none', border: 'none', color: '#2E7D32', fontSize: '1.5rem', cursor: 'pointer' }}
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
          background: '#fff', padding: '12px 24px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          borderTop: '1px solid #E4EBE4',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <Link to="/" style={{
            color: location.pathname === '/' ? '#2E7D32' : '#374151',
            fontWeight: location.pathname === '/' ? 600 : 400,
            fontSize: '0.9rem', padding: '10px 12px', borderRadius: 8,
            background: location.pathname === '/' ? '#E8F5E9' : 'transparent',
            textDecoration: 'none', display: 'block',
          }}>Home</Link>

          {/* Crops section in mobile */}
          <div style={{ padding: '6px 12px 2px', fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crops</div>
          {CROP_LINKS.map(link => (
            <Link key={link.path} to={link.path} style={{
              color: location.pathname === link.path ? '#2E7D32' : '#374151',
              fontWeight: location.pathname === link.path ? 600 : 400,
              fontSize: '0.9rem', padding: '10px 12px 10px 24px', borderRadius: 8,
              background: location.pathname === link.path ? '#E8F5E9' : 'transparent',
              textDecoration: 'none', display: 'block',
            }}>{link.label}</Link>
          ))}

          {NAV_LINKS.filter(l => l.path !== '/').map(link => (
            <Link key={link.path} to={link.path} style={{
              color: location.pathname === link.path ? '#2E7D32' : '#374151',
              fontWeight: location.pathname === link.path ? 600 : 400,
              fontSize: '0.9rem', padding: '10px 12px', borderRadius: 8,
              background: location.pathname === link.path ? '#E8F5E9' : 'transparent',
              textDecoration: 'none', display: 'block',
            }}>{link.label}</Link>
          ))}

          {session && (
            <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid #E4EBE4' }}>
              {session.role === 'admin' && (
                <Link to="/admin/dashboard" style={{ color: '#2E7D32', fontWeight: 600, fontSize: '0.9rem', padding: '10px 12px', display: 'block', textDecoration: 'none' }}>
                  Admin Panel
                </Link>
              )}
              <div style={{ fontSize: '0.78rem', color: '#6B7280', padding: '4px 12px' }}>
                {session.name} · {session.role === 'admin' ? 'Admin' : 'Governance'}
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{ fontSize: '0.9rem', fontWeight: 600, color: '#C62828', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 12px', textAlign: 'left', width: '100%' }}
              >
                Sign Out
              </button>
            </div>
          )}
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
