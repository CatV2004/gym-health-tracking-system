import axios from "axios";
import { API_BASE } from "../constants/config";

export const createSubscription = async (data, token) => {
  try {
    const response = await axios.post(`${API_BASE}/subscriptions/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating subscription:", error);
  
    throw error;
  }

};

// Gọi đến backend để xác minh VNPay sau khi người dùng thanh toán xong
export const verifyVnPayReturn = async (queryParams) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();

    const response = await axios.get(`${API_BASE}/vnpay-return/?${queryString}`);

    return response.data;
  } catch (error) {
    console.error("VNPay return verification failed:", error);
    throw error;
  }
};
