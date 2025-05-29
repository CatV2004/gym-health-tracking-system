import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  BackHandler,
} from "react-native";
import { WebView } from "react-native-webview";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  createVNPayPayment,
  paymentReturn,
} from "../../../../api/payment/vnpayServiceApi";
import colors from "../../../../constants/colors";
import { useSelector } from "react-redux";
import styles from "./VNPayPaymentScreen.styles";
import { getVnpayResponseMessage } from "../../../../utils/vnpayMessages";
import generateAndUploadReceipt from "../../../../utils/generateAndUploadReceipt";

const VNPayPaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { subscription } = route.params;
  const token = useSelector((state) => state.auth.accessToken);

  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const webViewRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Khởi tạo thanh toán
  useEffect(() => {
    if (!subscription?.id || !token) return;

    let isCancelled = false;

    const initializePayment = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await createVNPayPayment(subscription.id, token);

        if (response.payment_url && !isCancelled) {
          setPaymentUrl(response.payment_url);
        } else {
          throw new Error("Không nhận được URL thanh toán từ server");
        }
      } catch (error) {
        console.error("Payment initialization failed:", error);
        setError(
          error.response?.data?.error || "Không thể khởi tạo thanh toán"
        );
        Alert.alert(
          "Lỗi",
          error.response?.data?.error || "Không thể khởi tạo thanh toán",
          [{ text: "Quay lại", onPress: () => navigation.goBack() }]
        );
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    initializePayment();

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton
    );

    return () => {
      isCancelled = true;
      backHandler.remove();
    };
  }, [subscription?.id, token, navigation]);

  // Xử lý khi URL thay đổi
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    if (!url || isProcessing) return;

    if (
      url.includes("/api/") &&
      !url.includes("/api/payments/payment_return/")
    ) {
      setLoading(true);
      return;
    }

    // Kiểm tra URL return của VNPay
    if (url.includes("/api/payments/payment_return/")) {
      setLoading(true);
      handlePaymentReturn(url);
    }
  };

  // Xử lý khi nhận được URL return từ VNPay
  const handlePaymentReturn = async (url) => {
    try {
      setIsProcessing(true);
      webViewRef.current?.stopLoading();

      // Trích xuất thông tin từ URL
      const urlObj = new URL(url);
      const queryParams = Object.fromEntries(urlObj.searchParams.entries());

      // Xử lý kết quả thanh toán
      await processPaymentResult(queryParams);
    } catch (error) {
      console.error("Payment processing error:", error);
      handlePaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý nút back
  const handleBackButton = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn hủy giao dịch thanh toán?", [
      { text: "Tiếp tục thanh toán", style: "cancel" },
      {
        text: "Hủy",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "PaymentResult",
                params: {
                  success: false,
                  message: "Bạn đã hủy giao dịch thanh toán",
                },
              },
            ],
          });
        },
      },
    ]);
    return true;
  };

  // Xử lý kết quả thanh toán
  const processPaymentResult = async (queryParams) => {
    if (queryParams.vnp_ResponseCode === "00") {
      try {
        const result = await paymentReturn(queryParams, token);
        if (result.status === "success") {
          const paymentData = {
            id: result.order_id,
            amount: queryParams.vnp_Amount
              ? parseInt(queryParams.vnp_Amount) / 100
              : 0,
            transaction_id: queryParams.vnp_TransactionNo || "N/A",
            bank_code: queryParams.vnp_BankCode || "N/A",
            bank_trans_no: queryParams.vnp_BankTranNo || "N/A",
            pay_date: queryParams.vnp_PayDate || "N/A",
          };

          try {
            await generateAndUploadReceipt(paymentData, subscription, token);
          } catch (receiptError) {
            console.error("Receipt generation failed:", receiptError);
          }

          navigation.reset({
            index: 0,
            routes: [
              {
                name: "PaymentResult",
                params: {
                  success: true,
                  payment: {
                    amount: queryParams.vnp_Amount
                      ? parseInt(queryParams.vnp_Amount) / 100
                      : 0,
                    transaction_id: queryParams.vnp_TransactionNo || "N/A",
                    bank_code: queryParams.vnp_BankCode || "N/A",
                    bank_trans_no: queryParams.vnp_BankTranNo || "N/A",
                    pay_date: queryParams.vnp_PayDate || "N/A",
                  },
                  subscription,
                  message: "Thanh toán thành công",
                },
              },
            ],
          });
        } else {
          throw new Error(
            result.message || "Lỗi xác nhận thanh toán từ server"
          );
        }
      } catch (error) {
        console.error("Payment processing error:", error);
        handlePaymentError(error);
      }
    } else {
      // Xử lý trường hợp thanh toán không thành công
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "PaymentResult",
            params: {
              success: false,
              message: getVnpayResponseMessage(queryParams.vnp_ResponseCode),
              payment: {
                amount: queryParams.vnp_Amount
                  ? parseInt(queryParams.vnp_Amount) / 100
                  : 0,
                transaction_id: queryParams.vnp_TransactionNo || "N/A",
              },
            },
          },
        ],
      });
    }
  };

  // Xử lý lỗi thanh toán
  const handlePaymentError = (error) => {
    console.error("Payment error occurred:", error);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "PaymentResult",
          params: {
            success: false,
            message:
              error.response?.data?.message ||
              error.message ||
              "Lỗi xử lý thanh toán",
          },
        },
      ],
    });
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //       <Text style={styles.loadingText}>
  //         {!paymentUrl
  //           ? "Đang khởi tạo thanh toán..."
  //           : "Đang tải trang thanh toán VNPay..."}
  //       </Text>
  //       {error && <Text style={styles.errorText}>{error}</Text>}
  //     </View>
  //   );
  // }

  if (!paymentUrl) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          {error || "Không thể tải trang thanh toán"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onLoadProgress={({ nativeEvent }) => {
          if (nativeEvent.progress === 1) {
            setLoading(false);
          } else {
            setLoading(true);
          }
        }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        mixedContentMode="always"
        allowsBackForwardNavigationGestures={false}
        sharedCookiesEnabled={true}
        userAgent={
          Platform.OS === "android"
            ? "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
            : undefined
        }
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error:", nativeEvent);
          setError("Không thể tải trang thanh toán");
          setLoading(false);
        }}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />

      {/* Hiển thị khi đang tải hoặc xử lý */}
      {(loading || isProcessing) && (
        <View style={styles.fullscreenOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isProcessing
              ? "Đang xử lý thanh toán..."
              : "Đang kết nối với cổng thanh toán..."}
          </Text>
        </View>
      )}
    </View>
  );
};

export default VNPayPaymentScreen;
