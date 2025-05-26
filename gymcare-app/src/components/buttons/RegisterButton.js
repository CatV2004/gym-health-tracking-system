import React, { useCallback, useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import HealthModal from "../../components/home/HealthModal";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import SubscribePackageModal from "../home/package/SubscribePackageModal";
// import { fetchMemberHealth } from "../../store/memberSlice";

const RegisterButton = ({ trainingPackage }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);

  // const dispatch = useDispatch();
  const navigation = useNavigation();
  const { accessToken } = useSelector((state) => state.auth);
  const { health } = useSelector((state) => state.member);

  const handlePress = () => {
    if (!accessToken) {
      navigation.navigate("Auth", { screen: "Login" });
    } else {
      setIsModalVisible(true);
      // dispatch(fetchMemberHealth());
    }
  };
  
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleEditHealth = () => {
    navigation.navigate("UpdateHealth");
    // console.log("Chỉnh sửa thông tin sức khỏe.");
    // handleCloseModal();
  };

  const handleOpenRegisterModal = () => {
    setIsRegisterModalVisible(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Đăng ký gói tập</Text>
      </TouchableOpacity>

      <HealthModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onEdit={handleEditHealth}
        onContinue={handleOpenRegisterModal}
      />

      <SubscribePackageModal
        visible={isRegisterModalVisible}
        onClose={handleCloseRegisterModal}
        trainingPackage={trainingPackage}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ef440ee8",
    padding: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterButton;
