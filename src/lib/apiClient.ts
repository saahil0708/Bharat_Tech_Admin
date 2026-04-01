// API Client with fallback support for localhost and production server

const LOCAL_API_URL = import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:5000';
const PROD_API_URL = import.meta.env.VITE_API_BASE_URL_PROD || 'https://bharat-tech-admin.onrender.com';

// Function to get the API base URL with fallback
export const getApiBaseUrl = async (): Promise<string> => {
  try {
    // Try local server first (faster for development)
    const localResponse = await fetch(`${LOCAL_API_URL}/`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    if (localResponse.ok) {
      console.log('Using local API server:', LOCAL_API_URL);
      return LOCAL_API_URL;
    }
  } catch (error) {
    console.log('Local API server not available, trying production...');
  }

  try {
    // Fallback to production server
    const prodResponse = await fetch(`${PROD_API_URL}/`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    if (prodResponse.ok) {
      console.log('Using production API server:', PROD_API_URL);
      return PROD_API_URL;
    }
  } catch (error) {
    console.log('Production API server not available');
  }

  // Default to local if both fail (will show error when trying to fetch)
  console.warn('No API server available, defaulting to local');
  return LOCAL_API_URL;
};

// Cached API URL to avoid repeated availability checks
let cachedApiUrl: string | null = null;

export const initializeApiClient = async () => {
  if (!cachedApiUrl) {
    cachedApiUrl = await getApiBaseUrl();
  }
  return cachedApiUrl;
};

// Get cached or default API URL
export const getApi = () => cachedApiUrl || LOCAL_API_URL;

// API request wrapper
interface FetchOptions extends RequestInit {
  timeout?: number;
}

export const apiFetch = async (
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const apiUrl = await getApiBaseUrl();
  const { timeout = 10000, ...fetchOptions } = options;
  
  const url = `${apiUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: AbortSignal.timeout(timeout)
    });
    return response;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

// Specialized functions for common operations
export const apiGet = (endpoint: string) =>
  apiFetch(endpoint, { method: 'GET' });

export const apiPost = (endpoint: string, data: Record<string, any>) =>
  apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

export const apiPut = (endpoint: string, data: Record<string, any>) =>
  apiFetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

export const apiDelete = (endpoint: string) =>
  apiFetch(endpoint, { method: 'DELETE' });
