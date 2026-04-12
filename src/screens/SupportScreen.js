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

const ABOUT_SECTIONS = [
  {
    icon: 'info',
    title: 'What is Synclexia?',
    body: 'Synclexia is an AI-powered reading and writing assistance app that integrates synthetic phonics to support learners with dyslexia. It combines guided learning modules, text-to-speech, speech-to-text, and OCR scanning to make literacy practice more accessible and engaging for students, parents, and teachers.',
  },
  {
    icon: 'mic',
    title: 'Phonics',
    body: 'Learn letter sounds through structured synthetic phonics lessons. Each lesson introduces letter-sound relationships with visual aids and audio playback so learners can hear and practice each sound correctly before moving on.',
  },
  {
    icon: 'book-open',
    title: 'Reading',
    body: 'Read passages and stories designed for dyslexic learners using dyslexia-friendly fonts and spacing. The built-in Text-to-Speech (TTS) feature reads content aloud so students can follow along and improve reading fluency at their own pace.',
  },
  {
    icon: 'pencil',
    title: 'Writing',
    body: 'Practice writing with guided prompts and structured exercises. The app provides instant feedback to help students build confidence in forming words and sentences, reinforcing what they learn in phonics and reading modules.',
  },
  {
    icon: 'type',
    title: 'Spelling',
    body: "Interactive spelling exercises where students listen to a word and type or select the correct spelling. Words are matched to the student's current level and difficulty increases gradually as they improve.",
  },
  {
    icon: 'volume-2',
    title: 'Text-to-Speech (TTS)',
    body: 'Any text in the app can be read aloud using the TTS feature. Students can paste or type text and have it spoken back clearly, helping with comprehension and reducing the frustration of silent reading for dyslexic learners.',
  },
  {
    icon: 'mic-2',
    title: 'Speech-to-Text',
    body: 'Students can speak into the microphone and have their voice converted into written text. This helps learners who struggle with typing to express their ideas and complete writing tasks without barriers.',
  },
  {
    icon: 'camera',
    title: 'OCR Scanner',
    body: 'Point the camera at any printed text – books, worksheets, or signs – and the app will scan and convert it into digital text. The scanned text can then be read aloud via TTS, making physical materials fully accessible.',
  },
  {
    icon: 'headphones',
    title: 'Phonological Awareness',
    body: 'Sound-based games and activities that train students to identify, blend, and manipulate sounds in words. These exercises build the foundational auditory skills needed for reading and spelling success.',
  },
  {
    icon: 'bar-chart-2',
    title: 'Progress Tracking',
    body: 'Every activity is recorded – scores, attempts, time spent, and completion status are all logged. Students can see their own progress on the dashboard, while parents can monitor their child\'s learning journey through the Parent Dashboard.',
  },
];

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
        <View style={[styles.infoBox, { backgroundColor: colors.primaryLight }]}>
          <Icon name="info" size="md" color={colors.primary} />
          <AppText variant="caption" style={[styles.infoText, { color: colors.primary }]}>
            Your feedback is logged in our maintenance system for better tracking and response.
          </AppText>
        </View>
      </View>
    );

    if (tab === 'About') return (
      <View>
        <AppText variant="display" style={[styles.aboutTitle, { color: colors.onSurface }]}>Synclexia</AppText>
        <AppText variant="caption" style={[styles.aboutTagline, { color: colors.primary }]}>
          AI-powered literacy support for dyslexic learners
        </AppText>

        {ABOUT_SECTIONS.map(({ icon, title, body }) => (
          <View key={title} style={[styles.featureCard, { backgroundColor: colors.surfaceCard }]}>
            <View style={[styles.featureIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Icon name={icon} size="md" color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <AppText variant="label" style={[styles.featureTitle, { color: colors.onSurface }]}>{title}</AppText>
              <AppText variant="body" style={[styles.featureBody, { color: colors.onSurfaceMuted }]}>{body}</AppText>
            </View>
          </View>
        ))}
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
  aboutTitle:     { textAlign: 'center', marginBottom: tokens.spacing.xs },
  aboutTagline:   { textAlign: 'center', marginBottom: tokens.spacing.lg, fontStyle: 'italic' },
  featureCard:    { flexDirection: 'row', borderRadius: tokens.radius.md, padding: tokens.spacing.md, marginBottom: tokens.spacing.sm, gap: tokens.spacing.sm },
  featureIconWrap:{ width: 36, height: 36, borderRadius: tokens.radius.sm, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  featureText:    { flex: 1 },
  featureTitle:   { marginBottom: 2 },
  featureBody:    { lineHeight: 20 },
  infoBox:      { flexDirection: 'row', alignItems: 'center', padding: tokens.spacing.sm, borderRadius: tokens.radius.md, marginTop: tokens.spacing.md, gap: tokens.spacing.sm, maxWidth: '90%' },
  infoText:     { flex: 1, lineHeight: 16 },
});
