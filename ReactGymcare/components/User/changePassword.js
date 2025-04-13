import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import api, { endpoint } from "../../configs/API";
import styles from "./styles/ChangePass.styles";
import { useSelector } from "react-redux";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state) => state.auth); 

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ các trường.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và nhập lại không khớp.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.patch(
        endpoint.changePassword,
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

      setLoading(false);

      if (response.status === 200) {
        Alert.alert("Thành công", "Mật khẩu đã được thay đổi.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra khi thay đổi mật khẩu.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Lỗi từ server:", error.response?.data);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Không thể thay đổi mật khẩu. Vui lòng thử lại.";

      Alert.alert("Lỗi", message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thay đổi mật khẩu</Text>

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu hiện tại"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu mới"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Đang thay đổi..." : "Thay đổi mật khẩu"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePassword;
