import { StyleSheet, Dimensions } from "react-native";
const { width: windowWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#ef440ee8", 
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    height:100,
    zIndex: 1,
    marginBottom: 10,
  },
  title: {
    color: "#fff", 
    fontSize: 20,
    fontWeight: "bold", 
    top: 60,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: 16,
    marginBottom: 150,
  },
  packageItem: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: "100%",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  packageName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef440ee8", 
    marginBottom: 6,
  },
  packageDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  packageCost: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ef440ee8", 
    marginBottom: 6,
  },
  packageSessions: {
    fontSize: 14,
    color: "#888", 
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderColor: "#ef440ee8",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    elevation: 2,
  },
  packageBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  packageInfo: {
    flex: 1,
  },
  registerButton: {
    marginTop: 10,
    backgroundColor: "#ef440ee8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default styles;
