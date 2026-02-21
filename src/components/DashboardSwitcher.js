import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/students/DashboardScreen';
import TeacherDashboardScreen from '../screens/teachers/TeacherDashboardScreen';
import ParentDashboardScreen from '../screens/parents/ParentDashboardScreen';

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

  // Manual override takes priority
  if (dashboardMode === 'student') return <DashboardScreen {...props} />;
  if (dashboardMode === 'teacher') return <TeacherDashboardScreen {...props} />;

  // Role-based routing
  if (profile.role === 'parent')               return <ParentDashboardScreen {...props} />;
  if (profile.role === 'teacher' || profile.role === 'admin') return <TeacherDashboardScreen {...props} />;

  // Default: student
  return <DashboardScreen {...props} />;
}
