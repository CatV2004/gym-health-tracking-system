import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getMemberSubscriptionsDetail } from '../../../api/subscriptionApi';
import { reviewTrainer, reviewTrainingPackage } from '../../../api/reviewService';
import RatingModal from '../../../components/subscription/RatingModal';
import colors from '../../../constants/colors';
import { formatCurrency, formatDate } from '../../../utils/format';
import styles from './MySubscriptionDetail.styles';
import { ChatService } from "../../../api/chatService";


const MySubscriptionDetail = ({ route, navigation }) => {
  const { subId } = route.params;
  const token = useSelector((state) => state.auth.accessToken);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratingType, setRatingType] = useState('package');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubscriptionDetail = async () => {
    try {
      const response = await getMemberSubscriptionsDetail(subId, token);
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription detail:', error);
      ToastAndroid.show('Lỗi khi tải chi tiết gói tập', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSubscriptionDetail();
      return () => {};
    }, [subId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptionDetail();
  };

  const handleRate = async () => {
    if (!subscription) return;
  
    try {
      const payload = {};
      if (rating > 0) payload.rating = rating;
      if (review.trim() !== "") payload.comment = review.trim();
  
      if (Object.keys(payload).length === 0) {
        ToastAndroid.show("Vui lòng nhập đánh giá hoặc chọn số sao", ToastAndroid.SHORT);
        return;
      }
  
      if (ratingType === "package") {
        await reviewTrainingPackage(
          subscription.training_package.id,
          payload,
          token
        );
      } else {
        await reviewTrainer(
          subscription.training_package.pt.id,
          payload,
          token
        );
      }
  
      ToastAndroid.show("Đánh giá đã được gửi!", ToastAndroid.SHORT);
      setRatingModalVisible(false);
      setRating(0);
      setReview("");
      fetchSubscriptionDetail();
    } catch (error) {
      console.error("Gửi đánh giá thất bại:", error);
      ToastAndroid.show("Gửi đánh giá thất bại", ToastAndroid.SHORT);
    }
  };

  const getModalTitle = () => {
    if (!subscription) return "Đánh giá";
    
    return `Đánh giá ${
      ratingType === "package"
        ? subscription.training_package?.name || "gói tập"
        : `${subscription.training_package?.pt?.user?.first_name} ${subscription.training_package?.pt?.user?.last_name}` || "huấn luyện viên"
    }`;
  };
  
  const { user } = useSelector((state) => state.auth);


  const handleUserPress = async (trainerUser) => {
    try {
      if (!trainerUser || !trainerUser.id || !user || !user.id) {
        ToastAndroid.show("Không thể mở cuộc trò chuyện", ToastAndroid.SHORT);
        return;
      }

      // Tạo hoặc lấy chat room
      const { success, chatId } = await ChatService.getOrCreateChatRoom(
        user.id,
        trainerUser.id
      );

      if (success) {
        navigation.navigate("ChatScreen", {
          chatId,
          otherUser: trainerUser,
        });
      } else {
        ToastAndroid.show("Không thể tạo cuộc trò chuyện", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Lỗi khi mở chat:", error);
      ToastAndroid.show("Đã xảy ra lỗi", ToastAndroid.SHORT);
    }
  };


 


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!subscription) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin gói tập</Text>
      </View>
    );
  }

  const ptName = `${subscription.training_package.pt.user.first_name} ${subscription.training_package.pt.user.last_name}`;
  const canRatePackage = subscription.status !== 1 && !subscription.user_has_rated;
  const canRateTrainer = subscription.status !== 1 && !subscription.training_package.pt.user_has_rated;
  // console.log("subscription.training_package.pt: ",subscription.training_package.pt)

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.packageName}>{subscription.training_package.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: subscription.status === 1 ? colors.success : colors.warning }
        ]}>
          <Text style={styles.statusText}>{subscription.status_display}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin huấn luyện viên</Text>
        <View style={styles.ptContainer}>
          <Image
            source={{ uri: subscription.training_package.pt.user.avatar }}
            style={styles.avatar}
          />
          <View style={styles.ptInfo}>
            <Text style={styles.ptName}>{ptName}</Text>
            <Text style={styles.ptDetail}>
              Kinh nghiệm: {subscription.training_package.pt.experience} năm
            </Text>
            <Text style={styles.ptDetail}>
              Chứng chỉ: {subscription.training_package.pt.certification}
            </Text>
            <TouchableOpacity 
              style={styles.contactButton} 
              onPress={() => handleUserPress(subscription.training_package.pt.user)}
            >
              <Text style={styles.contactButtonText}>Liên lạc</Text>
            </TouchableOpacity>
            
            
            {subscription.training_package.pt.average_rating > 0 && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={colors.warning} />
                <Text style={styles.ratingText}>
                  {subscription.training_package.pt.average_rating.toFixed(1)} 
                  ({subscription.training_package.pt.total_reviews} đánh giá)
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin gói tập</Text>
        <View style={styles.detailRow}>
          <Icon name="fitness-center" size={20} color={colors.primary} />
          <Text style={styles.detailText}>
            Số buổi: {subscription.training_package.session_count}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="category" size={20} color={colors.primary} />
          <Text style={styles.detailText}>
            Loại gói: {subscription.training_package.type_package === 1 ? 'Cá nhân' : 'Nhóm'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar-today" size={20} color={colors.primary} />
          <Text style={styles.detailText}>
            Ngày bắt đầu: {formatDate(subscription.start_date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="event-available" size={20} color={colors.primary} />
          <Text style={styles.detailText}>
            Ngày kết thúc: {formatDate(subscription.end_date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="attach-money" size={20} color={colors.primary} />
          <Text style={styles.detailText}>
            Giá gói: {formatCurrency(Number(subscription.training_package.cost))}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="shopping-cart" size={20} color={colors.primary} />
          <Text style={styles.detailText}>
            Số lượng: {subscription.quantity}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="payments" size={20} color={colors.primary} />
          <Text style={styles.detailText}>
            Tổng thanh toán: {formatCurrency(Number(subscription.total_cost))}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mô tả</Text>
        <Text style={styles.descriptionText}>
          {subscription.training_package.description || 'Không có mô tả'}
        </Text>
      </View>

      {subscription.training_package.average_rating > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá gói tập</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={24} color={colors.warning} />
            <Text style={styles.ratingTextLarge}>
              {subscription.training_package.average_rating.toFixed(1)} 
              ({subscription.training_package.total_reviews} đánh giá)
            </Text>
          </View>
        </View>
      )}

      {(canRatePackage || canRateTrainer) && (
        <TouchableOpacity 
          style={styles.rateButton}
          onPress={() => setRatingModalVisible(true)}
        >
          <Text style={styles.rateButtonText}>Đánh giá gói tập/huấn luyện viên</Text>
        </TouchableOpacity>
      )}

      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        rating={rating}
        onRatingChange={setRating}
        review={review}
        onReviewChange={setReview}
        ratingType={ratingType}
        onRatingTypeChange={setRatingType}
        onSubmit={handleRate}
        modalTitle={getModalTitle()}
        disabledSubmit={rating === 0}
      />
    </ScrollView>
  );
};



export default MySubscriptionDetail;