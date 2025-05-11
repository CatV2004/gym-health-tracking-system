import { StyleSheet } from "react-native";
import colors from "../../../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    padding: 15,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionsContainer: {
    flex: 1,
    padding: 15,
  },
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timeBadge: {
    backgroundColor: colors.lightPrimary,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 15,
  },
  timeText: {
    fontWeight: "bold",
    color: colors.primary,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textDark,
  },
  sessionDuration: {
    fontSize: 12,
    color: colors.gray,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  requestsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  requestsTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textDark,
    marginBottom: 5,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  requestText: {
    fontSize: 13,
    color: colors.textDark,
    marginLeft: 5,
  },
  sessionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 13,
    color: colors.gray,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 15,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  requestDetails: {
    flex: 1,
    marginLeft: 8,
  },
  requestText: {
    fontSize: 13,
    color: colors.textDark,
  },
  requestReason: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
    fontStyle: "italic",
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  responseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: colors.green,
  },
  rejectButton: {
    backgroundColor: colors.red,
  },
  responseButtonText: {
    color: colors.white,
    fontWeight: "500",
  },
  requestStatus: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
    fontWeight: "500",
  },
  requestActionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10, // Khoảng cách giữa 2 nút
  },
  requestStatusContainer: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  requestStatusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  timeBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    fontWeight: "bold",
    color: colors.white,
    marginLeft: 4,
  },

  sessionInfo: {
    flex: 1,
  },

  sessionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  typeIcon: {
    marginRight: 6,
  },

  sessionType: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    flex: 1,
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  sessionMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12,
  },

  subscriptionInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightDivider,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
    marginLeft: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    color: colors.textDark,
    marginLeft: 8,
  },

  sessionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightDivider,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});

export default styles;
