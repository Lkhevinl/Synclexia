import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function QuestScreen() {
  return (
    <ScreenWrapper style={{ backgroundColor: '#FFF3E0' }}>
      <GoBackBtn />
      <View style={styles.container}>
        <Ionicons name="construct-outline" size={64} color="#FFB74D" />
        <Text style={styles.title}>Quests</Text>
        <Text style={styles.subtitle}>Coming soon!</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title:    { fontSize: 24, fontWeight: 'bold', color: '#E65100' },
  subtitle: { fontSize: 15, color: '#888' },
});
