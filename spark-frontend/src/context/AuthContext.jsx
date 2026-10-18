'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

// Auth is an httpOnly cookie set by the backend; nothing is stored in JS.
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(undefined); // undefined=loading, null=not authed, obj=authed

  useEffect(() => {
    // Older builds kept a bearer token here; remove it.
    try { localStorage.removeItem('sc_admin_token'); } catch { /* storage unavailable */ }

    let cancelled = false;
    api.get('/auth/me')
      .then(res => { if (!cancelled) setAdmin(res.data); })
      .catch(err => {
        if (err?.response?.status !== 401) console.error('Failed to check admin session', err);
        if (!cancelled) setAdmin(null);
      });
    return () => { cancelled = true; };
  }, []);

  // An expired or revoked session returns 401 on any admin call: treat it as logged out
  // so ProtectedAdmin redirects to /admin/login.
  useEffect(() => {
    const id = api.interceptors.response.use(
      res => res,
      err => {
        const url = err?.config?.url || '';
        // Login and change-password report a wrong password, not an expired session.
        if (err?.response?.status === 401 && !/\/auth\/(login|change-password)/.test(url)) setAdmin(null);
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAdmin(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
