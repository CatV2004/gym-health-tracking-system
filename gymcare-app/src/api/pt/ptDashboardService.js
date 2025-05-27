import axios from 'axios';
import { API_BASE } from '../../constants/config';


export const getPTDashboard = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/pt-dashboard/`, {
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

export const getTodaySchedules = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/trainer/today-schedules/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch today schedules:', error);
    throw error;
  }
};