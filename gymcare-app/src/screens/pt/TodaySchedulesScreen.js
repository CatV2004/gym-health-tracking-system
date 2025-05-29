import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { formatTime, formatDuration } from "../../utils/format";
import { getTodaySchedules } from "../../api/pt/ptDashboardService";
import colors from "../../constants/colors";
import styles from "./TodaySchedulesScreen.styles";

const TodaySchedulesScreen = ({ navigation }) => {
  const token = useSelector((state) => state.auth.accessToken);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodaySchedules = async () => {
    try {
      const response = await getTodaySchedules(token);
      setSchedules(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching today schedules:", err);
      setError("Không thể tải lịch tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTodaySchedules();
      return () => {};
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodaySchedules();
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      0: { text: "Đã lên lịch", color: colors.info },
      1: { text: "Đã hoàn thành", color: colors.success },
      2: { text: "Đã hủy", color: colors.danger },
      3: { text: "Chờ thay đổi", color: colors.warning },
      4: { text: "Đã thay đổi", color: colors.primary },
      5: { text: "Đã xác nhận", color: colors.success },
    };
    return statusMap[status] || { text: "Không xác định", color: colors.gray };
  };

  const renderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const scheduledTime = new Date(item.scheduled_at);
    const now = new Date();
    const isUpcoming = scheduledTime > now && item.status !== 2;

    return (
      <TouchableOpacity
        style={[
          styles.scheduleCard,
          isUpcoming && styles.upcomingCard,
        ]}
        onPress={() => navigation.navigate("ScheduleDetail", { scheduleId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.timeContainer}>
            <Icon name="access-time" size={16} color={colors.primary} />
            <Text style={styles.timeText}>{formatTime(item.scheduled_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="hourglass-empty" size={14} color={colors.gray} />
            </View>
            <Text style={styles.detailText}>
              {formatDuration(item.duration)} phút • {item.training_type === 1 ? "Cá nhân" : "Nhóm"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="assignment" size={14} color={colors.gray} />
            </View>
            <Text style={styles.detailText}>Gói tập #{item.packageId}</Text>
          </View>
        </View>

        {isUpcoming && (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingText}>SẮP DIỄN RA</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Icon name="error-outline" size={40} color={colors.danger} />
        </View>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchTodaySchedules}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch tập hôm nay</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>

      {schedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="event-available" size={48} color={colors.lightGray} />
          </View>
          <Text style={styles.emptyTitle}>Không có lịch tập hôm nay</Text>
          <Text style={styles.emptyDescription}>
            Bạn không có buổi tập nào được lên lịch cho hôm nay.
            Hãy kiểm tra lịch tuần hoặc tạo lịch mới cho khách hàng.
          </Text>
        </View>
      ) : (
        <FlatList
          data={schedules}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default TodaySchedulesScreen;