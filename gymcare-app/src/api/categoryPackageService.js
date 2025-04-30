import axios from "axios";
import { API_BASE } from "../constants/config";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const categoryPackageService = {
  fetchCategoryPackages: async () => {
    try {
      const response = await api.get("/category-packages/");
      return response.data; 
    } catch (error) {
      console.error("Lỗi khi lấy danh mục gói tập:", error);
      throw new Error("Không thể lấy danh mục gói tập");
    }
  },

  getPackagesByCategory: async (categoryId, page = 1, pageSize = 5) => {
    try {
      const response = await api.get(`/category-packages/${categoryId}/packages/`, {
        params: { page, page_size: pageSize },
      });
      return response; 
    } catch (error) {
      console.error("Lỗi khi lấy gói tập theo danh mục:", error);
      throw new Error(error.response?.data?.detail || "Không thể lấy gói tập");
    }
  },
};

export default categoryPackageService;
