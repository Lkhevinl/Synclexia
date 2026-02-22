import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';

// Standard Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/students/DashboardScreen';
import PhonicsScreen from '../screens/students/PhonicsScreen';
import WritingScreen from '../screens/students/WritingScreen';
import ReadingScreen from '../screens/students/ReadingScreen';
import ScanScreen from '../screens/students/ScanScreen';
import QuestsScreen from '../screens/students/QuestScreen';
import LeaderboardScreen from '../screens/students/LeaderboardScreen';
import ShopScreen from '../screens/students/ShopScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SupportScreen from '../screens/SupportScreen';
import AboutScreen from '../screens/AboutScreen';

// ✅ TEACHER SCREENS (now in 'teachers' folder)
import TeacherDashboardScreen from '../screens/teachers/TeacherDashboardScreen';
import TeacherAddStoryScreen from '../screens/teachers/TeacherAddStoryScreen';
import TeacherUsersScreen from '../screens/teachers/TeacherUsersScreen';
import TeacherNotificationsScreen from '../screens/teachers/TeacherNotificationsScreen';
import TeacherFeedbackScreen from '../screens/teachers/TeacherFeedbackScreen';
import TeacherPhonicsScreen from '../screens/teachers/TeacherPhonicsScreen';
import TeacherEnrollmentScreen from '../screens/teachers/TeacherEnrollmentScreen';
import TeacherAssignActivitiesScreen from '../screens/teachers/TeacherAssignActivitiesScreen';
import TeacherProgressScreen from '../screens/teachers/TeacherProgressScreen';
import StudentEnrollScreen from '../screens/StudentEnrollScreen';
import PhonicsActivityScreen from '../screens/students/PhonicsActivityScreen';
import SpellingScreen from '../screens/students/SpellingScreen';
import PhonologicalAwarenessScreen from '../screens/students/PhonologicalAwarenessScreen';
import SpeechToTextScreen from '../screens/students/SpeechToTextScreen';
import TextToSpeechScreen from '../screens/students/TextToSpeechScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// PARENT SCREENS
import ParentDashboardScreen from '../screens/parents/ParentDashboardScreen';

// ADMIN SCREENS
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminPhonicsScreen from '../screens/admin/AdminPhonicsScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminEnrollmentScreen from '../screens/admin/AdminEnrollmentScreen';
import AdminAssignActivitiesScreen from '../screens/admin/AdminAssignActivitiesScreen';
import AdminAddStoryScreen from '../screens/admin/AdminAddStoryScreen';
import AdminSpellingScreen from '../screens/admin/AdminSpellingScreen';
import AdminPhonicsActivityScreen from '../screens/admin/AdminPhonicsActivityScreen';
import AdminPhonologicalScreen from '../screens/admin/AdminPhonologicalScreen';
import AdminParentLinksScreen from '../screens/admin/AdminParentLinksScreen';
import TeacherSpellingScreen from '../screens/teachers/TeacherSpellingScreen';
import TeacherPhonicsActivityScreen from '../screens/teachers/TeacherPhonicsActivityScreen';
import TeacherPhonologicalScreen from '../screens/teachers/TeacherPhonologicalScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
            backgroundColor: '#fff', 
            height: 60, 
            paddingBottom: 8, 
            borderTopLeftRadius: 20, 
            borderTopRightRadius: 20,
            elevation: 5
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={require('../components/DashboardSwitcher').default} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading, profile } = useAuth();

  const isTeacher = profile?.role === 'teacher';
  const isAdmin   = profile?.role === 'admin';
  const isParent  = profile?.role === 'parent';

  if (loading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
            {/* User App */}
            <Stack.Screen name="Home" component={AppTabs} />
            <Stack.Screen name="Phonics" component={PhonicsScreen} />
            <Stack.Screen name="Writing" component={WritingScreen} />
            <Stack.Screen name="Reading" component={ReadingScreen} />
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="Quests" component={QuestsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Shop" component={ShopScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="StudentEnroll" component={StudentEnrollScreen} />
            <Stack.Screen name="PhonicsActivity" component={PhonicsActivityScreen} />
            <Stack.Screen name="Spelling" component={SpellingScreen} />
            <Stack.Screen name="PhonologicalAwareness" component={PhonologicalAwarenessScreen} />
            <Stack.Screen name="SpeechToText" component={SpeechToTextScreen} />
            <Stack.Screen name="TextToSpeech" component={TextToSpeechScreen} />
            {/* Parent routes — read-only child progress */}
            {profile?.role === 'parent' && (
              <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
            )}
            {(isTeacher || isAdmin) && (
              <>
                <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
                <Stack.Screen name="TeacherAddStory" component={TeacherAddStoryScreen} />
                <Stack.Screen name="TeacherPhonics" component={TeacherPhonicsScreen} />
                <Stack.Screen name="TeacherUsers" component={TeacherUsersScreen} />
                <Stack.Screen name="TeacherNotifications" component={TeacherNotificationsScreen} />
                <Stack.Screen name="TeacherFeedback" component={TeacherFeedbackScreen} />
                <Stack.Screen name="TeacherEnrollment" component={TeacherEnrollmentScreen} />
                <Stack.Screen name="TeacherAssignActivities" component={TeacherAssignActivitiesScreen} />
                <Stack.Screen name="TeacherProgress" component={TeacherProgressScreen} />
                <Stack.Screen name="TeacherSpelling" component={TeacherSpellingScreen} />
                <Stack.Screen name="TeacherPhonicsActivity" component={TeacherPhonicsActivityScreen} />
                <Stack.Screen name="TeacherPhonological" component={TeacherPhonologicalScreen} />
              </>
            )}
            {isAdmin && (
              <>
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
                <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
                <Stack.Screen name="AdminPhonics" component={AdminPhonicsScreen} />
                <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
                <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
                <Stack.Screen name="AdminEnrollment" component={AdminEnrollmentScreen} />
                <Stack.Screen name="AdminAssignActivities" component={AdminAssignActivitiesScreen} />
                <Stack.Screen name="AdminAddStory" component={AdminAddStoryScreen} />
                <Stack.Screen name="AdminSpelling" component={AdminSpellingScreen} />
                <Stack.Screen name="AdminPhonicsActivity" component={AdminPhonicsActivityScreen} />
                <Stack.Screen name="AdminPhonological" component={AdminPhonologicalScreen} />
                <Stack.Screen name="AdminParentLinks" component={AdminParentLinksScreen} />
              </>
            )}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}