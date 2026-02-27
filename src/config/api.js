const DEFAULT_REMOTE_API = "https://smartfood-checker-1.onrender.com";
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_REMOTE_API;
const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const resolvedBaseUrl =
  !isLocalHost && /localhost|127\.0\.0\.1/.test(rawBaseUrl) ? DEFAULT_REMOTE_API : rawBaseUrl;

export const API_BASE_URL = resolvedBaseUrl.replace(/\/+$/, "");

export const apiUrl = (path) => {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${safePath}`;
};
