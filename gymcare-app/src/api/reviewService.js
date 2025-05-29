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
  // try {
  //   const response = await axios.post(
  //     `${API_BASE}/reviews/`,
  //     {
  //       gym_feedback: true,
  //       ...payload,
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );
  //   return response.data;
  // } catch (error) {
  //   console.error("Error reviewing gym:", error);
  //   throw error;
  // }
  try {
    const fullPayload = {
      gym_feedback: true,
      ...payload,
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log("Review payload:", fullPayload);
    console.log("Headers:", headers);

    const response = await axios.post(
      `${API_BASE}/reviews/`,
      fullPayload,
      {
        headers: headers,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error reviewing gym:", error.response?.data || error.message);
    throw error;
  }
};
