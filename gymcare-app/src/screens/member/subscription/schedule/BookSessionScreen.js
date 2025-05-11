import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { createWorkoutSchedule } from '../../../../api/schedule/workoutScheduleService';
import Button from '../../../../components/buttons/Button';
import styles from './BookSessionScreen.styles';
import colors from '../../../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BookSessionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const token = useSelector((state) => state.auth.accessToken);
  const { packageId } = route.params;

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [trainingType, setTrainingType] = useState(1); // Default to 1
  const [duration, setDuration] = useState(60); // Default to 60 minutes
  const [loading, setLoading] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const handleSubmit = async () => {
    if (!date || !time) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày và giờ tập');
      return;
    }

    // Combine date and time
    const scheduleDateTime = new Date(date);
    scheduleDateTime.setHours(time.getHours());
    scheduleDateTime.setMinutes(time.getMinutes());
    scheduleDateTime.setSeconds(0);
    scheduleDateTime.setMilliseconds(0);

    // Check if selected time is in the future
    if (scheduleDateTime <= new Date()) {
      Alert.alert('Lỗi', 'Vui lòng chọn thời gian trong tương lai');
      return;
    }

    const workoutData = {
      subscription: packageId, // Changed from training_package to subscription
      training_type: trainingType, // Added training_type
      scheduled_at: scheduleDateTime.toISOString(), // Changed from scheduled_date to scheduled_at
      duration: duration, // Added duration
    };

    try {
      setLoading(true);
      const response = await createWorkoutSchedule(workoutData, token);
      Alert.alert(
        'Thành công',
        'Đã đặt lịch tập thành công',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      console.error('Booking error:', error);
      let errorMessage = 'Đặt lịch tập thất bại. Vui lòng thử lại';
      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đặt lịch tập</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ngày tập</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Text>{date.toLocaleDateString('vi-VN')}</Text>
          <Icon name="calendar-today" size={20} color={colors.primary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Giờ tập</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowTimePicker(true)}
          activeOpacity={0.7}
        >
          <Text>{time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
          <Icon name="access-time" size={20} color={colors.primary} />
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Loại hình tập</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioButton, trainingType === 0 && styles.radioButtonSelected]}
            onPress={() => setTrainingType(0)}
          >
            <Text style={trainingType === 0 ? styles.radioButtonSelectedText : styles.radioButtonText}>
              Tự tập
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radioButton, trainingType === 1 && styles.radioButtonSelected]}
            onPress={() => setTrainingType(1)}
          >
            <Text style={trainingType === 1 ? styles.radioButtonSelectedText : styles.radioButtonText}>
              Tập với PT
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Thời lượng (phút)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={duration.toString()}
          onChangeText={(text) => setDuration(Number(text) || 60)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Nhập ghi chú nếu có..."
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <Button
        title="Xác nhận đặt lịch"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

export default BookSessionScreen;