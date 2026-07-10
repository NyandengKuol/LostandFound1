const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:4000")
).replace(/\/$/, "");

export const apiUrl = path => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
