import axios from "axios";
import { API_BASE } from "../constants/config";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTrainers = async (page = 1) => {
  try {
    const response = await axios.get(`${API_BASE}/trainer/`, {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trainers:', error);
    throw error;
  }
};

const trainerService = {

  getTrainerById: async (trainerId) => {
    try {
      const response = await api.get(
        `/trainer/${trainerId}/`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin PT", error);
      throw new Error(error.response?.data?.detail || "Không thể lấy thông tin PT");
    }
  },
};

export default trainerService;
