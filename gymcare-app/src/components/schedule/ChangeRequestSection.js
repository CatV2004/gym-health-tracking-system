import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { format, parseISO } from "date-fns";
import colors from "../../constants/colors";
import styles from "../../screens/member/subscription/schedule/MemberScheduleScreen.styles";

const ChangeRequestSection = ({
  requests,
  REQUEST_STATUS,
  renderRequestActions,
}) => {
  if (!requests.length) return null;

  return (
    <View style={styles.requestsContainer}>
      <Text style={styles.requestsTitle}>Yêu cầu thay đổi:</Text>
      {requests.map((request) => (
        <View key={request.id} style={styles.requestItem}>
          <Icon name="info-outline" size={16} color={colors.orange} />
          <View style={styles.requestDetails}>
            <Text style={styles.requestText}>
              HLV {request.trainer_name} đề xuất đổi sang{" "}
              {format(parseISO(request.proposed_time), "HH:mm dd/MM")}
            </Text>
            {request.reason && (
              <Text style={styles.requestReason}>Lý do: {request.reason}</Text>
            )}
            {renderRequestActions(request)}
          </View>
        </View>
      ))}
    </View>
  );
};

export default ChangeRequestSection;
