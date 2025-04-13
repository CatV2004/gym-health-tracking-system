import { StyleSheet, Dimensions } from "react-native";
const { width: windowWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute", // Để header phủ lên trên
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ef440ee8", // Màu cam
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
  scrollContainer: {
    position: "relative",
    marginTop: 50,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    paddingBottom: 15,
  },
  messageBox: {
    width: windowWidth,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    top: 0,
    zIndex: 100,
  },
  textContainer: {
    width: "100%",
    height: 100,
    backgroundColor: "#fff3e6",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef440ee8",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  messageText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  normalDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef440ee8",
    marginHorizontal: 4,
  },
  menu: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    alignItems: "center",
    marginVertical: 10,
    width: "40%",
    padding: 16,
    backgroundColor: "#fff3e6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef440ee8",
    elevation: 2,
  },
  menuText: {
    color: "#ef440ee8",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },

  packageSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },

  packageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  packageItem: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  packageText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ef440ee8",
  },

  promotionSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  promotionCard: {
    backgroundColor: "#fff3e6",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  promotionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#ef440ee8",
  },

  promotionDescription: {
    fontSize: 14,
    color: "#333",
  },

  newsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 20, 
  },
  newsCard: {
    backgroundColor: "#fff", 
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: "300", 
    borderWidth: 1,
    borderColor: "#ef440ee8", // Sử dụng màu chính của ứng dụng cho viền
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#ef440ee8", // Sử dụng màu chính cho tiêu đề để nổi bật
  },
  newsDate: {
    fontSize: 12,
    color: "#888", // Màu xám nhẹ cho ngày tháng để không làm mất chú ý vào tiêu đề
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    color: "#333", // Màu đen đậm dễ đọc cho nội dung
    lineHeight: 20, // Cải thiện độ dễ đọc bằng cách tăng khoảng cách dòng
  },
});

export default styles;
