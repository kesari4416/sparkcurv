import axios from 'axios';

// Empty by default: the API is served from the same origin under /api
// (nginx in production, the rewrite in next.config.ts in development).
export const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');

// Auth is an httpOnly cookie set by the backend, so no token is handled in JS.
export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

// Uploaded images are stored as relative "/api/images/<id>" paths so they survive
// host changes. Prefix them only when the API lives on another host.
export const assetUrl = (url) => (url && url.startsWith('/api/') ? `${BACKEND_URL}${url}` : url || '');

// FastAPI returns `detail` as a string, or as an array of objects for 422s.
// Always reduce it to a string so it is safe to render.
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((d) => {
        const field = Array.isArray(d?.loc) ? d.loc[d.loc.length - 1] : '';
        return field && field !== 'body' ? `${field}: ${d.msg}` : d?.msg;
      })
      .filter(Boolean)
      .join('. ');
  }
  if (err?.response?.status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
  if (!err?.response) return 'Network error. Check your connection and try again.';
  return fallback;
};
