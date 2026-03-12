import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/students/DashboardScreen';
import TeacherDashboardScreen from '../screens/teachers/TeacherDashboardScreen';
import ParentDashboardScreen from '../screens/parents/ParentDashboardScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

export default function DashboardSwitcher(props) {
  const { profile, dashboardMode, loading, profileLoaded } = useAuth();

  // Show spinner only while actively loading — once profileLoaded is true, proceed even if profile is null
  if (loading || !profileLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#4c669f" />
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
