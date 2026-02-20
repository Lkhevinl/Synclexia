import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getStudentProgress } from '../../lib/analyticsHelper';

const ACTIVITY_ICONS = {
  phonics: '🗣️',
  phonics_blend: '🔗',
  phonics_rhyme: '🎵',
  phonics_segment: '✂️',
  spelling: '🔤',
  writing: '✍️',
  reading: '📖',
  scan: '📷',
};

export default function TeacherProgressScreen({ navigation }) {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [daysBack, setDaysBack] = useState(7);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('enrollments')
      .select('*, profiles!enrollments_student_id_fkey(id, full_name, email, xp)')
      .eq('teacher_id', profile?.id);
    
    if (data) {
      setStudents(data);
      if (data.length > 0) {
        loadProgress(data[0]);
      }
    }
    setLoading(false);
  };

  const loadProgress = async (student) => {
    setSelectedStudent(student);
    setProgressLoading(true);
    const data = await getStudentProgress(student.profiles.id, daysBack);
    setProgress(data);
    setProgressLoading(false);
  };

  const handleDaysChange = async (days) => {
    setDaysBack(days);
    if (selectedStudent) {
      setProgressLoading(true);
      const data = await getStudentProgress(selectedStudent.profiles.id, days);
      setProgress(data);
      setProgressLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  if (students.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
          <GoBackBtn />
          <Text style={styles.headerTitle}>Student Progress</Text>
        </LinearGradient>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="analytics" size={80} color="#ccc" style={{ marginBottom: 20 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#666', textAlign: 'center' }}>
            No students enrolled yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Student Progress</Text>
        <Text style={styles.headerSub}>Detailed analytics per student</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Student Selector */}
        <Text style={styles.sectionLabel}>Select Student</Text>
        <FlatList
          horizontal
          data={students}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.studentChip, selectedStudent?.id === item.id && styles.studentChipActive]}
              onPress={() => loadProgress(item)}
            >
              <Text style={[styles.chipName, selectedStudent?.id === item.id && styles.chipNameActive]}>
                {item.profiles?.full_name?.split(' ')[0]}
              </Text>
              <Text style={[styles.chipXP, selectedStudent?.id === item.id && styles.chipXPActive]}>
                {item.profiles?.xp || 0} XP
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Time Range */}
        <View style={styles.timeRow}>
          {[7, 14, 30].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.timeBtn, daysBack === d && styles.timeBtnActive]}
              onPress={() => handleDaysChange(d)}
            >
              <Text style={[styles.timeText, daysBack === d && styles.timeTextActive]}>
                {d}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {progressLoading ? (
          <ActivityIndicator size="large" color="#4c669f" style={{ marginTop: 40 }} />
        ) : progress ? (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{progress.totalSessions}</Text>
                <Text style={styles.summaryLabel}>Sessions</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{progress.totalXP}</Text>
                <Text style={styles.summaryLabel}>XP Earned</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: progress.avgAccuracy >= 70 ? '#4CAF50' : '#FF9800' }]}>
                  {progress.avgAccuracy}%
                </Text>
                <Text style={styles.summaryLabel}>Avg Accuracy</Text>
              </View>
            </View>

            {/* Activity Breakdown */}
            <Text style={styles.sectionLabel}>Activity Breakdown</Text>
            {Object.entries(progress.byActivity).length === 0 ? (
              <View style={styles.emptyBreakdown}>
                <Text style={{ color: '#999', textAlign: 'center' }}>No activity in this period</Text>
              </View>
            ) : (
              Object.entries(progress.byActivity).map(([type, stats]) => (
                <View key={type} style={styles.breakdownRow}>
                  <Text style={styles.breakdownIcon}>{ACTIVITY_ICONS[type] || '📊'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownType}>{type}</Text>
                    <View style={styles.breakdownBar}>
                      <View style={[styles.breakdownFill, { width: `${Math.min(stats.avgAccuracy, 100)}%`, backgroundColor: stats.avgAccuracy >= 70 ? '#4CAF50' : stats.avgAccuracy >= 50 ? '#FF9800' : '#F44336' }]} />
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.breakdownSessions}>{stats.count} sessions</Text>
                    <Text style={styles.breakdownAccuracy}>{stats.avgAccuracy}% avg</Text>
                  </View>
                </View>
              ))
            )}

            {/* Recent Sessions */}
            <Text style={styles.sectionLabel}>Recent Sessions</Text>
            {progress.recentSessions.map((session, idx) => (
              <View key={session.id || idx} style={styles.sessionItem}>
                <Text style={styles.sessionIcon}>{ACTIVITY_ICONS[session.activity_type] || '📊'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionType}>{session.activity_type}</Text>
                  <Text style={styles.sessionScore}>
                    {session.score}/{session.total} ({session.accuracy}%)
                    {session.xp_earned ? ` • +${session.xp_earned} XP` : ''}
                  </Text>
                </View>
                <Text style={styles.sessionTime}>
                  {new Date(session.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 5 },
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 15, marginTop: 20 },

  // Student Chips
  studentChip: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, marginRight: 10, alignItems: 'center', elevation: 1 },
  studentChipActive: { backgroundColor: '#3b5998' },
  chipName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  chipNameActive: { color: '#fff' },
  chipXP: { fontSize: 11, color: '#999', marginTop: 3 },
  chipXPActive: { color: 'rgba(255,255,255,0.8)' },

  // Time Range
  timeRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  timeBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', elevation: 1 },
  timeBtnActive: { backgroundColor: '#3b5998' },
  timeText: { fontWeight: 'bold', color: '#666' },
  timeTextActive: { color: '#fff' },

  // Summary Cards
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', elevation: 2 },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  summaryLabel: { fontSize: 11, color: '#999', fontWeight: 'bold', marginTop: 5, textTransform: 'uppercase' },

  // Breakdown
  emptyBreakdown: { backgroundColor: '#fff', borderRadius: 16, padding: 30, elevation: 1 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 10, elevation: 1 },
  breakdownIcon: { fontSize: 28, marginRight: 12 },
  breakdownType: { fontSize: 14, fontWeight: 'bold', color: '#333', textTransform: 'capitalize' },
  breakdownBar: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  breakdownFill: { height: '100%', borderRadius: 3 },
  breakdownSessions: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  breakdownAccuracy: { fontSize: 10, color: '#999', marginTop: 2 },

  // Sessions
  sessionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, elevation: 1 },
  sessionIcon: { fontSize: 24, marginRight: 12 },
  sessionType: { fontSize: 14, fontWeight: 'bold', color: '#333', textTransform: 'capitalize' },
  sessionScore: { fontSize: 12, color: '#666', marginTop: 2 },
  sessionTime: { fontSize: 11, color: '#999' },
});
