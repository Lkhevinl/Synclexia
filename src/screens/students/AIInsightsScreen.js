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
  Modal,
  ScrollView,
} from 'react-native';
import Icon from '../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { analyzeStudentProfile, applyLearningPath, ACTIVITY_META } from '../../lib/strengthsAnalysis';
import ScreenWrapper from '../../components/ScreenWrapper';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import StudentCard from '../../components/student/StudentCard';
import c from '../../components/student/candyTokens';
import tokens from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TREND_ICON = { improving: 'trending-up', declining: 'trending-down', stable: 'remove', none: 'help-circle-outline' };
const TREND_COLOR = { improving: '#4CAF50', declining: '#EF5350', stable: '#FF9800', none: '#90A4AE' };
const LEVEL_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

export default function AIInsightsScreen({ navigation, route }) {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [profile_data, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [cardModal, setCardModal] = useState({ visible: false, item: null, type: null });
  const openCardModal = (item, type) => setCardModal({ visible: true, item, type });
  const closeCardModal = () => setCardModal({ visible: false, item: null, type: null });

  // Parents pass studentId as a route param to view their child's report
  const targetId = route?.params?.studentId || profile?.id;
  const isViewingChild = !!route?.params?.studentId && route.params.studentId !== profile?.id;

  const load = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    setError(null);
    setApplied(false);
    try {
      const data = await analyzeStudentProfile(targetId, 60);
      setProfileData(data);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch (e) {
      console.error('[AIInsightsScreen] analyzeStudentProfile failed:', e);
      setError('Could not load your learning insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => { load(); }, [load]);

  const handleApplyPath = async () => {
    if (!targetId || !profile_data?.learningPath?.length) return;
    setApplying(true);
    try {
      const result = await applyLearningPath(targetId, profile_data.learningPath);
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
    const color = p?.overallMasteryColor || (score >= 75 ? '#4CAF50' : score >= 50 ? '#FF9800' : '#EF5350');
    const label = p?.overallMasteryLabel || (score >= 75 ? 'Strong Learner' : score >= 50 ? 'Making Progress' : 'Needs Focus');
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
        onPress={() => openCardModal(item, variant === 'strength' ? 'strength' : 'weakness')}
        activeOpacity={0.8}
      >
        <View style={styles.activityCardTop}>
          <View style={[styles.activityIconBg, { backgroundColor: item.color + '22' }]}>
            <Icon name={item.icon} size="md" color={item.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.activityLabel, { color: accentColor }]}>{item.label}</Text>
            <View style={styles.accuracyRow}>
              <Text style={styles.accuracyNumber}>{item.masteryScore ?? item.avgAccuracy}%</Text>
              <Text style={styles.accuracyText}> mastery</Text>
            </View>
            {item.masteryLabel ? (
              <Text style={[styles.masteryTag, { color: item.masteryColor ?? accentColor }]}>{item.masteryLabel}</Text>
            ) : null}
          </View>
          <View style={styles.trendBadge}>
            <Icon name={TREND_ICON[item.trend]} size="sm" color={TREND_COLOR[item.trend]} />
          </View>
        </View>

        <View style={styles.activityCardBottom}>
          <View style={styles.statPill}>
            <Icon name="layers" size="xs" color="#666" />
            <Text style={styles.statPillText}>{LEVEL_LABELS[item.adaptiveLevel] ?? 'Easy'}</Text>
          </View>
          <View style={styles.statPill}>
            <Icon name="check-check" size="xs" color="#666" />
            <Text style={styles.statPillText}>{item.totalSessions} sessions</Text>
          </View>
          {item.daysSinceLastSession != null && (
            <View style={styles.statPill}>
              <Icon name="clock" size="xs" color="#666" />
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
      onPress={() => openCardModal(rec, 'recommendation')}
      activeOpacity={0.8}
    >
      <View style={styles.recHeader}>
        <View style={[styles.recIconBg, { backgroundColor: rec.color + '22' }]}>
          <Icon name={rec.icon} size="md" color={rec.color} />
        </View>
        <Text style={[styles.recTitle, { color: rec.color }]}>{rec.title}</Text>
      </View>
      <Text style={styles.recBody}>{rec.body}</Text>
    </TouchableOpacity>
  );

  const CardDetailModal = () => {
    const { visible, item, type } = cardModal;
    if (!item) return null;

    const isStrength = type === 'strength';
    const isNotExplored = type === 'notExplored';
    const isPracticeTool = type === 'practiceTool';
    const isRecommendation = type === 'recommendation';
    const showScoreStats = !isNotExplored && !isPracticeTool && !isRecommendation;
    const accentColor = isStrength ? '#2E7D32'
      : isNotExplored ? '#E8927C'
      : isPracticeTool ? '#009688'
      : isRecommendation ? item.color
      : '#E65100';
    const headerColors = isStrength
      ? ['#4CAF50', '#2E7D32']
      : isNotExplored
      ? ['#E8927C', '#C87456']
      : isPracticeTool
      ? ['#009688', '#00695C']
      : isRecommendation
      ? [item.color, item.color + 'BB']
      : ['#FF9800', '#E65100'];
    const headerTitle = isStrength
      ? 'Why You Mastered This'
      : isNotExplored
      ? 'Not Explored Yet'
      : isPracticeTool
      ? 'Practice Tool'
      : isRecommendation
      ? item.title
      : 'Why This Needs Improvement';

    let summaryText = '';
    if (isStrength) {
      const trendMsg =
        item.trend === 'improving' ? 'and your scores are still improving'
        : item.trend === 'declining' ? 'but your recent scores have dropped — keep practicing!'
        : 'and holding steady';
      summaryText = `You've completed ${item.totalSessions} session${item.totalSessions !== 1 ? 's' : ''} with a mastery score of ${item.masteryScore}% — ${trendMsg}. Your consistent practice has paid off!`;
    } else if (isNotExplored) {
      summaryText = `You haven't tried ${item.label} yet. This activity hasn't been explored, so there's no performance data available. Start practicing to unlock your potential in this area!`;
    } else if (isPracticeTool) {
      summaryText = `You've used ${item.label} in ${item.totalSessions} session${item.totalSessions !== 1 ? 's' : ''}. This tool supports your learning but isn't scored by the AI — keep using it to strengthen your skills!`;
    } else if (isRecommendation) {
      summaryText = item.body;
    } else {
      const trendMsg =
        item.trend === 'improving' ? "The good news — you're on an upward trend!"
        : item.trend === 'declining' ? 'Your scores have been dropping — more focused sessions are needed.'
        : 'Consistent practice will help you build mastery.';
      const sessions = item.totalSessions === 1 ? '1 session' : `${item.totalSessions} sessions`;
      summaryText = `After ${sessions}, your mastery is at ${item.masteryScore}%. ${trendMsg}`;
    }

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeCardModal}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeCardModal}>
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1} onPress={() => {}}>
            <LinearGradient colors={headerColors} style={styles.modalHeader}>
              <View style={styles.modalHeaderIconBg}>
                <Icon name={item.icon} size="lg" color="#fff" />
              </View>
              <Text style={styles.modalHeaderTitle}>{headerTitle}</Text>
              <TouchableOpacity onPress={closeCardModal} style={styles.modalCloseBtn}>
                <Icon name="x" size="md" color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalActivityRow}>
                <Text style={[styles.modalActivityName, { color: item.color ?? '#333' }]}>
                  {item.label ?? ACTIVITY_META[item.activity]?.label ?? ''}
                </Text>
                {showScoreStats && (
                  <View style={[
                    styles.modalScoreBadge,
                    { backgroundColor: isStrength ? '#E8F5E9' : '#FFF3E0', borderColor: isStrength ? '#A5D6A7' : '#FFCC80' },
                  ]}>
                    <Text style={[styles.modalScoreNum, { color: accentColor }]}>{item.masteryScore}%</Text>
                    <Text style={[styles.modalScoreUnit, { color: accentColor }]}> mastery</Text>
                  </View>
                )}
              </View>

              {showScoreStats && item.masteryLabel ? (
                <Text style={[styles.modalMasteryTag, { color: item.masteryColor ?? accentColor }]}>
                  {item.masteryLabel}
                </Text>
              ) : null}

              {showScoreStats && (
                <View style={styles.modalStatsRow}>
                  <View style={styles.modalStatChip}>
                    <Icon name="check-check" size="xs" color="#666" />
                    <Text style={styles.modalStatText}>{item.totalSessions} sessions</Text>
                  </View>
                  <View style={styles.modalStatChip}>
                    <Icon name="layers" size="xs" color="#666" />
                    <Text style={styles.modalStatText}>{LEVEL_LABELS[item.adaptiveLevel] ?? 'Easy'}</Text>
                  </View>
                  {item.daysSinceLastSession != null && (
                    <View style={styles.modalStatChip}>
                      <Icon name="clock" size="xs" color="#666" />
                      <Text style={styles.modalStatText}>
                        {item.daysSinceLastSession === 0 ? 'Today' : `${item.daysSinceLastSession}d ago`}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.modalStatChip, { borderColor: TREND_COLOR[item.trend] + '55' }]}>
                    <Icon name={TREND_ICON[item.trend]} size="xs" color={TREND_COLOR[item.trend]} />
                    <Text style={[styles.modalStatText, { color: TREND_COLOR[item.trend] }]}>{item.trend}</Text>
                  </View>
                </View>
              )}

              <View style={styles.modalDivider} />

              <View style={styles.modalSummaryBox}>
                <Icon
                  name={isStrength ? 'info' : isNotExplored ? 'compass' : isRecommendation ? 'lightbulb' : 'alert-circle'}
                  size="sm"
                  color={accentColor}
                />
                <Text style={styles.modalSummaryText}>{summaryText}</Text>
              </View>

              {showScoreStats && item.insight ? (
                <View style={[styles.modalInsightBox, { backgroundColor: isStrength ? '#F1F8E9' : '#FFF8E1' }]}>
                  <Text style={[styles.modalInsightText, { color: isStrength ? '#33691E' : '#BF360C' }]}>
                    "{item.insight}"
                  </Text>
                </View>
              ) : null}

              {item.tip ? (
                <View style={styles.modalTipBox}>
                  <Icon name="lightbulb" size="sm" color="#FF9800" />
                  <Text style={styles.modalTipText}>{item.tip}</Text>
                </View>
              ) : null}

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalDoneBtn, { backgroundColor: accentColor }]}
              onPress={closeCardModal}
            >
              <Text style={styles.modalDoneBtnText}>Got it!</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const LearningPathItem = ({ item, index }) => {
    const needsAdjustment = item.suggestedLevel !== item.currentLevel;
    return (
      <View style={styles.pathItem}>
        <View style={styles.pathNumber}>
          <Text style={styles.pathNumberText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.pathTitleRow}>
            <Icon name={item.icon} size="sm" color="#E8927C" />
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
          <Icon name="alert-circle" size="xl" color="#EF5350" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={load}>
            <Icon name="refresh-cw" size="md" color="#fff" />
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
  const hasPracticeTools = (p.practiceTools ?? []).length > 0;
  const hasPath = p.learningPath.length > 0;
  const pathHasAdjustments = p.learningPath.some(i => i.suggestedLevel !== i.currentLevel);

  return (
    <ScreenWrapper role="student" padded={false}>
      <StudentPageHeader
        title="AI Learning Insights"
        right={
          <TouchableOpacity onPress={load}>
            <Icon name="refresh-cw" size="md" color={c.primary} />
          </TouchableOpacity>
        }
      />

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
              <Icon name="info" size="md" color="#1976D2" />
              <Text style={styles.noDataText}>Complete some activities to see your personalized insights!</Text>
            </View>
          )}
        </View>

        {/* STRENGTHS */}
        {hasStrengths && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.sectionIconGradient}>
                <Icon name="star" size="sm" color="#fff" />
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
                <Icon name="dumbbell" size="sm" color="#fff" />
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
                <Icon name="rocket" size="sm" color="#fff" />
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
                    onPress={() => openCardModal({ activity, ...meta }, 'notExplored')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[meta.color + 'CC', meta.color]}
                      style={styles.notPracticedGradient}
                    >
                      <Icon name={meta.icon} size="xl" color="#fff" />
                      <Text style={styles.notPracticedLabel}>{meta.label}</Text>
                      <Text style={styles.notPracticedTry}>Try it!</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* PRACTICE TOOLS */}
        {hasPracticeTools && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#009688', '#00695C']} style={styles.sectionIconGradient}>
                <Icon name="tool" size="sm" color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Practice Tools Used</Text>
            </View>
            <View style={styles.toolsNote}>
              <Icon name="info" size="sm" color="#888" />
              <Text style={styles.toolsNoteText}>These tools support learning but are not scored by the AI.</Text>
            </View>
            {(p.practiceTools ?? []).map(tool => (
              <TouchableOpacity
                key={tool.activity}
                style={styles.toolCard}
                onPress={() => openCardModal(tool, 'practiceTool')}
                activeOpacity={0.8}
              >
                <View style={[styles.toolIconBg, { backgroundColor: tool.color + '22' }]}>
                  <Icon name={tool.icon} size="md" color={tool.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toolLabel, { color: tool.color }]}>{tool.label}</Text>
                  <Text style={styles.toolSessions}>{tool.totalSessions} session{tool.totalSessions !== 1 ? 's' : ''} logged</Text>
                </View>
                <View style={styles.toolBadge}>
                  <Text style={styles.toolBadgeText}>No Scoring</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* AI RECOMMENDATIONS */}
        {p.recommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#E8927C', '#C87456']} style={styles.sectionIconGradient}>
                <Icon name="lightbulb" size="sm" color="#fff" />
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
                <Icon name="map" size="sm" color="#fff" />
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

            {pathHasAdjustments && !isViewingChild && (
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
                    <Icon name={applied ? 'check-circle' : 'zap'} size="md" color="#fff" />
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

      <CardDetailModal />
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
  scoreRingWrapper: { alignItems: 'center', alignSelf: 'center', marginBottom: tokens.spacing.lg - 4 },
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
  },
  scoreNumber: { fontSize: tokens.fontSize.display + 2, fontWeight: 'bold' },
  scorePercent: { fontSize: tokens.fontSize.sm + 2, fontWeight: '600', color: '#999', alignSelf: 'flex-start', paddingTop: 12 },
  scoreLabel: { marginTop: tokens.spacing.sm + 2, fontSize: tokens.fontSize.sm, fontWeight: '700', letterSpacing: 0.5 },

  overallStats: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 0 },
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
  accuracyText: { fontSize: 13, color: '#666' },
  masteryTag: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  toolsNote: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F5F5F5', borderRadius: 8, padding: 10, marginBottom: 10 },
  toolsNoteText: { fontSize: 13, color: '#666', flex: 1 },
  toolCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  toolIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  toolLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  toolSessions: { fontSize: 13, color: '#888' },
  toolBadge: { backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  toolBadgeText: { fontSize: 13, color: '#888', fontWeight: '600' },
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
  statPillText: { fontSize: 12, color: '#555', fontWeight: '600' },
  activityInsight: { fontSize: 13, marginTop: 8, lineHeight: 18, fontStyle: 'italic' },

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
  notPracticedTry: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },

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
  adjustBadgeText: { fontSize: 12, fontWeight: '700', color: '#3F51B5' },
  pathReason: { fontSize: 13, color: '#777', lineHeight: 18 },
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
  applyHint: { fontSize: 13, color: '#90A4AE', textAlign: 'center', lineHeight: 18 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  modalHeaderIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: { padding: 16 },
  modalActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalActivityName: { fontSize: 18, fontWeight: 'bold' },
  modalScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  modalScoreNum: { fontSize: 18, fontWeight: 'bold' },
  modalScoreUnit: { fontSize: 13, fontWeight: '600' },
  modalMasteryTag: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  modalStatsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12, marginTop: 6 },
  modalStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalStatText: { fontSize: 12, fontWeight: '600', color: '#555' },
  modalDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  modalSummaryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  modalSummaryText: { flex: 1, fontSize: 14, lineHeight: 21, color: '#444' },
  modalInsightBox: { borderRadius: 12, padding: 12, marginBottom: 12 },
  modalInsightText: { fontSize: 14, lineHeight: 20, fontStyle: 'italic', fontWeight: '600' },
  modalTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  modalTipText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
  modalDoneBtn: {
    margin: 16,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalDoneBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
