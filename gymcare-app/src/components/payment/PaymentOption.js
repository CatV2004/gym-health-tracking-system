import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

const PaymentOption = ({ onPress, method, description, icon, disabled = false }) => {
  const renderIcon = () => {
    const iconStyle = disabled ? styles.disabledIcon : null;
    
    if (icon === 'zalo') {
      return (
        <Image
          source={require('../../../assets/logo_zalopay.png')}
          style={[styles.iconImage, iconStyle]}
        />
      );
    }
    else if (icon === 'vnpay') {
      return (
        <Image
          source={require('../../../assets/logo_vnpay.png')}
          style={[styles.iconImage, iconStyle]}
        />
      );
    }
    return <Icon name={icon} size={24} color={disabled ? '#CCCCCC' : '#4A90E2'} />;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, disabled && styles.disabledContainer]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.iconContainer, disabled && styles.disabledIconContainer]}>
        {renderIcon()}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.methodText, disabled && styles.disabledText]}>{method}</Text>
        <Text style={[styles.descriptionText, disabled && styles.disabledText]}>
          {description}
        </Text>
      </View>
      <Icon 
        name="chevron-right" 
        size={24} 
        color={disabled ? '#EEEEEE' : '#CCCCCC'} 
      />
    </TouchableOpacity>
  );
};

PaymentOption.propTypes = {
  onPress: PropTypes.func.isRequired,
  method: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledContainer: {
    opacity: 0.7,
  },
  iconContainer: {
    backgroundColor: '#E8F2FE',
    padding: 12,
    borderRadius: 50,
    marginRight: 16,
  },
  disabledIconContainer: {
    backgroundColor: '#F5F5F5',
  },
  textContainer: {
    flex: 1,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
  },
  disabledText: {
    color: '#CCCCCC',
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  disabledIcon: {
    opacity: 0.5,
  },
});

export default PaymentOption;