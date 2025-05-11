import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../../screens/member/subscription/SubscriptionListScreen.styles';
import colors from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/format';

const SubscriptionCard = ({ 
  item, 
  onPress, 
  onRatePress, 
  onBookPress, 
  isActive 
}) => {
  const ptName = `${item.training_package.pt.user.first_name} ${item.training_package.pt.user.last_name}`;
  const sessionsCompleted = 0;
  const totalSessions = item.training_package.session_count;
  const canRatePackage = !isActive && !item.user_has_rated;
  const canRateTrainer = !isActive && !item.training_package.pt.user_has_rated;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !isActive && { opacity: 0.7, backgroundColor: colors.lightGray },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.packageName}>{item.training_package.name}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === 1 ? colors.success : colors.warning,
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status_display}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.ptContainer}>
          <Image
            source={{ uri: item.training_package.pt.user.avatar }}
            style={styles.ptAvatar}
          />
          <View>
            <Text style={styles.ptText}>Huấn luyện viên: {ptName}</Text>
            <Text style={styles.ptExperience}>
              Kinh nghiệm: {item.training_package.pt.experience} năm
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Buổi tập: {sessionsCompleted}/{totalSessions}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(sessionsCompleted / totalSessions) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View style={styles.dateItem}>
            <Icon name="calendar-today" size={16} color={colors.primary} />
            <Text style={styles.dateText}>
              Bắt đầu: {formatDate(item.start_date)}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Icon name="event-available" size={16} color={colors.primary} />
            <Text style={styles.dateText}>
              Kết thúc: {formatDate(item.end_date)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.priceText}>
            {formatCurrency(Number(item.total_cost))}
          </Text>

          {isActive ? (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={onBookPress}
            >
              <Text style={styles.bookButtonText}>Đặt lịch tập</Text>
            </TouchableOpacity>
          ) : (canRatePackage || canRateTrainer) ? (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={onRatePress}
            >
              <Text style={styles.rateButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SubscriptionCard;