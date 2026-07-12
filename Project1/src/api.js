const API_BASE_URL = (
  import.meta.env.PROD
    ? ""
    : import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/$/, "");

export const apiUrl = path => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const apiRequest = async (path, options) => {
  const res = await fetch(apiUrl(path), options);
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      text.trim().startsWith("<!doctype html")
        ? "API route is returning the website instead of the server. Please redeploy the Vercel API configuration."
        : text || "Server returned an empty response."
    );
  }

  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};
