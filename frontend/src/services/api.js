import axios from 'axios';
import { clearAuthSession, getAccessToken, getRefreshToken, setAccessToken } from './auth';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshWaitQueue = [];

const enqueueRefreshWaiter = () =>
  new Promise((resolve, reject) => {
    refreshWaitQueue.push({ resolve, reject });
  });

const flushRefreshWaiters = (error, nextAccessToken = null) => {
  refreshWaitQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(nextAccessToken);
    }
  });
  refreshWaitQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
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
    const requestUrl = String(originalRequest?.url || '');
    const isAuthRequest = requestUrl.includes('/token/') || requestUrl.includes('/register/');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const refresh = getRefreshToken();
        if (!refresh) {
          clearAuthSession();
          if (window.location.pathname !== '/') {
            window.location.assign('/');
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          const queuedToken = await enqueueRefreshWaiter();
          originalRequest.headers.Authorization = `Bearer ${queuedToken}`;
          return api(originalRequest);
        }

        isRefreshing = true;
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
        const { access } = response.data;
        setAccessToken(access);
        flushRefreshWaiters(null, access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        flushRefreshWaiters(refreshError, null);
        clearAuthSession();
        if (window.location.pathname !== '/') {
          window.location.assign('/');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
