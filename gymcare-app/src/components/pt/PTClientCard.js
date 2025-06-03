import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';

const PTClientCard = ({ client, onPress, onContactPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{client.full_name.charAt(0)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{client.full_name}</Text>
        <Text style={styles.goal}>{client.goal}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>Cân nặng: {client.weight}kg</Text>
          <Text style={styles.stat}>Chiều cao: {client.height}cm</Text>
        </View>

        
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
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
  },
  goal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 12,
    color: '#888',
  },
  contactButtonWrapper: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});

export default PTClientCard;
