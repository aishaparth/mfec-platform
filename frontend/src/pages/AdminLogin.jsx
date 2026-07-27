import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { session, login } = useAuth();
  const navigate  = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (session) {
    return <Navigate to={session.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    navigate(result.role === 'admin' ? '/admin/dashboard' : '/');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #22282A 0%, #2E3830 50%, #22282A 100%)',
      padding: '24px', fontFamily: 'var(--font-body)',
    }}>
      {/* Background pattern */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.05, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2371917A' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #5F7D68, #71917A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(95,125,104,0.35)' }}>
            🌿
          </div>
          <div style={{ color: '#A8C4AC', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            MFEC / DSAI · Secure Portal
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            Platform Login
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: 8 }}>
            Meghalaya Agricultural Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: '32px', backdropFilter: 'blur(20px)' }}>

          {/* Role info chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { icon: '🔧', role: 'Admin', desc: 'Upload & manage datasets', color: '#F9A825' },
              { icon: '🏛', role: 'Governance', desc: 'View interventions & reports', color: '#93C5FD' },
            ].map(r => (
              <div key={r.role} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{r.icon}</div>
                <div style={{ color: r.color, fontSize: '0.75rem', fontWeight: 700 }}>{r.role}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="admin  or  gov.meghalaya"
                autoFocus
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.07)', border: `1.5px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
                  color: '#fff', fontSize: '0.88rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.07)', border: `1.5px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
                    color: '#fff', fontSize: '0.88rem', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, marginBottom: 16 }}>
                <span style={{ color: '#F87171', fontSize: '0.82rem' }}>⚠ {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: '100%', padding: '13px', marginTop: 16, borderRadius: 10,
                background: loading ? 'rgba(95,125,104,0.5)' : 'linear-gradient(135deg, #5F7D68, #71917A)',
                color: '#fff', fontWeight: 700, fontSize: '0.92rem', border: 'none',
                cursor: loading ? 'wait' : (!username || !password ? 'not-allowed' : 'pointer'),
                opacity: !username || !password ? 0.6 : 1,
                transition: 'all 0.2s', letterSpacing: '0.3px',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(95,125,104,0.35)',
              }}>
              {loading ? 'Authenticating…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '2px solid rgba(168,196,172,0.3)' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
              This is a restricted government platform. Unauthorised access is prohibited.<br />
              All sessions are logged. Contact MFEC / DSAI for access credentials.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', textDecoration: 'none' }}>
            ← Back to Public Platform
          </a>
        </div>
      </div>
    </div>
  );
}