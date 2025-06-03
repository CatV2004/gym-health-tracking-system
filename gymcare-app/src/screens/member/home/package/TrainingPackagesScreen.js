import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { fetchTypePackages } from "../../../../api/trainingPackageService";
import { getTrainers } from "../../../../api/trainerService";
import categoryPackageService from "../../../../api/categoryPackageService";
import TrainingPackageList from "../../../../components/home/package/TrainingPackageList";
import TrainingPackageFilters from "../../../../components/home/package/TrainingPackageFilters";

const TrainingPackagesScreen = () => {
  const [filters, setFilters] = useState({
    pt_id: null,
    category_id: null,
    type_package_id: null,
  });

  const [pts, setPts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [typePackages, setTypePackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trainerRes, categoryRes, typePackageRes] = await Promise.all([
          getTrainers(),
          categoryPackageService.fetchCategoryPackages(),
          fetchTypePackages(),
        ]);

        setPts(trainerRes.results || []);
        setCategories(categoryRes || []);
        setTypePackages(typePackageRes || []);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải dữ liệu lọc.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const onPtChange = (value) => {
    setFilters((f) => ({ ...f, pt_id: value }));
  };

  const onCategoryChange = (value) => {
    setFilters((f) => ({ ...f, category_id: value }));
  };

  const onTypePackageChange = (value) => {
    setFilters((f) => ({ ...f, type_package_id: value }));
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TrainingPackageFilters
        filters={filters}
        pts={pts}
        categories={categories}
        typePackages={typePackages}
        onPtChange={onPtChange}
        onCategoryChange={onCategoryChange}
        onTypePackageChange={onTypePackageChange}
      />

      <Text style={styles.title}>Danh sách gói tập</Text>
      <TrainingPackageList filters={filters}/>
    </ScrollView>
  );
};

export default TrainingPackagesScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginVertical: 8,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
