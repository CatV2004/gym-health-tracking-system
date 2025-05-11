import axios from "axios";
import { API_BASE } from "../constants/config";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
