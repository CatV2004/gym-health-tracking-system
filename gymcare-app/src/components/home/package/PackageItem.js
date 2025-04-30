import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import RegisterButton from "../../buttons/RegisterButton";

export default function PackageItem({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
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
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
