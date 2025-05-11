import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  Keyboard,
} from "react-native";
import { useSelector } from "react-redux";
import {
  getTrainerWorkoutSchedules,
  createChangeRequest,
  approveWorkoutSchedule,
} from "../../api/schedule/workoutScheduleService";
import { getSubscriptionsDetail } from "../../api/subscriptionApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import "moment/locale/vi";
import PTNavHeader from "../../components/pt/PTNavHeader";
import styles from "./TrainerWorkoutSchedulesScreen.styles";


const STATUS_MAP = {
  0: { text: "Đã lên lịch", color: "#4a90e2" },
  1: { text: "Đã hoàn thành", color: "#4CAF50" },
  2: { text: "Đã huỷ", color: "#F44336" },
  3: { text: "Chờ thay đổi", color: "#FF9800" },
  4: { text: "Đã đổi lịch", color: "#9C27B0" },
  5: { text: "Đã duyệt", color: "#009688" },
};

const TRAINING_TYPE_MAP = {
  0: "Tự tập luyện",
  1: "PT 1-1",
};

const TrainerWorkoutSchedulesScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [proposedTime, setProposedTime] = useState(new Date());
  const [reason, setReason] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const token = useSelector((state) => state.auth.accessToken);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [scheduleToApprove, setScheduleToApprove] = useState(null);

  const handleApproveSchedule = (schedule) => {
    setScheduleToApprove(schedule);
    setShowApproveConfirm(true);
  };

  const confirmApproveSchedule = async () => {
    try {
      await approveWorkoutSchedule(scheduleToApprove.id, token);
      Alert.alert("Thành công", "Lịch tập đã được duyệt");
      setShowApproveConfirm(false);
      fetchSchedules(); // Refresh danh sách
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Duyệt lịch thất bại");
    }
  };

  const fetchSchedules = async () => {
    try {
      setRefreshing(true);
      const response = await getTrainerWorkoutSchedules(token);
      const scheduleData = response.data;

      const enrichedSchedules = await Promise.all(
        scheduleData.map(async (schedule) => {
          if (!schedule.subscription) return schedule;

          try {
            const detailRes = await getSubscriptionsDetail(
              schedule.subscription,
              token
            );
            return {
              ...schedule,
              subscriptionDetail: detailRes.data,
            };
          } catch (err) {
            console.warn(
              `Failed to fetch subscription ${schedule.subscription}:`,
              err.message
            );
            return schedule;
          }
        })
      );

      setSchedules(enrichedSchedules);
      setError(null);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = () => {
    fetchSchedules();
  };

  const handleRequestChange = (schedule) => {
    setSelectedSchedule(schedule);
    setProposedTime(new Date(schedule.scheduled_at));
    setReason("");
    setShowChangeModal(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type !== 'dismissed' && selectedDate) {
      setProposedTime(selectedDate);
    }
  };

  const submitChangeRequest = async () => {
    if (!reason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do thay đổi");
      return;
    }

    try {
      const requestData = {
        schedule: selectedSchedule.id,
        proposed_time: proposedTime.toISOString(),
        reason: reason.trim(),
      };

      console.log("================: ", requestData.proposed_time)

      await createChangeRequest(token, requestData);

      Alert.alert("Thành công", "Yêu cầu thay đổi lịch đã được gửi");
      setShowChangeModal(false);
      fetchSchedules(); // Refresh the list
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Gửi yêu cầu thất bại");
    }
  };

  const renderScheduleItem = (schedule) => {
    const formattedDate = moment(schedule.scheduled_at).format("LLL");
    const statusInfo = STATUS_MAP[schedule.status] || {
      text: "Không xác định",
      color: "#9E9E9E",
    };
    const trainingTypeText =
      TRAINING_TYPE_MAP[schedule.training_type] || "Khác";
    const sub = schedule.subscriptionDetail;
    const pack = sub?.training_package;

    // Only allow change requests for scheduled (status 0) or already requested (status 3) sessions
    const canRequestChange = schedule.status === 0 || schedule.status === 3;

    // Chỉ cho phép duyệt với các trạng thái cụ thể (ví dụ: status 0 - đã lên lịch)
    const canApprove = schedule.status === 0;

    return (
      <View key={schedule.id} style={styles.scheduleItem}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTime}>{formattedDate}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.scheduleDetails}>
          <View style={styles.detailRow}>
            <Icon name="access-time" size={16} color="#555" />
            <Text style={styles.detailText}>
              Thời lượng: {schedule.duration} phút
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="fitness-center" size={16} color="#555" />
            <Text style={styles.detailText}>Loại tập: {trainingTypeText}</Text>
          </View>
        </View>

        {sub && (
          <>
            <View style={styles.divider} />
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>
                Gói tập: {pack?.name || "Không xác định"}
              </Text>
              <Text style={styles.memberName}>Hội viên: {sub.member_name}</Text>
            </View>
          </>
        )}

        <View style={styles.actionButtons}>
          {canApprove && (
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveSchedule(schedule)}
            >
              <Text style={styles.actionButtonText}>Duyệt lịch</Text>
            </TouchableOpacity>
          )}

          {canRequestChange && (
            <TouchableOpacity
              style={[styles.actionButton, styles.changeButton]}
              onPress={() => handleRequestChange(schedule)}
            >
              <Text style={styles.actionButtonText}>Yêu cầu thay đổi</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSchedules}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PTNavHeader
        title="Lịch tập hội viên"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4a90e2"]}
            tintColor="#4a90e2"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Lịch tập các hội viên phụ trách</Text>
          <Text style={styles.subtitle}>
            Tổng số: {schedules.length} buổi tập
          </Text>
        </View>

        {schedules.length > 0 ? (
          schedules.map(renderScheduleItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={48} color="#888" />
            <Text style={styles.emptyText}>Không có lịch tập nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal xác nhận duyệt lịch */}
      <Modal
        visible={showApproveConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowApproveConfirm(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContainer}>
            <Text style={styles.confirmModalTitle}>Xác nhận duyệt lịch</Text>
            <Text style={styles.confirmModalText}>
              Bạn có chắc chắn muốn duyệt lịch tập này?
            </Text>
            
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.cancelButton]}
                onPress={() => setShowApproveConfirm(false)}
              >
                <Text style={styles.confirmModalButtonText}>Huỷ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.submitButton]}
                onPress={confirmApproveSchedule}
              >
                <Text style={styles.confirmModalButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Request Modal */}
      <Modal
        visible={showChangeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Yêu cầu thay đổi lịch tập</Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Lịch hiện tại:</Text>
              <Text style={styles.modalText}>
                {selectedSchedule &&
                  moment(selectedSchedule.scheduled_at).format("LLL")}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Thời gian đề xuất:</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {moment(proposedTime).format("LLL")}
                </Text>
                <Icon name="edit" size={18} color="#4a90e2" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={proposedTime}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  onCancel={() => setShowDatePicker(false)}
                />
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Lý do thay đổi:</Text>
              <TextInput
                style={styles.reasonInput}
                multiline
                numberOfLines={4}
                placeholder="Nhập lý do thay đổi..."
                value={reason}
                onChangeText={setReason}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowChangeModal(false)}
              >
                <Text style={styles.modalButtonText}>Huỷ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitChangeRequest}
              >
                <Text style={styles.modalButtonText}>Gửi yêu cầu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TrainerWorkoutSchedulesScreen;
