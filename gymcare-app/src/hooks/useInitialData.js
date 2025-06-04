import { fetchTypePackages } from "../api/trainingPackageService";
import { getTrainers } from "../api/trainerService";
import categoryPackageService from "../api/categoryPackageService";
import { useEffect, useState } from "react";
const useInitialData = () => {
  const [data, setData] = useState({
    pts: [],
    categories: [],
    typePackages: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trainerRes, categoryRes, typePackageRes] = await Promise.all([
          getTrainers(),
          categoryPackageService.fetchCategoryPackages(),
          fetchTypePackages(),
        ]);

        setData({
          pts: trainerRes.results || [],
          categories: categoryRes?.results || [],
          typePackages: typePackageRes || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Không thể tải dữ liệu lọc",
        }));
        console.error("Fetch initial data error:", error);
      }
    };

    loadData();
  }, []);

  return data;
};
export default useInitialData;
