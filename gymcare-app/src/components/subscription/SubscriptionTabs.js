import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../../screens/member/subscription/SubscriptionListScreen.styles';

const SubscriptionTabs = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "active" && styles.activeTab]}
        onPress={() => onTabChange("active")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "active" && styles.activeTabText,
          ]}
        >
          Đang hoạt động
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "expired" && styles.activeTab,
        ]}
        onPress={() => onTabChange("expired")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "expired" && styles.activeTabText,
          ]}
        >
          Đã kết thúc
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SubscriptionTabs;