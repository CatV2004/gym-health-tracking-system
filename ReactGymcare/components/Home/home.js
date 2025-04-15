import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import styles from "./styles";
import moment from "moment";
import api, { endpoint } from "../../configs/API";

const { width: windowWidth } = Dimensions.get("window");

const messages = [
  "Các lớp học 15 phút để làm các dụng cụ",
  "Các lớp tập sẽ được đặt lịch trước 2 giờ. Hội viên Signature có thể đặt trước bất kỳ lúc nào.",
  "Quý hội viên vui lòng đặt lịch trước khi đến phòng tập.",
];

const menuItems = [
  { label: "Đặt lịch tập luyện", iconName: "calendar-month-outline" },
  { label: "Đặt lịch HLV", iconName: "account-tie" },
  { label: "Lịch học", iconName: "timetable" },
  { label: "Mua dịch vụ", iconName: "cart-outline" },
];

const promotions = [
  { title: "🔥 Combo Hè", description: "Giảm ngay 30% khi đăng ký 3 tháng" },
  { title: "🎁 Quà tặng", description: "Áo thun thể thao cho hội viên mới" },
  { title: "💪 Giảm giá", description: "Ưu đãi đặc biệt cho sinh viên" },
];

const news = [
  {
    title: "🎉 Khai giảng lớp học mùa hè",
    description: "Lớp học đặc biệt với chương trình giảm giá cho hội viên mới.",
    date: "2025-05-10",
  },
  {
    title: "💼 Mở rộng dịch vụ thể hình",
    description: "Thêm các gói tập mới dành cho mọi đối tượng.",
    date: "2025-04-25",
  },
  {
    title: "🏅 Chương trình giảm giá mùa thu",
    description: "Giảm 20% cho tất cả các dịch vụ từ tháng 9.",
    date: "2025-09-01",
  },
];

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(endpoint.getCategoryPackage);
        setCategories(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục gói tập:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = async (categoryId) => {
    try {
      const res = await api.get(`/category-package/${categoryId}/packages/`);
      const packages = res.data;

      navigation.navigate("PackageListScreen", { packages, categoryId });
    } catch (error) {
      console.error("Lỗi khi lấy gói tập theo danh mục:", error);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Xin chào {`${user?.first_name || "Bạn"} ${user?.last_name || ""}`}!
          </Text>
        </View>

        {/* Phần cuộn ngang thông báo */}
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
            {messages.map((msg, index) => (
              <View key={index} style={styles.messageBox}>
                <View style={styles.textContainer}>
                  <Text style={styles.messageText}>{msg}</Text>
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
                <Animated.View
                  key={index}
                  style={[styles.normalDot, { width }]}
                />
              );
            })}
          </View>
        </View>

        {/* Cuộn dọc với pull-to-refresh */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Menu */}
          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem}>
                <Icon
                  name={item.iconName}
                  size={30}
                  color="#ef440ee8"
                  style={{ marginBottom: 6 }}
                />
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Gói tập */}
          <View style={styles.packageSection}>
            <Text style={styles.sectionTitle}>Danh mục gói tập</Text>
            <View style={styles.packageContainer}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.packageItem}
                  onPress={() => handleCategoryPress(item.id)}
                >
                  <Text style={styles.packageText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ưu đãi */}
          <View style={styles.promotionSection}>
            <Text style={styles.sectionTitle}>Ưu đãi dành cho bạn</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {promotions.map((promo, index) => (
                <View key={index} style={styles.promotionCard}>
                  <Text style={styles.promotionTitle}>{promo.title}</Text>
                  <Text style={styles.promotionDescription}>
                    {promo.description}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
          {/* Tin tức */}
          <View style={styles.newsSection}>
            <Text style={styles.sectionTitle}>Tin tức mới nhất</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {news.map((item, index) => (
                <View key={index} style={styles.newsCard}>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsDescription}>{item.description}</Text>
                  <Text style={styles.newsDate}>
                    {moment(item.date).format("DD/MM/YYYY")}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Home;
