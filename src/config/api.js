const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://smartfood-checker-1.onrender.com";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const apiUrl = (path) => {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${safePath}`;
};
