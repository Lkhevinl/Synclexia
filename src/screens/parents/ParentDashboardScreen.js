// screens/parents/ParentDashboardScreen.js
// Parents can view the progress of their linked children.
// A parent account is linked to a student via the parent_links table.
// Read-only: parents cannot assign activities or post notifications.
// Features: child progress, assignments tracker, notifications, adaptive levels,
//           daily streak, feedback sending, support & settings navigation.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Modal, TextInput,
  Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getStudentProgress } from '../../lib/analyticsHelper';
import { getAllAdaptiveStates, levelLabel } from '../../lib/adaptiveEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ACTIVITY_LABELS = {
  phonics:                  '🗣️ Phonics',
  phonics_blend:            '🔗 Blending',
  phonics_rhyme:            '🎵 Rhyme',
  phonics_segment:          '✂️ Segmenting',
  spelling:                 '🔤 Spelling',
  writing:                  '✍️ Writing',
  reading:                  '📖 Reading',
  scan:                     '📷 Scan',
  phonological_awareness:   '🎧 Phonological',
};

const TIME_RANGES = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

export default function ParentDashboardScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [progress, setProgress] = useState(null);
  const [adaptiveStates, setAdaptiveStates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [daysBack, setDaysBack] = useState(14);

  // Feedback modal
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Notifications modal
  const [notifVisible, setNotifVisible] = useState(false);

  useEffect(() => {
    fetchLinkedChildren();
  }, []);

  const fetchLinkedChildren = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('parent_links')
      .select('*')
      .eq('parent_id', profile?.id)
      .order('created_at');

    if (data && data.length > 0) {
      const childIds = [...new Set(data.map(l => l.student_id))];
      const { data: childProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, xp, coins, role')
        .in('id', childIds);
      const profileMap = {};
      (childProfiles || []).forEach(p => { profileMap[p.id] = p; });

      const enriched = data.map(l => ({
        ...l,
        profiles: profileMap[l.student_id] || null,
      }));
      setChildren(enriched);
      await selectChild(enriched[0], daysBack);
    }
    setLoading(false);
  };

  const selectChild = async (link, days) => {
    if (!link?.profiles) return;
    setSelectedChild(link);
    const d = days ?? daysBack;
    const [prog, adaptive, assigns, notifs] = await Promise.all([
      getStudentProgress(link.profiles.id, d),
      getAllAdaptiveStates(link.profiles.id),
      fetchAssignments(link.profiles.id),
      fetchNotifications(link.profiles.id),
    ]);
    setProgress(prog);
    setAdaptiveStates(adaptive);
    setAssignments(assigns);
    setNotifications(notifs);
  };

  const fetchAssignments = async (studentId) => {
    try {
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    } catch { return []; }
  };

  const fetchNotifications = async (studentId) => {
    try {
      // Get notifications from the student's enrolled teacher
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('teacher_id')
        .eq('student_id', studentId)
        .limit(1)
        .maybeSingle();

      if (!enrollment) return [];

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('teacher_id', enrollment.teacher_id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    } catch { return []; }
  };

  const handleDaysChange = async (days) => {
    setDaysBack(days);
    if (selectedChild) {
      await selectChild(selectedChild, days);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLinkedChildren();
    setRefreshing(false);
  };

  const sendFeedback = async () => {
    if (!feedbackMessage.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }
    setSendingFeedback(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: profile?.id,
      message: feedbackMessage.trim(),
      rating: feedbackRating,
    });
    setSendingFeedback(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Thank You!', 'Your feedback has been sent to the teacher.');
      setFeedbackMessage('');
      setFeedbackRating(5);
      setFeedbackVisible(false);
    }
  };

  const level = Math.floor((selectedChild?.profiles?.xp || 0) / 100) + 1;
  const xp    = selectedChild?.profiles?.xp || 0;
  const coins = selectedChild?.profiles?.coins || 0;
  const xpToNext = 100 - (xp % 100);
  const xpProgress = (xp % 100) / 100;

  // Compute daily streak from recent sessions
  const computeStreak = useCallback(() => {
    if (!progress?.recentSessions?.length) return 0;
    const days = new Set();
    progress.recentSessions.forEach(s => {
      days.add(new Date(s.created_at).toDateString());
    });
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) streak++;
      else if (i > 0) break; // allow today to be missing
    }
    return streak;
  }, [progress]);

  const streak = computeStreak();
  const pendingAssignments = assignments.filter(a => !a.is_completed);
  const completedAssignments = assignments.filter(a => a.is_completed);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6A1B9A" />
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#6A1B9A', '#4A148C']} style={styles.header}>
          <Text style={styles.headerTitle}>Parent Dashboard</Text>
          <Text style={styles.headerSub}>No linked children found.</Text>
        </LinearGradient>
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No children linked yet.</Text>
          <Text style={styles.emptyHint}>Ask the teacher or admin to link your account.</Text>
        </View>
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.supportBtn} onPress={() => navigation.navigate('Support')}>
            <Ionicons name="help-circle-outline" size={20} color="#6A1B9A" />
            <Text style={styles.supportBtnText}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#6A1B9A', '#4A148C']} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Parent Dashboard</Text>
            <Text style={styles.headerSub}>Welcome, {profile?.full_name}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setNotifVisible(true)}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {notifications.length > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setFeedbackVisible(true)}>
              <Ionicons name="chatbubble-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={signOut}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelector}>
          {children.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.childChip, selectedChild?.id === c.id && styles.childChipActive]}
              onPress={() => selectChild(c)}>
              <Text style={[styles.childChipText, selectedChild?.id === c.id && styles.childChipTextActive]}>
                {c.profiles?.full_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6A1B9A']} />}
      >
        {selectedChild && (
          <>
            {/* Child Summary Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {selectedChild.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.childName}>{selectedChild.profiles?.full_name}</Text>
                  <Text style={styles.childEmail}>{selectedChild.profiles?.email}</Text>
                </View>
                {streak > 0 && (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥 {streak}d</Text>
                  </View>
                )}
              </View>

              {/* XP Progress Bar */}
              <View style={styles.xpBarContainer}>
                <View style={styles.xpBarBg}>
                  <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
                </View>
                <Text style={styles.xpBarLabel}>{xpToNext} XP to Level {level + 1}</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>Lv. {level}</Text>
                  <Text style={styles.statLabel}>LEVEL</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{xp}</Text>
                  <Text style={styles.statLabel}>TOTAL XP</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: '#FFD700' }]}>{coins}</Text>
                  <Text style={styles.statLabel}>COINS</Text>
                </View>
              </View>
            </View>

            {/* Quick Stats Row */}
            <View style={styles.quickStatsRow}>
              <View style={[styles.quickStat, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={[styles.quickStatValue, { color: '#4CAF50' }]}>{completedAssignments.length}</Text>
                <Text style={styles.quickStatLabel}>Completed</Text>
              </View>
              <View style={[styles.quickStat, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="time" size={24} color="#FF9800" />
                <Text style={[styles.quickStatValue, { color: '#FF9800' }]}>{pendingAssignments.length}</Text>
                <Text style={styles.quickStatLabel}>Pending</Text>
              </View>
              <View style={[styles.quickStat, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="flame" size={24} color="#6A1B9A" />
                <Text style={[styles.quickStatValue, { color: '#6A1B9A' }]}>{streak}</Text>
                <Text style={styles.quickStatLabel}>Day Streak</Text>
              </View>
            </View>

            {/* Time Range Selector */}
            <View style={styles.timeRangeRow}>
              {TIME_RANGES.map(r => (
                <TouchableOpacity
                  key={r.days}
                  style={[styles.timeBtn, daysBack === r.days && styles.timeBtnActive]}
                  onPress={() => handleDaysChange(r.days)}
                >
                  <Text style={[styles.timeText, daysBack === r.days && styles.timeTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Progress Summary */}
            {progress && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>📊 Progress Summary</Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{progress.totalSessions}</Text>
                    <Text style={styles.statLabel}>SESSIONS</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{progress.totalXP}</Text>
                    <Text style={styles.statLabel}>XP EARNED</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: progress.avgAccuracy >= 70 ? '#4CAF50' : progress.avgAccuracy >= 40 ? '#FF9800' : '#F44336' }]}>
                      {progress.avgAccuracy}%
                    </Text>
                    <Text style={styles.statLabel}>AVG ACCURACY</Text>
                  </View>
                </View>

                {/* Per-activity breakdown */}
                {Object.keys(progress.byActivity).length > 0 && (
                  <>
                    <Text style={styles.subTitle}>Activity Breakdown</Text>
                    {Object.entries(progress.byActivity).map(([type, data]) => {
                      const acc = data.totalItems > 0 ? Math.round((data.totalScore / data.totalItems) * 100) : 0;
                      const color = acc >= 70 ? '#4CAF50' : acc >= 40 ? '#FF9800' : '#F44336';
                      return (
                        <View key={type} style={styles.activityRow}>
                          <Text style={styles.activityLabel}>{ACTIVITY_LABELS[type] || type}</Text>
                          <View style={styles.activityRight}>
                            <Text style={styles.activitySessions}>{data.count}x</Text>
                            <View style={[styles.accBadge, { backgroundColor: color + '20', borderColor: color }]}>
                              <Text style={[styles.accText, { color }]}>{acc}%</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}
              </View>
            )}

            {/* Assignments Tracker */}
            {assignments.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>📋 Assignments</Text>
                {pendingAssignments.length > 0 && (
                  <>
                    <Text style={styles.subTitle}>Pending ({pendingAssignments.length})</Text>
                    {pendingAssignments.map(a => (
                      <View key={a.id} style={styles.assignmentRow}>
                        <View style={[styles.assignDot, { backgroundColor: '#FF9800' }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.assignType}>{ACTIVITY_LABELS[a.activity_type] || a.activity_type}</Text>
                          {a.notes && <Text style={styles.assignNotes}>{a.notes}</Text>}
                        </View>
                        <Text style={styles.assignTarget}>Target: {a.target_count || 1}</Text>
                      </View>
                    ))}
                  </>
                )}
                {completedAssignments.length > 0 && (
                  <>
                    <Text style={styles.subTitle}>Completed ({completedAssignments.length})</Text>
                    {completedAssignments.slice(0, 5).map(a => (
                      <View key={a.id} style={[styles.assignmentRow, { opacity: 0.6 }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginRight: 10 }} />
                        <Text style={[styles.assignType, { textDecorationLine: 'line-through' }]}>
                          {ACTIVITY_LABELS[a.activity_type] || a.activity_type}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}

            {/* Adaptive Levels */}
            {adaptiveStates.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>🎯 Adaptive Difficulty</Text>
                {adaptiveStates.map(s => {
                  const color = s.current_level === 1 ? '#4CAF50' : s.current_level === 2 ? '#FF9800' : '#F44336';
                  return (
                    <View key={s.activity_type} style={styles.adaptiveRow}>
                      <Text style={styles.adaptiveLabel}>{ACTIVITY_LABELS[s.activity_type] || s.activity_type}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.adaptiveAttempts}>{s.attempts || 0} attempts</Text>
                        <View style={[styles.levelBadge, { backgroundColor: color + '20', borderColor: color }]}>
                          <Text style={[styles.levelText, { color }]}>{levelLabel(s.current_level)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Recent Sessions */}
            {progress?.recentSessions?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>🕐 Recent Activity</Text>
                {progress.recentSessions.slice(0, 8).map(s => (
                  <View key={s.id} style={styles.sessionRow}>
                    <View>
                      <Text style={styles.sessionType}>{ACTIVITY_LABELS[s.activity_type] || s.activity_type}</Text>
                      <Text style={styles.sessionDate}>{new Date(s.created_at).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.sessionRight}>
                      <Text style={styles.sessionXP}>+{s.xp_earned} XP</Text>
                      <Text style={[styles.sessionAcc, {
                        color: s.accuracy >= 70 ? '#4CAF50' : s.accuracy >= 40 ? '#FF9800' : '#F44336'
                      }]}>{s.accuracy}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setFeedbackVisible(true)}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#6A1B9A" />
                  <Text style={styles.actionLabel}>Send Feedback</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Support')}>
                  <Ionicons name="help-circle" size={24} color="#2196F3" />
                  <Text style={styles.actionLabel}>Support</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('About')}>
                  <Ionicons name="information-circle" size={24} color="#FF9800" />
                  <Text style={styles.actionLabel}>About</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Settings')}>
                  <Ionicons name="settings" size={24} color="#78909C" />
                  <Text style={styles.actionLabel}>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Notifications Modal */}
      <Modal visible={notifVisible} transparent animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Announcements</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {notifications.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Ionicons name="megaphone-outline" size={40} color="#ccc" />
                  <Text style={{ color: '#999', marginTop: 10 }}>No announcements yet</Text>
                </View>
              ) : notifications.map(n => (
                <View key={n.id} style={styles.notifItem}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifBody}>{n.content}</Text>
                  <Text style={styles.notifDate}>{new Date(n.created_at).toLocaleDateString()}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal visible={feedbackVisible} transparent animationType="slide" onRequestClose={() => setFeedbackVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💬 Send Feedback</Text>
              <TouchableOpacity onPress={() => setFeedbackVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.feedbackHint}>Share your thoughts about your child's learning experience.</Text>

            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#666', marginTop: 12, marginBottom: 8 }}>Rating</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(r => (
                <TouchableOpacity key={r} onPress={() => setFeedbackRating(r)}>
                  <Ionicons
                    name={r <= feedbackRating ? 'star' : 'star-outline'}
                    size={32}
                    color={r <= feedbackRating ? '#FBC02D' : '#ccc'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.feedbackInput}
              multiline
              placeholder="Write your feedback..."
              value={feedbackMessage}
              onChangeText={setFeedbackMessage}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.feedbackSendBtn, sendingFeedback && { opacity: 0.5 }]}
              onPress={sendFeedback}
              disabled={sendingFeedback}
            >
              {sendingFeedback ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.feedbackSendText}>Send Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F7FA' },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  header:          { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:     { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub:       { fontSize: 13, color: '#fff', opacity: 0.85, marginTop: 2 },
  headerIcons:     { flexDirection: 'row', gap: 8 },
  headerIconBtn:   { padding: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
  notifDot:        { position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5252' },
  childSelector:   { paddingHorizontal: 15, paddingVertical: 10, maxHeight: 55 },
  childChip:       { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10, elevation: 2 },
  childChipActive: { backgroundColor: '#6A1B9A' },
  childChipText:   { fontWeight: 'bold', color: '#6A1B9A' },
  childChipTextActive: { color: '#fff' },
  scroll:          { padding: 15, paddingBottom: 40 },
  card:            { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 3 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarCircle:    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6A1B9A', justifyContent: 'center', alignItems: 'center' },
  avatarText:      { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  childName:       { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  childEmail:      { fontSize: 12, color: '#90A4AE' },
  streakBadge:     { backgroundColor: '#FFF3E0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  streakText:      { fontSize: 13, fontWeight: 'bold', color: '#FF9800' },
  xpBarContainer:  { marginBottom: 12 },
  xpBarBg:         { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  xpBarFill:       { height: '100%', backgroundColor: '#6A1B9A', borderRadius: 4 },
  xpBarLabel:      { fontSize: 10, color: '#90A4AE', marginTop: 4, textAlign: 'right' },
  statsRow:        { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  stat:            { alignItems: 'center' },
  statValue:       { fontSize: 20, fontWeight: 'bold', color: '#6A1B9A' },
  statLabel:       { fontSize: 10, color: '#90A4AE', marginTop: 2, letterSpacing: 0.5 },
  divider:         { width: 1, backgroundColor: '#f0f0f0' },

  // Quick Stats
  quickStatsRow:   { flexDirection: 'row', gap: 10, marginBottom: 14 },
  quickStat:       { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', elevation: 1 },
  quickStatValue:  { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  quickStatLabel:  { fontSize: 10, color: '#666', fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' },

  // Time Range
  timeRangeRow:    { flexDirection: 'row', gap: 10, marginBottom: 14 },
  timeBtn:         { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', elevation: 1 },
  timeBtnActive:   { backgroundColor: '#6A1B9A' },
  timeText:        { fontWeight: 'bold', color: '#666', fontSize: 13 },
  timeTextActive:  { color: '#fff' },

  sectionTitle:    { fontSize: 16, fontWeight: 'bold', color: '#37474F', marginBottom: 14 },
  subTitle:        { fontSize: 13, fontWeight: 'bold', color: '#78909C', marginTop: 14, marginBottom: 8 },
  activityRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  activityLabel:   { fontSize: 14, color: '#37474F' },
  activityRight:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activitySessions:{ fontSize: 12, color: '#90A4AE' },
  accBadge:        { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  accText:         { fontSize: 12, fontWeight: 'bold' },

  // Assignments
  assignmentRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  assignDot:       { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  assignType:      { fontSize: 14, fontWeight: '600', color: '#37474F' },
  assignNotes:     { fontSize: 11, color: '#90A4AE', marginTop: 2 },
  assignTarget:    { fontSize: 11, fontWeight: 'bold', color: '#78909C' },

  adaptiveRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  adaptiveLabel:   { fontSize: 14, color: '#37474F' },
  adaptiveAttempts:{ fontSize: 11, color: '#90A4AE' },
  levelBadge:      { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 3 },
  levelText:       { fontSize: 12, fontWeight: 'bold' },
  sessionRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  sessionType:     { fontSize: 14, fontWeight: '600', color: '#37474F' },
  sessionDate:     { fontSize: 11, color: '#90A4AE', marginTop: 2 },
  sessionRight:    { alignItems: 'flex-end' },
  sessionXP:       { fontSize: 13, fontWeight: 'bold', color: '#6A1B9A' },
  sessionAcc:      { fontSize: 11, fontWeight: 'bold' },

  // Quick Actions
  actionGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn:       { width: (SCREEN_WIDTH - 80) / 2, backgroundColor: '#F5F7FA', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6 },
  actionLabel:     { fontSize: 12, fontWeight: 'bold', color: '#37474F' },

  // Bottom
  bottomActions:   { paddingHorizontal: 20, paddingBottom: 20 },
  supportBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F3E5F5', borderRadius: 12, padding: 14, marginBottom: 10 },
  supportBtnText:  { color: '#6A1B9A', fontWeight: 'bold' },
  emptyText:       { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 16 },
  emptyHint:       { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },
  signOutBtn:      { backgroundColor: '#E53935', borderRadius: 12, padding: 14, alignItems: 'center' },
  signOutText:     { color: '#fff', fontWeight: 'bold' },

  // Modals
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent:    { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 24, maxHeight: '80%' },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:      { fontSize: 18, fontWeight: 'bold', color: '#333' },
  notifItem:       { marginBottom: 14, borderBottomWidth: 1, borderColor: '#f0f0f0', paddingBottom: 12 },
  notifTitle:      { fontWeight: 'bold', color: '#6A1B9A', marginBottom: 4, fontSize: 15 },
  notifBody:       { color: '#555', fontSize: 13, lineHeight: 20 },
  notifDate:       { fontSize: 10, color: '#90A4AE', marginTop: 4 },

  // Feedback
  feedbackHint:    { fontSize: 13, color: '#999', marginBottom: 8 },
  ratingRow:       { flexDirection: 'row', gap: 8, marginBottom: 12 },
  feedbackInput:   { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14, fontSize: 15, minHeight: 100, borderWidth: 1, borderColor: '#E0E0E0' },
  feedbackSendBtn: { backgroundColor: '#6A1B9A', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 14 },
  feedbackSendText:{ color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
