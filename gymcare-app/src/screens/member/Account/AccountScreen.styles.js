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
  avatarWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    color: "white",
    fontSize: 24,
  },
});
