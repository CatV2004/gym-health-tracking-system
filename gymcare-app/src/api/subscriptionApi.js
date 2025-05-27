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
    // console.error("Error creating subscription:", error);
    throw error;
  }

};

export const getMemberSubscriptions = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/member-subscriptions/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getMemberSubscriptionsDetail = async (subId, token) => {
  try {
    const response = await axios.get(`${API_BASE}/member-subscriptions/${subId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionsDetail = async (subId, token) => {
  try {
    const response = await axios.get(`${API_BASE}/subscriptions/${subId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getMemberSubscriptionsExpired = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/member-subscriptions/expired/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};




export const submitRating = async (subscriptionId, { rating, review }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/subscriptions/${subscriptionId}/rate/`,
      { rating, review }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};