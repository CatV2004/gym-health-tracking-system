import { View, Text, Picker, StyleSheet } from "react-native";

const TrainingPackageFilters = ({
  filters,
  pts,
  categories,
  typePackages,
  onPtChange,
  onCategoryChange,
  onTypePackageChange,
}) => {
  return (
    <View>
      <Text style={styles.title}>Bộ lọc</Text>

      <Text>Huấn luyện viên (PT)</Text>
      <Picker
        selectedValue={filters.pt_id}
        onValueChange={onPtChange}
        style={styles.picker}
      >
        <Picker.Item label="Tất cả" value={null} />
        {pts.map((pt) => (
          <Picker.Item
            key={pt.id}
            label={`${pt.user.first_name} ${pt.user.last_name}`}
            value={pt.id}
          />
        ))}
      </Picker>

      <Text>Danh mục gói tập</Text>
      <Picker
        selectedValue={filters.category_id}
        onValueChange={onCategoryChange}
        style={styles.picker}
      >
        <Picker.Item label="Tất cả" value={null} />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      <Text>Loại gói tập</Text>
      <Picker
        selectedValue={filters.type_package_id}
        onValueChange={onTypePackageChange}
        style={styles.picker}
      >
        <Picker.Item label="Tất cả" value={null} />
        {typePackages.map((type) => (
          <Picker.Item key={type.value} label={type.label} value={type.value} />
        ))}
      </Picker>
    </View>
  );
};

export default TrainingPackageFilters;

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginVertical: 8,
  },
  picker: {
    marginVertical: 8,
  },
});
