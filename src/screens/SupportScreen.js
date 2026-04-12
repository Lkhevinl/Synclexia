import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, StyleSheet, Platform } from 'react-native';
import Icon from '../components/icons/Icon';
import AppHeader from '../components/AppHeader';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TABLES } from '../lib/constants';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';

export default function SupportScreen({ route }) {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const isStudent = profile?.role === 'student';
  const canSendFeedback = !!profile?.id && !isStudent;
  const tabs = React.useMemo(() => (isStudent ? ['Help', 'About'] : ['Help', 'Rate', 'About']), [isStudent]);
  const requestedTab = route?.params?.initialTab;
  const initialTab = tabs.includes(requestedTab) ? requestedTab : 'Help';
  const [tab, setTab] = useState(initialTab);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (tabs.includes(requestedTab)) setTab(requestedTab);
  }, [requestedTab, tabs]);

  const submitFeedback = async () => {
    if (!canSendFeedback) {
      alert('Students cannot submit feedback at this time.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (!feedback.trim() && !rating) {
        alert('Please add a rating or a short message.');
        return;
      }
      const feedbackData = {
        log_type: 'user_concern',
        title: rating ? `App Rating: ${rating} star${rating > 1 ? 's' : ''}` : 'User Feedback',
        description: feedback.trim() || `User rated the app ${rating} out of 5 stars.`,
        reported_by: user.id,
        reporter_role: profile?.role || 'user',
        status: 'open',
        priority: rating <= 2 ? 'high' : rating <= 3 ? 'medium' : 'low',
        category: 'user_feedback',
        device_info: {
          platform: Platform.OS,
          rating: rating > 0 ? rating : null,
        },
      };
      const { error } = await supabase.from(TABLES.MAINTENANCE_LOGS).insert([feedbackData]);
      if (error) {
        console.error('Error submitting feedback:', error);
        alert('Error submitting feedback. Please try again.');
        return;
      }
      setFeedback('');
      setRating(0);
      alert('Thank you for your feedback! It has been logged for review.');
    }
  };

  const renderContent = () => {
    if (tab === 'Help') return (
      <View>
        <AppText variant="label" style={[styles.qTitle, { color: colors.primary }]}>Where can I find font style?</AppText>
        <AppText variant="body" style={[styles.qBody, { color: colors.onSurfaceMuted }]}>Go to hamburger icon in the upper right...</AppText>
        <AppText variant="label" style={[styles.qTitle, { color: colors.primary }]}>Where is my progress?</AppText>
        <AppText variant="body" style={[styles.qBody, { color: colors.onSurfaceMuted }]}>You can see it on the dashboard.</AppText>
      </View>
    );

    if (tab === 'Rate') return (
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', marginBottom: tokens.spacing.md }}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Icon name={star <= rating ? 'star' : 'star-off'} size="xl" color="#FBC02D" />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surfaceCard, color: colors.onSurface, borderColor: colors.border }]}
          multiline
          placeholder="Your feedback..."
          placeholderTextColor={colors.onSurfaceMuted}
          value={feedback}
          onChangeText={setFeedback}
        />
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={submitFeedback}>
          <AppText variant="body" style={{ fontWeight: 'bold', color: colors.onPrimary }}>Submit</AppText>
        </TouchableOpacity>
      </View>
    );

    if (tab === 'About') return (
      <View>
        <View style={styles.aboutLogoBox}>
          <Icon name="book-open" size="xl" color={colors.primary} />
          <AppText variant="display" style={{ color: colors.onSurface }}>Synclexia</AppText>
          <AppText variant="caption" style={[{ color: colors.onSurfaceMuted, textAlign: 'center' }]}>
            AI-powered literacy support for dyslexic learners
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>What is Synclexia?</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Synclexia is an AI-powered reading and writing assistance app that integrates synthetic phonics to support learners with dyslexia. It combines guided learning modules, text-to-speech, speech-to-text, and OCR scanning to make literacy practice more accessible and engaging for students, parents, and teachers.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Phonics</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Learn letter sounds through structured synthetic phonics lessons. Each lesson introduces letter-sound relationships with visual aids and audio playback so learners can hear and practice each sound correctly before moving on.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Reading</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Read passages and stories designed for dyslexic learners using dyslexia-friendly fonts and spacing. The built-in Text-to-Speech (TTS) feature reads content aloud so students can follow along and improve reading fluency at their own pace.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Writing</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Practice writing with guided prompts and structured exercises. The app provides instant feedback to help students build confidence in forming words and sentences, reinforcing what they learn in phonics and reading modules.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Spelling</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Interactive spelling exercises where students listen to a word and type or select the correct spelling. Words are matched to the student's current level and difficulty increases gradually as they improve.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Text-to-Speech (TTS)</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Any text in the app can be read aloud using the TTS feature. Students can paste or type text and have it spoken back clearly, helping with comprehension and reducing the frustration of silent reading for dyslexic learners.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Speech-to-Text</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Students can speak into the microphone and have their voice converted into written text. This helps learners who struggle with typing to express their ideas and complete writing tasks without barriers.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>OCR Scanner</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Point the camera at any printed text — books, worksheets, or signs — and the app will scan and convert it into digital text. The scanned text can then be read aloud via TTS, making physical materials fully accessible.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Phonological Awareness</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Sound-based games and activities that train students to identify, blend, and manipulate sounds in words. These exercises build the foundational auditory skills needed for reading and spelling success.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Progress Tracking</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            {`Every activity is recorded — scores, attempts, time spent, and completion status are all logged. Students can see their own progress on the Dashboard, while parents can monitor their child's learning journey through the Parent Dashboard.`}
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Parent Monitoring</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            Parents link to their child's account using a unique Student Link Code. Once linked, they can view completed activities, scores, and overall progress — keeping them informed and involved in their child's learning without needing to sit beside them.
          </AppText>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="label" style={[styles.aboutCardTitle, { color: colors.primary }]}>Dyslexia-Friendly Design</AppText>
          <AppText variant="caption" style={[styles.aboutCardBody, { color: colors.onSurfaceMuted }]}>
            The entire app is built with accessibility in mind — dyslexia-friendly fonts (like OpenDyslexic), adjustable letter spacing, high-contrast color themes, and clear visual layouts reduce cognitive load and make reading easier for every user.
          </AppText>
        </View>

        <View style={styles.aboutFooter}>
          <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>Version 1.0.0</AppText>
          <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>© 2024 Synclexia. All rights reserved.</AppText>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper padded={false} edges={['left', 'right', 'bottom']}>
      <AppHeader title="Help & Support" />
      <View style={styles.innerContent}>
        <View style={styles.tabs}>
          {tabs.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && [styles.activeTab, { borderColor: colors.primary }]]}
            >
              <AppText variant="label" style={{ color: tab === t ? colors.onSurface : colors.onSurfaceMuted }}>
                {t}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView style={styles.contentBox}>{renderContent()}</ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  innerContent: { flex: 1, padding: tokens.spacing.md },
  tabs:         { flexDirection: 'row', justifyContent: 'space-around', marginBottom: tokens.spacing.md },
  tabBtn:       { padding: tokens.spacing.sm, borderBottomWidth: 2, borderColor: 'transparent' },
  activeTab:    {},
  contentBox:   { flex: 1, padding: tokens.spacing.sm },
  qTitle:       { marginTop: tokens.spacing.sm },
  qBody:        { marginBottom: tokens.spacing.md },
  textArea:     { width: '100%', height: 150, borderWidth: 1.5, borderRadius: tokens.radius.md, padding: tokens.spacing.md, textAlignVertical: 'top' },
  submitBtn:    { marginTop: tokens.spacing.md, paddingHorizontal: tokens.spacing.xl, paddingVertical: tokens.spacing.sm, borderRadius: tokens.radius.full },
  aboutLogoBox:   { alignItems: 'center', marginBottom: tokens.spacing.md, gap: tokens.spacing.xs },
  aboutCard:      { borderRadius: tokens.radius.lg, padding: tokens.spacing.md, marginBottom: tokens.spacing.sm },
  aboutCardTitle: { marginBottom: tokens.spacing.xs },
  aboutCardBody:  { lineHeight: 22 },
  aboutFooter:    { alignItems: 'center', marginTop: tokens.spacing.lg, gap: tokens.spacing.xs },
  infoBox:      { flexDirection: 'row', alignItems: 'center', padding: tokens.spacing.sm, borderRadius: tokens.radius.md, marginTop: tokens.spacing.md, gap: tokens.spacing.sm, maxWidth: '90%' },
  infoText:     { flex: 1, lineHeight: 16 },
});
