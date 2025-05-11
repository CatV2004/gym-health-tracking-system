import { StyleSheet } from "react-native";

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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  packageName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 20,
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
});

export default styles;
