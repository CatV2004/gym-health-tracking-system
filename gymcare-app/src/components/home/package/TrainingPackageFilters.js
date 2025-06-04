import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../../../constants/theme";

const createDropdownItems = (items, defaultLabel, iconName) => [
  {
    label: defaultLabel,
    value: null,
    key: "default",
    icon: () => <Icon name={iconName} size={18} color={colors.textSecondary} />,
    selected: true,
  },
  ...items.map((item, index) => {
    let label = "";
    let value = null;

    if (item.label !== undefined) {
      // For typePackages
      label = item.label;
      value = item.value;
    } else if (item.user) {
      // For pts
      label = `${item.user.first_name} ${item.user.last_name}`;
      value = item.id;
    } else if (item.name) {
      // For categories
      label = item.name;
      value = item.id;
    }

    return {
      label,
      value,
      key: `item-${value ?? index}`,
    };
  }),
];

const TrainingPackageFilters = ({
  filters,
  pts = [],
  categories = [],
  typePackages = [],
  onPtChange,
  onCategoryChange,
  onTypePackageChange,
  onSearchChange,
  onReset,
  onClose,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [ptValue, setPtValue] = useState(filters.pt_id ?? null);
  const [categoryValue, setCategoryValue] = useState(
    filters.category_id ?? null
  );
  const [typeValue, setTypeValue] = useState(filters.type_package_id ?? null);
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  const ptItems = useMemo(
    () => createDropdownItems(pts, "Tất cả HLV", "account-tie"),
    [pts]
  );

  const categoryItems = useMemo(
    () =>
      createDropdownItems(
        categories,
        "Tất cả danh mục",
        "format-list-bulleted-type"
      ),
    [categories]
  );

  const typeItems = useMemo(
    () =>
      createDropdownItems(
        typePackages,
        "Tất cả loại gói",
        "package-variant-closed"
      ),
    [typePackages]
  );

  const handleDropdownToggle = (type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const applyFilters = () => {
    onPtChange(ptValue);
    onCategoryChange(categoryValue);
    onTypePackageChange(typeValue);
    onSearchChange(searchValue);
    onClose();
  };

  const handleReset = () => {
    setPtValue(null);
    setCategoryValue(null);
    setTypeValue(null);
    setSearchValue("");
    onReset();
  };

  const hasActiveFilters =
    ptValue !== null ||
    categoryValue !== null ||
    typeValue !== null ||
    searchValue !== "";

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm theo tên gói..."
          placeholderTextColor={colors.textSecondary}
          value={searchValue}
          onChangeText={setSearchValue}
          returnKeyType="search"
        />
      </View>

      <View style={styles.dropdownsContainer}>
        {/* PT Dropdown */}
        <View
          style={[
            styles.dropdownWrapper,
            activeDropdown === "pt" && styles.activeDropdownWrapper,
          ]}
        >
          <DropDownPicker
            open={activeDropdown === "pt"}
            value={ptValue}
            items={ptItems}
            setOpen={(open) => {
              if (open) {
                setActiveDropdown("pt");
              } else {
                setActiveDropdown(null);
              }
            }}
            dropDownDirection="AUTO"
            setValue={setPtValue}
            placeholder="Chọn HLV"
            placeholderStyle={styles.placeholderStyle}
            style={styles.picker}
            dropDownContainerStyle={styles.dropdownContainer}
            listItemContainerStyle={styles.listItem}
            labelStyle={styles.labelStyle}
            selectedItemContainerStyle={styles.selectedItem}
            searchable={pts.length > 5}
            searchPlaceholder="Tìm kiếm HLV..."
            searchTextInputStyle={styles.searchInput}
            mode="BADGE"
            badgeDotColors={[colors.primary]}
            zIndex={3000}
            zIndexInverse={1000}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            )}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={20} color={colors.textSecondary} />
            )}
          />
        </View>

        {/* Category Dropdown */}
        <View
          style={[
            styles.dropdownWrapper,
            activeDropdown === "category" && styles.activeDropdownWrapper,
          ]}
        >
          <DropDownPicker
            open={activeDropdown === "category"}
            value={categoryValue}
            items={categoryItems}
            setOpen={() => handleDropdownToggle("category")}
            dropDownDirection="AUTO"
            setValue={setCategoryValue}
            placeholder="Chọn danh mục"
            placeholderStyle={styles.placeholderStyle}
            style={styles.picker}
            dropDownContainerStyle={styles.dropdownContainer}
            listItemContainerStyle={styles.listItem}
            labelStyle={styles.labelStyle}
            selectedItemContainerStyle={styles.selectedItem}
            searchable={categories.length > 5}
            searchPlaceholder="Tìm kiếm danh mục..."
            searchTextInputStyle={styles.searchInput}
            mode="BADGE"
            badgeDotColors={[colors.primary]}
            zIndex={2000}
            zIndexInverse={2000}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            )}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={20} color={colors.textSecondary} />
            )}
          />
        </View>

        {/* Type Dropdown */}
        <View
          style={[
            styles.dropdownWrapper,
            activeDropdown === "type" && styles.activeDropdownWrapper,
          ]}
        >
          <DropDownPicker
            open={activeDropdown === "type"}
            value={typeValue}
            items={typeItems}
            setOpen={() => handleDropdownToggle("type")}
            dropDownDirection="AUTO"
            setValue={setTypeValue}
            placeholder="Chọn loại gói"
            placeholderStyle={styles.placeholderStyle}
            style={styles.picker}
            dropDownContainerStyle={styles.dropdownContainer}
            listItemContainerStyle={styles.listItem}
            labelStyle={styles.labelStyle}
            selectedItemContainerStyle={styles.selectedItem}
            searchable={typePackages.length > 5}
            searchPlaceholder="Tìm kiếm loại gói..."
            searchTextInputStyle={styles.searchInput}
            mode="BADGE"
            badgeDotColors={[colors.primary]}
            zIndex={1000}
            zIndexInverse={3000}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            )}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={20} color={colors.textSecondary} />
            )}
          />
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleReset}
            disabled={!hasActiveFilters}
          >
            <Text
              style={[
                styles.resetButtonText,
                !hasActiveFilters && styles.disabledButtonText,
              ]}
            >
              Đặt lại
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.applyButton]}
            onPress={applyFilters}
          >
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  searchInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownsContainer: {
    padding: 16,
    gap: 12,
  },
  dropdownWrapper: {
    zIndex: 10,
  },
  activeDropdownWrapper: {
    zIndex: 1000,
  },
  picker: {
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 8,
    minHeight: 48,
    borderWidth: 1.5,
  },
  dropdownContainer: {
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 4,
  },
  placeholderStyle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  labelStyle: {
    color: colors.text,
    fontSize: 14,
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  selectedItem: {
    backgroundColor: colors.primaryLight,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  resetButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  resetButtonText: {
    color: colors.text,
    fontWeight: "500",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  disabledButtonText: {
    color: colors.textSecondary,
    opacity: 0.6,
  },
});

export default React.memo(TrainingPackageFilters);
