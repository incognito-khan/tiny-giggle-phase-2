import axios from "axios";

// Axios instance
const apiInstance = axios.create({
  baseURL: `/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token dynamically
apiInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------- Methods --------------------
export const GET = (url, config = {}) => apiInstance.get(url, config);
export const POST = (url, body, config = {}) => apiInstance.post(url, body, config);
export const PUT = (url, body, config = {}) => apiInstance.put(url, body, config);
export const PATCH = (url, body, config = {}) => apiInstance.patch(url, body, config);
export const DELETE = (url, config = {}) => apiInstance.delete(url, config);
