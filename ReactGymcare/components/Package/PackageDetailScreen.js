import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";

export default function PackageDetailScreen({ route }) {
  const { pack } = route.params;
  const pt = pack.pt?.user;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{pack.name}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Thông tin gói tập</Text>
        <Text style={styles.description}>{pack.description}</Text>
        <Text style={styles.info}>
          Giá: {Number(pack.cost).toLocaleString()}đ
        </Text>
        <Text style={styles.info}>Số buổi: {pack.session_count}</Text>

        {pack.pt && (
          <>
            <Text style={styles.sectionTitle}>Huấn luyện viên</Text>
            <View style={styles.ptContainer}>
              <Image
                source={{ uri: pack.pt.user.avatar }}
                style={styles.avatar}
              />
              <View style={styles.ptInfo}>
                <Text style={styles.ptName}>
                  {pt.last_name} {pt.first_name} ({pt.username})
                </Text>
                <Text style={styles.ptDetail}>
                  🎓 Chứng chỉ: {pack.pt.certification}
                </Text>
                <Text style={styles.ptDetail}>
                  🏋️ Kinh nghiệm: {pack.pt.experience} năm
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          /* TODO: xử lý đăng ký */
        }}
      >
        <Text style={styles.buttonText}>Đăng ký gói tập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
    height: 100,
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
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#ef440ee8",
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    color: "#333",
  },
  info: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  ptContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: "#ccc",
  },
  ptInfo: {
    flex: 1,
  },
  ptName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ptDetail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  button: {
    backgroundColor: "#ef440ee8",
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
});
