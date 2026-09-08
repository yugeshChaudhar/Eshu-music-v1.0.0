/**
 * API configuration helper.
 * Supports configurable remote backend via VITE_API_BASE_URL (for Android APK / remote deployment),
 * while cleanly defaulting to relative paths in standard web browser environments.
 * Strictly avoids hardcoded localhost URLs.
 */

export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}
