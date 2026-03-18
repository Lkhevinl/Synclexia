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
            Synclexia is an AI-powered reading and writing assistance system that integrates synthetic phonics to support dyslexic learners. It combines guided learning activities, text-to-speech (TTS), and OCR scanning to make literacy practice more accessible and engaging.
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="star" size={40} color="#FFD700" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.description}>
            To analyze, design, and develop Synclexia as a literacy support tool that enhances reading and writing skills through synthetic phonics, AI-assisted guidance, and meaningful progress monitoring.
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="school" size={40} color="#4CAF50" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>System Flow</Text>
          <Text style={styles.description}>
            1) Register (Student/Parent) → create account
            {"\n"}2) Login → routed to the correct dashboard
            {"\n"}3) Admin Dashboard → manages users, learning content, game content, feedback, and reports
            {"\n"}4) Student Dashboard → completes Phonics/Reading/Writing and Play & Learn activities (with TTS/OCR support)
            {"\n"}5) Parent Dashboard → links to a student using a Link Code and monitors progress; submits feedback to Admin
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="heart" size={40} color="#FF6B6B" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>For Students</Text>
          <Text style={styles.description}>
            • Learning modules: Phonics, Reading, Writing
            • AI support: TTS read-aloud and OCR Scan to turn images into readable text
            • Play & Learn games: Spelling, Fun Activities, Sound Games
            • Progress tracking: scores, attempts, and learning activity logs
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="people" size={40} color="#2196F3" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>For Admin (Admin-only Management)</Text>
          <Text style={styles.description}>
            • Manage users: view, update, deactivate, delete
            • Manage content: add/edit/deactivate learning lessons and game content
            • Review feedback and maintain system content
            • Generate reports on learning progress and engagement
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="person" size={40} color="#8E44AD" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>For Parents</Text>
          <Text style={styles.description}>
            • Link to a student using a Student Link Code
            • Monitor learning progress and activity completion
            • Send feedback to the Admin about the system and learning experience
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="clipboard" size={40} color="#FF8C00" style={{ marginBottom: 15 }} />
          <Text style={styles.sectionTitle}>Objectives (Aligned to the System)</Text>
          <Text style={styles.description}>
            • Identify limitations of current literacy interventions and learner challenges
            {"\n"}• Utilize AI-driven phonics with TTS and OCR scanning
            {"\n"}• Use gamified activities to increase engagement
            {"\n"}• Enable admin-managed content and activity management
            {"\n"}• Support parent-child progress tracking and monitoring
            {"\n"}• Establish system acceptability through usability and feedback
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
