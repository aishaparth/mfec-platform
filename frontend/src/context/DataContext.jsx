import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

// Context field name -> backend dataset key
const FIELD_TO_KEY = {
  suitabilityData:    'suitability',
  dropoutReasons:      'dropout_reasons',
  returnConditions:    'return_conds',
  yieldBands:          'yield_bands',
  seedSources:         'seed_sources',
  cropSubstitution:    'crop_sub',
  districtStats:       'district_stats',
  blockLevel:          'block_level',
  winemakers:          'winemakers',
  scenarioScores:      'scenario_scores',
  activeFarmers:       'active_farmers',
  dropoutFarmers:      'dropout_farmers',
};

const EMPTY_STATE = {
  suitabilityData: [], dropoutReasons: [], returnConditions: [], yieldBands: [],
  seedSources: [], cropSubstitution: [], districtStats: [], blockLevel: [],
  winemakers: [], scenarioScores: { baseline: {}, ssp126: {}, ssp585: {} },
  activeFarmers: [], dropoutFarmers: [],
};

export function DataProvider({ children }) {
  const { session } = useAuth();
  const [state, setState] = useState(EMPTY_STATE);
  const [lastUpdated, setLastUpdated] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!session?.token) {
      setState(EMPTY_STATE);
      setLastUpdated({});
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    client.get('/api/datasets').then(res => {
      if (cancelled) return;
      const byField = { ...EMPTY_STATE };
      Object.entries(FIELD_TO_KEY).forEach(([field, key]) => {
        if (res.data.data[key] !== undefined) byField[field] = res.data.data[key];
      });
      setState(byField);
      setLastUpdated(res.data.meta?.lastUpdated || {});
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session?.token]);

  const update = useCallback(async (field, data) => {
    const key = FIELD_TO_KEY[field];
    const res = await client.put(`/api/datasets/${key}`, data);
    setState(prev => ({ ...prev, [field]: res.data.data }));
    setLastUpdated(prev => ({ ...prev, [key]: res.data.updatedAt }));
  }, []);

  const reset = useCallback(async (field) => {
    const key = FIELD_TO_KEY[field];
    const res = await client.post(`/api/datasets/${key}/reset`);
    setState(prev => ({ ...prev, [field]: res.data.data }));
    setLastUpdated(prev => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  const { districtStats, dropoutReasons, returnConditions } = state;

  // Derived: programme totals from districtStats (reactive)
  const PROGRAMME_TOTALS = useMemo(() => {
    const ds = Array.isArray(districtStats) ? districtStats : [];
    const dr = Array.isArray(dropoutReasons) ? dropoutReasons : [];
    const rc = Array.isArray(returnConditions) ? returnConditions : [];
    const active   = ds.reduce((s, d) => s + (d.activeFarmers || 0), 0);
    const dropout  = ds.reduce((s, d) => s + (d.dropoutFarmers || 0), 0);
    const revival  = ds.reduce((s, d) => s + (d.revivalWilling || 0), 0);
    const total    = active + dropout;
    const noGuidance = dr.find(r => r.reason?.toLowerCase().includes('guidance'))?.count || 141;
    const procSupport = rc.find(r => r.condition?.toLowerCase().includes('processing'))?.count || 151;
    return {
      totalRespondents: total,
      activeFarmers: active,
      dropoutFarmers: dropout,
      dropoutRate: total > 0 ? +((dropout / total) * 100).toFixed(1) : 76.6,
      revivalWilling: revival,
      revivalRate: dropout > 0 ? +((revival / dropout) * 100).toFixed(1) : 85.0,
      medianHarvest_kg: 12,
      noGuidanceCount: noGuidance,
      processingSupport: procSupport,
      surveyYear: '2021–2023',
      dataSource: 'KoboToolbox field survey',
      reportVersion: 'v9.0 · 22 Jun 2026',
    };
  }, [districtStats, dropoutReasons, returnConditions]);

  const ctx = {
    ...state,
    PROGRAMME_TOTALS,
    lastUpdated,
    loading,

    setSuitabilityData:  (d) => update('suitabilityData', d),
    setDropoutReasons:   (d) => update('dropoutReasons', d),
    setReturnConditions: (d) => update('returnConditions', d),
    setYieldBands:       (d) => update('yieldBands', d),
    setSeedSources:      (d) => update('seedSources', d),
    setCropSubstitution: (d) => update('cropSubstitution', d),
    setDistrictStats:    (d) => update('districtStats', d),
    setBlockLevel:       (d) => update('blockLevel', d),
    setWinemakers:       (d) => update('winemakers', d),
    setScenarioScores:   (d) => update('scenarioScores', d),
    setActiveFarmers:    (d) => update('activeFarmers', d),
    setDropoutFarmers:   (d) => update('dropoutFarmers', d),

    resetSuitabilityData:  () => reset('suitabilityData'),
    resetDropoutReasons:   () => reset('dropoutReasons'),
    resetReturnConditions: () => reset('returnConditions'),
    resetYieldBands:       () => reset('yieldBands'),
    resetSeedSources:      () => reset('seedSources'),
    resetCropSubstitution: () => reset('cropSubstitution'),
    resetDistrictStats:    () => reset('districtStats'),
    resetBlockLevel:       () => reset('blockLevel'),
    resetWinemakers:       () => reset('winemakers'),
    resetScenarioScores:   () => reset('scenarioScores'),
    resetActiveFarmers:    () => reset('activeFarmers'),
    resetDropoutFarmers:   () => reset('dropoutFarmers'),
  };

  return <DataContext.Provider value={ctx}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}

// CSV helpers exported for AdminDashboard
export function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { vals.push(cur); cur = ''; continue; }
      cur += ch;
    }
    vals.push(cur);
    const obj = {};
    headers.forEach((h, i) => {
      const v = (vals[i] || '').trim();
      if (v === '') { obj[h] = v; return; }
      if (v === 'true')  { obj[h] = true;  return; }
      if (v === 'false') { obj[h] = false; return; }
      const n = Number(v);
      obj[h] = isNaN(n) ? v : n;
    });
    return obj;
  });
}

export function toCSV(data) {
  if (!data || !data.length) return '';
  const keys = Object.keys(data[0]);
  const esc  = v => { const s = String(v ?? ''); return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
  return [keys.join(','), ...data.map(r => keys.map(k => esc(r[k])).join(','))].join('\n');
}
