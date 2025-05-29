import { StyleSheet } from "react-native";
import colors from "../../../../constants/colors";

export default styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
  },
  errorText: {
    marginTop: 8,
    color: colors.error,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  processingText: {
    color: colors.white,
    marginTop: 10,
    fontSize: 16,
  },
  fullscreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
});
