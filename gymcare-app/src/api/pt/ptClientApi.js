import axios from "axios";
import { API_BASE } from "../../constants/config";

const API_URL = `${API_BASE}/trainer/my-members/`;

export const getClientPrediction = async (clientId, token) => {
  try {
    const response = await axios.get(`${API_BASE}/get-latest-prediction/`, {
      params: { member_id: clientId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to get prediction");
  }
};

export const createAIPrediction = async (clientId, token) => {
  const response = await fetch(`${API_BASE}/train-model/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ member_id: clientId }),
  });

  if (!response.ok) {
    throw new Error("Failed to get prediction");
  }

  return await response.json();
};

export const getClientDetail = async (clientId, token) => {
  try {
    const response = await axios.get(`${API_URL}${clientId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching client detail:", error);
    throw error;
  }
};

export const recordClientProgress = async (clientId, progressData, token) => {
  try {
    const response = await axios.post(
      `${API_URL}${clientId}/progress/`,
      progressData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error recording progress:", error);
    throw error;
  }
};

export const getClientProgressHistory = async (clientId, token, page = 1) => {
  try {
    const response = await axios.get(
      `${API_URL}${clientId}/get-progress/?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching progress history:", error);
    throw error;
  }
};
