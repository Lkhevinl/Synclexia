import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Alert, Share } from 'react-native';
import Icon from '../../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../../components/GoBackBtn';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { fetchEnrollmentsWithProfiles } from '../../../lib/enrollmentHelper';
import { getStudentProgress } from '../../../lib/analyticsHelper';
import ScreenWrapper from '../../../components/ScreenWrapper';
import tokens from '../../../theme/tokens';
import { useTheme } from '../../../context/ThemeContext';

const ACTIVITY_ICONS = {
  phonics:                  'mic',
  phonics_blend:            'link-2',
  phonics_segment:          'scissors',
  spelling:                 'type',
  writing:                  'pencil',
  reading:                  'book-open',
  scan:                     'camera',
  phonological_awareness:   'headphones',
};

export default function TeacherProgressScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [daysBack, setDaysBack] = useState(7);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Null-safe helpers — profiles can be null if RLS blocks the query
  const getStudentId   = (s) => s?.profiles?.id   ?? s?.student_id;
  const getStudentName = (s) => s?.profiles?.full_name ?? 'Student';

  const fetchStudents = async () => {
    const data = await fetchEnrollmentsWithProfiles(profile?.id);
    setStudents(data);
    if (data.length > 0) {
      await loadProgress(data[0]);
    }
    setLoading(false);
  };

  const loadProgress = async (student) => {
    setSelectedStudent(student);
    const sid = getStudentId(student);
    if (!sid) return;
    setProgressLoading(true);
    const data = await getStudentProgress(sid, daysBack);
    setProgress(data);
    setProgressLoading(false);
  };

  const handleDaysChange = async (days) => {
    setDaysBack(days);
    if (selectedStudent) {
      const sid = getStudentId(selectedStudent);
      if (!sid) return;
      setProgressLoading(true);
      const data = await getStudentProgress(sid, days);
      setProgress(data);
      setProgressLoading(false);
    }
  };

  const exportReport = async () => {
    if (!progress || !selectedStudent) {
      Alert.alert('No Data', 'Please select a student with progress data to export.');
      return;
    }

    const studentName = getStudentName(selectedStudent);
    const dateStr = new Date().toLocaleDateString();
    
    // Build CSV content
    let csv = `Synclexia Progress Report\n`;
    csv += `Student: ${studentName}\n`;
    csv += `Generated: ${dateStr}\n`;
    csv += `Period: Last ${daysBack} days\n\n`;
    csv += `Summary\n`;
    csv += `Total Sessions,${progress.totalSessions}\n`;
    csv += `Average Accuracy,${progress.avgAccuracy}%\n\n`;
    csv += `Activity Breakdown\n`;
    csv += `Activity Type,Sessions,Average Accuracy\n`;
    
    Object.entries(progress.byActivity).forEach(([type, stats]) => {
      const avgAcc = stats.totalItems > 0 ? Math.round((stats.totalScore / stats.totalItems) * 100) : 0;
      csv += `${type},${stats.count},${avgAcc}%\n`;
    });
    
    csv += `\nRecent Sessions\n`;
    csv += `Date,Activity,Score,Total,Accuracy\n`;
    progress.recentSessions.forEach(session => {
      csv += `${new Date(session.created_at).toLocaleDateString()},${session.activity_type},${session.score},${session.total},${session.accuracy}%\n`;
    });

    try {
      await Share.share({
        message: csv,
        title: `Progress Report - ${studentName}`,
      });
    } catch (error) {
      Alert.alert('Export Error', error.message);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper role="teacher" padded={false} style={{ backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4c669f" />
      </ScreenWrapper>
    );
  }

  if (students.length === 0) {
    return (
      <ScreenWrapper role="teacher" padded={false} style={{ backgroundColor: colors.surface }}>
        <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
          <GoBackBtn />
          <Text style={styles.headerTitle}>Student Progress</Text>
        </LinearGradient>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Icon name="bar-chart" size="xl" color="#ccc" style={{ marginBottom: 20 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#666', textAlign: 'center' }}>
            No students enrolled yet
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper role="teacher" padded={false} style={{ backgroundColor: colors.surface }}>
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
          keyExtractor={item => item.student_id ?? item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = getStudentId(selectedStudent) === getStudentId(item);
            return (
              <TouchableOpacity
                style={[styles.studentChip, isActive && styles.studentChipActive]}
                onPress={() => loadProgress(item)}
              >
                <View style={[styles.chipAvatar, isActive && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={styles.chipAvatarText}>
                    {(getStudentName(item)[0] || '?').toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.chipName, isActive && styles.chipNameActive]}>
                  {getStudentName(item).split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          }}
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
                <Text style={[styles.summaryValue, { color: progress.avgAccuracy >= 70 ? '#4CAF50' : '#FF9800' }]}>
                  {progress.avgAccuracy}%
                </Text>
                <Text style={styles.summaryLabel}>Avg Accuracy</Text>
              </View>
            </View>

            {/* Export Button */}
            <TouchableOpacity style={styles.exportBtn} onPress={exportReport}>
              <Icon name="download" size="md" color="#fff" />
              <Text style={styles.exportText}>Export Report</Text>
            </TouchableOpacity>

            {/* Activity Breakdown */}
            <Text style={styles.sectionLabel}>Activity Breakdown</Text>
            {Object.entries(progress.byActivity).length === 0 ? (
              <View style={styles.emptyBreakdown}>
                <Text style={{ color: '#999', textAlign: 'center' }}>No activity in this period</Text>
              </View>
            ) : (
              Object.entries(progress.byActivity).map(([type, stats]) => {
                const avgAcc = stats.totalItems > 0 ? Math.round((stats.totalScore / stats.totalItems) * 100) : 0;
                return (
                  <View key={type} style={styles.breakdownRow}>
                    <Icon name={ACTIVITY_ICONS[type] || 'bar-chart'} size="md" color="#607D8B" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.breakdownType}>{type}</Text>
                      <View style={styles.breakdownBar}>
                        <View style={[styles.breakdownFill, { width: `${Math.min(avgAcc, 100)}%`, backgroundColor: avgAcc >= 70 ? '#4CAF50' : avgAcc >= 50 ? '#FF9800' : '#F44336' }]} />
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.breakdownSessions}>{stats.count} sessions</Text>
                      <Text style={styles.breakdownAccuracy}>{avgAcc}% avg</Text>
                    </View>
                  </View>
                );
              })
            )}

            {/* Recent Sessions */}
            <Text style={styles.sectionLabel}>Recent Sessions</Text>
            {progress.recentSessions.map((session, idx) => (
              <View key={session.id || idx} style={styles.sessionItem}>
                <Icon name={ACTIVITY_ICONS[session.activity_type] || 'bar-chart'} size="md" color="#607D8B" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionType}>{session.activity_type}</Text>
                  <Text style={styles.sessionScore}>
                    {session.score}/{session.total} ({session.accuracy}%)
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 5 },
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 15, marginTop: 20 },

  // Student Chips
  studentChip: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, marginRight: 10, alignItems: 'center', elevation: 1, minWidth: 80 },
  studentChipActive: { backgroundColor: '#3b5998' },
  chipAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  chipAvatarText: { fontWeight: 'bold', color: '#3b5998', fontSize: 15 },
  chipName: { fontWeight: 'bold', color: '#333', fontSize: 13 },
  chipNameActive: { color: '#fff' },

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

  // Export Button
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b5998', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 15, marginBottom: 5, elevation: 2 },
  exportText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },

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
