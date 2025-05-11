import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../../constants/colors';

const PTCard = ({ pt, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.avatarPlaceholder}>
        {pt.avatar ? (
          <Image source={{ uri: pt.avatar }} style={styles.avatar} />
        ) : (
          <Text style={styles.avatarText}>{pt.pt_name.charAt(0)}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{pt.pt_name}</Text>
        <Text style={styles.specialty}>Chuyên môn: {pt.specialty || 'PT Fitness'}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>K.nghiệm: {pt.experience || 'N/A'}</Text>
          <Text style={styles.stat}>Đánh giá: {pt.rating ? `${pt.rating}★` : 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.darkText,
  },
  specialty: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 12,
    color: colors.lightGray,
  },
});

export default PTCard;