import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    paddingTop: 40,
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 12,
    alignItems: "center",
    elevation: 1,
  },
  unreadBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF7A00",
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: "#333",
  },
  unreadText: {
    fontWeight: "bold",
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#999",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginLeft: 8,
  },
});
