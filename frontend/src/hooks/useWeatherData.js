import { useState, useEffect, useCallback } from 'react';

const API_KEY = '0cd022b4ac3216bc0c226013c8b306d3';
const CACHE_KEY = 'mfec_weather_v2';
const CACHE_TTL_MS = 5 * 60 * 1000;

export const WEATHER_DISTRICTS = [
  { name: 'Shillong',     region: 'East Khasi Hills',         lat: 25.5788, lon: 91.8933 },
  { name: 'Nongstoin',    region: 'West Khasi Hills',         lat: 25.5178, lon: 91.2632 },
  { name: 'Mawkyrwat',    region: 'South West Khasi Hills',   lat: 25.2297, lon: 91.3022 },
  { name: 'Mairang',      region: 'West Khasi Hills (Sub)',   lat: 25.5605, lon: 91.6695 },
  { name: 'Tura',         region: 'West Garo Hills',          lat: 25.5139, lon: 90.2131 },
  { name: 'Baghmara',     region: 'South Garo Hills',         lat: 25.2042, lon: 90.6411 },
  { name: 'Williamnagar', region: 'East Garo Hills',          lat: 25.4979, lon: 90.6143 },
  { name: 'Resubelpara',  region: 'North Garo Hills',         lat: 25.8733, lon: 90.4044 },
  { name: 'Ampati',       region: 'South West Garo Hills',    lat: 25.4007, lon: 90.0219 },
  { name: 'Jowai',        region: 'West Jaintia Hills',       lat: 25.4525, lon: 92.2026 },
  { name: 'Khliehriat',   region: 'East Jaintia Hills',       lat: 25.2797, lon: 92.4041 },
  { name: 'Amlarem',      region: 'West Jaintia Hills (Sub)', lat: 25.3667, lon: 92.1500 },
];

async function fetchOne(d) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${d.lat}&lon=${d.lon}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const json = await res.json();
  return {
    temp:    json.main.temp,
    feels:   json.main.feels_like,
    hum:     json.main.humidity,
    rain:    json.rain ? (json.rain['1h'] || 0) : 0,
    wind:    +(json.wind.speed * 3.6).toFixed(1),
    windDeg: json.wind.deg || 0,
    id:      json.weather[0].id,
    desc:    json.weather[0].description,
    ts:      Date.now(),
  };
}

const avgArr = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

export function useWeatherData() {
  const [results, setResults]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
          setResults(cached.data);
          setLastUpdated(new Date(cached.ts));
          setLoading(false);
          return;
        }
      } catch (_) {}
    }

    setLoading(true);
    setError(null);

    const settled = await Promise.allSettled(
      WEATHER_DISTRICTS.map((d, i) => fetchOne(d).then(r => ({ i, r })))
    );

    const data = {};
    settled.forEach(res => {
      if (res.status === 'fulfilled') data[res.value.i] = res.value.r;
    });

    if (!Object.keys(data).length) {
      setError('Could not reach OpenWeatherMap. Check your connection.');
      setLoading(false);
      return;
    }

    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (_) {}

    setResults(data);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), CACHE_TTL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const valid = results
    ? WEATHER_DISTRICTS.map((d, i) => ({ d, i, r: results[i] })).filter(x => x.r)
    : [];

  const summary = valid.length ? {
    avgTemp: avgArr(valid.map(x => x.r.temp)),
    avgHum:  avgArr(valid.map(x => x.r.hum)),
    maxRain: valid.reduce((a, b) => b.r.rain > a.r.rain ? b : a),
    maxWind: valid.reduce((a, b) => b.r.wind > a.r.wind ? b : a),
    hottest: valid.reduce((a, b) => b.r.temp > a.r.temp ? b : a),
    coolest: valid.reduce((a, b) => b.r.temp < a.r.temp ? b : a),
  } : null;

  return {
    results,
    valid,
    loading,
    error,
    lastUpdated,
    refresh: () => load(true),
    summary,
  };
}
