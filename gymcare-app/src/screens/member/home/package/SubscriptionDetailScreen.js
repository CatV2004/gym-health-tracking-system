import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import SubscriptionInfo from "../../../../components/subscription/SubscriptionInfo";
import { useSelector } from "react-redux";
import { createSubscription } from "../../../../api/subscriptionApi";

const SubscriptionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { registrationData, trainingPackage } = route.params;

  const token = useSelector((state) => state.auth.accessToken);
  const [loading, setLoading] = useState(false);

  const handleSubscription = async () => {
    setLoading(true);
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
        Alert.alert("Lỗi", error.response.data.non_field_errors[0]);
      } else {
        Alert.alert("Lỗi", "Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chi tiết đăng ký gói tập</Text>

      <SubscriptionInfo
        registrationData={registrationData}
        trainingPackage={trainingPackage}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubscription}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tiếp tục</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  button: {
    fontSize: 18,
    padding: 10,
    backgroundColor: "#ef440e",
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default SubscriptionDetailScreen;
