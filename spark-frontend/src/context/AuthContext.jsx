import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL;
const TOKEN_KEY = 'sc_admin_token';

// Attach token to every request from localStorage
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(undefined); // undefined=loading, null=not authed, obj=authed

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAdmin(null);
      return;
    }
    axios.get(`${API}/api/auth/me`, { withCredentials: true })
      .then(res => setAdmin(res.data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAdmin(null);
      });
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(
      `${API}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    // Store token in localStorage for reliable auth across page loads
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    const { token: _, ...adminData } = data;
    setAdmin(adminData);
    return adminData;
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch { /* ignore */ }
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
