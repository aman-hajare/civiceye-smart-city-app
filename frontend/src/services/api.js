import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh');
        if (!refresh) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('role');
          localStorage.removeItem('username');
          localStorage.removeItem('full_name');
          window.location.href = '/';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
        const { access } = response.data;
        localStorage.setItem('access', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('full_name');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
