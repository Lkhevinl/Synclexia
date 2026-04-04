import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { analyzeStudentProfile, applyLearningPath, ACTIVITY_META } from '../../lib/strengthsAnalysis';
import ScreenWrapper from '../../components/ScreenWrapper';
import tokens from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TREND_ICON = { improving: 'trending-up', declining: 'trending-down', stable: 'remove', none: 'help-circle-outline' };
const TREND_COLOR = { improving: '#4CAF50', declining: '#EF5350', stable: '#FF9800', none: '#90A4AE' };
const LEVEL_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

export default function AIInsightsScreen({ navigation }) {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [profile_data, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    setError(null);
    setApplied(false);
    try {
      const data = await analyzeStudentProfile(profile.id, 60);
      setProfileData(data);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch (e) {
      console.error('[AIInsightsScreen] analyzeStudentProfile failed:', e);
      setError('Could not load your learning insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const handleApplyPath = async () => {
    if (!profile?.id || !profile_data?.learningPath?.length) return;
    setApplying(true);
    try {
      const result = await applyLearningPath(profile.id, profile_data.learningPath);
      setApplied(true);
      Alert.alert(
        'Learning Path Applied!',
        `Your activities have been adjusted to match your learning needs. ${result.applied} activity level${result.applied !== 1 ? 's' : ''} updated.`,
        [{ text: 'Got it!' }]
      );
    } catch (e) {
      console.error('[AIInsightsScreen] applyLearningPath failed:', e);
      Alert.alert('Error', 'Could not apply the learning path. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  const ScoreRing = ({ score }) => {
    const color = score >= 75 ? '#4CAF50' : score >= 50 ? '#FF9800' : '#EF5350';
    const label = score >= 75 ? 'Strong Learner' : score >= 50 ? 'Making Progress' : 'Needs Focus';
    return (
      <View style={styles.scoreRingWrapper}>
        <LinearGradient colors={[color + '22', color + '44']} style={styles.scoreRingOuter}>
          <View style={[styles.scoreRingInner, { borderColor: color }]}>
            <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
            <Text style={styles.scorePercent}>%</Text>
          </View>
        </LinearGradient>
        <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
      </View>
    );
  };

  const ActivityCard = ({ item, variant }) => {
    const isStrength = variant === 'strength';
    const bgColor = isStrength ? '#E8F5E9' : '#FFF3E0';
    const borderColor = isStrength ? '#A5D6A7' : '#FFCC80';
    const accentColor = isStrength ? '#2E7D32' : '#E65100';

    return (
      <TouchableOpacity
        style={[styles.activityCard, { backgroundColor: bgColor, borderColor }]}
        onPress={() => navigation.navigate(item.route)}
        activeOpacity={0.8}
      >
        <View style={styles.activityCardTop}>
          <View style={[styles.activityIconBg, { backgroundColor: item.color + '22' }]}>
            <Text style={styles.activityIcon}>{item.icon}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.activityLabel, { color: accentColor }]}>{item.label}</Text>
            <View style={styles.accuracyRow}>
              <Text style={styles.accuracyNumber}>{item.avgAccuracy}%</Text>
              <Text style={styles.accuracyText}> accuracy</Text>
            </View>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name={TREND_ICON[item.trend]} size={14} color={TREND_COLOR[item.trend]} />
          </View>
        </View>

        <View style={styles.activityCardBottom}>
          <View style={styles.statPill}>
            <Ionicons name="layers-outline" size={11} color="#666" />
            <Text style={styles.statPillText}>{LEVEL_LABELS[item.adaptiveLevel] ?? 'Easy'}</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="checkmark-done-outline" size={11} color="#666" />
            <Text style={styles.statPillText}>{item.totalSessions} sessions</Text>
          </View>
          {item.daysSinceLastSession != null && (
            <View style={styles.statPill}>
              <Ionicons name="time-outline" size={11} color="#666" />
              <Text style={styles.statPillText}>
                {item.daysSinceLastSession === 0 ? 'Today' : `${item.daysSinceLastSession}d ago`}
              </Text>
            </View>
          )}
        </View>

        {item.insight && (
          <Text style={[styles.activityInsight, { color: accentColor + 'CC' }]}>{item.insight}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const RecommendationCard = ({ rec }) => (
    <TouchableOpacity
      style={[styles.recCard, { borderLeftColor: rec.color }]}
      onPress={() => navigation.navigate(ACTIVITY_META[rec.activity]?.route ?? 'Dashboard')}
      activeOpacity={0.8}
    >
      <View style={styles.recHeader}>
        <View style={[styles.recIconBg, { backgroundColor: rec.color + '22' }]}>
          <Text style={styles.recIcon}>{rec.icon}</Text>
        </View>
        <Text style={[styles.recTitle, { color: rec.color }]}>{rec.title}</Text>
      </View>
      <Text style={styles.recBody}>{rec.body}</Text>
    </TouchableOpacity>
  );

  const LearningPathItem = ({ item, index }) => {
    const needsAdjustment = item.suggestedLevel !== item.currentLevel;
    return (
      <View style={styles.pathItem}>
        <View style={styles.pathNumber}>
          <Text style={styles.pathNumberText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.pathTitleRow}>
            <Text style={styles.pathIcon}>{item.icon}</Text>
            <Text style={styles.pathLabel}>{item.label}</Text>
            {needsAdjustment && (
              <View style={styles.adjustBadge}>
                <Text style={styles.adjustBadgeText}>Will adjust</Text>
              </View>
            )}
          </View>
          <Text style={styles.pathReason}>{item.reason}</Text>
        </View>
      </View>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ScreenWrapper role="student" padded={false}>
        <View style={[styles.centered, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing your learning journey...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper role="student" padded={false}>
        <View style={[styles.centered, { backgroundColor: colors.surface }]}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF5350" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={load}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const p = profile_data;
  const hasStrengths = p.strengths.length > 0;
  const hasWeaknesses = p.weaknesses.length > 0;
  const hasNotPracticed = p.notPracticed.length > 0;
  const hasPath = p.learningPath.length > 0;
  const pathHasAdjustments = p.learningPath.some(i => i.suggestedLevel !== i.currentLevel);

  return (
    <ScreenWrapper role="student" padded={false}>
      {/* HEADER */}
      <LinearGradient colors={colors.headerGradient} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Learning Insights</Text>
          <Text style={styles.headerSub}>Personalized for {profile?.full_name?.split(' ')[0] ?? 'you'}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={load}>
          <Ionicons name="refresh-outline" size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* OVERALL SCORE */}
        <View style={styles.overallCard}>
          <ScoreRing score={p.overallScore} />
          <View style={styles.overallStats}>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatNum}>{p.totalSessions}</Text>
              <Text style={styles.overallStatLabel}>Sessions</Text>
            </View>
            <View style={styles.overallStatDivider} />
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatNum}>{p.activitiesPracticed}</Text>
              <Text style={styles.overallStatLabel}>Activities</Text>
            </View>
            <View style={styles.overallStatDivider} />
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatNum}>{p.strengths.length}</Text>
              <Text style={styles.overallStatLabel}>Strengths</Text>
            </View>
          </View>

          {p.totalSessions === 0 && (
            <View style={styles.noDataBanner}>
              <Ionicons name="information-circle-outline" size={18} color="#1976D2" />
              <Text style={styles.noDataText}>Complete some activities to see your personalized insights!</Text>
            </View>
          )}
        </View>

        {/* STRENGTHS */}
        {hasStrengths && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.sectionIconGradient}>
                <Ionicons name="star" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Your Strengths</Text>
            </View>
            {p.strengths.map(item => (
              <ActivityCard key={item.activity} item={item} variant="strength" />
            ))}
          </View>
        )}

        {/* AREAS TO IMPROVE */}
        {hasWeaknesses && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#FF9800', '#E65100']} style={styles.sectionIconGradient}>
                <Ionicons name="fitness" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Areas to Improve</Text>
            </View>
            {p.weaknesses.map(item => (
              <ActivityCard key={item.activity} item={item} variant="weakness" />
            ))}
          </View>
        )}

        {/* NOT PRACTICED YET */}
        {hasNotPracticed && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#E8927C', '#C87456']} style={styles.sectionIconGradient}>
                <Ionicons name="rocket" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Not Explored Yet</Text>
            </View>
            <View style={styles.notPracticedGrid}>
              {p.notPracticed.map(activity => {
                const meta = ACTIVITY_META[activity];
                if (!meta) return null;
                return (
                  <TouchableOpacity
                    key={activity}
                    style={styles.notPracticedCard}
                    onPress={() => navigation.navigate(meta.route)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[meta.color + 'CC', meta.color]}
                      style={styles.notPracticedGradient}
                    >
                      <Text style={styles.notPracticedIcon}>{meta.icon}</Text>
                      <Text style={styles.notPracticedLabel}>{meta.label}</Text>
                      <Text style={styles.notPracticedTry}>Try it!</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* AI RECOMMENDATIONS */}
        {p.recommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#E8927C', '#C87456']} style={styles.sectionIconGradient}>
                <Ionicons name="bulb" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>AI Recommendations</Text>
            </View>
            {p.recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} />
            ))}
          </View>
        )}

        {/* LEARNING PATH + CUSTOMIZE BUTTON */}
        {hasPath && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#00BFA5', '#00796B']} style={styles.sectionIconGradient}>
                <Ionicons name="map" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Suggested Learning Path</Text>
            </View>

            <View style={styles.pathCard}>
              {p.learningPath.map((item, index) => (
                <View key={item.activity}>
                  <LearningPathItem item={item} index={index} />
                  {index < p.learningPath.length - 1 && <View style={styles.pathDivider} />}
                </View>
              ))}
            </View>

            {pathHasAdjustments && (
              <TouchableOpacity
                style={[styles.applyBtn, applied && styles.applyBtnApplied]}
                onPress={applied ? undefined : handleApplyPath}
                disabled={applying || applied}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={applied ? ['#4CAF50', '#2E7D32'] : ['#E8927C', '#C87456']}
                  style={styles.applyBtnGradient}
                >
                  {applying ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name={applied ? 'checkmark-circle' : 'flash'} size={20} color="#fff" />
                  )}
                  <Text style={styles.applyBtnText}>
                    {applying ? 'Applying...' : applied ? 'Learning Path Applied!' : 'Customize My Learning'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <Text style={styles.applyHint}>
              {pathHasAdjustments
                ? 'Tapping the button above will adjust activity difficulty to match your current skill level.'
                : 'Your difficulty levels are already optimized for your current skill level.'}
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: tokens.spacing.lg - 4,
    paddingHorizontal: tokens.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: tokens.fontSize.lg, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: tokens.fontSize.xs + 1, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: { padding: tokens.spacing.md },

  // Loading / error
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: tokens.spacing.xl },
  loadingText: { marginTop: tokens.spacing.md, fontSize: tokens.fontSize.md, color: '#E8927C', fontWeight: '500' },
  errorText: { marginTop: tokens.spacing.md, fontSize: tokens.fontSize.sm, color: '#666', textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm + 4,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radius.md + 2,
  },
  retryText: { color: '#fff', fontWeight: '700' },

  // Overall score card
  overallCard: {
    backgroundColor: '#fff',
    borderRadius: tokens.radius.lg + 4,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg - 4,
    alignItems: 'center',
    ...tokens.shadows.mid,
  },
  scoreRingWrapper: { alignItems: 'center', marginBottom: tokens.spacing.lg - 4 },
  scoreRingOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreRingInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: { fontSize: tokens.fontSize.display + 2, fontWeight: 'bold' },
  scorePercent: { fontSize: tokens.fontSize.md + 1, fontWeight: '600', color: '#999' },
  scoreLabel: { marginTop: tokens.spacing.sm + 2, fontSize: tokens.fontSize.sm, fontWeight: '700', letterSpacing: 0.5 },

  overallStats: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  overallStatItem: { flex: 1, alignItems: 'center' },
  overallStatNum: { fontSize: tokens.fontSize.xl, fontWeight: 'bold', color: '#333' },
  overallStatLabel: { fontSize: tokens.fontSize.xs, color: '#888', marginTop: 2 },
  overallStatDivider: { width: 1, height: 36, backgroundColor: '#E0E0E0', marginHorizontal: tokens.spacing.sm },

  noDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.sm + 4,
    marginTop: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  noDataText: { flex: 1, fontSize: tokens.fontSize.sm, color: '#1976D2', lineHeight: 18 },

  // Section
  section: { marginBottom: tokens.spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm + 2, marginBottom: tokens.spacing.sm + 4 },
  sectionIconGradient: {
    width: tokens.spacing.xl - 4,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },

  // Activity cards
  activityCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  activityCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  activityIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  activityIcon: { fontSize: 24 },
  activityLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  accuracyRow: { flexDirection: 'row', alignItems: 'baseline' },
  accuracyNumber: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  accuracyText: { fontSize: 12, color: '#666' },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCardBottom: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statPillText: { fontSize: 10, color: '#555', fontWeight: '600' },
  activityInsight: { fontSize: 12, marginTop: 8, lineHeight: 16, fontStyle: 'italic' },

  // Not practiced
  notPracticedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  notPracticedCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  notPracticedGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  notPracticedIcon: { fontSize: 32, marginBottom: 6 },
  notPracticedLabel: { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center' },
  notPracticedTry: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },

  // Recommendation cards
  recCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  recIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recIcon: { fontSize: 18 },
  recTitle: { flex: 1, fontSize: 14, fontWeight: '700' },
  recBody: { fontSize: 13, color: '#555', lineHeight: 18 },

  // Learning path
  pathCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 14,
  },
  pathItem: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  pathNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8927C',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  pathNumberText: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
  pathTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  pathIcon: { fontSize: 16 },
  pathLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  adjustBadge: {
    backgroundColor: '#E8EAF6',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  adjustBadgeText: { fontSize: 10, fontWeight: '700', color: '#3F51B5' },
  pathReason: { fontSize: 12, color: '#777', lineHeight: 16 },
  pathDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 14 },

  // Apply button
  applyBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#E8927C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 10,
  },
  applyBtnApplied: { elevation: 2 },
  applyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  applyBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  applyHint: { fontSize: 11, color: '#90A4AE', textAlign: 'center', lineHeight: 16 },
});
