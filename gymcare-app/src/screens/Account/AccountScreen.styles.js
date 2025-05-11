import { StyleSheet, Platform } from "react-native";
import Constants from "expo-constants";

const PRIMARY_GRADIENT_START = "#FF7E5F"; 
const PRIMARY_GRADIENT_END = "#FF6347";   
const TEXT_COLOR = "#fff";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    marginBottom: 5,
  },
  header: {
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight + 20 : 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_GRADIENT_END,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 18,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: TEXT_COLOR,
  },
  editProfile: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    textDecorationLine: "underline",
  },
  menu: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
});
