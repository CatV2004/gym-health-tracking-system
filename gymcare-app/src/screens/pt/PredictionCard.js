import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';

const PredictionCard = ({ prediction, loading, onTrain, isTraining, trainingProgress, showSuccess }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (showSuccess) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuccess]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!prediction) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Không có dữ liệu dự đoán</Text>
        <TouchableOpacity 
          style={styles.trainButton} 
          onPress={onTrain}
          disabled={isTraining}
        >
          {isTraining ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator color="white" />
              <Text style={styles.buttonText}>{Math.floor(trainingProgress)}%</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Train Model</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showSuccess && (
        <Animated.View style={[styles.successMessage, { opacity: fadeAnim }]}>
          <Text style={styles.successText}>Train thành công!</Text>
        </Animated.View>
      )}

      <Text style={styles.header}>Dự đoán sức khỏe</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Ngày dự đoán:</Text>
        <Text style={styles.value}>
          {new Date(prediction.prediction_date).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Kiểm tra tiếp theo:</Text>
        <Text style={styles.value}>
          {new Date(prediction.next_check_date).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Cân nặng dự đoán</Text>
          <Text style={styles.statValue}>{prediction.predicted_weight} kg</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tỷ lệ mỡ</Text>
          <Text style={styles.statValue}>{prediction.predicted_body_fat}%</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Khối lượng cơ</Text>
          <Text style={styles.statValue}>{prediction.predicted_muscle_mass}%</Text>
        </View>
      </View>
      
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Độ tin cậy:</Text>
        <View style={styles.confidenceBar}>
          <View 
            style={[
              styles.confidenceProgress, 
              { width: `${prediction.confidence * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.confidenceValue}>
          {(prediction.confidence * 100).toFixed(1)}%
        </Text>
      </View>

      <TouchableOpacity 
        style={[
          styles.trainButton,
          isTraining && styles.trainButtonDisabled
        ]} 
        onPress={onTrain}
        disabled={isTraining}
      >
        {isTraining ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator color="white" />
            <Text style={styles.buttonText}>{Math.floor(trainingProgress)}%</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Train Model</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  confidenceContainer: {
    marginTop: 15,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  confidenceBar: {
    height: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  confidenceProgress: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  confidenceValue: {
    fontSize: 12,
    color: '#3498db',
    textAlign: 'right',
  },
  trainButton: {
    backgroundColor: '#f39c12',
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  trainButtonDisabled: {
    backgroundColor: '#f39c1280',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMessage: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PredictionCard;