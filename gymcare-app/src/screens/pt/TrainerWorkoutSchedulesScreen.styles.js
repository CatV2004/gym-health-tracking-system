import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  scheduleItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  scheduleDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  subscriptionInfo: {
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  memberName: {
    fontSize: 14,
    color: "#666",
  },
  changeButton: {
    backgroundColor: "#FF9800",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 8,
  },
  changeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    minHeight: 100,
    fontSize: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#4a90e2",
  },
  modalButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 120,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#009688",
  },
  changeButton: {
    backgroundColor: "#FF9800",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  // Style cho modal xác nhận
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    width: "80%",
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  confirmModalText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  confirmModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  confirmModalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default styles;
