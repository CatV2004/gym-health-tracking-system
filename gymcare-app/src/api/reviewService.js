// services/reviewService.js
import axios from "axios";
import { API_BASE } from "../constants/config";

/**
 * Gửi đánh giá cho gói tập
 * @param {number} trainingPackageId
 * @param {Object} payload - { comment: string, rating: number }
 * @param {string} token - Bearer token
 */
export const reviewTrainingPackage = async (trainingPackageId, payload, token) => {
  try {
    const response = await axios.post(
      `${API_BASE}/reviews/`,
      {
        training_package: trainingPackageId,
        gym_feedback: false,
        ...payload,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error reviewing training package:", error);
    throw error;
  }
};

/**
 * Gửi đánh giá cho HLV
 * @param {number} trainerId
 * @param {Object} payload - { comment: string, rating: number }
 * @param {string} token
 */
export const reviewTrainer = async (trainerId, payload, token) => {
  try {
    const response = await axios.post(
      `${API_BASE}/reviews/`,
      {
        trainer: trainerId,
        gym_feedback: false,
        ...payload,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error reviewing trainer:", error);
    throw error;
  }
};

/**
 * Gửi đánh giá cho phòng gym
 * @param {Object} payload - { comment: string, rating: number }
 * @param {string} token
 */
export const reviewGym = async (payload, token) => {
  try {
    const response = await axios.post(
      `${API_BASE}/reviews/`,
      {
        gym_feedback: true,
        ...payload,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error reviewing gym:", error);
    throw error;
  }
  
};

/**
 * Lấy danh sách đánh giá phòng gym
 * @param {number} [page=1] - Trang hiện tại (mặc định là 1)
 * @param {number} [size=5] - Số lượng đánh giá mỗi trang (mặc định là 5)
 * @returns {Promise<Object>} Dữ liệu phản hồi từ API bao gồm: count, next, previous, results
 * @throws {Error} Nếu xảy ra lỗi khi gọi API
 */
export const fetchGymReviews = async (page = 1, size = 5) => {
  try {
    const response = await axios.get(`${API_BASE}/reviews/gym-feedbacks/?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching gym reviews:", error);
    throw error;
  }
};
