import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import StarRating from '../StarRating';
import Button from '../buttons/Button';
import styles from '../../screens/member/subscription/SubscriptionListScreen.styles';

const RatingModal = ({
  visible,
  onClose,
  rating,
  onRatingChange,
  review,
  onReviewChange,
  ratingType,
  onRatingTypeChange,
  onSubmit,
  modalTitle,
  disabledSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>

            <View style={styles.ratingTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.ratingTypeButton,
                  ratingType === "package" && styles.activeRatingType,
                ]}
                onPress={() => onRatingTypeChange("package")}
              >
                <Text>Gói tập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ratingTypeButton,
                  ratingType === "trainer" && styles.activeRatingType,
                ]}
                onPress={() => onRatingTypeChange("trainer")}
              >
                <Text>Huấn luyện viên</Text>
              </TouchableOpacity>
            </View>

            <StarRating
              rating={rating}
              onRatingChange={onRatingChange}
              starSize={30}
            />

            <TextInput
              style={styles.reviewInput}
              placeholder="Nhận xét của bạn..."
              multiline
              numberOfLines={4}
              value={review}
              onChangeText={onReviewChange}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Hủy"
                onPress={onClose}
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
              />
              <Button
                title="Gửi đánh giá"
                onPress={onSubmit}
                disabled={disabledSubmit}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default RatingModal;