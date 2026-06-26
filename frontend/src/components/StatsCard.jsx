import React from 'react';

export default function StatsCard({ value, label, note, icon, color = 'var(--primary)', bg = '#E8F5E9' }) {
  return (
    <div className="stat-card animate-in" style={{ borderTop: `4px solid ${color}`, background: bg }}>
      {icon && <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{icon}</div>}
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}
