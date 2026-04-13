import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('kb_token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kb_user')); } catch { return null; }
  });

  function login(newToken, newUser) {
    localStorage.setItem('kb_token', newToken);
    localStorage.setItem('kb_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('kb_token');
    localStorage.removeItem('kb_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
