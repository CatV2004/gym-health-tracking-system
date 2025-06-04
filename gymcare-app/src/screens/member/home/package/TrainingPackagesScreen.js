import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TrainingPackageList from "../../../../components/home/package/TrainingPackageList";
import TrainingPackageFilters from "../../../../components/home/package/TrainingPackageFilters";
import useInitialData from "../../../../hooks/useInitialData";
import { colors } from "../../../../constants/theme";

const TrainingPackagesScreen = () => {
  const { pts, categories, typePackages, loading: initialLoading, error } = useInitialData();
  const [filters, setFilters] = useState({
    pt_id: null,
    category_id: null,
    type_package_id: null,
    search: "",
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleFilterChange = useCallback(
    (key) => (value) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSearchChange = (text) => {
    setFilters((prev) => ({ ...prev, search: text }));
  };

  const resetAllFilters = () => {
    setFilters({
      pt_id: null,
      category_id: null,
      type_package_id: null,
      search: "",
    });
  };

  const hasActiveFilters =
    filters.pt_id !== null ||
    filters.category_id !== null ||
    filters.type_package_id !== null ||
    filters.search !== "";

  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={40} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh sách gói tập</Text>
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilters && styles.activeFilterButton,
          ]}
          onPress={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <Icon
            name="filter"
            size={20}
            color={hasActiveFilters ? colors.primary : "#fff"}
          />
          <Text
            style={[
              styles.filterButtonText,
              hasActiveFilters && { color: colors.primary },
            ]}
          >
            {isFilterExpanded ? "Đóng lọc" : "Lọc gói tập"}
          </Text>
          {hasActiveFilters && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {[
                  filters.pt_id,
                  filters.category_id,
                  filters.type_package_id,
                  filters.search ? 1 : 0,
                ].filter(Boolean).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isFilterExpanded && (
        <TrainingPackageFilters
          filters={filters}
          pts={pts}
          categories={categories}
          typePackages={typePackages}
          onPtChange={handleFilterChange("pt_id")}
          onCategoryChange={handleFilterChange("category_id")}
          onTypePackageChange={handleFilterChange("type_package_id")}
          onSearchChange={handleSearchChange}
          onReset={resetAllFilters}
          onClose={() => setIsFilterExpanded(false)}
        />
      )}

      <View style={styles.body}>
        <TrainingPackageList filters={filters} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "500",
    fontSize: 14,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  body: {
    zIndex: 1,
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default TrainingPackagesScreen;