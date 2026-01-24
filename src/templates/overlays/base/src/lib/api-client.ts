/**
 * API Client - Centralized HTTP client following bulletproof-react patterns
 * Replace with your actual API configuration
 */

export type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
};

export type ApiResponse<T> = {
  data: T;
  status: number;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(endpoint, API_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  
  return url.toString();
}

/**
 * Get authorization headers (customize based on your auth strategy)
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  
  return {};
}

/**
 * Main API client function
 */
export async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, params } = config;

  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return {
    data,
    status: response.status,
  };
}

/**
 * Convenience methods
 */
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean>) =>
    apiClient<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};

