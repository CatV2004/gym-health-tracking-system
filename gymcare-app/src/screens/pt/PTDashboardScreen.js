import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import { getPTDashboard } from "../../api/pt/ptDashboardService";
import PTStatsCard from "../../components/pt/PTStatsCard";
import PTClientCard from "../../components/pt/PTClientCard";
import PTNavHeader from "../../components/pt/PTNavHeader";
import styles from "./PTDashboardScreen.styles";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const PTDashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const {accessToken: token, user}= useSelector((state) => state.auth);
  console.log("user: ",user)

  const fetchDashboardData = async () => {
    try {
      const data = await getPTDashboard(token);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#0000ff"]}
          tintColor="#0000ff" 
        />
      }
    >
      <PTNavHeader title="PT Dashboard" />

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <PTStatsCard
          title="Tổng học viên"
          value={dashboardData?.total_members || 0}
          icon="users"
        />
        <PTStatsCard
          title="Buổi tập hôm nay"
          value={dashboardData?.sessions_today || 0}
          icon="calendar-check"
          onPress={() => navigation.navigate("TodaySchedules")}
        />
        <PTStatsCard
          title="Chờ duyệt"
          value={dashboardData?.pending_approvals || 0}
          icon="clock"
          onPress={() => navigation.navigate("TrainerWorkoutSchedules")}
        />
      </View>

      {/* Priority Members Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Học viên ưu tiên</Text>
        {dashboardData?.priority_members?.map((member) => (
          <PTClientCard
            key={member.id}
            client={member}
            onPress={() =>
              navigation.navigate("PTClientDetail", { clientId: member.id })
            }
            
          />
        ))}
      </View>

      {/* Upcoming Sessions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buổi tập sắp tới</Text>
        {dashboardData?.upcoming_sessions?.length > 0 ? (
          dashboardData.upcoming_sessions.map((session) => {
            const formattedTime = format(
              new Date(session.scheduled_at),
              "HH:mm dd/MM/yyyy",
            );

            return (
              <Text key={session.id}>
                {formattedTime} - Gói #{session.packageId} (
                {session.duration
                  ? session.duration + " phút"
                  : "Không rõ thời lượng"}
                )
              </Text>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Không có buổi tập nào sắp tới</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default PTDashboardScreen;
