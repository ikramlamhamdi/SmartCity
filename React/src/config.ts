/**
 * Shared API base URL.
 * Override with VITE_API_URL environment variable for production.
 */
export const API_BASE_URL: string =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ??
  'http://127.0.0.1:8000';
