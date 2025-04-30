import axios from 'axios';
import { API_BASE } from "../constants/config";

export const updatePassword = async (currentPassword, newPassword, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/user/change-password/`,
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.message) {
      return { success: true, message: response.data.message };
    }

    if (response.data?.current_password) {
      return { success: false, error: response.data.current_password[0] };
    }

    return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại.' };
  } catch (error) {
    if (error.response) {
      return { success: false, error: error.response.data?.current_password ? error.response.data.current_password[0] : 'Đã xảy ra lỗi khi thay đổi mật khẩu.' };
    }
    return { success: false, error: 'Không thể kết nối đến server.' };
  }
};

export const updateAvatar = async (imageUrl, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/user/update/`,
      { image: imageUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Cập nhật avatar thất bại." };
  }
};


export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/user/all-users/`, {
      headers:{
        Authorization: `Bearer ${token}`
      }
  });
  // console.log("response.data.results: ", response.data.results)
  return {
    success: true,
    data: response.data.results,
    count: response.data.count,
    next: response.data.next,
  };
  }
  catch (error) {
    return {
      success: false,
      error: error.response?.data || 'Không thể lấy danh sách người dùng.',
    }
  }
}

export const getUserById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE}/user/get-user/`, {
      params: { id },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { 
      success: true, 
      user: response.data
    }
  }
  catch (error) {
    return {
      success: false,
      error: error.response?.data || `Không thể lấy chi tiết người dùng ${id}`,
    }
  }
}