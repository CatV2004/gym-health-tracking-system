import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import categoryPackageService from "../../../../api/categoryPackageService";
import PackageItem from "../../../../components/home/package/PackageItem";
import styles from "./PackagesOfCategoryScreen.style"; 

export default function PackagesOfCategoryScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const [searchText, setSearchText] = useState("");
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 5;

  const fetchPackages = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await categoryPackageService.getPackagesByCategory(categoryId, pageNum, pageSize);
      const newPackages = res.data.results;

      setPackages((prev) =>
        pageNum === 1 ? newPackages : [...prev, ...newPackages]
      );
      setHasMore(!!res.data.next);
    } catch (error) {
      console.error("Lỗi khi lấy gói tập:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchPackages(page);
  }, [fetchPackages, page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const filteredPackages = packages.filter((item) => {
    const query = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const renderItem = ({ item }) => (
    <PackageItem
      item={item}
      onPress={(packageItem) => navigation.navigate("PackageDetail", { pack: packageItem })}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gói tập cho danh mục {categoryName}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm gói tập..."
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.body}>
        <FlatList
          data={filteredPackages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" color="#ef440ee8" />
            ) : filteredPackages.length === 0 ? (
              <Text style={{ textAlign: "center", padding: 16 }}>
                Không có gói tập nào.
              </Text>
            ) : null
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}
