import React from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SubscriptionCard from './SubscriptionCard';
import styles from '../../screens/member/subscription/SubscriptionListScreen.styles';
import colors from '../../constants/colors';

const SubscriptionList = ({
  data,
  onRefresh,
  refreshing,
  onPressItem,
  onRatePress,
  onBookPress,
  activeTab,
}) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <SubscriptionCard
          item={item}
          onPress={() => onPressItem(item)}
          onRatePress={() => onRatePress(item)}
          onBookPress={() => onBookPress(item)}
          isActive={activeTab === "active"}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Icon name="fitness-center" size={50} color={colors.gray} />
          <Text style={styles.emptyText}>Bạn chưa gói tập nào</Text>
        </View>
      }
    />
  );
};

export default SubscriptionList;