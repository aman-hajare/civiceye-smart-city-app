export const getAccessToken = () => localStorage.getItem('access') || '';

export const getRole = () => {
  const role = localStorage.getItem('role') || '';
  return role.toUpperCase();
};

export const isAuthenticated = () => Boolean(getAccessToken());

export const setAuthSession = ({ access, refresh, role }) => {
  if (access) localStorage.setItem('access', access);
  if (refresh) localStorage.setItem('refresh', refresh);
  if (role) localStorage.setItem('role', String(role).toUpperCase());
};

export const clearAuthSession = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('role');
};

export const logout = () => {
  clearAuthSession();
};
