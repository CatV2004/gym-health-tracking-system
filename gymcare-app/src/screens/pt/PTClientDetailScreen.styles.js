import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  profileSection: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  goalText: {
    fontSize: 14,
    color: "#4a90e2",
    fontStyle: "italic",
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4a90e2",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  historyItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#4a90e2",
  },
  historyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  historyStat: {
    fontSize: 14,
    color: "#666",
  },
  historyNotes: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 16,
  },
  contactButton: {
  backgroundColor: "#4CAF50",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  marginTop: 12,
  alignSelf: "flex-start",
},

  contactButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

});

export default styles;
