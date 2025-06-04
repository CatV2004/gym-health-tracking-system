import React, { useState, useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import PackageItem from "./PackageItem";
import { fetchTrainingPackages } from "../../../api/trainingPackageService";
import { useNavigation } from "@react-navigation/native";

const usePackages = (filters) => {
  const [state, setState] = useState({
    data: [],
    page: 1,
    next: null,
    loading: false,
    refreshing: false,
    error: null,
  });

  const loadData = async (pageNumber = 1, isRefreshing = false) => {
    if (state.loading) return;

    setState((prev) => ({
      ...prev,
      loading: !isRefreshing,
      refreshing: isRefreshing,
      error: null,
    }));

    try {
      const res = await fetchTrainingPackages(filters, pageNumber);

      setState((prev) => ({
        ...prev,
        data:
          isRefreshing || pageNumber === 1
            ? res.results
            : [...prev.data, ...res.results],
        next: res.next,
        page: pageNumber,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err.message || "Lỗi tải dữ liệu",
      }));
    } finally {
      setState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
      }));
    }
  };

  useEffect(() => {
    loadData(1, true);
  }, [filters]);

  return {
    ...state,
    loadMore: () => state.next && !state.loading && loadData(state.page + 1),
    refresh: () => loadData(1, true),
  };
};

const TrainingPackageList = ({ filters }) => {

  const navigation = useNavigation();
  const { data, loading, refreshing, error, loadMore, refresh } =
    usePackages(filters);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        {error ? error : "Không có gói tập nào phù hợp"}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PackageItem
          item={item}
          onPress={() => navigation.navigate("PackageDetail", { pack: item })}
        />
      )}
      onEndReached={loadMore}
      onEndReachedThreshold={0.2}
      refreshing={refreshing}
      onRefresh={refresh}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={data.length === 0 && styles.emptyContainer}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  empty: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
  },
});

export default TrainingPackageList;
