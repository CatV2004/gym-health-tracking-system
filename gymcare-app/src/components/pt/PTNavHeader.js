import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';

const PTNavHeader = ({ title, showBack = false, showNotification = true }) => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={Colors.primary} />
        </TouchableOpacity>
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {showNotification && (
        <TouchableOpacity 
          style={styles.notificationIcon}
          onPress={() => navigation.navigate('PTNotifications')}
        >
          <Icon name="bell" size={20} color={Colors.primary} />
          {/* Badge có thể thêm nếu có thông báo */}
          {/* <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View> */}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  notificationIcon: {
    position: 'relative',
    padding: 5,
    marginLeft: 10,
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PTNavHeader;