import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Icon from '../components/icons/Icon';
import AppHeader from '../components/AppHeader';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScreenWrapper padded={false} edges={['left', 'right', 'bottom']}>
      <AppHeader title="About Synclexia" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoBox}>
          <Icon name="book-open" size={64} color="#7C4DFF" />
          <AppText variant="display" style={{ color: colors.onSurface }}>Synclexia</AppText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <Icon name="info" size="xl" color={colors.primary} style={{ marginBottom: 15 }} />
          <AppText variant="heading" style={[styles.sectionTitle, { color: colors.onSurface }]}>What is Synclexia?</AppText>
          <AppText variant="caption" style={[styles.description, { color: colors.onSurfaceMuted }]}>
            Synclexia is an AI-powered reading and writing assistance system that integrates synthetic phonics to support dyslexic learners. It combines guided learning activities, text-to-speech (TTS), and OCR scanning to make literacy practice more accessible and engaging.
          </AppText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <Icon name="star" size={40} color="#FFD700" style={{ marginBottom: 15 }} />
          <AppText variant="heading" style={[styles.sectionTitle, { color: colors.onSurface }]}>Our Mission</AppText>
          <AppText variant="caption" style={[styles.description, { color: colors.onSurfaceMuted }]}>
            To analyze, design, and develop Synclexia as a literacy support tool that enhances reading and writing skills through synthetic phonics, AI-assisted guidance, and meaningful progress monitoring.
          </AppText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <Icon name="school" size={40} color="#4CAF50" style={{ marginBottom: 15 }} />
          <AppText variant="heading" style={[styles.sectionTitle, { color: colors.onSurface }]}>System Flow</AppText>
          <AppText variant="caption" style={[styles.description, { color: colors.onSurfaceMuted }]}>
            {`1) Register (Student/Parent) → create account\n2) Login → routed to the correct dashboard\n3) Admin Dashboard → manages users, learning content, game content, feedback, and reports\n4) Student Dashboard → completes Phonics/Reading/Writing and Play & Learn activities (with TTS/OCR support)\n5) Parent Dashboard → links to a student using a Link Code and monitors progress; submits feedback to Admin`}
          </AppText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <Icon name="heart" size={40} color="#FF6B6B" style={{ marginBottom: 15 }} />
          <AppText variant="heading" style={[styles.sectionTitle, { color: colors.onSurface }]}>For Students</AppText>
          <AppText variant="caption" style={[styles.description, { color: colors.onSurfaceMuted }]}>
            {`• Learning modules: Phonics, Reading, Writing\n• AI support: TTS read-aloud and OCR Scan to turn images into readable text\n• Play & Learn games: Spelling, Fun Activities, Sound Games\n• Progress tracking: scores, attempts, and learning activity logs`}
          </AppText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <Icon name="people" size={40} color="#2196F3" style={{ marginBottom: 15 }} />
          <AppText variant="heading" style={[styles.sectionTitle, { color: colors.onSurface }]}>For Admin (Admin-only Management)</AppText>
          <AppText variant="caption" style={[styles.description, { color: colors.onSurfaceMuted }]}>
            {`• Manage users: view, update, deactivate, delete\n• Manage content: add/edit/deactivate learning lessons and game content\n• Review feedback and maintain system content\n• Generate reports on learning progress and engagement`}
          </AppText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <Icon name="person" size={40} color="#8E44AD" style={{ marginBottom: 15 }} />
          <AppText variant="heading" style={[styles.sectionTitle, { color: colors.onSurface }]}>For Parents</AppText>
          <AppText variant="caption" style={[styles.description, { color: colors.onSurfaceMuted }]}>
            {`• Link to a student using a Student Link Code\n• Monitor learning progress and activity completion\n• Send feedback to the Admin about the system and learning experience`}
          </AppText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <Icon name="clipboard" size={40} color="#FF8C00" style={{ marginBottom: 15 }} />
          <AppText variant="heading" style={[styles.sectionTitle, { color: colors.onSurface }]}>Objectives (Aligned to the System)</AppText>
          <AppText variant="caption" style={[styles.description, { color: colors.onSurfaceMuted }]}>
            {`• Identify limitations of current literacy interventions and learner challenges\n• Utilize AI-driven phonics with TTS and OCR scanning\n• Use gamified activities to increase engagement\n• Enable admin-managed content and activity management\n• Support parent-child progress tracking and monitoring\n• Establish system acceptability through usability and feedback`}
          </AppText>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>Version 1.0.0</AppText>
          <AppText variant="caption" style={{ color: colors.onSurfaceMuted, marginTop: tokens.spacing.xs }}>© 2024 Synclexia. All rights reserved.</AppText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: tokens.spacing.md, paddingTop: tokens.spacing.md },
  logoBox:       { alignItems: 'center', marginBottom: tokens.spacing.lg },
  logo:          { fontSize: 80, marginBottom: tokens.spacing.sm },
  card:          { borderRadius: tokens.radius.lg, padding: tokens.spacing.md, marginBottom: tokens.spacing.sm },
  sectionTitle:  { marginBottom: tokens.spacing.sm },
  description:   { lineHeight: 22 },
  footer:        { alignItems: 'center', marginTop: tokens.spacing.lg },
});
