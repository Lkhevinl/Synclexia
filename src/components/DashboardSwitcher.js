import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/students/DashboardScreen';
import TeacherDashboardScreen from '../screens/teachers/TeacherDashboardScreen';
import ParentDashboardScreen from '../screens/parents/ParentDashboardScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

export default function DashboardSwitcher(props) {
  const { profile, dashboardMode, loading, profileLoaded, profileError, setProfileError, setLoading, session, fetchProfile, signOut } = useAuth();

  // Show spinner while actively loading
  if (loading || !profileLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  // Profile failed to load (server error / infinite recursion in DB) — show actionable error
  if (profileError && !profile) {
    const isServerError = profileError === 'server_error';
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={64} color="#e53e3e" style={{ marginBottom: 16 }} />
        <Text style={styles.errorTitle}>
          {isServerError ? 'Database Error' : 'Profile Not Found'}
        </Text>
        <Text style={styles.errorMsg}>
          {isServerError
            ? 'Could not connect to your profile.\nThis is usually a database configuration issue.\n\nAsk your admin to run the latest SQL fix in Supabase.'
            : 'Your profile was not found. Please sign out and sign in again.'}
        </Text>
        {session && (
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              // Reset stale error/loading state first so spinner shows
              setProfileError(null);
              setLoading(true);
              fetchProfile(session.user.id);
            }}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Manual override — only allow if the profile role matches (prevents role escalation)
  if (dashboardMode === 'student' && profile?.role === 'student') return <DashboardScreen {...props} />;
  if (dashboardMode === 'teacher' && profile?.role === 'teacher') return <TeacherDashboardScreen {...props} />;
  if (dashboardMode === 'admin'   && profile?.role === 'admin')   return <AdminDashboardScreen {...props} />;
  if (dashboardMode === 'parent'  && profile?.role === 'parent')  return <ParentDashboardScreen {...props} />;

  // Role-based routing
  if (profile?.role === 'parent')  return <ParentDashboardScreen {...props} />;
  if (profile?.role === 'admin')   return <AdminDashboardScreen {...props} />;
  if (profile?.role === 'teacher') return <TeacherDashboardScreen {...props} />;

  // Default: student
  return <DashboardScreen {...props} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F7FA', padding: 32,
  },
  errorTitle: {
    fontSize: 20, fontWeight: '700', color: '#1a202c',
    marginBottom: 12, textAlign: 'center',
  },
  errorMsg: {
    fontSize: 14, color: '#4a5568', textAlign: 'center',
    lineHeight: 22, marginBottom: 28,
  },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4c669f', paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 10, marginBottom: 12,
  },
  retryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  signOutBtn: {
    paddingHorizontal: 28, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0',
  },
  signOutBtnText: { color: '#4a5568', fontWeight: '500', fontSize: 14 },
});
