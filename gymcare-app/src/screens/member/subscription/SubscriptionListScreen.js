import React, { useState } from "react";
import { View, ToastAndroid } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchExpiredSubscriptions,
  fetchMemberSubscriptions,
} from "../../../store/memberSlice";
import { reviewTrainer, reviewTrainingPackage } from "../../../api/reviewService";
import LoadingIndicator from "../../../components/LoadingIndicator";
import SubscriptionTabs from "../../../components/subscription/SubscriptionTabs";
import SubscriptionList from "../../../components/subscription/SubscriptionList";
import RatingModal from "../../../components/subscription/RatingModal";
import styles from "./SubscriptionListScreen.styles";

const SubscriptionListScreen = ({ navigation }) => {
  const token = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();
  const { expiredSubscriptions, subscriptions, loading } = useSelector(
    (state) => state.member
  );
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [ratingType, setRatingType] = useState("package");

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchMemberSubscriptions()),
      dispatch(fetchExpiredSubscriptions()),
    ]);
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchMemberSubscriptions());
      dispatch(fetchExpiredSubscriptions());
    }, [dispatch])
  );

  const handleRate = async () => {
    if (!selectedSubscription) return;
  
    try {
      const payload = {};
      if (rating > 0) payload.rating = rating;
      if (review.trim() !== "") payload.comment = review.trim();
  
      if (Object.keys(payload).length === 0) {
        Alert.alert("Thông báo", "Vui lòng nhập đánh giá hoặc chọn số sao.");
        return;
      }
  
      if (ratingType === "package") {
        await reviewTrainingPackage(
          selectedSubscription.training_package.id,
          payload,
          token
        );
      } else {
        await reviewTrainer(
          selectedSubscription.training_package.pt.id,
          payload,
          token
        );
      }
  
      ToastAndroid.show("Đánh giá đã được gửi!", ToastAndroid.SHORT);
  
      setRatingModalVisible(false);
      setRating(0);
      setReview("");
      setSelectedSubscription(null);
  
      dispatch(fetchExpiredSubscriptions());
      dispatch(fetchMemberSubscriptions());
    } catch (error) {
      console.error("Gửi đánh giá thất bại:", error);
    }
  };

  const getModalTitle = () => {
    if (!selectedSubscription) return "Đánh giá";
    
    try {
      return `Đánh giá ${
        ratingType === "package"
          ? selectedSubscription.training_package?.name || "gói tập"
          : selectedSubscription.training_package?.pt?.user?.first_name || "huấn luyện viên"
      }`;
    } catch (error) {
      console.error("Error getting modal title:", error);
      return "Đánh giá";
    }
  };

  const filteredSubscriptions =
    activeTab === "active" ? subscriptions : expiredSubscriptions;

  if (loading && !refreshing) return <LoadingIndicator />;
  return (
    <View style={styles.container}>
      <SubscriptionTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <SubscriptionList
        data={filteredSubscriptions} 
        onRefresh={onRefresh}
        refreshing={refreshing}
        onPressItem={(item) => navigation.navigate("MySubscriptionDetail", { subId: item.id })}
        onRatePress={(item) => {
          setSelectedSubscription(item);
          setRatingModalVisible(true);
          setRatingType("package");
        }}
        onBookPress={(item) => navigation.navigate("BookSession", {
          packageId: item.id,
        })}
        activeTab={activeTab}
      />

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
    </View>
  );
};

export default SubscriptionListScreen;