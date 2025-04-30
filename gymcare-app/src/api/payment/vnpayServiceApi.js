import axios from "axios";
import { API_BASE } from "../../constants/config";
import { Linking } from "react-native";

export const createVNPayPayment = async (subscriptionId, token) => {
  const response = await axios.post(
    `${API_BASE}/api/payments/create/`,  
    {
      "subscription_id": subscriptionId,  
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


export const paymentReturn = async (queryParams, token) => {
  try {
    const response = await axios.get(
      `${API_BASE}/api/payments/payment_return/`, 
      {
        params: queryParams, 
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error processing payment return:', error);
    throw error;
  }
};













export const handleVNPayPayment = async (paymentUrl) => {
  try {
    const canOpen = await Linking.canOpenURL(paymentUrl);
    if (canOpen) {
      await Linking.openURL(paymentUrl);
    } else {
      throw new Error("Cannot open VNPay payment link");
    }
  } catch (error) {
    console.error("VNPay payment error:", error);
    throw error;
  }
};


export const updatePaymentStatus = async (paymentId, paymentStatus, token) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/payments/update_status/`, 
      {
        "payment_id": paymentId,
        "payment_status": paymentStatus, 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; 
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error; 
  }
};





