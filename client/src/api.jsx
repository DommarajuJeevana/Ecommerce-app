import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://ecommerce-app-otze.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handling — auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// The backend stores uploaded images (products, avatars) as paths like
// "/uploads/xxx.jpg", relative to the API server. Since the frontend and
// backend are on different domains in production, those paths need to be
// prefixed with the backend's origin to actually load. Absolute URLs
// (http/https) are left untouched.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "https://ecommerce-app-otze.onrender.com/api").replace(/\/api\/?$/, "");

export const getImageUrl = (path) => {
  if (!path) return "/placeholder.png";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
};

export default api;
