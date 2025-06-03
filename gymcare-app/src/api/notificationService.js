import { API_BASE } from '../constants/config';

const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response;
};

export const fetchNotifications = async (page = 1, token) => {
  try {
    const response = await handleApiError(
      await fetch(`${API_BASE}/notifications/?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    );
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.status, error.message);
    throw error;
  }
};

export const fetchUnreadNotificationCount = async (token) => {
  try {
    const data = await fetchNotifications(1, token);
    const unreadCount = data.results.filter(item => !item.is_read).length;
    return unreadCount;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};


export const markNotificationAsRead = async (notificationId, token) => {
  try {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}/mark_as_read/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (token) => {
  try {
    const response = await fetch(`${API_BASE}/notifications/mark_all_as_read/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};