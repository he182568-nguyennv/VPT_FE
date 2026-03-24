import axios from "axios";
import { API_URL } from "../config";
const axiosClient = axios.create({
  baseURL: `${API_URL}`,
  responseType: "json",
  timeout: 60 * 1000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default axiosClient;
