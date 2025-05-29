import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { reviewGym } from "../../api/reviewService";
import Icon from "react-native-vector-icons/FontAwesome";

const GymReviewForm = () => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0); // số sao đã chọn
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.accessToken);

  const validate = () => {
    if (rating === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn số sao đánh giá.");
      return false;
    }
    if (comment.length > 500) {
      Alert.alert("Lỗi", "Nhận xét không được vượt quá 500 ký tự.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await reviewGym({ comment, rating }, token);
      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá phòng gym!");
      setComment("");
      setRating(0);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại.";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm render 5 sao
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          activeOpacity={0.7}
          style={{ marginHorizontal: 6 }}
        >
          <Icon
            name={i <= rating ? "star" : "star-o"}
            size={32}
            color={i <= rating ? "#f1c40f" : "#ccc"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Đánh giá phòng gym</Text>

      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 16 }}>
        {renderStars()}
      </View>

      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        placeholder="Nhập nhận xét..."
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={500}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Gửi đánh giá</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#ef440e",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#b2472d",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default GymReviewForm;
