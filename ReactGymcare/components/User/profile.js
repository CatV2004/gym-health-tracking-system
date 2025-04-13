import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { LogoutAction } from "../../redux/actions/authActions";
import styles from "./styles/ProfileScreen.styles";



const Profile = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", onPress: () => dispatch(LogoutAction()) },
    ]);
  };

  const renderItem = (label, onPress) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.itemText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            user?.avatar
              ? { uri: user.avatar}
              : { uri: "https://res.cloudinary.com/dohsfqs6d/image/upload/v1742786537/gymcare/user.png" }          }
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{`${user?.first_name || ""} ${user?.last_name || ""}`}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
            <Text style={styles.editProfile}>Hồ sơ ➔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.menu}>
        {renderItem("Chương trình giới thiệu bạn", () => {})}
        {renderItem("Ưu đãi", () => navigation.navigate("Promotions"))}
        {renderItem("Hướng dẫn sử dụng", () => {})}
        {renderItem("Liên hệ", () => navigation.navigate("Contact"))}
        {renderItem("Hợp đồng", () => {})}
        {renderItem("Lịch sử chăm sóc khách hàng", () => {})}
        {renderItem("Cài đặt đăng nhập", () => {})}
        {renderItem("Bổ sung hồ sơ", () => {})}
        {renderItem("Đổi ngôn ngữ", () => {})}
        {renderItem("Thay mật khẩu", () => navigation.navigate("ChangePassword"))}
        {renderItem("Vô hiệu hóa tài khoản", () => {})}
        {renderItem("Đăng xuất", handleLogout)}
      </ScrollView>
    </View>
  );
};

export default Profile;
