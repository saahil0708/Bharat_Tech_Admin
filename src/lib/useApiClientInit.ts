import { useEffect } from 'react';
import { initializeApiClient } from './apiClient';

/**
 * Hook to initialize the API client on app mount
 * Determines which server (localhost or production) is available
 */
export const useApiClientInit = () => {
  useEffect(() => {
    const init = async () => {
      try {
        const apiUrl = await initializeApiClient();
        console.log('API client initialized with server:', apiUrl);
      } catch (error) {
        console.error('Failed to initialize API client:', error);
      }
    };

    init();
  }, []);
};
