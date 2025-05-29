import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import colors from "../../../constants/colors";

const PaymentResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { success, message, payment, subscription } = route.params || {};

  const handleNavigateHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <View style={styles.container}>
      {success ? (
        <>
          <Icon name="check-circle" size={80} color={colors.success} />
          <Text style={styles.successTitle}>Thanh toán thành công</Text>

          <View style={styles.detailContainer}>
            <Text style={styles.detailText}>
              Số tiền: {payment?.amount?.toLocaleString()} VND
            </Text>
            <Text style={styles.detailText}>
              Mã giao dịch: {payment?.transaction_id || "N/A"}
            </Text>
            {subscription?.training_package?.name && (
              <Text style={styles.detailText}>
                Gói dịch vụ: {subscription.training_package.name}
              </Text>
            )}
          </View>

          <Text style={styles.noteText}>
            {message || "Gói của bạn đã được kích hoạt thành công!"}
          </Text>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleNavigateHome}
          >
            <Text style={styles.homeButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Icon name="times-circle" size={80} color={colors.error} />
          <Text style={styles.errorTitle}>Thanh toán thất bại</Text>

          {message && <Text style={styles.errorMessage}>{message}</Text>}

          <Text style={styles.noteText}>
            Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp diễn.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.actionButtonText}>Thử lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.secondary },
              ]}
              onPress={handleNavigateHome}
            >
              <Text style={styles.actionButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 15,
    color: colors.success,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 15,
    color: colors.error,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 10,
  },
  detailContainer: {
    marginVertical: 15,
    width: "100%",
    paddingHorizontal: 20,
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: "center",
  },
  noteText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  homeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 25,
    minWidth: 200,
  },
  homeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-around",
    width: "100%",
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 120,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});

export default PaymentResultScreen;
