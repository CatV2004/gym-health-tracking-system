// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   RefreshControl,
//   Modal,
//   TextInput,
//   ToastAndroid,
// } from "react-native";
// import { useFocusEffect } from "@react-navigation/native";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   fetchExpiredSubscriptions,
//   fetchMemberSubscriptions,
// } from "../../../store/memberSlice";
// import { submitRating } from "../../../api/subscriptionApi";
// import LoadingIndicator from "../../../components/LoadingIndicator";
// import styles from "./SubscriptionListScreen.styles";
// import colors from "../../../constants/colors";
// import { formatCurrency, formatDate } from "../../../utils/format";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import StarRating from "../../../components/StarRating";
// import Button from "../../../components/buttons/Button";
// import { reviewTrainer, reviewTrainingPackage } from "../../../api/reviewService";

// const SubscriptionListScreen = ({ navigation }) => {
//   const token = useSelector((state) => state.auth.accessToken);
//   const dispatch = useDispatch();
//   const { expiredSubscriptions, subscriptions, loading } = useSelector(
//     (state) => state.member
//   );
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedSubscription, setSelectedSubscription] = useState(null);
//   const [ratingModalVisible, setRatingModalVisible] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [review, setReview] = useState("");
//   const [activeTab, setActiveTab] = useState("active");
//   const [ratingType, setRatingType] = useState("package"); // 'package' hoặc 'trainer'

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await Promise.all([
//       dispatch(fetchMemberSubscriptions()),
//       dispatch(fetchExpiredSubscriptions()),
//     ]);
//     setRefreshing(false);
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       dispatch(fetchMemberSubscriptions());
//       dispatch(fetchExpiredSubscriptions());
//     }, [dispatch])
//   );

//   const handleRate = async () => {
//     if (!selectedSubscription) return;
  
//     try {
//       const payload = {};
//       if (rating > 0) payload.rating = rating;
//       if (review.trim() !== "") payload.comment = review.trim();
  
//       if (Object.keys(payload).length === 0) {
//         Alert.alert("Thông báo", "Vui lòng nhập đánh giá hoặc chọn số sao.");
//         return;
//       }
  
//       if (ratingType === "package") {
//         await reviewTrainingPackage(
//           selectedSubscription.training_package.id,
//           payload,
//           token
//         );
//       } else {
//         await reviewTrainer(
//           selectedSubscription.training_package.pt.id,
//           payload,
//           token
//         );
//       }
  
//       ToastAndroid.show("Đánh giá đã được gửi!", ToastAndroid.SHORT);
  
//       setRatingModalVisible(false);
//       setRating(0);
//       setReview("");
//       setSelectedSubscription(null);
  
//       dispatch(fetchExpiredSubscriptions());
//       dispatch(fetchMemberSubscriptions());
//     } catch (error) {
//       console.error("Gửi đánh giá thất bại:", error);
//     }
//   };
  

//   const filteredSubscriptions =
//     activeTab === "active" ? subscriptions : expiredSubscriptions;

//   const renderSubscriptionItem = ({ item }) => {
//     const ptName = `${item.training_package.pt.user.first_name} ${item.training_package.pt.user.last_name}`;
//     const sessionsCompleted = 0;
//     const totalSessions = item.training_package.session_count;
//     const isActive = item.status === 1 && item.status_display === "Active";
//     const canRatePackage = !isActive && !item.user_has_rated;
//     const canRateTrainer = !isActive && !item.training_package.pt.user_has_rated;


//     return (
//       <TouchableOpacity
//         style={[
//           styles.card,
//           !isActive && { opacity: 0.7, backgroundColor: colors.lightGray },
//         ]}
//         onPress={() =>
//           navigation.navigate("SubscriptionDetail", { subscription: item })
//         }
//       >
//         <View style={styles.cardHeader}>
//           <Text style={styles.packageName}>{item.training_package.name}</Text>
//           <View
//             style={[
//               styles.statusBadge,
//               {
//                 backgroundColor:
//                   item.status === 1 ? colors.success : colors.warning,
//               },
//             ]}
//           >
//             <Text style={styles.statusText}>{item.status_display}</Text>
//           </View>
//         </View>

//         <View style={styles.cardBody}>
//           <View style={styles.ptContainer}>
//             <Image
//               source={{ uri: item.training_package.pt.user.avatar }}
//               style={styles.ptAvatar}
//             />
//             <View>
//               <Text style={styles.ptText}>Huấn luyện viên: {ptName}</Text>
//               <Text style={styles.ptExperience}>
//                 Kinh nghiệm: {item.training_package.pt.experience} năm
//               </Text>
//             </View>
//           </View>

//           <View style={styles.progressContainer}>
//             <Text style={styles.progressText}>
//               Buổi tập: {sessionsCompleted}/{totalSessions}
//             </Text>
//             <View style={styles.progressBar}>
//               <View
//                 style={[
//                   styles.progressFill,
//                   {
//                     width: `${(sessionsCompleted / totalSessions) * 100}%`,
//                   },
//                 ]}
//               />
//             </View>
//           </View>

//           <View style={styles.dateContainer}>
//             <View style={styles.dateItem}>
//               <Icon name="calendar-today" size={16} color={colors.primary} />
//               <Text style={styles.dateText}>
//                 Bắt đầu: {formatDate(item.start_date)}
//               </Text>
//             </View>
//             <View style={styles.dateItem}>
//               <Icon name="event-available" size={16} color={colors.primary} />
//               <Text style={styles.dateText}>
//                 Kết thúc: {formatDate(item.end_date)}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.footer}>
//             <Text style={styles.priceText}>
//               {formatCurrency(Number(item.total_cost))}
//             </Text>

//             {isActive ? (
//               <TouchableOpacity
//                 style={styles.bookButton}
//                 onPress={() =>
//                   navigation.navigate("BookSession", {
//                     packageId: item.training_package.id,
//                   })
//                 }
//               >
//                 <Text style={styles.bookButtonText}>Đặt lịch tập</Text>
//               </TouchableOpacity>
//             ) : canRatePackage || canRateTrainer ? (
//               <TouchableOpacity
//                 style={styles.rateButton}
//                 onPress={() => {
//                   setSelectedSubscription(item);
//                   setRatingModalVisible(true);
//                   setRatingType("package");
//                 }}
//               >
//                 <Text style={styles.rateButtonText}>Đánh giá</Text>
//               </TouchableOpacity>
//             ) : null}
//           </View>
          
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (loading && !refreshing) return <LoadingIndicator />;

//   const getModalTitle = () => {
//     if (!selectedSubscription) return "Đánh giá";
    
//     try {
//       return `Đánh giá ${
//         ratingType === "package"
//           ? selectedSubscription.training_package?.name || "gói tập"
//           : selectedSubscription.training_package?.pt?.user?.first_name || "huấn luyện viên"
//       }`;
//     } catch (error) {
//       console.error("Error getting modal title:", error);
//       return "Đánh giá";
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tabButton, activeTab === "active" && styles.activeTab]}
//           onPress={() => setActiveTab("active")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === "active" && styles.activeTabText,
//             ]}
//           >
//             Đang hoạt động
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.tabButton,
//             activeTab === "expired" && styles.activeTab,
//           ]}
//           onPress={() => setActiveTab("expired")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === "expired" && styles.activeTabText,
//             ]}
//           >
//             Đã kết thúc
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={filteredSubscriptions}
//         renderItem={renderSubscriptionItem}
//         keyExtractor={(item) => item.id.toString()}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Icon name="fitness-center" size={50} color={colors.gray} />
//             <Text style={styles.emptyText}>Bạn chưa gói tập nào</Text>
//           </View>
//         }
//       />

