import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://3.238.235.255",  // EC2 IP - Nginx handles /api prefix
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token to headers
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 unauthorized
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Check if it's a role-based access issue (403 would be better, but some backends return 401)
      const errorMessage = error.response?.data?.message || "";
      
      // Only redirect to login if it's a real authentication error, not authorization
      // If error message contains "role" or "admin", it might be an authorization issue
      if (!errorMessage.toLowerCase().includes("role") && 
          !errorMessage.toLowerCase().includes("admin") &&
          !errorMessage.toLowerCase().includes("access denied")) {
        // Real authentication error - token expired or invalid
        localStorage.clear();
        window.location.href = "/login";
      }
      // Otherwise, let the component handle the error (don't redirect)
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

