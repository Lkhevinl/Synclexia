import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { isUserStudent, isUserAdmin, isUserParent, isUserTeacher, canAccessTeacherFeatures } from '../lib/userUtils';
import DashboardScreen from '../screens/students/DashboardScreen';
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
  if (dashboardMode === 'student' && isUserStudent(profile)) return <DashboardScreen {...props} />;
  if (dashboardMode === 'admin' && isUserAdmin(profile)) return <AdminDashboardScreen {...props} />;
  if (dashboardMode === 'parent' && isUserParent(profile)) return <ParentDashboardScreen {...props} />;
  if ((dashboardMode === 'teacher' || dashboardMode === 'admin') && canAccessTeacherFeatures(profile)) return <AdminDashboardScreen {...props} />;

  // Role-based routing
  if (isUserParent(profile)) return <ParentDashboardScreen {...props} />;
  if (isUserAdmin(profile) || isUserTeacher(profile)) return <AdminDashboardScreen {...props} />;

  // Default: student
  return <DashboardScreen {...props} />;
}
