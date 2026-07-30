import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from './tokenService';
import { authService } from './authService';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Request Interceptor: Attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and Token Refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle token expiration specifically
    const isTokenNotValid = error.response?.status === 401 && (error.response?.data as any)?.code === 'token_not_valid';

    if ((error.response?.status === 401 || isTokenNotValid) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await authService.refreshToken();

      if (newAccessToken) {
        // Retry the original request with the new access token
        if (!originalRequest.headers) {
          originalRequest.headers = {} as any;
        }
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } else {
        // If refresh failed or returned invalid token, logout user
        authService.logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
