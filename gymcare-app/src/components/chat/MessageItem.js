import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Easing,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";

const MessageItem = ({
  message,
  isCurrentUser,
  otherUserAvatar,
  currentUserAvatar,
  showSeenStatus,
}) => {
  const [statusAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.elastic(1)),
        useNativeDriver: true,
      }),
      Animated.timing(statusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        delay: 200,
      }),
    ]).start();
  }, []);

  const renderStatus = () => {
    if (!isCurrentUser) return null;

    let iconName = "check";
    let iconColor = colors.textSecondary;
    let doubleCheck = false;

    if (message.status === "sent") {
      iconName = "check";
      iconColor = colors.primary;
      doubleCheck = message.seen;
    } else if (message.status === "sending") {
      iconName = "access-time";
      iconColor = colors.textSecondary;
    }

    return (
      <Animated.View style={{ opacity: statusAnim, flexDirection: "row" }}>
        <MaterialIcons
          name={iconName}
          size={14}
          color={iconColor}
          style={styles.statusIcon}
        />
        {doubleCheck && (
          <MaterialIcons
            name={iconName}
            size={14}
            color={iconColor}
            style={styles.statusIcon}
          />
        )}
      </Animated.View>
    );
  };

  const bubbleStyle = isCurrentUser
    ? styles.currentUserBubble
    : styles.otherUserBubble;
  const textStyle = isCurrentUser
    ? styles.currentUserText
    : styles.otherUserText;
  const avatarSource = isCurrentUser
    ? {
        uri:
          currentUserAvatar ||
          "https://res.cloudinary.com/dohsfqs6d/image/upload/v1742786537/gymcare/user.png",
      }
    : {
        uri:
          otherUserAvatar ||
          "https://res.cloudinary.com/dohsfqs6d/image/upload/v1742786537/gymcare/user.png",
      };

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
        {
          transform: [
            {
              scale: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      {!isCurrentUser && <Image source={avatarSource} style={styles.avatar} />}

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.bubble, bubbleStyle]}
      >
        {!isCurrentUser && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <Text style={textStyle}>{message.text}</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {renderStatus()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 8,
    maxWidth: "80%",
  },
  currentUserContainer: {
    alignSelf: "flex-end",
  },
  otherUserContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  currentUserText: {
    color: "#fff",
    fontSize: 15,
  },
  otherUserText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  timeText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 4,
  },
  senderName: {
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
    fontSize: 13,
  },
  statusIcon: {
    marginLeft: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
});

export default MessageItem;