//       <Modal
//         visible={ratingModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setRatingModalVisible(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPressOut={() => setRatingModalVisible(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>{getModalTitle()}</Text>

//               <View style={styles.ratingTypeContainer}>
//                 <TouchableOpacity
//                   style={[
//                     styles.ratingTypeButton,
//                     ratingType === "package" && styles.activeRatingType,
//                   ]}
//                   onPress={() => setRatingType("package")}
//                 >
//                   <Text>Gói tập</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[
//                     styles.ratingTypeButton,
//                     ratingType === "trainer" && styles.activeRatingType,
//                   ]}
//                   onPress={() => setRatingType("trainer")}
//                 >
//                   <Text>Huấn luyện viên</Text>
//                 </TouchableOpacity>
//               </View>

//               <StarRating
//                 rating={rating}
//                 onRatingChange={setRating}
//                 starSize={30}
//               />

//               <TextInput
//                 style={styles.reviewInput}
//                 placeholder="Nhận xét của bạn..."
//                 multiline
//                 numberOfLines={4}
//                 value={review}
//                 onChangeText={setReview}
//               />

//               <View style={styles.modalButtons}>
//                 <Button
//                   title="Hủy"
//                   onPress={() => setRatingModalVisible(false)}
//                   style={styles.cancelButton}
//                   textStyle={styles.cancelButtonText}
//                 />
//                 <Button
//                   title="Gửi đánh giá"
//                   onPress={handleRate}
//                   disabled={rating === 0}
//                 />
//               </View>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// };

// export default SubscriptionListScreen;


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
        onPressItem={(item) => navigation.navigate("SubscriptionDetail", { subscription: item })}
        onRatePress={(item) => {
          setSelectedSubscription(item);
          setRatingModalVisible(true);
          setRatingType("package");
        }}
        onBookPress={(item) => navigation.navigate("BookSession", {
          packageId: item.training_package.id,
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