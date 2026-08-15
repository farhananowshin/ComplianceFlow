import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = '/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

// Request Interceptor: Attach JWT Token, User ID & Tenant Header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('complianceflow_token');
    if (token && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (token.startsWith('mock_jwt_token_')) {
        const userId = token.replace('mock_jwt_token_', '').trim();
        if (userId) {
          if (typeof config.headers.set === 'function') {
            config.headers.set('X-User-ID', userId);
          } else {
            config.headers['X-User-ID'] = userId;
          }
        }
      }
    }

    const tenantId = localStorage.getItem('complianceflow_tenant_id');
    if (tenantId && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('X-Tenant-ID', tenantId);
      } else {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Data Unwrapping
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An unexpected server error occurred.';

      // Handle 401 Unauthorized (token expired or invalid)
      if (status === 401 && !window.location.pathname.startsWith('/verify')) {
        localStorage.removeItem('complianceflow_token');
        // Dispatch auth error event for reactive context updates
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Network error. Unable to reach ComplianceFlow servers.'));
    } else {
      return Promise.reject(error);
    }
  }
);

export default apiClient;
