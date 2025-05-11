import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
            >
              <Text style={styles.packageText}>{item.name}</Text>
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
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },

  packageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  packageItem: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  packageText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ef440ee8",
  },
});

export default CategorySection;
