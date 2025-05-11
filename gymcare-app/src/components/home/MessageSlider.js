import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Animated } from "react-native";

const { width: windowWidth } = Dimensions.get("window");

const MessageSlider = () => {
  const scrollX = new Animated.Value(0); // Thêm dòng này để khởi tạo scrollX
  
  const messages = [
    { id: 1, text: "Các lớp học 15 phút để làm các dụng cụ" },
    {
      id: 2,
      text: "Các lớp tập sẽ được đặt lịch trước 2 giờ. Hội viên Signature có thể đặt trước bất kỳ lúc nào.",
    },
    {
      id: 3,
      text: "Quý hội viên vui lòng đặt lịch trước khi đến phòng tập.",
    },
  ];

  return ( // Thêm return ở đây
    <View style={styles.scrollContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: scrollX,
                },
              },
            },
          ],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageBox}>
            <View style={styles.textContainer}>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicatorContainer}>
        {messages.map((_, index) => {
          const width = scrollX.interpolate({
            inputRange: [
              windowWidth * (index - 1),
              windowWidth * index,
              windowWidth * (index + 1),
            ],
            outputRange: [8, 16, 8],
            extrapolate: "clamp",
          });
          return (
            <Animated.View key={index} style={[styles.normalDot, { width }]} />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    position: "relative",
    marginTop: 50,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    paddingBottom: 15,
  },
  messageBox: {
    width: windowWidth,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    top: 0,
    zIndex: 100,
  },
  textContainer: {
    width: "100%",
    height: 100,
    backgroundColor: "#fff3e6",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef440ee8",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  messageText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  normalDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef440ee8",
    marginHorizontal: 4,
  },
});

export default MessageSlider;