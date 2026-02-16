import api from './api';

const getList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const issueService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    const response = await api.get('/issues/', { params: Object.fromEntries(params) });
    return getList(response.data);
  },

  getById: async (id) => {
    const response = await api.get(`/issues/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/issues/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/issues/${id}/`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/issues/${id}/`, { status });
    return response.data;
  },

  requestResolve: async (id) => {
    const response = await api.post(`/issues/${id}/request-resolve/`);
    return response.data;
  },

  assignWorker: async (id, workerId) => {
    try {
      const response = await api.post(`/issues/${id}/assign_worker/`, { worker_id: workerId || null });
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        const response = await api.patch(`/issues/${id}/`, { assigned_to: workerId || null });
        return response.data;
      }
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats/');
      return response.data || {};
    } catch {
      return {};
    }
  },

  getNearby: async (latitude, longitude, radius = 5) => {
    const response = await api.get('/issues/nearby/', { params: { latitude, longitude, radius } });
    return getList(response.data);
  },
};

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  getWorkers: async () => {
    const response = await api.get('/users/', { params: { role: 'WORKER' } });
    return getList(response.data);
  },

  getAll: async () => {
    const response = await api.get('/users/');
    return getList(response.data);
  },
};

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/token/', { username, password });
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/token/refresh/', { refresh: refreshToken });
    return response.data;
  },
};

// Legacy exports for backward compatibility
export const getIssues = async (params = {}) => issueService.getAll(params);
export const getDashboardStats = async () => issueService.getStats();
export const getWorkers = async () => userService.getWorkers();
export const updateIssueStatus = async (issueId, status) => issueService.updateStatus(issueId, status);
export const assignIssueWorker = async (issueId, workerId) => issueService.assignWorker(issueId, workerId);
export const createIssue = async (formData) => issueService.create(formData);
export const getNearbyIssues = async (latitude, longitude, radius = 5) => issueService.getNearby(latitude, longitude, radius);
export const requestIssueResolve = async (issueId) => issueService.requestResolve(issueId);
