import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, StyleSheet, Platform } from 'react-native';
import Icon from '../components/icons/Icon';
import AppHeader from '../components/AppHeader';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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
      const { error } = await supabase.from('maintenance_logs').insert([feedbackData]);
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
      <View style={{ alignItems: 'center' }}>
        <AppText variant="display" style={{ color: colors.onSurface }}>Synclexia</AppText>
        <AppText variant="body" style={[styles.aboutBody, { color: colors.onSurfaceMuted }]}>
          Composed of college students taking up Bachelor of Science in Information Technology
          in University of Cebu Lapu-lapu and Mandaue.
        </AppText>
        <View style={styles.teamGrid}>
          <View style={styles.memberCard}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.onSurfaceMuted }]}>
              <Icon name="user" size="lg" color="#fff" />
            </View>
            <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>Project Manager</AppText>
          </View>
          <View style={styles.row}>
            <View style={styles.memberCard}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.onSurfaceMuted }]}>
                <Icon name="user" size="lg" color="#fff" />
              </View>
              <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>Lead Developer</AppText>
            </View>
            <View style={styles.memberCard}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.onSurfaceMuted }]}>
                <Icon name="user" size="lg" color="#fff" />
              </View>
              <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>UI/UX Designer</AppText>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.memberCard}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.onSurfaceMuted }]}>
                <Icon name="user" size="lg" color="#fff" />
              </View>
              <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>Business Analyst</AppText>
            </View>
            <View style={styles.memberCard}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.onSurfaceMuted }]}>
                <Icon name="user" size="lg" color="#fff" />
              </View>
              <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>QA Tester</AppText>
            </View>
          </View>
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
  aboutBody:    { textAlign: 'center', marginVertical: tokens.spacing.md },
  teamGrid:     { marginTop: tokens.spacing.md, width: '100%', alignItems: 'center' },
  row:          { flexDirection: 'row', gap: 40, marginTop: tokens.spacing.md },
  memberCard:   { alignItems: 'center' },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: tokens.spacing.xs },
  infoBox:      { flexDirection: 'row', alignItems: 'center', padding: tokens.spacing.sm, borderRadius: tokens.radius.md, marginTop: tokens.spacing.md, gap: tokens.spacing.sm, maxWidth: '90%' },
  infoText:     { flex: 1, lineHeight: 16 },
});
