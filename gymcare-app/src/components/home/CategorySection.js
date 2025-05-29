import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

const CategorySection = ({ categories, navigation }) => {
  const handleCategoryPress = (categoryId, categoryName) => {
    navigation.navigate("PackagesOfCategory", { categoryId, categoryName });
  };

  return (
    <View style={styles.packageSection}>
      <Text style={styles.sectionTitle}>Danh mục gói tập</Text>
      <View style={styles.packageContainer}>
        {Array.isArray(categories) &&
          categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.packageItem}
              onPress={() => handleCategoryPress(item.id, item.name)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Chọn danh mục ${item.name}`}
            >
              <Text style={styles.packageText} numberOfLines={1} ellipsizeMode="tail">
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  packageSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#222",
  },

  packageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  packageItem: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    width: "48%",
    alignItems: "center",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    // Elevation for Android
    elevation: 4,
  },

  packageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef440e",
    textAlign: "center",
  },
});

export default CategorySection;
