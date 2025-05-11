import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const menuItems = [
  { icon: 'barbell', label: 'Gói tập', route: 'PackageList' },
  { icon: 'fitness', label: 'Huấn luyện viên', route: 'TrainerList' },
  { icon: 'heart', label: 'Sức khỏe', route: 'HealthStats' },
  { icon: 'chatbox', label: 'Chat', route: 'ChatScreen' },  
];

const PRIMARY_COLOR = '#ef440ee8'; 

const MenuGrid = ({ navigation }) => (
  <View style={styles.container}>
    {menuItems.map((item, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => navigation.navigate(item.route)}
        style={styles.menuItem}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={32} color={PRIMARY_COLOR} />
        </View>
        <Text style={styles.label}>{item.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  menuItem: {
    alignItems: 'center',
    margin: 8,
    width: '20%', 
  },
  iconContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
});

export default MenuGrid;