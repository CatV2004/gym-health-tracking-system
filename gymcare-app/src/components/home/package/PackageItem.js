import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import RegisterButton from "../../buttons/RegisterButton";
import Icon from "react-native-vector-icons/FontAwesome";

export default function PackageItem({ item, onPress }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
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
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>

      {item.average_rating != null && item.total_reviews > 0 && (
        <View style={styles.ratingContainer}>
          {renderStars(item.average_rating)}
          <Text style={styles.ratingText}>
            {item.average_rating.toFixed(1)} / 5
          </Text>
          <Text style={styles.reviewsText}>
            Từ {item.total_reviews} đánh giá
          </Text>
        </View>
      )}


      <View style={styles.bottomRow}>
        <View>
          <Text>💰 {item.cost} đ</Text>
          <Text>🕒 {item.session_count} buổi</Text>
        </View>
        <TouchableOpacity style={styles.registerButton}>
          <RegisterButton trainingPackage={item} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    marginVertical: 6,
    color: "#555",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 6,
  },
  reviewsText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  registerButton: {
    marginLeft: 10,
  },
});
