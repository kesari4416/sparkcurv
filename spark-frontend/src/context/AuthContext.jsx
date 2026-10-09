import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(undefined); // undefined=loading, null=not authed, obj=authed

  useEffect(() => {
    axios.get(`${API}/api/auth/me`, { withCredentials: true })
      .then(res => setAdmin(res.data))
      .catch(() => setAdmin(null));
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/api/auth/login`, { email, password }, { withCredentials: true });
    setAdmin(data);
    return data;
  };

  const logout = async () => {
    await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
