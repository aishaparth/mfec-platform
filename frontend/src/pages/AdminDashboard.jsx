import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData, parseCSV, toCSV } from '../context/DataContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTS(iso) {
  if (!iso) return 'Default data';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `Updated ${dd} ${mo} ${d.getFullYear()}, ${hh}:${mm}`;
}

function triggerDownload(filename, content, type) {
  const blob = new Blob([content], { type: type || 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Shared button / card styles ─────────────────────────────────────────────

const BTN = {
  greenOutline: {
    padding: '6px 14px', borderRadius: 7, border: '1.5px solid #5F7D68',
    color: '#5F7D68', background: 'white', cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: 'inherit',
  },
  blueOutline: {
    padding: '6px 14px', borderRadius: 7, border: '1.5px solid #1565C0',
    color: '#1565C0', background: 'white', cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: 'inherit',
  },
  redOutline: {
    padding: '6px 14px', borderRadius: 7, border: '1.5px solid #C62828',
    color: '#C62828', background: 'white', cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: 'inherit',
  },
  greenFill: {
    padding: '6px 14px', borderRadius: 7, border: 'none',
    color: 'white', background: '#5F7D68', cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: 'inherit',
  },
};

const CARD = {
  background: 'white',
  border: '1px solid #E4EBE4',
  borderRadius: 14,
  boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  padding: '20px',
  marginBottom: 20,
};

const TH_STYLE = {
  padding: '7px 10px',
  background: '#F0F2EF',
  color: '#4B6352',
  fontSize: '0.68rem',
  textTransform: 'uppercase',
  fontWeight: 700,
  textAlign: 'left',
  borderBottom: '2px solid #E4EBE4',
  whiteSpace: 'nowrap',
};

// ─── KpiStrip ────────────────────────────────────────────────────────────────

function KpiStrip({ items, color }) {
  const bg   = color === 'purple' ? '#F5F3FF' : '#F0F2EF';
  const bord = color === 'purple' ? '#DDD6FE' : '#C7D6CB';
  const txt  = color === 'purple' ? '#4A148C' : '#4B6352';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 10, marginBottom: 14 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: bg, border: `1px solid ${bord}`, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: txt }}>{item.value}</div>
          <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 2 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── InlineBarChart ───────────────────────────────────────────────────────────

function InlineBarChart({ data, valueKey, labelKey, color }) {
  const barColor = color || '#5F7D68';
  const top5 = [...data].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0)).slice(0, 5);
  const max = Math.max(...top5.map(d => d[valueKey] || 0), 1);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Top 5 by {labelKey}
      </div>
      {top5.map((row, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <div style={{ fontSize: '0.72rem', color: '#374151', width: 190, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row[labelKey]}>
            {row[labelKey]}
          </div>
          <div style={{ flex: 1, background: '#F0F4F0', borderRadius: 4, height: 16, overflow: 'hidden' }}>
            <div style={{ width: `${((row[valueKey] || 0) / max) * 100}%`, background: barColor, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#374151', width: 36, textAlign: 'right', fontWeight: 600 }}>{row[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

// ─── DatasetPanel ─────────────────────────────────────────────────────────────

function DatasetPanel({ title, subtitle, data, columns, onSave, onReset, storageKey, lastUpdated, extraContent, getCellStyle }) {
  const [page, setPage]               = useState(0);
  const [editIdx, setEditIdx]         = useState(null);
  const [editRow, setEditRow]         = useState(null);
  const [uploadPreview, setUploadPrev] = useState(null);
  const fileRef = useRef();
  const PAGE_SIZE = 20;

  const safeData = Array.isArray(data) ? data : [];
  const pageData  = safeData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(safeData.length / PAGE_SIZE);

  function startEdit(ri) {
    const actualIdx = page * PAGE_SIZE + ri;
    setEditIdx(actualIdx);
    setEditRow({ ...safeData[actualIdx] });
  }

  function commitEdit() {
    const newData = safeData.map((r, i) => (i === editIdx ? editRow : r));
    onSave(newData);
    setEditIdx(null);
    setEditRow(null);
  }

  function cancelEdit() {
    setEditIdx(null);
    setEditRow(null);
  }

  function handleDownload() {
    triggerDownload(`${storageKey}_${new Date().toISOString().slice(0, 10)}.csv`, toCSV(safeData));
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed = parseCSV(ev.target.result);
      setUploadPrev({ count: parsed.length, parsed });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function confirmUpload() {
    if (uploadPreview) { onSave(uploadPreview.parsed); setUploadPrev(null); }
  }

  function renderCell(row, col, ri) {
    const val = row[col.key];
    const display = col.type === 'list'
      ? (Array.isArray(val) ? val.join(', ') : (val ?? '—'))
      : val === true ? 'Yes' : val === false ? 'No' : (val ?? '—');
    const extra = getCellStyle ? getCellStyle(col.key, val) : {};
    return (
      <td key={col.key} style={{ padding: '6px 10px', borderBottom: '1px solid #F0F4F0', fontSize: '0.77rem', color: '#374151', ...extra }}>
        {String(display)}
      </td>
    );
  }

  function renderEditCell(col) {
    const val = editRow[col.key];
    if (col.readonly) {
      return (
        <td key={col.key} style={{ padding: '6px 10px', borderBottom: '1px solid #F0F4F0', fontSize: '0.77rem', color: '#6B7280' }}>
          {String(val ?? '—')}
        </td>
      );
    }
    if (col.type === 'select') {
      return (
        <td key={col.key} style={{ padding: '4px 6px', borderBottom: '1px solid #F0F4F0' }}>
          <select
            value={String(val ?? '')}
            onChange={e => {
              let v = e.target.value;
              if (v === 'true') v = true;
              else if (v === 'false') v = false;
              else if (v !== '' && !isNaN(Number(v))) v = Number(v);
              setEditRow({ ...editRow, [col.key]: v });
            }}
            style={{ fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 4px', fontFamily: 'inherit' }}
          >
            {(col.options || []).map(o => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
          </select>
        </td>
      );
    }
    if (col.type === 'list') {
      return (
        <td key={col.key} style={{ padding: '4px 6px', borderBottom: '1px solid #F0F4F0' }}>
          <input
            type="text"
            value={Array.isArray(val) ? val.join(', ') : (val ?? '')}
            onChange={e => {
              const v = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              setEditRow({ ...editRow, [col.key]: v });
            }}
            placeholder="Comma-separated"
            style={{ width: '100%', minWidth: 140, fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 6px', fontFamily: 'inherit' }}
          />
        </td>
      );
    }
    return (
      <td key={col.key} style={{ padding: '4px 6px', borderBottom: '1px solid #F0F4F0' }}>
        <input
          type={col.type === 'number' ? 'number' : 'text'}
          value={val ?? ''}
          step={col.step}
          onChange={e => {
            let v = e.target.value;
            if (col.type === 'number' && v !== '') v = Number(v);
            setEditRow({ ...editRow, [col.key]: v });
          }}
          style={{ width: '100%', minWidth: 60, fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 6px', fontFamily: 'inherit' }}
        />
      </td>
    );
  }

  return (
    <div style={CARD}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.77rem', color: '#6B7280', marginTop: 3 }}>{subtitle}</div>}
        </div>
        <span style={{ fontSize: '0.68rem', color: '#4B6352', background: '#E6ECE4', border: '1px solid #A8C4AC', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {formatTS(lastUpdated)}
        </span>
      </div>

      {/* Extra content (KPI strip, bar chart, note, etc.) */}
      {extraContent}

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={BTN.greenOutline} onClick={handleDownload}>↓ Download CSV</button>
        <button style={BTN.blueOutline} onClick={() => fileRef.current && fileRef.current.click()}>↑ Upload CSV</button>
        <input type="file" accept=".csv" ref={fileRef} style={{ display: 'none' }} onChange={handleFile} />
        <button style={BTN.redOutline} onClick={() => { if (window.confirm('Reset "' + title + '" to default data?')) onReset(); }}>
          Reset to Default
        </button>
        <span style={{ fontSize: '0.68rem', color: '#9CA3AF', marginLeft: 2 }}>key: {storageKey}</span>
      </div>

      {/* Upload preview */}
      {uploadPreview && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: '#1E40AF' }}>
            Parsed <strong>{uploadPreview.count}</strong> rows — ready to import
          </span>
          <button style={{ ...BTN.greenFill, padding: '4px 12px' }} onClick={confirmUpload}>Confirm Import</button>
          <button style={{ ...BTN.redOutline, padding: '4px 12px' }} onClick={() => setUploadPrev(null)}>Discard</button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.77rem' }}>
          <thead>
            <tr>
              <th style={{ ...TH_STYLE, width: 36 }}>#</th>
              {columns.map(c => <th key={c.key} style={TH_STYLE}>{c.label}</th>)}
              <th style={TH_STYLE}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, ri) => {
              const actualIdx = page * PAGE_SIZE + ri;
              const isEditing = editIdx === actualIdx;
              const rowBg = ri % 2 === 0 ? '#FAFFFE' : '#FFFFFF';
              return (
                <tr key={ri} style={{ background: rowBg }}>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid #F0F4F0', color: '#9CA3AF', fontSize: '0.7rem' }}>
                    {actualIdx + 1}
                  </td>
                  {isEditing
                    ? columns.map(col => renderEditCell(col))
                    : columns.map(col => renderCell(row, col, ri))
                  }
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #F0F4F0' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ ...BTN.greenFill, padding: '3px 10px', fontSize: '0.7rem' }} onClick={commitEdit}>Save</button>
                        <button style={{ ...BTN.redOutline, padding: '3px 8px', fontSize: '0.7rem' }} onClick={cancelEdit}>Cancel</button>
                      </div>
                    ) : (
                      <button style={{ ...BTN.greenOutline, padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => startEdit(ri)}>Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.8rem' }}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.73rem', color: '#6B7280' }}>
            Page {page + 1} / {totalPages} &nbsp;·&nbsp; {safeData.length} rows
          </span>
          <button style={{ ...BTN.greenOutline, padding: '3px 10px' }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>◀</button>
          <button style={{ ...BTN.greenOutline, padding: '3px 10px' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>▶</button>
        </div>
      )}
    </div>
  );
}

// ─── ScenarioPanel ────────────────────────────────────────────────────────────

function ScenarioPanel({ scenarioScores, setScenarioScores, resetScenarioScores, lastUpdated }) {
  const [local, setLocal]   = useState(() => JSON.parse(JSON.stringify(scenarioScores || {})));
  const [dirty, setDirty]   = useState(false);

  useEffect(() => {
    setLocal(JSON.parse(JSON.stringify(scenarioScores || {})));
    setDirty(false);
  }, [scenarioScores]);

  const districts = Object.keys((scenarioScores && scenarioScores.baseline) || {});

  const SCENARIOS = [
    { key: 'baseline', label: 'Baseline',   sub: 'Current Climate' },
    { key: 'ssp126',   label: 'SSP1-2.6',   sub: '2050 Low Emissions' },
    { key: 'ssp585',   label: 'SSP5-8.5',   sub: '2050 High Emissions' },
  ];

  function scoreStyle(v) {
    if (v >= 75) return { background: '#E6ECE4', color: '#4B6352' };
    if (v >= 50) return { background: '#FEF9C3', color: '#713F12' };
    return { background: '#FEE2E2', color: '#991B1B' };
  }

  function updateScore(scenario, district, rawVal) {
    const n = rawVal === '' ? '' : Number(rawVal);
    setLocal(prev => ({
      ...prev,
      [scenario]: { ...prev[scenario], [district]: n },
    }));
    setDirty(true);
  }

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)' }}>
            Climate Scenario Scores
          </div>
          <div style={{ fontSize: '0.77rem', color: '#6B7280', marginTop: 3 }}>
            MaxEnt climate-only model (AUC = 0.992) · Buckwheat suitability across three climate futures
          </div>
        </div>
        <span style={{ fontSize: '0.68rem', color: '#4B6352', background: '#E6ECE4', border: '1px solid #A8C4AC', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {formatTS(lastUpdated && lastUpdated['scenario_scores'])}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {dirty && (
          <button style={BTN.greenFill} onClick={() => { setScenarioScores(local); setDirty(false); }}>
            Save Changes
          </button>
        )}
        {dirty && (
          <button style={BTN.redOutline} onClick={cancelDirty}>Cancel</button>
        )}
        <button style={BTN.redOutline} onClick={() => { if (window.confirm('Reset scenario scores to default?')) resetScenarioScores(); }}>
          Reset to Default
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, overflowX: 'auto' }}>
        {SCENARIOS.map(sc => (
          <div key={sc.key}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>
              {sc.label}
              <span style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 400, marginLeft: 6 }}>{sc.sub}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...TH_STYLE, fontSize: '0.62rem' }}>District</th>
                  <th style={{ ...TH_STYLE, fontSize: '0.62rem', textAlign: 'center', width: 70 }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((dist, ri) => {
                  const val = (local[sc.key] && local[sc.key][dist] !== undefined) ? local[sc.key][dist] : 0;
                  return (
                    <tr key={dist} style={{ background: ri % 2 === 0 ? '#FAFFFE' : '#FFFFFF' }}>
                      <td style={{ padding: '4px 8px', borderBottom: '1px solid #F0F4F0', fontSize: '0.71rem', color: '#374151' }}>
                        {dist}
                      </td>
                      <td style={{ padding: '3px 6px', borderBottom: '1px solid #F0F4F0', textAlign: 'center' }}>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={val}
                          onChange={e => updateScore(sc.key, dist, e.target.value)}
                          style={{ width: 52, textAlign: 'center', fontSize: '0.72rem', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 4px', fontWeight: 700, ...scoreStyle(Number(val)), fontFamily: 'inherit' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );

  function cancelDirty() {
    setLocal(JSON.parse(JSON.stringify(scenarioScores || {})));
    setDirty(false);
  }
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const importAllRef = useRef();

  const {
    districtStats,    setDistrictStats,    resetDistrictStats,
    dropoutReasons,   setDropoutReasons,   resetDropoutReasons,
    returnConditions, setReturnConditions, resetReturnConditions,
    yieldBands,       setYieldBands,       resetYieldBands,
    seedSources,      setSeedSources,      resetSeedSources,
    cropSubstitution, setCropSubstitution, resetCropSubstitution,
    blockLevel,       setBlockLevel,       resetBlockLevel,
    winemakers,       setWinemakers,       resetWinemakers,
    suitabilityData,  setSuitabilityData,  resetSuitabilityData,
    scenarioScores,   setScenarioScores,   resetScenarioScores,
    activeFarmers,    setActiveFarmers,    resetActiveFarmers,
    dropoutFarmers,   setDropoutFarmers,   resetDropoutFarmers,
    groundwaterStations, setGroundwaterStations, resetGroundwaterStations,
    lastUpdated,
  } = useData();

  // Auth guard
  useEffect(() => {
    if (!session || session.role !== 'admin') navigate('/login');
  }, [session, navigate]);

  if (!session || session.role !== 'admin') return null;

  // ── Column schemas ────────────────────────────────────────────────────────

  const COLS_DISTRICT_STATS = [
    { key: 'district',            label: 'District',         type: 'text',   readonly: true },
    { key: 'activeFarmers',       label: 'Active',           type: 'number' },
    { key: 'dropoutFarmers',      label: 'Dropout',          type: 'number' },
    { key: 'revivalWilling',      label: 'Revival Willing',  type: 'number' },
    { key: 'medianYield_kg',      label: 'Med. Yield (kg)',  type: 'number' },
    { key: 'interventionPriority',label: 'Priority',         type: 'select', options: [1, 2, 3] },
  ];

  const COLS_DROPOUT_REASONS = [
    { key: 'reason',     label: 'Reason',     type: 'text' },
    { key: 'count',      label: 'Count',      type: 'number' },
    { key: 'pct',        label: '% Share',    type: 'number' },
    { key: 'category',   label: 'Category',   type: 'text' },
    { key: 'actionable', label: 'Actionable', type: 'select', options: ['true', 'false'] },
  ];

  const COLS_RETURN_CONDITIONS = [
    { key: 'condition', label: 'Condition', type: 'text' },
    { key: 'count',     label: 'Count',     type: 'number' },
    { key: 'pct',       label: '% Share',   type: 'number' },
    { key: 'priority',  label: 'Priority',  type: 'select', options: [1, 2, 3] },
  ];

  const COLS_YIELD_BANDS = [
    { key: 'band',    label: 'Band',    type: 'text' },
    { key: 'farmers', label: 'Farmers', type: 'number' },
    { key: 'pct',     label: '%',       type: 'number' },
    { key: 'label',   label: 'Label',   type: 'text' },
  ];

  const COLS_SEED_SOURCES = [
    { key: 'source',     label: 'Source',     type: 'text' },
    { key: 'farmersPct', label: 'Farmers %',  type: 'number' },
    { key: 'risk',       label: 'Risk',       type: 'select', options: ['high', 'medium', 'low'] },
  ];

  const COLS_WINEMAKERS = [
    { key: 'name',      label: 'Name',        type: 'text' },
    { key: 'gender',    label: 'Gender',      type: 'select', options: ['M', 'F'] },
    { key: 'age',       label: 'Age',         type: 'number' },
    { key: 'district',  label: 'District',    type: 'text' },
    { key: 'exp',       label: 'Exp (yr)',    type: 'number' },
    { key: 'setup',     label: 'Setup',       type: 'select', options: ['Commercial', 'Home-based'] },
    { key: 'capacity',  label: 'Cap (L)',     type: 'number' },
    { key: 'actual',    label: 'Actual (L)',  type: 'number' },
    { key: 'revenue',   label: 'Revenue (₹)', type: 'number' },
    { key: 'profit',    label: 'Profit (₹)',  type: 'number' },
    { key: 'margin',    label: 'Margin',      type: 'text' },
    { key: 'incBefore', label: 'Income Before MFEC (₹)', type: 'number' },
    { key: 'incAfter',  label: 'Income After MFEC (₹)',  type: 'number' },
    { key: 'training',  label: 'Training',    type: 'select', options: ['true', 'false'] },
    { key: 'barriers',  label: 'Barriers',    type: 'list' },
  ];

  const COLS_SUITABILITY = [
    { key: 'district',     label: 'District',      type: 'text',   readonly: true },
    { key: 'buckwheat',    label: 'Buckwheat',     type: 'number' },
    { key: 'plum',         label: 'Plum',          type: 'number' },
    { key: 'peach',        label: 'Peach',         type: 'number' },
    { key: 'passionFruit', label: 'Passion Fruit', type: 'number' },
    { key: 'aucScore',     label: 'AUC Score',     type: 'number', step: 0.001 },
  ];

  const COLS_ACTIVE_FARMERS = [
    { key: 'id',          label: 'ID',           type: 'text' },
    { key: 'district',    label: 'District',     type: 'text' },
    { key: 'block',       label: 'Block',        type: 'text' },
    { key: 'lat',         label: 'Lat',          type: 'number' },
    { key: 'lon',         label: 'Lon',          type: 'number' },
    { key: 'area_ha',     label: 'Area (ha)',    type: 'number' },
    { key: 'yield_kg',    label: 'Yield (kg)',   type: 'number' },
    { key: 'seedSource',  label: 'Seed Source',  type: 'text' },
    { key: 'hasGuidance', label: 'Guidance',     type: 'select', options: ['true', 'false'] },
    { key: 'sellsTo',     label: 'Sells To',     type: 'text' },
    { key: 'pricePerKg',  label: '₹/kg',         type: 'number' },
  ];

  const COLS_DROPOUT_FARMERS = [
    { key: 'id',             label: 'ID',              type: 'text' },
    { key: 'district',       label: 'District',        type: 'text' },
    { key: 'block',          label: 'Block',           type: 'text' },
    { key: 'lat',            label: 'Lat',             type: 'number' },
    { key: 'lon',            label: 'Lon',             type: 'number' },
    { key: 'dropoutYear',    label: 'Dropout Year',    type: 'number' },
    { key: 'primaryReason',  label: 'Primary Reason',  type: 'text' },
    { key: 'revivalWilling', label: 'Revival Willing', type: 'select', options: ['true', 'false'] },
    { key: 'lastYield_kg',   label: 'Last Yield (kg)', type: 'number' },
  ];

  const COLS_GROUNDWATER = [
    { key: 'id',           label: 'Station ID',    type: 'text', readonly: true },
    { key: 'name',         label: 'Station Name',  type: 'text' },
    { key: 'district',     label: 'District',      type: 'text' },
    { key: 'block',        label: 'Block',         type: 'text' },
    { key: 'lat',          label: 'Lat',           type: 'number' },
    { key: 'lon',          label: 'Lon',           type: 'number' },
    { key: 'agency',       label: 'Agency',        type: 'select', options: ['CGWB', 'Meghalaya'] },
    { key: 'telemetric',   label: 'Telemetric',    type: 'select', options: ['true', 'false'] },
    { key: 'basin',        label: 'River Basin',   type: 'text' },
    { key: 'established',  label: 'Established',   type: 'text' },
    { key: 'geologyCode',  label: 'Geology Code (CGWB)', type: 'text' },
  ];

  // ── Derived KPIs ──────────────────────────────────────────────────────────

  const safeDistStats = Array.isArray(districtStats) ? districtStats : [];
  const totalActive   = safeDistStats.reduce((s, d) => s + (Number(d.activeFarmers)  || 0), 0);
  const totalDropout  = safeDistStats.reduce((s, d) => s + (Number(d.dropoutFarmers) || 0), 0);
  const totalRevival  = safeDistStats.reduce((s, d) => s + (Number(d.revivalWilling) || 0), 0);
  const totalFarmers  = totalActive + totalDropout;
  const dropoutRate   = totalFarmers > 0 ? ((totalDropout / totalFarmers) * 100).toFixed(1) : '—';
  const revivalRate   = totalDropout > 0 ? ((totalRevival / totalDropout) * 100).toFixed(1) : '—';

  const safeWinemakers  = Array.isArray(winemakers) ? winemakers : [];
  const totalCapacity   = safeWinemakers.reduce((s, w) => s + (Number(w.capacity) || 0), 0);
  const totalRevenue    = safeWinemakers.reduce((s, w) => s + (Number(w.revenue)  || 0), 0);

  // ── Suitability cell colour ───────────────────────────────────────────────

  function suitCellStyle(key, val) {
    if (!['buckwheat', 'plum', 'peach', 'passionFruit'].includes(key)) return {};
    const n = Number(val);
    if (n >= 75) return { background: '#E6ECE4', color: '#4B6352', fontWeight: 700 };
    if (n >= 50) return { background: '#FEF9C3', color: '#713F12', fontWeight: 700 };
    return { background: '#FEE2E2', color: '#991B1B', fontWeight: 700 };
  }

  // ── System & Export helpers ───────────────────────────────────────────────

  const ALL_DATASETS = [
    { name: 'District Overview Stats', key: 'district_stats',  data: districtStats,    reset: resetDistrictStats },
    { name: 'Dropout Reasons',         key: 'dropout_reasons', data: dropoutReasons,   reset: resetDropoutReasons },
    { name: 'Return Conditions',       key: 'return_conds',    data: returnConditions, reset: resetReturnConditions },
    { name: 'Yield Bands',             key: 'yield_bands',     data: yieldBands,       reset: resetYieldBands },
    { name: 'Seed Sources',            key: 'seed_sources',    data: seedSources,      reset: resetSeedSources },
    { name: 'Crop Substitution',       key: 'crop_sub',        data: cropSubstitution, reset: resetCropSubstitution },
    { name: 'Block Level Data',        key: 'block_level',     data: blockLevel,       reset: resetBlockLevel },
    { name: 'Winemakers',              key: 'winemakers',      data: winemakers,       reset: resetWinemakers },
    { name: 'Suitability Scores',      key: 'suitability',     data: suitabilityData,  reset: resetSuitabilityData },
    { name: 'Scenario Scores',         key: 'scenario_scores', data: scenarioScores,   reset: resetScenarioScores, isObj: true },
    { name: 'Active Farmers (GPS)',    key: 'active_farmers',  data: activeFarmers,    reset: resetActiveFarmers },
    { name: 'Dropout Farmers (GPS)',   key: 'dropout_farmers', data: dropoutFarmers,   reset: resetDropoutFarmers },
    { name: 'Groundwater Stations',    key: 'groundwater_stations', data: groundwaterStations, reset: resetGroundwaterStations },
  ];

  function handleExportAll() {
    const payload = {};
    ALL_DATASETS.forEach(d => { payload[d.key] = d.data; });
    payload.exported_at = new Date().toISOString();
    const dateStr = new Date().toISOString().slice(0, 10);
    triggerDownload(`mfec_data_export_${dateStr}.json`, JSON.stringify(payload, null, 2), 'application/json');
  }

  function handleImportAll(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const p = JSON.parse(ev.target.result);
        if (p.district_stats)   setDistrictStats(p.district_stats);
        if (p.dropout_reasons)  setDropoutReasons(p.dropout_reasons);
        if (p.return_conds)     setReturnConditions(p.return_conds);
        if (p.yield_bands)      setYieldBands(p.yield_bands);
        if (p.seed_sources)     setSeedSources(p.seed_sources);
        if (p.crop_sub)         setCropSubstitution(p.crop_sub);
        if (p.block_level)      setBlockLevel(p.block_level);
        if (p.winemakers)       setWinemakers(p.winemakers);
        if (p.suitability)      setSuitabilityData(p.suitability);
        if (p.scenario_scores)  setScenarioScores(p.scenario_scores);
        if (p.active_farmers)   setActiveFarmers(p.active_farmers);
        if (p.dropout_farmers)  setDropoutFarmers(p.dropout_farmers);
        window.alert('All data imported successfully.');
      } catch (err) {
        window.alert('Failed to parse file. Make sure it is a valid MFEC export JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const GIS_FILES = [
    { name: 'villages.json',  desc: '6,861 villages',   size: '2.9 MB' },
    { name: 'roads.json',     desc: '2,076 features',   size: '663 KB' },
    { name: 'districts.json', desc: '12 districts',     size: '~120 KB' },
    { name: 'blocks.json',    desc: '46 blocks',        size: '~80 KB' },
    { name: 'state.json',     desc: 'State boundary',   size: '~45 KB' },
  ];

  const TABS = ['Buckwheat Programme', 'Wine Fruits Survey', 'Suitability Scores', 'Farmer GPS Data', 'Groundwater Stations', 'System & Export'];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page, #F7FAF7)', fontFamily: 'var(--font-body, sans-serif)' }}>

      {/* ── Top bar ── */}
      <div style={{
        background: 'linear-gradient(135deg, #262E28, #384338)',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        gap: 16,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🌿</span>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading, sans-serif)', letterSpacing: '0.01em' }}>
              MFEC Admin Dashboard
            </div>
            <div style={{ fontSize: '0.65rem', color: '#A8C4AC', letterSpacing: '0.03em', marginTop: 1 }}>
              Data Management Panel
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 20, padding: '3px 12px', marginLeft: 6 }}>
            <span style={{ fontSize: '0.72rem', color: '#D1FAE5', fontWeight: 600 }}>{session.name}</span>
            <span style={{ fontSize: '0.66rem', color: '#6EE7B7', margin: '0 5px' }}>·</span>
            <span style={{ fontSize: '0.66rem', color: '#9CA3AF' }}>{session.department}</span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            style={{ padding: '7px 16px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'inherit' }}
            onClick={() => navigate('/')}
          >
            View Public Platform
          </button>
          <button
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', color: '#262E28', background: '#A8C4AC', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'inherit' }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{
        background: 'white',
        borderBottom: '2px solid #E4EBE4',
        position: 'sticky',
        top: 64,
        zIndex: 998,
        padding: '0 24px',
        display: 'flex',
        gap: 0,
        overflowX: 'auto',
      }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '13px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: activeTab === i ? 700 : 500,
              color: activeTab === i ? '#5F7D68' : '#374151',
              borderBottom: activeTab === i ? '2.5px solid #5F7D68' : '2.5px solid transparent',
              marginBottom: -2,
              transition: 'color 0.15s',
              fontFamily: 'var(--font-body, sans-serif)',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Page content ── */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 24px' }}>

        {/* ════════════════ TAB 1 — BUCKWHEAT PROGRAMME ════════════════ */}
        {activeTab === 0 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)', marginBottom: 20, marginTop: 0 }}>
              Buckwheat Programme Data
            </h2>

            {/* 1A — District Overview Stats */}
            <DatasetPanel
              title="District Overview Statistics"
              subtitle="Per-district farmer counts, yield, and intervention priority"
              data={districtStats}
              columns={COLS_DISTRICT_STATS}
              onSave={setDistrictStats}
              onReset={resetDistrictStats}
              storageKey="district_stats"
              lastUpdated={lastUpdated && lastUpdated['district_stats']}
              extraContent={
                <KpiStrip items={[
                  { value: totalActive.toLocaleString(),   label: 'Total Active Farmers' },
                  { value: totalDropout.toLocaleString(),  label: 'Total Dropouts' },
                  { value: `${dropoutRate}%`,              label: 'Dropout Rate' },
                  { value: `${revivalRate}%`,              label: 'Revival Rate' },
                ]} />
              }
            />

            {/* 1B — Dropout Reasons */}
            <DatasetPanel
              title="Dropout Reasons"
              subtitle="Why farmers left the buckwheat programme"
              data={dropoutReasons}
              columns={COLS_DROPOUT_REASONS}
              onSave={setDropoutReasons}
              onReset={resetDropoutReasons}
              storageKey="dropout_reasons"
              lastUpdated={lastUpdated && lastUpdated['dropout_reasons']}
              extraContent={
                <InlineBarChart data={Array.isArray(dropoutReasons) ? dropoutReasons : []} valueKey="count" labelKey="reason" color="#5F7D68" />
              }
            />

            {/* 1C — Return Conditions */}
            <DatasetPanel
              title="Return Conditions"
              subtitle="Conditions required for revival-ready farmers to return · n=153 revival-ready farmers"
              data={returnConditions}
              columns={COLS_RETURN_CONDITIONS}
              onSave={setReturnConditions}
              onReset={resetReturnConditions}
              storageKey="return_conds"
              lastUpdated={lastUpdated && lastUpdated['return_conds']}
              extraContent={
                <div style={{ fontSize: '0.77rem', color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  Survey scope: n=153 revival-ready farmers (85% of 180 dropouts). Data source: KoboToolbox field survey 2021–2023.
                </div>
              }
            />

            {/* 1D — Productivity: 2-column grid */}
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: 12, marginTop: 4 }}>Productivity Data</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <DatasetPanel
                title="Yield Bands"
                subtitle="Farmer distribution across yield brackets"
                data={yieldBands}
                columns={COLS_YIELD_BANDS}
                onSave={setYieldBands}
                onReset={resetYieldBands}
                storageKey="yield_bands"
                lastUpdated={lastUpdated && lastUpdated['yield_bands']}
              />
              <DatasetPanel
                title="Seed Sources"
                subtitle="Where farmers obtain buckwheat seed and supply risk"
                data={seedSources}
                columns={COLS_SEED_SOURCES}
                onSave={setSeedSources}
                onReset={resetSeedSources}
                storageKey="seed_sources"
                lastUpdated={lastUpdated && lastUpdated['seed_sources']}
              />
            </div>
          </div>
        )}

        {/* ════════════════ TAB 2 — WINE FRUITS SURVEY ════════════════ */}
        {activeTab === 1 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)', marginBottom: 20, marginTop: 0 }}>
              Wine Fruits Survey Data
            </h2>

            <DatasetPanel
              title="Enterprise Winemakers"
              subtitle="Surveyed winemaking enterprises across Meghalaya"
              data={winemakers}
              columns={COLS_WINEMAKERS}
              onSave={setWinemakers}
              onReset={resetWinemakers}
              storageKey="winemakers"
              lastUpdated={lastUpdated && lastUpdated['winemakers']}
              extraContent={
                <KpiStrip
                  color="purple"
                  items={[
                    { value: safeWinemakers.length,                      label: 'Total Winemakers' },
                    { value: `${totalCapacity.toLocaleString()} L`,      label: 'Total Capacity' },
                    { value: `₹${(totalRevenue / 100000).toFixed(1)}L`,  label: 'Total Revenue' },
                  ]}
                />
              }
            />
          </div>
        )}

        {/* ════════════════ TAB 3 — SUITABILITY SCORES ════════════════ */}
        {activeTab === 2 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)', marginBottom: 20, marginTop: 0 }}>
              Suitability Scores
            </h2>

            <DatasetPanel
              title="District Suitability Scores"
              subtitle="MaxEnt model suitability per crop per district (0–100)"
              data={suitabilityData}
              columns={COLS_SUITABILITY}
              onSave={setSuitabilityData}
              onReset={resetSuitabilityData}
              storageKey="suitability"
              lastUpdated={lastUpdated && lastUpdated['suitability']}
              getCellStyle={suitCellStyle}
              extraContent={
                <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', background: '#E6ECE4', color: '#4B6352', border: '1px solid #A8C4AC', borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
                    ≥ 75 — High suitability
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#FEF9C3', color: '#713F12', border: '1px solid #FCD34D', borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
                    50–74 — Medium suitability
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
                    &lt; 50 — Low suitability
                  </span>
                </div>
              }
            />

            <ScenarioPanel
              scenarioScores={scenarioScores}
              setScenarioScores={setScenarioScores}
              resetScenarioScores={resetScenarioScores}
              lastUpdated={lastUpdated}
            />
          </div>
        )}

        {/* ════════════════ TAB 4 — FARMER GPS DATA ════════════════ */}
        {activeTab === 3 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)', marginBottom: 20, marginTop: 0 }}>
              Farmer GPS Data
            </h2>

            <DatasetPanel
              title="Active Farmers"
              subtitle="GPS-located active buckwheat cultivators"
              data={activeFarmers}
              columns={COLS_ACTIVE_FARMERS}
              onSave={setActiveFarmers}
              onReset={resetActiveFarmers}
              storageKey="active_farmers"
              lastUpdated={lastUpdated && lastUpdated['active_farmers']}
              extraContent={
                <div style={{ marginBottom: 12 }}>
                  <span style={{ background: '#E6ECE4', color: '#4B6352', border: '1px solid #A8C4AC', borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {Array.isArray(activeFarmers) ? activeFarmers.length : 0} active cultivators
                  </span>
                </div>
              }
            />

            <DatasetPanel
              title="Dropout Farmers"
              subtitle="GPS-located farmers who have left the buckwheat programme"
              data={dropoutFarmers}
              columns={COLS_DROPOUT_FARMERS}
              onSave={setDropoutFarmers}
              onReset={resetDropoutFarmers}
              storageKey="dropout_farmers"
              lastUpdated={lastUpdated && lastUpdated['dropout_farmers']}
              extraContent={
                <div style={{ marginBottom: 12 }}>
                  <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {Array.isArray(dropoutFarmers) ? dropoutFarmers.length : 0} dropout farmers
                  </span>
                </div>
              }
            />
          </div>
        )}

        {/* ════════════════ TAB 5 — GROUNDWATER STATIONS ════════════════ */}
        {activeTab === 4 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)', marginBottom: 20, marginTop: 0 }}>
              Groundwater Stations
            </h2>

            <DatasetPanel
              title="Groundwater Monitoring Stations"
              subtitle="Piezometer network — depth to water, trend, quality, aquifer type. Shown as a selectable layer on the Water Management map."
              data={groundwaterStations}
              columns={COLS_GROUNDWATER}
              onSave={setGroundwaterStations}
              onReset={resetGroundwaterStations}
              storageKey="groundwater_stations"
              lastUpdated={lastUpdated && lastUpdated['groundwater_stations']}
              extraContent={
                <div style={{ marginBottom: 12 }}>
                  <span style={{ background: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {Array.isArray(groundwaterStations) ? groundwaterStations.length : 0} stations
                  </span>
                </div>
              }
            />
          </div>
        )}

        {/* ════════════════ TAB 6 — SYSTEM & EXPORT ════════════════ */}
        {activeTab === 5 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)', marginBottom: 20, marginTop: 0 }}>
              System & Export
            </h2>

            {/* Export / Import card */}
            <div style={{ ...CARD, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                style={{ ...BTN.greenFill, padding: '10px 22px', fontSize: '0.85rem' }}
                onClick={handleExportAll}
              >
                ↓ Export All Data (JSON)
              </button>
              <button
                style={{ ...BTN.blueOutline, padding: '10px 22px', fontSize: '0.85rem' }}
                onClick={() => importAllRef.current && importAllRef.current.click()}
              >
                ↑ Import All Data (JSON)
              </button>
              <input type="file" accept=".json" ref={importAllRef} style={{ display: 'none' }} onChange={handleImportAll} />
              <span style={{ fontSize: '0.77rem', color: '#6B7280' }}>
                Export saves all 12 datasets as a single JSON file. Import restores from a previous export.
              </span>
            </div>

            {/* Dataset status table */}
            <div style={CARD}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)', marginBottom: 14 }}>
                Dataset Status
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      {['Dataset', 'Records', 'Last Updated', 'Status', 'Action'].map(h => (
                        <th key={h} style={TH_STYLE}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_DATASETS.map((ds, ri) => {
                      const hasCustom = !!(lastUpdated && lastUpdated[ds.key]);
                      const ts   = lastUpdated && lastUpdated[ds.key];
                      const count = ds.isObj
                        ? (ds.data && typeof ds.data === 'object' ? `${Object.keys(ds.data).length} scenarios` : '—')
                        : (Array.isArray(ds.data) ? ds.data.length : '—');
                      return (
                        <tr key={ds.key} style={{ background: ri % 2 === 0 ? '#FAFFFE' : '#FFFFFF' }}>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid #F0F4F0', fontWeight: 600, color: '#1A2332' }}>{ds.name}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid #F0F4F0', color: '#374151' }}>{count}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid #F0F4F0', color: '#6B7280', fontSize: '0.72rem' }}>{formatTS(ts)}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid #F0F4F0' }}>
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 600, borderRadius: 12, padding: '2px 10px',
                              background: hasCustom ? '#E6ECE4' : '#F3F4F6',
                              color:      hasCustom ? '#4B6352' : '#374151',
                              border:     hasCustom ? '1px solid #A8C4AC' : '1px solid #E5E7EB',
                            }}>
                              {hasCustom ? 'Has custom data' : 'Using default'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid #F0F4F0' }}>
                            <button
                              style={{ ...BTN.redOutline, padding: '3px 10px', fontSize: '0.7rem' }}
                              onClick={() => { if (window.confirm(`Reset "${ds.name}" to default?`)) ds.reset(); }}
                            >
                              Reset
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GIS files status */}
            <div style={CARD}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1A2332', fontFamily: 'var(--font-heading)', marginBottom: 14 }}>
                GIS Files Status
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10, marginBottom: 14 }}>
                {GIS_FILES.map((f, i) => (
                  <div key={i} style={{ background: '#F0F2EF', border: '1px solid #C7D6CB', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem', color: '#22C55E', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A2332' }}>{f.name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280', marginTop: 1 }}>{f.desc} · {f.size}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.77rem', color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '10px 14px' }}>
                All data stored in browser localStorage. Export regularly to backup.
                GIS vector files are bundled with the application and are not editable through this panel.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}