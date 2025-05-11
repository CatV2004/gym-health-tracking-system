import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { getAllUsers } from "../../api/userApi";
import { ChatService } from "../../api/chatService";
import colors from "../../constants/colors";

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, accessToken } = useSelector((state) => state.auth);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    // Load danh sách người dùng
    const loadUsers = async () => {
      try {
        const result = await getAllUsers(accessToken);
        if (result.success) {
          // Lọc bỏ user hiện tại
          const filteredUsers = result.data.filter(
            (userOther) => user.id !== userOther.id
          );
          setUsers(filteredUsers);


        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();

    // Hiệu ứng khi mở màn hình
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUserPress = async (userOther) => {
    try {
      // Tạo hoặc lấy chat room
      const { success, chatId } = await ChatService.getOrCreateChatRoom(
        user.id,
        userOther.id
      );

      if (success) {
        navigation.navigate("ChatScreen", {
          chatId,
          otherUser: userOther,
        });
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const renderUserItem = ({ item, index }) => {
    const delay = index * 100;
  
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          transform: [
            { translateX: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30 - index * 3],
            })}
          ]
        }}
      >
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => handleUserPress(item)}
          activeOpacity={0.7}
        >
          <Image
            source={{
              uri:
                item.avatar ||
                "https://res.cloudinary.com/dohsfqs6d/image/upload/v1742786537/gymcare/user.png",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
            {item.first_name || "ADMIN"} {item.last_name}
            </Text>
            <Text style={styles.role}>{getRoleName(item.role)}</Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {typeof error === "object" ? JSON.stringify(error) : error}
        </Text>
      </View>
    );
  }

  const getRoleName = (role) => {
    switch (role) {
      case 0:
        return "Admin";
      case 1:
        return "PT";
      case 2:
        return "Thành viên";
      default:
        return "Unknown";
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Trò chuyện cùng chúng tôi</Text>
      </Animated.View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 30,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  listContent: {
    padding: 15,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "space-between",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 3,
  },
  role: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
  },
});

export default UserListScreen;
