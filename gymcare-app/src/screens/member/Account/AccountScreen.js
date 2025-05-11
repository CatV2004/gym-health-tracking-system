import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { getCurrentUser, logout } from "../../../store/authSlice";
import styles from "./AccountScreen.styles";
import MenuItem from "../../../components/account/MenuItem";
import menuConfig from "../../../utils/profileMenuConfig";
import { updateAvatar } from "../../../api/userApi";
import { launchImageLibrary } from "../../../utils/ImagePickerUtil";
import Icon from 'react-native-vector-icons/Feather';

const AccountScreen = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const navigation = useNavigation();
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch();
  const DEFAULT_AVATAR =
    "https://res.cloudinary.com/dohsfqs6d/image/upload/v1742786537/gymcare/user.png";

  // useEffect(() => {
  //   if (accessToken && !user) {
  //     dispatch(getCurrentUser());
  //   }
  // }, [accessToken, user]);

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", onPress: () => dispatch(logout()) },
    ]);
  };

  const handleAvatarChange = async () => {
    try {
      if (!status?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            "Yêu cầu quyền",
            "Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh đại diện."
          );
          return;
        }
      }

      const result = await launchImageLibrary();
      if (!result) return;
      setIsUploading(true);
      const formData = new FormData();
      formData.append("avatar", {
        uri: result,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      await updateAvatar(formData, accessToken);

      Alert.alert("Thành công", "Đổi ảnh đại diện thành công!");
      dispatch(getCurrentUser());
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Lỗi", error.message || "Không thể đổi ảnh đại diện.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarChange}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={handleAvatarChange}
              disabled={isUploading} // ⛔ không cho nhấn khi đang upload
            >
              <Image
                source={{ uri: user?.avatar || DEFAULT_AVATAR }}
                style={styles.avatar}
              />
              <View style={styles.avatarOverlay}>
                {isUploading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <Icon name="camera" size={24} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <View>
          <Text style={styles.name}>{`${user?.first_name || ""} ${
            user?.last_name || ""
          }`}</Text>
          <Text
            style={styles.editProfile}
            onPress={() => navigation.navigate("EditProfile")}
          >
            Hồ sơ ➔
          </Text>
        </View>
      </View>

      <ScrollView style={styles.menu}>
        {menuConfig(navigation, handleLogout, user).map((item, index) => (
          <MenuItem key={index} label={item.label} onPress={item.onPress} />
        ))}
      </ScrollView>
    </View>
  );
};

export default AccountScreen;
