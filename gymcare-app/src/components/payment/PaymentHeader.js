import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/format';

const PaymentHeader = ({ title, amount = undefined }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {amount !== undefined && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Tổng thanh toán:</Text>
          <Text style={styles.amountValue}>{formatCurrency((amount))}</Text>
        </View>
      )}
    </View>
  );
};

PaymentHeader.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.number,
};


const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666666',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0068FF',
  },
});

export default PaymentHeader;