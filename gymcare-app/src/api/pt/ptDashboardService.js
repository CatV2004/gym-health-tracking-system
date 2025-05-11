import axios from 'axios';
import { API_BASE } from '../../constants/config';

const API_URL = `${API_BASE}/pt-dashboard/`;

export const getPTDashboard = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch PT Dashboard:', error);
    throw error;
  }
};
