import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createVNPayPayment, paymentReturn } from '../../../api/payment/vnpayServiceApi';
import colors from '../../../constants/colors';
import { useSelector } from 'react-redux';

const VNPayPaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { subscription } = route.params;
  const token = useSelector((state) => state.auth.accessToken);

  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const webViewRef = useRef(null);

  // Khởi tạo thanh toán
  useEffect(() => {
    const initializePayment = async () => {
      try {
        const response = await createVNPayPayment(subscription.id, token);
        
        if (response.payment_url) {
          setPaymentUrl(response.payment_url);
        } else {
          throw new Error('Không nhận được URL thanh toán từ server');
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
  }, []);

  // Xử lý khi WebView load hoàn tất
  const handleLoadEnd = () => {
    setLoading(false);
  };

  // Xử lý khi có sự thay đổi navigation state (quay lại từ VNPay)
  const handleNavigationStateChange = async (navState) => {
    if (!navState.url) return;
  
    // Kiểm tra nếu URL chứa return url của VNPay và chắc chắn đây là URL hợp lệ cho việc trả kết quả thanh toán
    if (navState.url.includes("/api/payments/payment_return/")) {
      try {
        // Trích xuất query parameters từ URL
        const url = new URL(navState.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());
  
  
        // Kiểm tra mã phản hồi từ VNPay
        if (queryParams.vnp_ResponseCode === '00') {
          const result = await paymentReturn(queryParams, token);
          
          if (result.status === "success") {
            navigation.replace("PaymentResult", {
              success: true,
              payment: {
                amount: queryParams.vnp_Amount / 100, 
                transaction_id: queryParams.vnp_TransactionNo,
              },
              subscription,
              message: "Thanh toán thành công",
            });
          } else {
            throw new Error(result.message || "Lỗi xử lý thanh toán");
          }
        } else {
          // Nếu mã phản hồi khác 00 (không thành công)
          navigation.replace("PaymentResult", {
            success: false,
            message: getVnpayResponseMessage(queryParams.vnp_ResponseCode),
          });
        }
      } catch (error) {
        console.error("Error processing payment return:", error);
        navigation.replace("PaymentResult", {
          success: false,
          message: error.response?.data?.message || error.message || "Lỗi xử lý thanh toán",
        });
      }
      
      return false; 
    }
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
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };
    
    return messages[code] || 'Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={`
          // Ngăn chặn người dùng nhấn back khi đang ở trang VNPay
          history.pushState(null, null, document.URL);
          window.addEventListener('popstate', function(event) {
            history.pushState(null, null, document.URL);
          });
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
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default VNPayPaymentScreen;