import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { formatCurrency } from '../../../utils/format';
import { colors } from '../../../constants/colors';

const SubscriptionDetailScreen = ({ route }) => {
  const { subscription } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{subscription.training_package_name}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: subscription.status === 1 ? colors.success : colors.warning 
        }]}>
          <Text style={styles.statusText}>{subscription.status_display}</Text>
        </View>
      </View>
      
      <PTClientCard 
        ptId={subscription.pt_id}
        ptName={subscription.pt_name}
        onPress={() => navigation.navigate('PTClientDetail', { ptId: subscription.pt_id })}
      />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin gói tập</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
          <Text style={styles.infoValue}>{subscription.start_date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
          <Text style={styles.infoValue}>{subscription.end_date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số lượng:</Text>
          <Text style={styles.infoValue}>{subscription.quantity}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tổng chi phí:</Text>
          <Text style={[styles.infoValue, { color: colors.secondary, fontWeight: 'bold' }]}>
            {formatCurrency(subscription.total_cost)}
          </Text>
        </View>
      </View>
      
      {/* Có thể thêm phần lịch tập hoặc thông tin khác ở đây */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.darkGray,
  },
  infoValue: {
    fontSize: 16,
    color: colors.black,
  },
});

export default SubscriptionDetailScreen;