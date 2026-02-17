export const getAccessToken = () => localStorage.getItem('access') || '';

export const getRole = () => {
  const role = localStorage.getItem('role') || '';
  return role.toUpperCase();
};

export const getUserName = () => localStorage.getItem('username') || '';
export const getFullName = () => localStorage.getItem('full_name') || '';

export const isAuthenticated = () => Boolean(getAccessToken());

export const setAuthSession = ({ access, refresh, role, username, fullName }) => {
  if (access) localStorage.setItem('access', access);
  if (refresh) localStorage.setItem('refresh', refresh);
  if (role) localStorage.setItem('role', String(role).toUpperCase());
  if (username) localStorage.setItem('username', String(username));
  if (fullName) localStorage.setItem('full_name', String(fullName));
};

export const clearAuthSession = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  localStorage.removeItem('full_name');
};

export const logout = () => {
  clearAuthSession();
};
