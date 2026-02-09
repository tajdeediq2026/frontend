import axios, { AxiosInstance } from 'axios';
import { AllArticles, AllCategories } from '../types/Articles';

// Update BASE_URL to match your backend - remove /api from here
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';

// Create a dedicated axios instance with proper configuration
const createAxiosInstance = (): AxiosInstance => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = {
    baseURL: BASE_URL,
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
    // Add retry configuration
    validateStatus: (status: number) => {
      return status >= 200 && status < 300;
    }
  };

  // Only use https.Agent on the server (Node.js), not in the browser
  if (typeof window === 'undefined') {
    try {
      // Dynamic import for server-side only
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const https = require('https');
      config.httpsAgent = new https.Agent({
        rejectUnauthorized: false // Only for development with self-signed certificates
      });
    } catch {
      // Ignore - running in browser
    }
  }

  return axios.create(config);
};

const apiClient = createAxiosInstance();

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.warn('Request timeout, retrying once...');
      // Retry the request once with a longer timeout
      const config = { ...error.config, timeout: 60000 };
      try {
        return await axios(config);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        throw retryError;
      }
    }
    return Promise.reject(error);
  }
);

export const getArticles = async (): Promise<AllArticles[]> => {
    try {
        console.log('Fetching articles from API...');
        const response = await apiClient.get('/api/Articles');
        console.log(`Successfully fetched ${response.data.length} articles`);
        return response.data;
    } catch (error) {
        console.error('Error fetching articles:', error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout: The API server is taking too long to respond. Please try again.');
            }
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to the API server. Please make sure the backend server is running on port 7065.');
            }
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
            }
            if (error.request) {
                throw new Error('Network Error: Unable to reach the API server. Please check your connection.');
            }
        }
        throw error;
    }
};

export const getCategories = async (): Promise<AllCategories[]> => {
    try {
        console.log('Fetching categories from API...');
        const response = await apiClient.get('/api/Categories');
        console.log(`Successfully fetched ${response.data.length} categories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout: The API server is taking too long to respond. Please try again.');
            }
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to the API server. Please make sure the backend server is running on port 7065.');
            }
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
            }
            if (error.request) {
                throw new Error('Network Error: Unable to reach the API server. Please check your connection.');
            }
        }
        throw error;
    }
};

// Update categoriesApi to use the correct functions
export const categoriesApi = {
  getAll: () => getCategories(),
  getById: async (id: number): Promise<AllCategories | undefined> => {
    try {
      const response = await apiClient.get(`/api/Categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: The API server is taking too long to respond. Please try again.');
      }
      throw error;
    }
  },
};

// Add articlesApi for consistency
export const articlesApi = {
  getAll: () => getArticles(),
  getById: async (id: string): Promise<AllArticles> => {
    try {
      const response = await apiClient.get(`/api/Articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: The API server is taking too long to respond. Please try again.');
      }
      throw error;
    }
  },
  getByCategory: async (categoryId: number): Promise<AllArticles[]> => {
    try {
      const response = await apiClient.get(`/api/Articles/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: The API server is taking too long to respond. Please try again.');
      }
      throw error;
    }
  },
};

// Social Media API
export const socialMediaApi = {
  getAll: async () => {
    try {
      console.log('Fetching social media links from API...');
      const response = await apiClient.get('/api/SocialMedia');
      console.log(`Successfully fetched ${response.data.length} social media links`);
      return response.data;
    } catch (error) {
      console.error('Error fetching social media links:', error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: The API server is taking too long to respond. Please try again.');
      }
      throw error;
    }
  },
  getById: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/SocialMedia/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching social media link:', error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: The API server is taking too long to respond. Please try again.');
      }
      throw error;
    }
  },
};
