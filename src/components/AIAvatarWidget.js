import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  ScrollView, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import Icon from './icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { analyzeStudentProfile } from '../lib/strengthsAnalysis';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── helpers ────────────────────────────────────────────────────────────────
const scoreColor  = s => s >= 75 ? '#4CAF50' : s >= 50 ? '#FF9800' : '#EF5350';
const scoreLabel  = s => s >= 75 ? 'Strong Learner!' : s >= 50 ? 'Making Progress!' : 'Keep Going!';
const buildLexiMessage = (firstName, data) => {
  const s = data.strengths;
  const w = data.weaknesses;
  if (s.length > 0) {
    const top    = s.slice(0, 2).map(x => x.label);
    const names  = top.join(' & ');
    const plural = top.length > 1;
    if (w.length > 0) {
      return `👋 Hi ${firstName}! ${names} ${plural ? 'are' : 'is'} your superpower${plural ? 's' : ''} 💪 Let's give ${w[0].label} some love today!`;
    }
    return `👋 Hi ${firstName}! You're crushing it — ${names} ${plural ? 'are' : 'is'} looking great! Keep going! 🌟`;
  }
  if (w.length > 0) {
    return `👋 Hi ${firstName}! Let's keep building — working on ${w[0].label} will make a big difference. You've got this! 💪`;
  }
  return `👋 Hi ${firstName}! Ready to learn something new today? Complete an activity and I'll track your progress! 🚀`;
};

