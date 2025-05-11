import axios from "axios";
import { API_BASE, CLIENT_ID, CLIENT_SECRET } from "../constants/config";

// Đăng nhập
export const login = (credentials) => {
  return axios.post(`${API_BASE}/o/token/`, {
    ...credentials,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "password",
  });
};

// Đăng ký
export const register = (userData) => {
  return axios.post(`${API_BASE}/member/`, userData);
};

// Lấy thông tin user
export const fetchCurrentUser = (token) => {
  return axios.get(`${API_BASE}/user/current/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
