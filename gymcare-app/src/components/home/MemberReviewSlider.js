import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { fetchGymReviews } from "../../api/reviewService";

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = '#ef440ee8';

const MemberReviewSlider = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews(page);
  }, []);

  const loadReviews = async (pageNumber) => {
    if (loading || !hasNext) return;

    setLoading(true);
    try {
      const data = await fetchGymReviews(pageNumber, 5);
      setReviews((prev) => [...prev, ...data.results]);
      setHasNext(data.next !== null);
      setPage(pageNumber + 1);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.reviewer}>{item.reviewer_name}</Text>
      <Text style={styles.comment} numberOfLines={3}>
        {item.comment || "(Không có nhận xét)"}
      </Text>
      <View style={styles.ratingContainer}>
  {Array.from({ length: 5 }).map((_, index) => (
    <FontAwesome
      key={index}
      name={index < item.rating ? "star" : "star-o"}
      size={18}
      color={index < item.rating ? "#FFD700" : "#ccc"} 
    />
  ))}
</View>
      <Text style={styles.date}>
        {new Date(item.created_date).toLocaleDateString("vi-VN")}
      </Text>
    </View>
  );

  return (
    <View style={{ marginVertical: 20 }}>
      <Text style={styles.title}>Đánh giá từ hội viên</Text>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        onEndReached={() => loadReviews(page)}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    paddingLeft: 16,
    marginBottom: 15,
    color: PRIMARY_COLOR,
    textShadowColor: "rgba(239, 68, 14, 0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  card: {
    width: width * 0.7,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reviewer: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginBottom: 8,
    textShadowColor: "rgba(239, 68, 14, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  comment: {
    fontSize: 15,
    color: "#444",
    fontStyle: "italic",
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  date: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    marginTop: 12,
    fontWeight: "600",
  },
});

export default MemberReviewSlider;
