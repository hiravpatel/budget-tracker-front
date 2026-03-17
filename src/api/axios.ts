import axios from 'axios';
import { enqueueRequest } from '../pwa/offlineQueue';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response && error.request) {
      const config = error.config;
      if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        await enqueueRequest({
          url: config.url || '',
          method: config.method || 'post',
          body: config.data,
          headers: config.headers
        });
        return Promise.resolve({ data: { success: true, offline: true } });
      }
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.accessToken;
        
        const state = useAuthStore.getState();
        if (state.user) {
          state.setAuth(state.user, newAccessToken);
        }

        processQueue(null, newAccessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Add auth token to every request
axiosInstance.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  if (state.tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${state.tokens.accessToken}`;
  }
  return config;
});

export default axiosInstance;
