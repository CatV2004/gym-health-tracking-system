import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import {
  getMemberSchedule,
  getChangeRequestsByScheduleId,
  respondToChangeRequest,
} from "../../../../api/schedule/workoutScheduleService";
import { getMemberSubscriptionsDetail } from "../../../../api/subscriptionApi";
import { format, parseISO, isSameDay } from "date-fns";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./MemberScheduleScreen.styles";
import colors from "../../../../constants/colors";

import CalendarSelector from "../../../../components/schedule/CalendarSelector";
import SessionItem from "../../../../components/schedule/SessionItem";

const MemberScheduleScreen = ({ navigation }) => {
  const token = useSelector((state) => state.auth.accessToken);
  const [schedules, setSchedules] = useState([]);
  const [changeRequests, setChangeRequests] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [subscriptions, setSubscriptions] = useState({});

  const TRAINING_TYPES = {
    0: { label: "Tự tập", color: colors.blue, icon: "person" },
    1: { label: "Với HLV", color: colors.primary, icon: "fitness-center" },
  };
  const STATUS = {
    0: { label: "Đã đặt", color: colors.orange },
    1: { label: "Đã duyệt", color: colors.green },
    2: { label: "Đã huỷ", color: colors.red },
    3: { label: "Chờ xử lý", color: colors.purple },
    4: { label: "Đã thay đổi", color: colors.teal },
    5: { label: "Đã xác nhận", color: colors.darkGreen }
  };
  const REQUEST_STATUS = {
    0: { label: "Chờ phản hồi", color: colors.orange, icon: "schedule" },
    1: { label: "Đã chấp nhận", color: colors.green, icon: "check-circle" },
    2: { label: "Đã từ chối", color: colors.red, icon: "cancel" },
  };

  const fetchData = async () => {
    try {
      const schedulesData = await getMemberSchedule(token);
      const requestsMap = {};
      const subscriptionsMap = {};

      // Tạo Set các subscription id cần fetch
      const subscriptionIds = new Set(
        schedulesData.map((schedule) => schedule.subscription)
      );

      // Fetch tất cả subscriptions cần thiết
      await Promise.all(
        Array.from(subscriptionIds).map(async (subId) => {
          try {
            const res = await getMemberSubscriptionsDetail(subId, token);
            subscriptionsMap[subId] = res.data;
          } catch (error) {
            console.error(`Error fetching subscription ${subId}:`, error);
          }
        })
      );

      // Fetch change requests
      for (const schedule of schedulesData) {
        requestsMap[schedule.id] = await getChangeRequestsByScheduleId(
          schedule.id,
          token
        );
      }

      setSchedules(schedulesData);
      setChangeRequests(requestsMap);
      setSubscriptions(subscriptionsMap);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu lịch tập");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log("subscriptopn: ", subscriptions);
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getSessionsForSelectedDate = () => {
    return schedules.filter((s) =>
      isSameDay(parseISO(s.scheduled_at), new Date(selectedDate))
    );
  };

  const handleRespondToRequest = async (requestId, response) => {
    try {
      setProcessingRequest(requestId);
      const rs = await respondToChangeRequest(requestId, response, token);
      if (rs.status === 201) {
        Alert.alert(
          "Thành công",
          response === "ACCEPT" ? "Đã chấp nhận" : "Đã từ chối",
          [{ text: "OK", onPress: fetchData }]
        );
      }
    } catch {
      Alert.alert("Lỗi", "Không thể xử lý yêu cầu.");
    } finally {
      setProcessingRequest(null);
    }
  };

  const renderRequestActions = (request) => {
    if (request.status === 0) {
      return (
        <View style={styles.requestActionsContainer}>
          <TouchableOpacity
            style={[styles.responseButton, styles.acceptButton]}
            onPress={() => handleRespondToRequest(request.id, "ACCEPT")}
            disabled={processingRequest === request.id}
          >
            {processingRequest === request.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="check" size={16} color="white" />
                <Text style={styles.responseButtonText}> Chấp nhận</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.responseButton, styles.rejectButton]}
            onPress={() => handleRespondToRequest(request.id, "REJECT")}
            disabled={processingRequest === request.id}
          >
            {processingRequest === request.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="close" size={16} color="white" />
                <Text style={styles.responseButtonText}> Từ chối</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.requestStatusContainer}>
        <Text
          style={[
            styles.requestStatusText,
            { color: REQUEST_STATUS[request.status].color },
          ]}
        >
          <Icon
            name={REQUEST_STATUS[request.status].icon}
            size={14}
            color={REQUEST_STATUS[request.status].color}
          />{" "}
          {REQUEST_STATUS[request.status].label}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <CalendarSelector
          schedules={schedules}
          selectedDate={selectedDate}
          onDayPress={({ dateString }) => setSelectedDate(dateString)}
          TRAINING_TYPES={TRAINING_TYPES}
        />
      </View>

      <ScrollView
        style={styles.sessionsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {getSessionsForSelectedDate().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="fitness-center" size={40} color={colors.gray} />
            <Text style={styles.emptyText}>
              Không có buổi tập nào vào ngày này
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("MySubscriptions")}
            >
              <Text style={styles.addButtonText}>+ Đặt lịch tập</Text>
            </TouchableOpacity>
          </View>
        ) : (
          getSessionsForSelectedDate().map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              changeRequests={changeRequests}
              subscription={subscriptions[session.subscription]}
              TRAINING_TYPES={TRAINING_TYPES}
              STATUS={STATUS}
              REQUEST_STATUS={REQUEST_STATUS}
              renderRequestActions={renderRequestActions}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default MemberScheduleScreen;
