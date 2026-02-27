export const getAccessToken = () => localStorage.getItem('access') || '';
export const getRefreshToken = () => localStorage.getItem('refresh') || '';

export const getRole = () => {
  const role = localStorage.getItem('role') || '';
  return role.toUpperCase();
};

export const getUserName = () => localStorage.getItem('username') || '';
export const getFullName = () => localStorage.getItem('full_name') || '';

export const isAuthenticated = () => Boolean(getAccessToken());

const emitAuthChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:changed'));
  }
};

export const setAuthSession = ({ access, refresh, role, username, fullName }) => {
  if (access) localStorage.setItem('access', access);
  if (refresh) localStorage.setItem('refresh', refresh);
  if (role) localStorage.setItem('role', String(role).toUpperCase());
  if (username) localStorage.setItem('username', String(username));
  if (fullName) localStorage.setItem('full_name', String(fullName));
  emitAuthChanged();
};

export const clearAuthSession = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  localStorage.removeItem('full_name');
  emitAuthChanged();
};

export const setAccessToken = (access) => {
  if (access) {
    localStorage.setItem('access', access);
    emitAuthChanged();
  }
};

export const logout = () => {
  clearAuthSession();
};
