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
  notification: {
    position: "absolute",
    top: 45,
    right: 16,
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    zIndex: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default styles;
