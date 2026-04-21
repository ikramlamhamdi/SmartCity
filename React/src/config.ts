/// <reference types="vite/client" />

/**
 * Shared API base URL.
 * Override with VITE_API_URL environment variable for production.
 */
export const API_BASE_URL: string =
  import.meta.env['VITE_API_URL'] ?? 'http://127.0.0.1:8000';
