import React, { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client';

const SESSION_KEY = 'mfec_auth_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    try {
      const res = await client.post('/api/auth/login', { username, password });
      const s = { ...res.data.user, token: res.data.token, loginTime: Date.now() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      setSession(s);
      return { ok: true, role: s.role };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || 'Invalid username or password' };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
