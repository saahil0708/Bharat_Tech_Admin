// API Client with fallback support for localhost and production server

const LOCAL_API_URL = import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:5000';
const PROD_API_URL = import.meta.env.VITE_API_BASE_URL_PROD || 'https://bharat-tech-admin.onrender.com';

// Function to get the API base URL with fallback
export const getApiBaseUrl = async (forceRefresh = false): Promise<string> => {
  // Use cached URL if available and not forcing refresh
  if (cachedApiUrl && !forceRefresh) {
    return cachedApiUrl;
  }

  try {
    // Try production server first as requested
    const prodResponse = await fetch(`${PROD_API_URL}/`, { 
      method: 'GET',
      signal: AbortSignal.timeout(30000) // 30 second timeout for Render cold start
    });
    if (prodResponse.ok) {
      console.log('Using production API server:', PROD_API_URL);
      cachedApiUrl = PROD_API_URL;
      return PROD_API_URL;
    }
  } catch (error) {
    console.log('Production API server not available, trying local...');
  }

  try {
    // Fallback to local server
    const localResponse = await fetch(`${LOCAL_API_URL}/`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    if (localResponse.ok) {
      console.log('Using local API server:', LOCAL_API_URL);
      cachedApiUrl = LOCAL_API_URL;
      return LOCAL_API_URL;
    }
  } catch (error) {
    console.log('Local API server not available');
  }

  // Default to production if both fail (will show error when trying to fetch)
  console.warn('No API server available, defaulting to production');
  cachedApiUrl = PROD_API_URL;
  return PROD_API_URL;
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
  const apiUrl = await initializeApiClient(); // Uses cached URL if available
  const { timeout = 60000, ...fetchOptions } = options; // Default to 60s for cold starts + processing
  
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
