import { StyleSheet, Dimensions } from "react-native";
const { width: windowWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute", 
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ef440ee8", 
    paddingTop: 150,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 1,
  },
  welcomeText: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    zIndex: 2,
  },
});

export default styles;
