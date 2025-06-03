import { useEffect, useState } from "react";
import { FlatList, View, Text, Button, ActivityIndicator } from "react-native";
import PackageItem from "./PackageItem";
import { fetchTrainingPackages } from "../../../api/trainingPackageService";
import { useNavigation } from "@react-navigation/native";

const TrainingPackageList = ({ filters = {} }) => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async (pageNumber = 1, isRefreshing = false) => {
    if (loading) return;

    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetchTrainingPackages(filters, pageNumber);
      setNext(res.next);
      setPage(pageNumber);

      if (isRefreshing || pageNumber === 1) {
        setData(res.results); // reset
      } else {
        setData((prev) => [...prev, ...res.results]); // append
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(1, true); // Load initial or when filters change
  }, [filters]);

  const handleLoadMore = () => {
    if (next && !loading) {
      loadData(page + 1);
    }
  };

  const handleRefresh = () => {
    loadData(1, true);
  };

  return (
    <View style={{ flex: 1 }}>
      {error && (
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      )}
      {!loading && data.length === 0 && (
        <Text style={{ textAlign: "center" }}>Không có gói tập nào.</Text>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PackageItem
            item={item}
            onPress={(packageItem) =>
              navigation.navigate("PackageDetail", { pack: packageItem })
            }
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator size="small" color="#000" />
          ) : null
        }
      />
    </View>
  );
};

export default TrainingPackageList;
