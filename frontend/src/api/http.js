import axios from 'axios'
const API_BASE = import.meta.env.VITE_SERVER_URL;

console.log("url", API_BASE);
export const http = axios.create({
  baseURL: API_BASE,
  timeout: 5000
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    Promise.reject(error);
  }
)