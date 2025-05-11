import axios from "axios";
import { API_BASE } from "../constants/config";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const packageService = {
  fetchPackages: async (page = 1) => {
    try {
      const response = await api.get("/training-package/", {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói tập:", error);
      throw new Error("Không thể lấy danh sách gói tập");
    }
  },

  getDetailPackage: async (packageId) => {
    try {
      const response = await api.get(
        `/training-package/${packageId}/`
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy gói chi tiết gói tập", error);
      throw new Error(error.response?.data?.detail || "Không thể lấy gói tập");
    }
  },
};

export default packageService;
