import { StyleSheet } from "react-native";

// Màu cam làm màu chủ đạo
const PRIMARY_COLOR = "#FF6347"; // Màu cam tươi sáng

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 80,
    paddingBottom: 30,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 35,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  editProfile: {
    color: "#eee",
    marginTop: 4,
  },
  menu: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  item: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default styles;
