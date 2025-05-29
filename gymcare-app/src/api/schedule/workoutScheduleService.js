import axios from "axios";
import { API_BASE } from "../../constants/config";

export const createWorkoutSchedule = async (data, token) => {
  try {
    const response = await axios.post(`${API_BASE}/workout-schedules/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error creating workout schedule:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const cancelWorkoutSchedule = async (scheduleId, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/workout-schedules/${scheduleId}/cancel/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    // console.error(
    //   `Error canceling workout schedule #${scheduleId}:`,
    //   error.response?.data || error.message
    // );
    throw error;
  }
};

export const getMemberSchedule = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/workout-schedules/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error creating workout schedule:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getChangeRequestsByScheduleId = async (scheduleId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE}/workout-schedules/${scheduleId}/change-requests/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch change requests:", error);
    throw error;
  }
};

export const respondToChangeRequest = async (requestId, response, token) => {
  try {
    const res = await axios.post(
      `${API_BASE}/change-requests/${requestId}/member_response/`,
      { response }, // response: "ACCEPT" || "REJECT"
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res;
  } catch (error) {
    console.error(
      "Error responding to change request:",
      error.response?.data || error.message
    );
    error.userMessage =
      error.response?.data?.detail || "Không thể xử lý yêu cầu";
    throw error;
  }
};

export const getTrainerWorkoutSchedules = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/trainer/workout-schedules/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching trainer's workout schedules:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Create a schedule change request
 * @param {Object} data - Change request data
 * @param {number} data.schedule - Schedule ID
 * @param {string} data.proposed_time - Proposed new time in ISO format
 * @param {string} data.reason - Reason for change
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const createChangeRequest = async (data, token) => {
  try {
    const response = await axios.post(`${API_BASE}/change-requests/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Bearer ${token}: Bearer", { token });
    return response.data;
  } catch (error) {
    console.error(
      "Error creating change request:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Approve a workout schedule as trainer
 * @param {number} scheduleId - ID of the schedule to approve
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const approveWorkoutSchedule = async (scheduleId, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/workout-schedules/${scheduleId}/trainer-approve/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error approving workout schedule:",
      error.response?.data || error.message
    );
    throw error;
  }
};