// ── sub-components ─────────────────────────────────────────────────────────
function ProgressBar({ value, color }) {
  return (
    <View style={bar.track}>
      <View style={[bar.fill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}
const bar = StyleSheet.create({
  track: { height: 7, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden', flex: 1 },
  fill:  { height: '100%', borderRadius: 4 },
});

function ChatBubble({ text }) {
  return (
    <View style={bubble.wrap}>
      <View style={bubble.box}>
        <Text style={bubble.text}>{text}</Text>
      </View>
      <View style={bubble.tail} />
    </View>
  );
}
const bubble = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', marginBottom: 16, marginLeft: 4 },
  box: {
    backgroundColor: '#FFF0E8',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '88%',
  },
  text: { fontSize: 15, color: '#333', lineHeight: 22 },
  tail: {
    width: 12,
    height: 8,
    backgroundColor: '#FFF0E8',
    marginLeft: 16,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 0,
    transform: [{ skewX: '-20deg' }],
    marginTop: -2,
  },
});

// ── main component ─────────────────────────────────────────────────────────
export default function AIAvatarWidget({ studentId, studentName }) {
  const { profile } = useAuth();
  const navigation  = useNavigation();
  const targetId = studentId || profile?.id;

  const [visible,    setVisible]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [data,       setData]       = useState(null);
  const [activeTab,  setActiveTab]  = useState('strengths');

  // Reset cached data whenever the target student changes (parent switching children)
  useEffect(() => {
    setData(null);
  }, [targetId]);

  // Default to Strengths tab when data loads; fall back to Focus if no strengths
  useEffect(() => {
    if (!data) return;
    setActiveTab(data.strengths?.length > 0 ? 'strengths' : 'focus');
  }, [data]);

  // Idle bounce for the floating button
  const bounceY  = useRef(new Animated.Value(0)).current;
  // "pop" when tapped
  const tapScale = useRef(new Animated.Value(1)).current;
  // sheet slide-up
  const slideY   = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // backdrop fade
  const fadeIn   = useRef(new Animated.Value(0)).current;

  // ── idle bounce loop ──
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, { toValue: -7, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0,  duration: 700, useNativeDriver: true }),
        Animated.delay(800),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // ── open ──
  const open = async () => {
    // pop animation
    Animated.sequence([
      Animated.timing(tapScale, { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.spring(tapScale, { toValue: 1,    useNativeDriver: true, friction: 4 }),
    ]).start();

    setVisible(true);
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.timing(fadeIn,  { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();

    if (!data && targetId) {
      setLoading(true);
      try   { setData(await analyzeStudentProfile(targetId, 60)); }
      catch (_) {}
      finally { setLoading(false); }
    }
  };

  // ── close ──
  const close = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true }),
      Animated.timing(fadeIn,  { toValue: 0,             duration: 220, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  };

  // ── derived values ──
  // Use studentName prop if provided (parent viewing child), else use logged-in user's name
  const firstName   = studentName || profile?.full_name?.split(' ')[0] || 'Learner';
  const score       = data?.overallScore ?? 0;
  const color       = scoreColor(score);
  const label       = scoreLabel(score);
  const hasActivity = data && (data.strengths.length > 0 || data.weaknesses.length > 0);

  return (
    <>
      {/* ════════════════════════════════════════
          FLOATING AVATAR BUTTON
      ════════════════════════════════════════ */}
      <Animated.View
        style={[
          styles.floatWrap,
          { transform: [{ translateY: bounceY }, { scale: tapScale }] },
        ]}
      >
        <TouchableOpacity onPress={open} activeOpacity={0.9}>
          {/* Glow ring */}
          <View style={styles.glowRing} />

          <LinearGradient colors={['#FF8C69', '#E8927C', '#C87456']} style={styles.floatBtn}>
            <Text style={styles.floatOwl}>🦉</Text>
          </LinearGradient>

          {/* "AI" badge */}
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* ════════════════════════════════════════
          CHAT PANEL (bottom sheet)
      ════════════════════════════════════════ */}
      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <View style={styles.modalRoot}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, { opacity: fadeIn }]} />
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />

          {/* Sheet */}
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>

            {/* ── Drag handle ── */}
            <View style={styles.handle} />

            {/* ── Panel header with Lexi avatar ── */}
            <LinearGradient colors={['#FFF4EE', '#fff']} style={styles.panelHeader}>
              <LinearGradient colors={['#FF8C69', '#C87456']} style={styles.lexiAvatar}>
                <Text style={styles.lexiEmoji}>🦉</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <View style={styles.lexiNameRow}>
                  <Text style={styles.lexiName}>Lexi</Text>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>online</Text>
                </View>
                <Text style={styles.lexiRole}>Your AI Learning Buddy</Text>
              </View>
              {data && (
                <View style={styles.arcChip}>
                  <Svg width={28} height={28} viewBox="0 0 28 28">
                    <Circle cx={14} cy={14} r={11} fill="none" stroke="#F0F0F0" strokeWidth={3} />
                    <Circle
                      cx={14} cy={14} r={11} fill="none"
                      stroke={color} strokeWidth={3}
                      strokeDasharray={`${Math.round(score / 100 * 69)} 69`}
                      strokeLinecap="round"
                      transform="rotate(-90, 14, 14)"
                    />
                  </Svg>
                  <View>
                    <Text style={[styles.arcChipScore, { color }]}>{score}%</Text>
                    <Text style={styles.arcChipLabel} numberOfLines={1}>{label}</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity onPress={close} style={styles.closeBtn}>
                <Icon name="x" size="md" color="#90A4AE" />
              </TouchableOpacity>
            </LinearGradient>

            {/* ── Scrollable content ── */}
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#E8927C" />
                <Text style={styles.loadingText}>Analyzing your journey...</Text>
              </View>
            ) : data ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Chat bubble greeting */}
                <ChatBubble
                  text={buildLexiMessage(firstName, data)}
                />

                <Text style={styles.sessionMeta}>
                  {data.totalSessions} session{data.totalSessions !== 1 ? 's' : ''} •{' '}
                  {data.activitiesPracticed} activit{data.activitiesPracticed !== 1 ? 'ies' : 'y'} practised
                </Text>

                {hasActivity ? (
                  <>
                    {/* ── Tabs ── */}
                    <View style={styles.tabRow}>
                      <TouchableOpacity
                        style={[styles.tab, activeTab === 'strengths' ? styles.tabActiveGreen : styles.tabInactive]}
                        onPress={() => setActiveTab('strengths')}
                        accessibilityRole="tab"
                        accessibilityLabel="Strengths"
                        accessibilityState={{ selected: activeTab === 'strengths' }}
                      >
                        <Text style={activeTab === 'strengths' ? styles.tabTextActive : styles.tabTextInactive}>
                          ✅ Strengths
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.tab, activeTab === 'focus' ? styles.tabActiveOrange : styles.tabInactive]}
                        onPress={() => setActiveTab('focus')}
                        accessibilityRole="tab"
                        accessibilityLabel="Focus Areas"
                        accessibilityState={{ selected: activeTab === 'focus' }}
                      >
                        <Text style={activeTab === 'focus' ? styles.tabTextActive : styles.tabTextInactive}>
                          ⚠️ Focus Areas
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* ── Strengths tab content ── */}
                    {activeTab === 'strengths' && (
                      data.strengths.length > 0 ? (
                        <View style={styles.section}>
                          {data.strengths.slice(0, 3).map(item => (
                            <View key={item.activity} style={styles.itemRow}>
                              <View style={[styles.itemIconWrap, { backgroundColor: '#E8F5E9' }]}>
                                <Icon name={item.icon} size="sm" color="#4CAF50" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.itemLabel}>{item.label}</Text>
                                <ProgressBar value={item.avgAccuracy} color="#4CAF50" />
                              </View>
                              <Text style={[styles.itemPct, { color: '#4CAF50' }]}>{item.avgAccuracy}%</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emptyText}>No strengths recorded yet — keep practising!</Text>
                      )
                    )}

                    {/* ── Focus tab content ── */}
                    {activeTab === 'focus' && (
                      data.weaknesses.length > 0 ? (
                        <View style={styles.section}>
                          {data.weaknesses.slice(0, 3).map(item => (
                            <View key={item.activity} style={styles.itemRow}>
                              <View style={[styles.itemIconWrap, { backgroundColor: '#FFF3E0' }]}>
                                <Icon name={item.icon} size="sm" color="#FF9800" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.itemLabel}>{item.label}</Text>
                                <ProgressBar value={item.avgAccuracy} color="#FF9800" />
                              </View>
                              <Text style={[styles.itemPct, { color: '#FF9800' }]}>{item.avgAccuracy}%</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emptyText}>No focus areas yet — you're doing great!</Text>
                      )
                    )}
                  </>
                ) : (
                  <View style={styles.emptyWrap}>
                    <Icon name="target" size="xl" color="#E8927C" />
                    <Text style={styles.emptyText}>
                      Complete some activities and I'll track your strengths and focus areas!
                    </Text>
                  </View>
                )}

                {/* ── Full report button ── */}
                <TouchableOpacity
                  style={styles.reportBtn}
                  onPress={() => { close(); setTimeout(() => navigation.navigate('AIInsights', studentId ? { studentId } : undefined), 300); }}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#FF8C69', '#C87456']} style={styles.reportGradient}>
                    <Icon name="bar-chart" size="md" color="#fff" />
                    <Text style={styles.reportText}>View Full Report</Text>
                    <Icon name="arrow-right" size="xs" color="rgba(255,255,255,0.75)" />
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.loadingWrap}>
                <Text style={styles.emptyText}>Couldn't load insights. Tap to try again.</Text>
                <TouchableOpacity onPress={() => { setData(null); open(); }} style={{ marginTop: 12 }}>
                  <Text style={{ color: '#E8927C', fontWeight: '700', fontSize: 15 }}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// ── styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  /* Floating button */
  floatWrap: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 99,
    elevation: 14,
  },
  glowRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8927C',
    opacity: 0.18,
    top: -6,
    left: -6,
  },
  floatBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#C87456',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  floatOwl: { fontSize: 28 },
  aiBadge: {
    position: 'absolute',
    top: -5,
    right: -6,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  aiBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  /* Modal */
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 28,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 0,
  },

  /* Panel header */
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  lexiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#C87456',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lexiEmoji: { fontSize: 24 },
  lexiNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  lexiName: { fontSize: 16, fontWeight: '800', color: '#263238' },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4CAF50' },
  onlineText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  lexiRole: { fontSize: 13, color: '#90A4AE' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Arc score chip */
  arcChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  arcChipScore: { fontSize: 13, fontWeight: '900' },
  arcChipLabel:  { fontSize: 10, color: '#90A4AE' },

  /* Tabs */
  tabRow:          { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab:             { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabActiveGreen:  { backgroundColor: '#4CAF50', elevation: 3, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  tabActiveOrange: { backgroundColor: '#FF9800', elevation: 3, shadowColor: '#FF9800', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  tabInactive:     { backgroundColor: '#F5F5F5' },
  tabTextActive:   { fontSize: 14, fontWeight: '800', color: '#fff' },
  tabTextInactive: { fontSize: 14, fontWeight: '700', color: '#90A4AE' },

  /* Loading */
  loadingWrap: { alignItems: 'center', paddingVertical: 44 },
  loadingText: { marginTop: 14, fontSize: 15, color: '#E8927C', fontWeight: '600' },

  /* Scroll content */
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },

  /* Session meta */
  sessionMeta: { fontSize: 12, color: '#B0BEC5', marginTop: 2, marginBottom: 14 },

  /* Sections */
  section: { marginBottom: 18 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  itemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
  itemPct: { fontSize: 14, fontWeight: '800', minWidth: 42, textAlign: 'right' },

  /* Empty */
  emptyWrap: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16 },
  emptyEmoji: { fontSize: 44, marginBottom: 14 },
  emptyText: { fontSize: 14, color: '#90A4AE', textAlign: 'center', lineHeight: 22 },

  /* Report button */
  reportBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 4,
    elevation: 6,
    shadowColor: '#C87456',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  reportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
  },
  reportText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
