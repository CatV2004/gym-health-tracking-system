import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const menuItems = [
  { icon: 'barbell', label: 'Gói tập', route: 'TrainingPackages' },
  { icon: 'fitness', label: 'Huấn luyện viên', route: 'TrainerList' },
  { icon: 'medkit', label: 'Cập nhật sức khỏe', route: 'UpdateHealth' },
  { icon: 'chatbox', label: 'Chat', route: 'UserListScreen' },
];

const MenuGrid = ({ navigation }) => (
  <View style={styles.container}>
    {menuItems.map((item, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => navigation.navigate(item.route)}
        style={styles.menuItem}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={32} color={styles.icon.color} />
        </View>
        <Text style={styles.label}>{item.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

MenuGrid.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    color: '#FF6347',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MenuGrid;