import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { updatePassword } from "../../../../api/userApi";
import { useSelector } from "react-redux";
import styles from "./ChangePasswordScreen.style";

const ChangePasswordScreen = ({navigation}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const {accessToken} = useSelector((state) => state.auth);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword(currentPassword, newPassword, accessToken);

      if (result.success) {
        Alert.alert("Thành công", result.message, [
          {
            text: "OK", 
            onPress: () => navigation.navigate("Main") 
          }
        ]);

      } else {
        Alert.alert("Lỗi", result.error);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.error || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi mật khẩu</Text>

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
        {loading ? (
          <Text style={styles.buttonText}>Đang xử lý...</Text>
        ) : (
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};


export default ChangePasswordScreen;
