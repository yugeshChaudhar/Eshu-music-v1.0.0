import { Capacitor } from '@capacitor/core';

/**
 * API configuration helper.
 * Supports configurable remote backend via VITE_API_BASE_URL (for Android APK / remote deployment),
 * while cleanly defaulting to relative paths in standard web browser environments.
 * Strictly avoids hardcoded localhost/127.0.0.1 calls on native Android.
 */

let hasLoggedBaseUrl = false;

/**
 * Returns true if running inside native Android Capacitor APK environment.
 */
export function isNativeAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() === 'android' ||
    window.location.protocol.startsWith('capacitor:') ||
    (/Android/i.test(navigator.userAgent) && window.location.origin.includes('localhost'))
  );
}

/**
 * Get configured remote API Base URL (if provided via VITE_API_BASE_URL).
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    if (!hasLoggedBaseUrl) {
      console.log(`[EshuMusic API] Configured remote API base URL: ${clean}`);
      hasLoggedBaseUrl = true;
    }
    return clean;
  }
  if (!hasLoggedBaseUrl) {
    console.log(`[EshuMusic API] No VITE_API_BASE_URL specified. Native Android: ${isNativeAndroid()}`);
    hasLoggedBaseUrl = true;
  }
  return '';
}

/**
 * Checks whether a backend API server is reachable for /api endpoints.
 * Returns false on native Android when VITE_API_BASE_URL is not set, preventing unwanted localhost calls.
 */
export function hasConfiguredBackend(): boolean {
  const base = getApiBaseUrl();
  if (base) return true;
  // In web browsers, the relative /api endpoints are served by Vite/Node/Express/Vercel
  return !isNativeAndroid();
}

/**
 * Constructs an API URL for a given path.
 * In native Android without VITE_API_BASE_URL, returns '' to prevent calling localhost.
 */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (base) {
    return `${base}${cleanPath}`;
  }

  // On native Android APK, relative paths resolve against https://localhost, which has no backend server.
  // Return empty string to prevent native Android from making failed localhost requests.
  if (isNativeAndroid()) {
    console.debug(`[EshuMusic API] Native Android direct mode: skipping local backend call for "${cleanPath}"`);
    return '';
  }

  return cleanPath;
}
