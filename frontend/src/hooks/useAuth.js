import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('access');
    const role = localStorage.getItem('role');
    setAuth({
      isAuthenticated: !!token,
      role: role || null,
      token: token || null,
    });
  }, []);

  const login = (token, role) => {
    localStorage.setItem('access', token);
    localStorage.setItem('role', role);
    setAuth({
      isAuthenticated: true,
      role,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    setAuth({
      isAuthenticated: false,
      role: null,
      token: null,
    });
  };

  return { ...auth, login, logout };
};
