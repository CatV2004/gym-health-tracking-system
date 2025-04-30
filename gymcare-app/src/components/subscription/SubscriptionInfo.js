import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { Feather } from "@expo/vector-icons";
import { calculateEndDate, formatDate } from "../../utils/dateUtils";

const SubscriptionInfo = ({ registrationData, trainingPackage }) => {
  const endDate = calculateEndDate(
    registrationData?.start_date,
    registrationData?.quantity,
    registrationData?.type_package
  );

  const totalCost = trainingPackage?.cost * registrationData?.quantity;

  const getPackageType = (type) =>
    type === 0 ? "Tháng" : type === 1 ? "Quý" : "Năm";

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.row}>
      <Feather name={icon} size={18} color="#ef440e" style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  const Section = ({ title, children }) => (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </Animatable.View>
  );

  return (
    <>
      <Section title="Thông tin đăng ký">
        <InfoRow icon="phone" label="Số điện thoại:" value={registrationData?.phone} />
        <InfoRow icon="mail" label="Email:" value={registrationData?.email} />
        <InfoRow
          icon="hash"
          label="Số lượng:"
          value={`${registrationData?.quantity} ${getPackageType(registrationData?.type_package)}`}
        />
        <InfoRow
          icon="calendar"
          label="Bắt đầu:"
          value={formatDate(new Date(registrationData?.start_date))}
        />
        <InfoRow icon="calendar" label="Kết thúc:" value={formatDate(endDate)} />
      </Section>

      <Section title="Thông tin gói tập">
        <InfoRow icon="package" label="Tên gói:" value={trainingPackage?.name} />
        <InfoRow icon="file-text" label="Mô tả:" value={trainingPackage?.description} />
        <InfoRow
          icon="dollar-sign"
          label="Chi phí:"
          value={`${trainingPackage?.cost.toLocaleString()} VND`}
        />
        <InfoRow
          icon="layers"
          label="Số buổi:"
          value={trainingPackage?.session_count?.toString()}
        />
        <InfoRow
          icon="calendar"
          label="Loại gói:"
          value={getPackageType(trainingPackage?.type_package)}
        />
        <InfoRow
          icon="credit-card"
          label="Tổng chi phí:"
          value={`${totalCost.toLocaleString()} VND`}
        />

        {trainingPackage?.pt && (
          <>
            <View style={styles.separator} />
            <InfoRow
              icon="user"
              label="Hướng dẫn:"
              value={`${trainingPackage.pt.user.first_name} ${trainingPackage.pt.user.last_name}`}
            />
            <InfoRow
              icon="award"
              label="Chứng chỉ:"
              value={trainingPackage.pt.certification}
            />
            <InfoRow
              icon="clock"
              label="Kinh nghiệm:"
              value={`${trainingPackage.pt.experience} năm`}
            />
            <InfoRow
              icon="at-sign"
              label="Username:"
              value={trainingPackage.pt.user.username}
            />
          </>
        )}
      </Section>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ef440e",
  },
  content: {
    paddingLeft: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  label: {
    fontWeight: "600",
    fontSize: 15,
    color: "#333",
    width: 120,
  },
  value: {
    fontSize: 15,
    color: "#555",
    flex: 1,
    flexWrap: "wrap",
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginVertical: 10,
  },
});

export default SubscriptionInfo;
