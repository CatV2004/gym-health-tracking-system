import axios from "axios";
import { API_BASE } from "../../constants/config";

export const uploadPaymentReceipt = (paymentId, formData, token) => {
  return axios.patch(
    `${API_BASE}/api/payments/${paymentId}/upload-receipt/`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
