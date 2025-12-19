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
      // Log the error for debugging
      console.error("AxiosClient - 401 Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      
      // Check if it's a role-based access issue (403 would be better, but some backends return 401)
      const errorMessage = error.response?.data?.message || "";
      const url = error.config?.url || "";
      
      // Don't redirect for /api/users endpoint - let component handle it
      // This gives us time to see the logs
      if (url.includes("/api/users") || 
          url.includes("/api/technicians") || 
          url.includes("/api/appointments/all")) {
        console.warn("AxiosClient - 401 on admin endpoint, letting component handle it");
        // Don't redirect, let component show error
        return Promise.reject(error);
      }
      
      // Only redirect to login if it's a real authentication error, not authorization
      // If error message contains "role" or "admin", it might be an authorization issue
      if (!errorMessage.toLowerCase().includes("role") && 
          !errorMessage.toLowerCase().includes("admin") &&
          !errorMessage.toLowerCase().includes("access denied")) {
        // Real authentication error - token expired or invalid
        console.warn("AxiosClient - Redirecting to login due to authentication error");
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 1000); // Wait 1 second to see logs
      } else {
        console.warn("AxiosClient - 401 but looks like authorization issue, not redirecting");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

