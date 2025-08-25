import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/',
  withCredentials: true,
  withXSRFToken: true,
});

// Request interceptor to add the auth token to every request
axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token'); // Use the same key you set during login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Response interceptor to handle common errors
axiosClient.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      // Optionally redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosClient;