import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import SubscriptionInfo from "../../../../components/subscription/SubscriptionInfo";
import { useSelector } from "react-redux";
import { createSubscription } from "../../../../api/subscriptionApi";
import { Ionicons } from "@expo/vector-icons";

const SubscriptionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { registrationData, trainingPackage } = route.params;

  const token = useSelector((state) => state.auth.accessToken);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubscription = async () => {
    setLoading(true);
    setErrorMessage(null); // Reset error message khi thử lại
    
    try {
      const data = {
        training_package: trainingPackage.id,
        start_date: registrationData.start_date,
        quantity: registrationData.quantity,
      };

      const response = await createSubscription(data, token);
      
      navigation.navigate("Payment", {
        subscriptionData: response.data,
      });
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.non_field_errors
      ) {
        // Hiển thị thông báo lỗi trên UI thay vì Alert
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else {
        setErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header với nút back */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ef440e" />
          </TouchableOpacity>
          <Text style={styles.title}>Chi tiết gói tập</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Thông tin gói tập */}
        <View style={styles.card}>
          <SubscriptionInfo
            registrationData={registrationData}
            trainingPackage={trainingPackage}
          />
        </View>

        {/* Hiển thị thông báo lỗi */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color="#d9534f" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Nút hành động */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubscription}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Tiếp tục thanh toán</Text>
                <Ionicons name="card" size={20} color="#fff" style={styles.buttonIcon} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerRightPlaceholder: {
    width: 32, // Cân bằng với nút back
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    backgroundColor: "#ef440e",
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#ef440e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8d7da",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#d9534f",
  },
  errorText: {
    color: "#721c24",
    marginLeft: 10,
    flex: 1,
  },
});

export default SubscriptionDetailScreen;