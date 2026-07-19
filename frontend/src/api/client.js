import axios from 'axios';

const SESSION_KEY = 'mfec_auth_session';

const client = axios.create({ baseURL: '' });

client.interceptors.request.use(config => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session && session.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
  } catch {}
  return config;
});

export default client;
