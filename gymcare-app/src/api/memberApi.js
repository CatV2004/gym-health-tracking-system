import axios from "axios";
import { API_BASE } from "../constants/config";

export const updateHealthInfo = (healthData, token) => {
  return axios.patch(`${API_BASE}/member/health/`, healthData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getHealthInfo = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/member/get-health/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

