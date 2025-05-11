import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { format, parseISO } from "date-fns";
import colors from "../../constants/colors";
import styles from "../../screens/member/subscription/schedule/MemberScheduleScreen.styles";
import ChangeRequestSection from "./ChangeRequestSection";

const SessionItem = ({
  session,
  changeRequests,
  subscription,
  TRAINING_TYPES,
  STATUS,
  REQUEST_STATUS,
  renderRequestActions,
}) => {
  const sessionTime = format(parseISO(session.scheduled_at), "HH:mm");
  const sessionDate = format(parseISO(session.scheduled_at), "dd/MM/yyyy");
  const trainingType = TRAINING_TYPES[session.training_type];
  const status = STATUS[session.status];
  const requests = changeRequests[session.id] || [];

  const isActionable = session.status === 0 || session.status === 1;
  return (
    <View style={styles.sessionCard}>
      {/* Header buổi tập */}
      <View style={styles.sessionHeader}>
        <View style={styles.timeBadge}>
          <Icon name="access-time" size={14} color={colors.white} />
          <Text style={styles.timeText}>{sessionTime}</Text>
        </View>
        <View style={styles.sessionInfo}>
          <View style={styles.sessionTitleRow}>
            <Icon
              name={trainingType.icon}
              size={16}
              color={trainingType.color}
              style={styles.typeIcon}
            />
            <Text style={styles.sessionType}>{trainingType.label}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${status.color}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionMetaText}>
              <Icon name="timer" size={12} color={colors.gray} />{" "}
              {session.duration} phút
            </Text>
            <Text style={styles.sessionMetaText}>
              <Icon name="calendar-today" size={12} color={colors.gray} />{" "}
              {sessionDate}
            </Text>
          </View>
        </View>
      </View>

      {/* Thông tin gói tập */}
      {subscription && (
        <View style={styles.subscriptionInfo}>
          <View style={styles.sectionHeader}>
            <Icon name="assignment" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Thông tin gói tập</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="local-offer" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {subscription.training_package.name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="person" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              HLV: {subscription.training_package.pt.user.first_name}{" "}
              {subscription.training_package.pt.user.last_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="date-range" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {format(parseISO(subscription.start_date), "dd/MM/yyyy")} →{" "}
              {format(parseISO(subscription.end_date), "dd/MM/yyyy")}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon
              name="fitness-center"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>
              {subscription.training_package.session_count} buổi |{" "}
              {subscription.status_display}
            </Text>
          </View>
        </View>
      )}

      {/* Change Request */}
      {requests.length > 0 && (
        <ChangeRequestSection
          requests={requests}
          REQUEST_STATUS={REQUEST_STATUS}
          renderRequestActions={renderRequestActions}
        />
      )}

      {/* Action buttons */}
      {isActionable && (
        <View style={styles.sessionActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="edit" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>
              Sửa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="delete-outline" size={18} color={colors.red} />
            <Text style={[styles.actionText, { color: colors.red }]}>Huỷ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="check-circle-outline" size={18} color={colors.green} />
            <Text style={[styles.actionText, { color: colors.green }]}>
              Hoàn thành
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SessionItem;
