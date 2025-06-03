import React, { useEffect, useState } from "react";
import { View, FlatList, Text, RefreshControl, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import NotificationItem from "../../../components/notification/NotificationItem";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../../api/notificationService";
import { Ionicons } from "@expo/vector-icons";

const NotificationsScreen = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications(1, accessToken);
      setNotifications(data.results);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(accessToken);
      loadNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleItemPress = async (item) => {
    if (!item.is_read) {
      await markNotificationAsRead(item.id, accessToken);
      loadNotifications();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", paddingTop: 40, padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Thông báo</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Ionicons name="checkmark-done-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={() => handleItemPress(item)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />
        }
        ListEmptyComponent={<Text>Không có thông báo nào.</Text>}
      />
    </View>
  );
};

export default NotificationsScreen;
