import axios from 'axios';
import { API_BASE } from '../../constants/config';

const API_URL = `${API_BASE}/trainer/my-members/`;

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
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error recording progress:", error);
    throw error;
  }
};

export const getClientProgressHistory = async (clientId, token) => {
  try {
    const response = await axios.get(`${API_URL}${clientId}/get-progress/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching progress history:", error);
    throw error;
  }
};