import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";
import RegisterButton from "../../../../components/buttons/RegisterButton";
import trainerService from "../../../../api/trainerService";
import Icon from "react-native-vector-icons/FontAwesome";

export default function PackageDetailScreen({ route }) {
  const { pack } = route.params;
  const [trainer, setTrainer] = useState(pack.pt);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const data = await trainerService.getTrainerById(pack.pt.id);
        setTrainer(data);
      } catch (err) {
        console.error("Không thể load huấn luyện viên:", err.message);
      }
    };

    if (pack.pt?.id) {
      fetchTrainer();
    }
  }, [pack]);

  console.log("trainer.average_rating:", trainer.average_rating);
  console.log("trainer.total_reviews:", trainer.total_reviews);
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
      >
        {Array.from({ length: fullStars }).map((_, i) => (
          <Icon
            key={`full-${i}`}
            name="star"
            size={16}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        ))}
        {halfStar && (
          <Icon
            name="star-half-full"
            size={16}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Icon
            key={`empty-${i}`}
            name="star-o"
            size={16}
            color="#CCC"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{pack.name}</Text>
      </View>

      {/* Nội dung gói tập */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Thông tin gói tập</Text>
        <Text style={styles.description}>{pack.description}</Text>
        <Text style={styles.info}>
          Giá: {Number(pack.cost).toLocaleString()}đ
        </Text>
        <Text style={styles.info}>Số buổi: {pack.session_count}</Text>

        {/* Thông tin huấn luyện viên (nếu có) */}
        {pack.pt && (
          <>
            <Text style={styles.sectionTitle}>Huấn luyện viên</Text>
            <View style={styles.ptContainer}>
              <Image
                source={{ uri: trainer.user.avatar }}
                style={styles.avatar}
              />
              <View style={styles.ptInfo}>
                <Text style={styles.ptName}>
                  {trainer.user.last_name} {trainer.user.first_name} (
                  {trainer.user.username})
                </Text>
                <Text style={styles.ptDetail}>
                  🎓 Chứng chỉ: {trainer.certification}
                </Text>
                <Text style={styles.ptDetail}>
                  🏋️ Kinh nghiệm: {trainer.experience} năm
                </Text>

                {trainer.average_rating != null && (
                  <View style={styles.ratingContainer}>
                    {renderStars(trainer.average_rating)}
                    <Text style={styles.ratingText}>
                      {trainer.average_rating.toFixed(1)} / 5 Từ{" "}
                      {trainer.total_reviews} đánh giá
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </View>

      {/* Button đăng ký */}
      <RegisterButton trainingPackage={pack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#ef440e",
    paddingBottom: 24,
    paddingTop: 48,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ef440e",
    marginBottom: 6,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  info: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  ptContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: "#ddd",
  },
  ptInfo: {
    flex: 1,
    justifyContent: "center",
  },
  ptName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  ptDetail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  ratingText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 6,
  },
  button: {
    backgroundColor: "#ef440e",
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

