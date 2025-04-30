import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const MenuItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Text style={styles.itemText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 12,
      backgroundColor: "#fff",
      borderRadius: 12,
      marginVertical: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    itemText: {
      fontSize: 16,
      color: "#111827",
    },
  });

export default MenuItem;
