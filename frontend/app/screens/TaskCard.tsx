import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getMilo } from '../constants/miloImages';

interface TaskCardProps {
  task: any;
  onPress: (task: any) => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(task)} activeOpacity={0.9}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.category}>{task.sector || 'Mission'}</Text>
          <Text style={styles.title}>{task.name || 'New Quest'}</Text>
          <Text style={styles.desc}>{task.description || 'Complete this task to earn XP!'}</Text>
        </View>
        <Image source={getMilo(task.id)} style={styles.mascot} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  textContainer: { flex: 1, marginRight: 16 },
  category: { fontSize: 12, fontWeight: '800', color: '#6C4AB6', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '900', color: '#1A202C', marginBottom: 4 },
  desc: { fontSize: 13, color: '#718096', lineHeight: 18 },
  mascot: { width: 70, height: 70, resizeMode: 'contain' },
});
