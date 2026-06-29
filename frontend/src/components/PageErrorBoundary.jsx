import React from 'react';
import { Link } from 'react-router-dom';

export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🌿</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: '#1B5E20', fontSize: '1.5rem', marginBottom: 10 }}>
            Data Loading in Progress
          </h2>
          <p style={{ color: 'var(--text-mid)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 32 }}>
            This section is currently being updated with the latest satellite and field data.
            Please try again after some time.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{
              padding: '10px 22px', borderRadius: 8, background: '#1B5E20', color: '#fff',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
            }}>Go to Home</Link>
            <Link to="/dashboard" style={{
              padding: '10px 22px', borderRadius: 8, border: '2px solid #1B5E20', color: '#1B5E20',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
            }}>Dashboard</Link>
            <Link to="/buckwheat-suitability" style={{
              padding: '10px 22px', borderRadius: 8, border: '2px solid var(--border)', color: 'var(--text-mid)',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
            }}>Buckwheat</Link>
          </div>
        </div>
      </div>
    );
  }
}
