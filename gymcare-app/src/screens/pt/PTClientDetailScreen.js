import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import {
  getClientDetail,
  recordClientProgress,
  getClientProgressHistory,
  getClientPrediction,
  createAIPrediction,
} from "../../api/pt/ptClientApi";
import PTNavHeader from "../../components/pt/PTNavHeader";
import PTProgressChart from "../../components/pt/PTProgressChart";
import ClientProgressForm from "../../components/pt/ClientProgressForm";
import styles from "./PTClientDetailScreen.styles";
import PredictionCard from "./PredictionCard";

const PTClientDetailScreen = ({ route }) => {
  const { clientId } = route.params;
  const token = useSelector((state) => state.auth.accessToken);
  const [client, setClient] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("progress");
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [detailData, historyData] = await Promise.all([
          getClientDetail(clientId, token),
          getClientProgressHistory(clientId, token),
        ]);
        setClient(detailData);
        setProgressHistory(historyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId, token]);

  const fetchPrediction = async () => {
    try {
      setPredictionLoading(true);
      const predictionData = await getClientPrediction(clientId, token);
      setPrediction(predictionData);
    } catch (err) {
      console.error("Failed to fetch prediction:", err);
      // Bạn có thể thêm xử lý hiển thị lỗi cho người dùng nếu cần
      setError(err.message);
    } finally {
      setPredictionLoading(false);
    }
  };

  useEffect(() => {
    if (clientId && token) {
      fetchPrediction();
    }
  }, [clientId, token]);
  const handleStartTraining = async () => {
    try {
      setIsTraining(true);
      setTrainingProgress(0);

      const interval = setInterval(() => {
        setTrainingProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 300);

      await createAIPrediction(clientId, token);

      clearInterval(interval);
      setTrainingProgress(100);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);

      setTimeout(() => fetchPrediction(), 3500);
    } catch (err) {
      console.error("Training error:", err);
      setError(err.message);
    } finally {
      setIsTraining(false);
    }
  };

  const handleSubmitProgress = async (formData) => {
    try {
      setLoading(true);
      const newProgress = await recordClientProgress(clientId, formData, token);
      setProgressHistory([newProgress, ...progressHistory]);
      // Cập nhật cân nặng hiện tại
      setClient((prev) => ({
        ...prev,
        weight: formData.weight_kg,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !client) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PTNavHeader
        title={`${client.user.first_name} ${client.user.last_name}`}
        showBack={true}
      />

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {client.user.avatar ? (
            <Image source={{ uri: client.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {client.user.first_name.charAt(0)}
                {client.user.last_name.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {client.user.first_name} {client.user.last_name}
          </Text>
          <Text style={styles.infoText}>
            Tuổi: {new Date().getFullYear() - client.birth_year}
          </Text>
          <Text style={styles.infoText}>Chiều cao: {client.height} cm</Text>
          <Text style={styles.infoText}>Cân nặng: {client.weight} kg</Text>
          <Text style={styles.goalText}>Mục tiêu: {client.goal}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "progress" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("progress")}
        >
          <Text style={styles.tabText}>Tiến độ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "history" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={styles.tabText}>Lịch sử</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "prediction" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("prediction")}
        >
          <Text style={styles.tabText}>Dự đoán</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "progress" ? (
        <ScrollView style={styles.contentContainer}>
          <PTProgressChart
            progressData={progressHistory}
            currentStats={{
              weight: client.weight,
              body_fat: progressHistory[0]?.body_fat,
              muscle_mass: progressHistory[0]?.muscle_mass,
            }}
          />

          <ClientProgressForm
            onSubmit={handleSubmitProgress}
            initialValues={{
              weight_kg: client.weight || "",
              body_fat: progressHistory[0]?.body_fat || "",
              muscle_mass: progressHistory[0]?.muscle_mass || "",
              notes: "",
            }}
          />
        </ScrollView>
      ) : activeTab === "history" ? (
        <ScrollView style={styles.contentContainer}>
          {progressHistory.length > 0 ? (
            progressHistory.map((progress, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {new Date(progress.created_date).toLocaleDateString()}
                </Text>
                <View style={styles.historyStats}>
                  <Text style={styles.historyStat}>
                    Cân nặng: {progress.weight_kg} kg
                  </Text>
                  <Text style={styles.historyStat}>
                    Mỡ: {progress.body_fat}%
                  </Text>
                  <Text style={styles.historyStat}>
                    Cơ: {progress.muscle_mass}%
                  </Text>
                </View>
                {progress.notes && (
                  <Text style={styles.historyNotes}>
                    Ghi chú: {progress.notes}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có dữ liệu tiến độ</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.contentContainer}>
          <PredictionCard
            prediction={prediction}
            loading={predictionLoading}
            onTrain={handleStartTraining}
            isTraining={isTraining}
            trainingProgress={trainingProgress}
            showSuccess={showSuccess}
          />
        </ScrollView>
      )}
    </View>
  );
};

export default PTClientDetailScreen;
