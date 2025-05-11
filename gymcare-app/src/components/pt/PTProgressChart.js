import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const PTProgressChart = ({ progressData, currentStats }) => {
  if (!progressData || progressData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Chưa có đủ dữ liệu để hiển thị biểu đồ
        </Text>
      </View>
    );
  }

  // Chuẩn bị dữ liệu
  const prepareChartData = () => {
    const sortedData = [...progressData].sort(
      (a, b) => new Date(a.created_date) - new Date(b.created_date)
    );

    const labels = sortedData.map((item) =>
      new Date(item.created_date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
    );

    // Thêm dữ liệu hiện tại nếu có
    if (currentStats) {
      labels.push("Hiện tại");
    }

    return {
      labels,
      weightData: sortedData.map((item) => parseFloat(item.weight_kg)),
      fatData: sortedData.map((item) => parseFloat(item.body_fat)),
      muscleData: sortedData.map((item) => parseFloat(item.muscle_mass)),
    };
  };

  const { labels, weightData, fatData, muscleData } = prepareChartData();

  // Tính toán phạm vi trục Y cho từng chỉ số
  const calculateRange = (data) => ({
    min: Math.floor(Math.min(...data)) - 2,
    max: Math.ceil(Math.max(...data)) + 2,
  });

  return (
    <View style={styles.container}>
      {/* Biểu đồ cân nặng */}
      <Text style={styles.title}>Tiến trình cân nặng (kg)</Text>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: weightData,
              color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
            },
          ],
        }}
        width={Dimensions.get("window").width - 40}
        height={200}
        yAxisSuffix="kg"
        chartConfig={chartConfig}
        bezier
      />

      {/* Biểu đồ tỷ lệ mỡ */}
      <Text style={styles.title}>Tỷ lệ mỡ cơ thể (%)</Text>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: fatData,
              color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
            },
          ],
        }}
        width={Dimensions.get("window").width - 40}
        height={200}
        yAxisSuffix="%"
        chartConfig={{ ...chartConfig, color: () => `rgba(255, 99, 71, 1)` }}
        bezier
      />

      {/* Biểu đồ tỷ lệ cơ */}
      <Text style={styles.title}>Tỷ lệ cơ bắp (%)</Text>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: muscleData,
              color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
            },
          ],
        }}
        width={Dimensions.get("window").width - 40}
        height={200}
        yAxisSuffix="%"
        chartConfig={{ ...chartConfig, color: () => `rgba(46, 204, 113, 1)` }}
        bezier
      />
    </View>
  );
};

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#f8f8f8",
  backgroundGradientTo: "#f8f8f8",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
    color: "#333",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
  },
});

export default PTProgressChart;
