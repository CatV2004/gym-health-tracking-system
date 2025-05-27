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

    // Kiểm tra URL return của VNPay
    if (url.includes("/api/payments/payment_return/")) {
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
    console.log("Processing payment result with params:", queryParams);
    if (queryParams.vnp_ResponseCode === "00") {
      const result = await paymentReturn(queryParams, token);
      console.log("Payment return result:", result);

      if (result.status === "success") {
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
        throw new Error(result.message || "Lỗi xác nhận thanh toán từ server");
      }
    } else {
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

  const getVnpayResponseMessage = (code) => {
    const messages = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      75: "Ngân hàng thanh toán đang bảo trì.",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch.",
      99: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    };

    return (
      messages[code] ||
      `Thanh toán thất bại (Mã lỗi: ${code || "Không xác định"})`
    );
  };
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
        <View style={styles.processingOverlay}>
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.processingText}>
              {isProcessing
                ? "Đang xử lý kết quả thanh toán..."
                : "Đang tải trang thanh toán..."}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
  },
  errorText: {
    marginTop: 8,
    color: colors.error,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  processingText: {
    color: colors.white,
    marginTop: 10,
    fontSize: 16,
  },
};

export default VNPayPaymentScreen;
