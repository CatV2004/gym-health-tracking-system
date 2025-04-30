import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import moment from "moment";

const { width } = Dimensions.get("window");

const news = [
  {
    id: 1,
    title: "Khai giảng lớp học mùa hè",
    description: "Lớp học đặc biệt với chương trình giảm giá cho hội viên mới.",
    date: "2025-05-10",
    image: { uri: "https://res.cloudinary.com/dohsfqs6d/image/upload/v1745384923/9b8a2ab5-314c-45cc-8456-4b1146f5d856.png" }, 
  },
  {
    id: 2,
    title: "Mở rộng dịch vụ thể hình",
    description: "Thêm các gói tập mới dành cho mọi đối tượng.",
    date: "2025-04-25",
    image: { uri: "https://res.cloudinary.com/dohsfqs6d/image/upload/v1745384948/9b03456c-91d8-4e1d-8f77-39c700bd29cc.png" },
  },
  {
    id: 3,
    title: "Chương trình mùa thu",
    description: "Hỗ trợ dụng cụ cho tất cả các dịch vụ từ tháng 9.",
    date: "2025-09-01",
    image: { uri: "https://res.cloudinary.com/dohsfqs6d/image/upload/v1745384904/fe8dc5a2-aa68-47fa-943c-8c973fdff813.png" },
  },
  {
    id: 4,
    title: "Chương trình mùa Đông",
    description: "Học cho tất cả các dịch vụ từ tháng 12.",
    date: "2025-09-01", 
    image: { uri: "https://res.cloudinary.com/dohsfqs6d/image/upload/v1745385186/faa29f64-c6d3-4ca1-9f70-6fbde102df0b.png" },
  },
];

const NewsSection = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Sự kiện nổi bật</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {news.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.newsCard}
            onPress={() => navigation.navigate("NewsDetail", { newsItem: item })}
          >
            <Image source={item.image} style={styles.newsImage} resizeMode="cover" />
            <View style={styles.overlay} />
            <View style={styles.textContainer}>
              <Text style={styles.newsDate}>
                {moment(item.date).format("DD/MM/YYYY")}
              </Text>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    paddingLeft: 5,
  },
  scrollContainer: {
    paddingRight: 16,
  },
  newsCard: {
    width: width * 0.7,
    height: 180,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    position: "relative",
  },
  newsImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  newsDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default NewsSection;