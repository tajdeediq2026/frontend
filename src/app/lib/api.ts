import axios, { AxiosInstance } from 'axios';
import { AllArticles, AllCategories } from '../types/Articles';
import { getBackendBaseUrl } from '@/lib/backend-url';

// Always call the backend directly from both server and browser.
// The backend CORS middleware echoes back any Origin header, so direct browser calls work fine.
// Bypassing the Vercel rewrite proxy avoids 502 errors caused by stempurl.com blocking Vercel IP ranges.
const BASE_URL = getBackendBaseUrl();

// Helper: returns the API path (same format for server and browser, direct calls only)
const apiPath = (path: string): string => path;

// Create a dedicated axios instance with proper configuration
const createAxiosInstance = (): AxiosInstance => {
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
        const response = await apiClient.get(apiPath('/api/Articles'));
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
        const response = await apiClient.get(apiPath('/api/Categories'));
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
      const response = await apiClient.get(apiPath(`/api/Categories/${id}`));
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
      const response = await apiClient.get(apiPath(`/api/Articles/${id}`));
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
      // Call backend directly for both server and browser (no Vercel proxy hop).
      const url = apiPath(`/api/Articles/Category/${categoryId}`);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.warn('Could not fetch articles for category', categoryId, '— returning empty list.', error);
      return [];
    }
  },
  search: async (query: string): Promise<AllArticles[]> => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    try {
      // Try the backend search endpoint first
      const response = await apiClient.get(apiPath(`/api/Articles/Search`), {
        params: { query: trimmed },
      });
      return response.data;
    } catch {
      // Fallback: fetch all articles and filter client-side
      // (works even if backend search endpoint is not deployed yet)
      console.warn('Backend search endpoint unavailable, falling back to client-side search');
      try {
        const allArticles = await getArticles();
        const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').trim() : '';
        return allArticles
          .filter((a) => {
            const title = (a.articleTitle || '').toLowerCase();
            const summary = stripHtml(a.articleSummary || '').toLowerCase();
            const content = stripHtml(a.articleContent || '').toLowerCase();
            return title.includes(trimmed) || summary.includes(trimmed) || content.includes(trimmed);
          })
          .sort((a, b) => {
            // Title matches first
            const aTitle = (a.articleTitle || '').toLowerCase().includes(trimmed) ? 1 : 0;
            const bTitle = (b.articleTitle || '').toLowerCase().includes(trimmed) ? 1 : 0;
            if (bTitle !== aTitle) return bTitle - aTitle;
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
          })
          .slice(0, 20);
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },
  getEditorChoice: async (): Promise<AllArticles[]> => {
    try {
      const response = await apiClient.get(apiPath('/api/Articles/EditorChoice'));
      return response.data;
    } catch {
      // Fallback: fetch all articles and filter client-side
      console.warn('EditorChoice endpoint unavailable, falling back to client-side filtering');
      try {
        const allArticles = await getArticles();
        return allArticles
          .filter(a => a.isPublished && a.editorChoice === true)
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
          .slice(0, 4);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },
};

export const authorArticlesApi = {
  getAll: async (opinionsCategoryId = 11): Promise<AllArticles[]> => {
    const response = await apiClient.get('/api/author-articles', {
      params: { opinionsCategoryId },
    });
    return response.data;
  },
  getById: async (id: string, opinionsCategoryId = 11): Promise<AllArticles> => {
    const response = await apiClient.get(`/api/author-articles/${id}`, {
      params: { opinionsCategoryId },
    });
    return response.data;
  },
};

// Social Media API
export const socialMediaApi = {
  getAll: async () => {
    try {
      console.log('Fetching social media links from API...');
      const response = await apiClient.get(apiPath('/api/SocialMedia'));
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
      const response = await apiClient.get(apiPath(`/api/SocialMedia/${id}`));
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
