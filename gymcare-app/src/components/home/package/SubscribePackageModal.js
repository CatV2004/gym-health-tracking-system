import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { formatDate } from "../../../utils/dateUtils";
import { useNavigation } from "@react-navigation/native";

const SubscribePackageModal = ({ visible, onClose, trainingPackage }) => {
  const { user } = useSelector((state) => state.auth);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const getLabel = () => {
    switch (trainingPackage?.type_package) {
      case 0:
        return "Tháng";
      case 1:
        return "Quý";
      case 2:
        return "Năm";
      default:
        return "";
    }
  };

  const handleSubmit = () => {
    const parsedQuantity = parseInt(quantity, 10);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số lượng hợp lệ");
      return;
    }

    const registrationData = {
      phone,
      email,
      quantity: parsedQuantity,
      start_date: startDate.toISOString().split("T")[0],
      type_package: trainingPackage?.type_package,
    };

    onClose(); 

    setTimeout(() => {
      navigation.navigate("SubscriptionDetail", {
        registrationData,
        trainingPackage,
      });
    }, 300);
  };

  const handleQuantityChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setQuantity(numericText);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
  };

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: startDate,
      onChange: onChangeDate,
      mode: "date",
      is24Hour: true,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Đăng ký gói tập</Text>

          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder={`Số lượng (${getLabel()})`}
            keyboardType="numeric"
            value={quantity}
            onChangeText={handleQuantityChange}
          />

          <TouchableOpacity style={styles.input} onPress={showDatePicker}>
            <Text>{formatDate(startDate)}</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SubscribePackageModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    backgroundColor: "#ef440e",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancel: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
