/**
 * Utility functions for handling image URLs with proper encoding
 */

const FALLBACK_BACKEND_URL = 'https://tajdeediq-001-site1.stempurl.com';

const normalizeBackendImageHost = (url: string): string => {
  return url
    .replace(/^http:\/\/localhost:7065/i, FALLBACK_BACKEND_URL)
    .replace(/^https:\/\/localhost:7065/i, FALLBACK_BACKEND_URL)
    .replace(/^http:\/\/127\.0\.0\.1:7065/i, FALLBACK_BACKEND_URL)
    .replace(/^https:\/\/127\.0\.0\.1:7065/i, FALLBACK_BACKEND_URL);
};

const getBackendUrl = (): string => {
  const rawValue = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  if (!rawValue || /^(undefined|null)$/i.test(rawValue)) {
    return FALLBACK_BACKEND_URL;
  }

  try {
    const parsed = new URL(rawValue);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return FALLBACK_BACKEND_URL;
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return FALLBACK_BACKEND_URL;
  }
};

/**
 * Properly encode image URLs to handle spaces and special characters
 * @param url - The URL to encode (can be relative or absolute)
 * @returns Properly encoded URL
 */
export const encodeImageUrl = (url: string): string => {
  if (!url) return '';

  // Replace local backend host URLs with production backend host.
  url = normalizeBackendImageHost(url);
  
  // If it's a relative path, convert to absolute first
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const backendUrl = getBackendUrl();
    url = `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  try {
    const urlObj = new URL(url);

    // Encode each path segment while preserving slashes.
    const decodedPath = decodeURI(urlObj.pathname);
    urlObj.pathname = decodedPath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return urlObj.toString();
  } catch {
    // Fallback to simple space replacement
    return url.replace(/ /g, '%20');
  }
};

/**
 * Encode only the filename/path part (for relative paths)
 * @param path - Relative path to encode
 * @returns Encoded path
 */
export const encodeImagePath = (path: string): string => {
  if (!path) return '';
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

/**
 * Get full image URL with proper encoding for backend images
 * @param path - Image path (relative or absolute)
 * @returns Properly formatted and encoded URL
 */
export const getImageUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  
  // If already absolute (http/https), encode and return
  if (/^https?:\/\//.test(path)) {
    return encodeImageUrl(path);
  }
  
  // For relative paths, construct and encode the full URL
  const backendUrl = getBackendUrl();
  const fullPath = `${backendUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  
  return encodeImageUrl(fullPath);
};

/**
 * Normalize image path for use with Next.js Image component
 * Handles relative and absolute paths with proper encoding
 * @param imagePath - The image path to normalize
 * @returns Normalized and encoded image URL
 */
export const normalizeImagePath = (imagePath: string): string => {
  return getImageUrl(imagePath) ?? '';
};
