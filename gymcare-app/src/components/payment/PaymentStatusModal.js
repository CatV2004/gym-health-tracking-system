import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

const PaymentStatusModal = ({ visible, success = false, message = '', onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, success ? styles.successIcon : styles.errorIcon]}>
            <Icon
              name={success ? 'check-circle' : 'error'}
              size={48}
              color="#FFFFFF"
            />
          </View>
          
          <Text style={styles.title}>
            {success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
          </Text>
          
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity
            style={[styles.button, success ? styles.successButton : styles.errorButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {success ? 'Hoàn tất' : 'Thử lại'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

PaymentStatusModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  success: PropTypes.bool,
  message: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: '#4CAF50',
  },
  errorIcon: {
    backgroundColor: '#F44336',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentStatusModal;