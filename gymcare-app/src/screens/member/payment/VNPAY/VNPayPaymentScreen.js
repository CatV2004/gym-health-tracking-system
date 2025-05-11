import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Alert, Platform, BackHandler } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute, useNavigation } from "@react-navigation/native";
import { createVNPayPayment, paymentReturn } from "../../../../api/payment/vnpayServiceApi";
import colors from "../../../../constants/colors";
import { useSelector } from "react-redux";

const VNPayPaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { subscription } = route.params;
  const token = useSelector((state) => state.auth.accessToken);

  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Khởi tạo thanh toán
  useEffect(() => {
    const initializePayment = async () => {
      try {
        const response = await createVNPayPayment(subscription.id, token);

        if (response.payment_url) {
          setPaymentUrl(response.payment_url);
        } else {
          throw new Error("Không nhận được URL thanh toán từ server");
        }
      } catch (error) {
        console.error("Payment initialization failed:", error);
        Alert.alert(
          "Lỗi",
          error.response?.data?.error || "Không thể khởi tạo thanh toán"
        );
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    initializePayment();

    // Thêm listener cho hardware back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  // Thiết lập timer kiểm tra URL
  useEffect(() => {
    if (!paymentUrl || !webViewRef.current) return;

    const interval = setInterval(() => {
      if (webViewRef.current && !isProcessing) {
        webViewRef.current.injectJavaScript(`
          window.ReactNativeWebView.postMessage(window.location.href);
          true;
        `);
      }
    }, 1000); // Kiểm tra mỗi giây

    return () => clearInterval(interval);
  }, [paymentUrl, isProcessing]);

  const handleBackButton = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn hủy giao dịch thanh toán?",
      [
        { text: "Tiếp tục thanh toán", style: "cancel" },
        { text: "Hủy", onPress: () => navigation.goBack() }
      ]
    );
    return true;
  };

  // Xử lý message từ WebView (URL hiện tại)
  const handleMessage = async (event) => {
    const url = event.nativeEvent.data;
    if (!url || isProcessing) return;
    
    setCurrentUrl(url);
    
    // Kiểm tra URL return của VNPay
    if (url.includes("/api/payments/payment_return/")) {
      try {
        setIsProcessing(true);
        
        // Dừng WebView ngay lập tức
        webViewRef.current.stopLoading();
        
        // Trích xuất thông tin từ URL
        const urlObj = new URL(url);
        const queryParams = Object.fromEntries(urlObj.searchParams.entries());
        
        console.log('Payment return params:', queryParams);

        // Xử lý kết quả thanh toán
        await processPaymentResult(queryParams);
      } catch (error) {
        console.error('Payment processing error:', error);
        handlePaymentError(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Xử lý kết quả thanh toán
  const processPaymentResult = async (queryParams) => {
    if (queryParams.vnp_ResponseCode === "00") {
      const result = await paymentReturn(queryParams, token);
      
      if (result.status === "success") {
        navigation.reset({
          index: 0,
          routes: [{ 
            name: "PaymentResult",
            params: {
              success: true,
              payment: {
                amount: queryParams.vnp_Amount ? queryParams.vnp_Amount / 100 : 0,
                transaction_id: queryParams.vnp_TransactionNo || "N/A",
              },
              subscription,
              message: "Thanh toán thành công",
            }
          }]
        });
      } else {
        throw new Error(result.message || "Lỗi xác nhận thanh toán từ server");
      }
    } else {
      navigation.reset({
        index: 0,
        routes: [{
          name: "PaymentResult",
          params: {
            success: false,
            message: getVnpayResponseMessage(queryParams.vnp_ResponseCode),
          }
        }]
      });
    }
  };

  // Xử lý lỗi thanh toán
  const handlePaymentError = (error) => {
    navigation.reset({
      index: 0,
      routes: [{
        name: "PaymentResult",
        params: {
          success: false,
          message: error.response?.data?.message || 
                  error.message || 
                  "Lỗi xử lý thanh toán",
        }
      }]
    });
  };

  if (loading || !paymentUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Đang tải trang thanh toán...</Text>
      </View>
    );
  }

  const getVnpayResponseMessage = (code) => {
    const messages = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì.",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch.",
      "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    };

    return messages[code] || "Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.";
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        mixedContentMode="always"
        allowsBackForwardNavigationGestures={false}
        sharedCookiesEnabled={true}
        // Thêm userAgent tùy chỉnh cho Android
        userAgent={
          Platform.OS === 'android' 
            ? 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
            : undefined
        }
        injectedJavaScript={`
          // Ngăn chặn người dùng nhấn back khi đang ở trang VNPay
          history.pushState(null, null, document.URL);
          window.addEventListener('popstate', function(event) {
            history.pushState(null, null, document.URL);
          });
          true;
        `}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error:", nativeEvent);
          Alert.alert("Lỗi", "Không thể tải trang thanh toán");
          navigation.goBack();
        }}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
};

export default VNPayPaymentScreen;