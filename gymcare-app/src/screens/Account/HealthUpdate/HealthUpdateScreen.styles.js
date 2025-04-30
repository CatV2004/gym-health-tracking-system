import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center", 
  },
  button: {
    width: 200,
    height: 50,
    backgroundColor: "#FF5722",
    borderRadius: 25, 
    justifyContent: "center",
    alignItems: "center",
  },
  buttonLoading: {
    backgroundColor: "#FF7043", 
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  success: {
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
});
