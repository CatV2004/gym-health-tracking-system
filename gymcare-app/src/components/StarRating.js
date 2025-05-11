import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../constants/colors';

const StarRating = ({ rating, onRatingChange, disabled = false, starSize = 24 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && onRatingChange && onRatingChange(star)}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Icon
            name={star <= rating ? 'star' : 'star-border'}
            size={starSize}
            color={star <= rating ? colors.warning : colors.gray}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});

export default StarRating;