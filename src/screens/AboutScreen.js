import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../components/GoBackBtn';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>About Synclexia</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>📚</Text>
          <Text style={styles.appName}>Synclexia</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="information-circle" size={40} color="#4c669f" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>What is Synclexia?</Text>
          <Text style={styles.description}>
            Synclexia is an innovative learning platform designed to help students improve their reading and writing skills through interactive, engaging activities.
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="star" size={40} color="#FFD700" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.description}>
            We believe every student can succeed. Our mission is to provide personalized learning experiences that adapt to each student's pace and style, making education accessible and enjoyable.
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="school" size={40} color="#4CAF50" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Text style={styles.description}>
            Teachers create assignments and track student progress. Students complete activities, earn XP and coins, and unlock new challenges. Real-time feedback helps everyone improve.
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="heart" size={40} color="#FF6B6B" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>For Students</Text>
          <Text style={styles.description}>
            • Interactive learning modules (Phonics, Writing, Reading, Scanning)
            • Earn XP and coins
            • Complete quests and challenges
            • Track your progress
            • Customize your experience
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="people" size={40} color="#2196F3" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>For Teachers</Text>
          <Text style={styles.description}>
            • Create and manage student classes
            • Assign activities and track progress
            • Provide feedback and rewards
            • Monitor comprehension levels
            • Manage learning materials
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2024 Synclexia. All rights reserved.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  
  logoBox: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 80, marginBottom: 10 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 13, color: '#666', lineHeight: 22 },
  
  footer: { alignItems: 'center', marginTop: 30 },
  version: { fontSize: 12, color: '#999' },
  copyright: { fontSize: 11, color: '#BBB', marginTop: 5 }
});
