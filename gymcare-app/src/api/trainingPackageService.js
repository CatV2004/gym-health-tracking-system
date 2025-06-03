import axios from "axios";
import { API_BASE } from "../constants/config";

export const fetchTrainingPackages = async (filters = {}, page = 1) => {
  try {
    const params = { page }; 

    if (filters.pt_id) params.pt_id = filters.pt_id;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.type_package_id) params.type_package_id = filters.type_package_id;

    const response = await axios.get(`${API_BASE}/training-package/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchTypePackages = async () => {
  try {
    const response = await axios.get(`${API_BASE}/type-packages/`);
    return response.data; 
  } catch (error) {
    console.error("Lỗi khi lấy danh sách type packages:", error);
    throw error;
  }
};