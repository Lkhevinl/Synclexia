import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/students/DashboardScreen';
import TeacherDashboardScreen from '../screens/teachers/TeacherDashboardScreen';
import ParentDashboardScreen from '../screens/parents/ParentDashboardScreen';

export default function DashboardSwitcher(props) {
  const { profile, dashboardMode } = useAuth();
  if (dashboardMode === 'student') return <DashboardScreen {...props} />;
  if (dashboardMode === 'teacher') return <TeacherDashboardScreen {...props} />;
  if (profile?.role === 'parent')  return <ParentDashboardScreen {...props} />;
  if (profile?.role === 'teacher' || profile?.role === 'admin') {
    return <TeacherDashboardScreen {...props} />;
  }
  return <DashboardScreen {...props} />;
}
