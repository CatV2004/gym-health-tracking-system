import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./NotificationItem.styles";

const NotificationItem = ({ notification, onPress }) => {
  const isUnread = !notification.is_read;

  const renderIcon = () => {
    switch (notification.notification_type_display) {
      case "Promotion":
        return <Ionicons name="pricetags-outline" size={24} color="#FF7A00" />;
      case "System":
        return <Ionicons name="alert-circle-outline" size={24} color="#007AFF" />;
      default:
        return <Ionicons name="notifications-outline" size={24} color="#888" />;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isUnread && styles.unreadBorder,
      ]}
    >
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <View style={styles.content}>
        <Text style={[styles.message, isUnread && styles.unreadText]}>
          {notification.message}
        </Text>
        <Text style={styles.time}>
          {new Date(notification.sent_at).toLocaleString()}
        </Text>
      </View>
      {notification.related_object?.image_url && (
        <Image
          source={{ uri: notification.related_object.image_url }}
          style={styles.image}
        />
      )}
    </TouchableOpacity>
  );
};

export default NotificationItem;
