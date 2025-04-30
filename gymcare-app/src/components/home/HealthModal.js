import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchMemberHealth } from "../../store/memberSlice";
import { SafeAreaView } from "react-native-safe-area-context"; 

const HealthModal = ({ visible, onClose, onEdit, onContinue }) => {
  const dispatch = useDispatch();
  const { health, loading, error } = useSelector((state) => state.member);

  useEffect(() => {
    if (visible) {
      dispatch(fetchMemberHealth());
    }
  }, [visible, dispatch]);

  const handleConfirm = () => {
    if (health.height!==null || health.weight!==null || health.goal!==null) {
      onClose();
      onContinue();
    }
    else{
      Alert.alert(
        "Thiếu thông tin sức khỏe",
        "Vui lòng cập nhật chiều cao, cân nặng và mục tiêu trước khi tiếp tục."
      );
    }
    
  };

  const handleCloseModal = () => {
    onClose(); 
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <SafeAreaView style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thông tin sức khỏe</Text>
              {health ? (
                <View>
                  <Text>Chiều cao: {health.height}</Text>
                  <Text>Cân nặng: {health.weight}</Text>
                  <Text>Mục tiêu: {health.goal}</Text>
                </View>
              ) : (
                <Text>Không có thông tin sức khỏe.</Text>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                  <Text style={styles.buttonText}>Tiếp tục</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onEdit}>
                  <Text style={styles.buttonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Tạo nền đen phủ toàn màn hình, bao gồm thanh trạng thái
    position: "absolute", // Đảm bảo modal phủ lên toàn bộ màn hình
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#ef440ee8",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default HealthModal;
