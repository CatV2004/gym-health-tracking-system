import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import PaymentOption from "../../components/payment/PaymentOption";
import PaymentHeader from "../../components/payment/PaymentHeader";
import PaymentStatusModal from "../../components/payment/PaymentStatusModal";
import styles from "./PaymentScreen.styles";

const POLLING_INTERVAL = 3000;
const MAX_POLLING_ATTEMPTS = 20;

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { subscriptionData } = route.params;
  console.log("toltalcost: ", subscriptionData.total_cost);
  console.log("quantity: ", subscriptionData.quantity);

  const accessToken = useSelector((state) => state.auth.accessToken);
  const [loading, setLoading] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    return () => {
      setLoading(false);
      setActivePayment(null);
    };
  }, []);

  const handlePaymentSuccess = () => {
    setPaymentResult({ success: true, message: "Thanh toán thành công!" });
    setShowStatusModal(true);
  };

  const handlePaymentFailure = (errorMessage = "Thanh toán thất bại") => {
    setPaymentResult({ success: false, message: errorMessage });
    setShowStatusModal(true);
  };

  const monitorPaymentStatus = async (paymentId, attempts = 0) => {
    if (attempts >= MAX_POLLING_ATTEMPTS) {
      handlePaymentFailure("Hết thời gian chờ xác nhận thanh toán");
      return;
    }

    try {
      const response = await checkPaymentStatus(paymentId, accessToken);

      if (response.data.payment_status === "COMPLETED") {
        handlePaymentSuccess();
      } else if (response.data.payment_status === "FAILED") {
        handlePaymentFailure(response.data.message || "Thanh toán thất bại");
      } else {
        // Continue polling
        setTimeout(
          () => monitorPaymentStatus(paymentId, attempts + 1),
          POLLING_INTERVAL
        );
      }
    } catch (error) {
      console.error("Payment status check error:", error);
      setTimeout(
        () => monitorPaymentStatus(paymentId, attempts + 1),
        POLLING_INTERVAL
      );
    }
  };

  const handleVNPayPayment = async (paymentUrl) => {
    navigation.navigate("VNPayPayment", {
      subscription: subscriptionData,
    });
  };

  const handleModalClose = () => {
    setShowStatusModal(false);
    if (paymentResult?.success) {
      navigation.navigate("SubscriptionDetail", { refresh: true });
    }
  };

  return (
    <View style={styles.container}>
      <PaymentHeader
        title="Phương thức thanh toán"
        amount={Number(subscriptionData.total_cost)}
      />

      <View style={styles.content}>
        <PaymentOption
          icon="vnpay"
          method="VNPAY"
          description="Thanh toán nhanh qua ứng dụng VNPAY"
          onPress={handleVNPayPayment}
          disabled={loading}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0068FF" />
            <Text style={styles.loadingText}>Đang kết nối với VNPay...</Text>
          </View>
        )}
      </View>

      <PaymentStatusModal
        visible={showStatusModal}
        success={paymentResult?.success}
        message={paymentResult?.message}
        onClose={handleModalClose}
      />
    </View>
  );
};

const enhancedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#0068FF",
    fontSize: 16,
  },
});

export default PaymentScreen;
