import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import styles from "./HomeScreen.styles";
import MessageSlider from "../../../components/home/MessageSlider";
import MenuGrid from "../../../components/home/MenuGrid";
import CategorySection from "../../../components/home/CategorySection";
import PromotionCarousel from "../../../components/home/PromotionCarousel";
import categoryPackageService from "../../../api/categoryPackageService";
import NewsSection from "../../../components/home/NewsSection";

const HomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoryPackageService.fetchCategoryPackages();
      setCategories(data.results);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục gói tập:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 16 }}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Xin chào {`${user?.first_name || "Bạn"} ${user?.last_name || ""}`}!
        </Text>
      </View>

      <MessageSlider />

      <FlatList
        data={[]} // Dữ liệu rỗng vì nội dung nằm trong ListHeaderComponent
        renderItem={null}
        keyExtractor={() => Math.random().toString()}
        ListHeaderComponent={
          <>
            <MenuGrid navigation={navigation} />
            <CategorySection navigation={navigation} categories={categories} />
            <PromotionCarousel />
            <NewsSection />
          </>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
