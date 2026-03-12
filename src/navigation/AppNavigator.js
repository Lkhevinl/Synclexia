import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';
import DashboardSwitcher from '../components/DashboardSwitcher';

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
import SettingsScreen from '../screens/SettingsScreen';
import SupportScreen from '../screens/SupportScreen';
import AboutScreen from '../screens/AboutScreen';

// ✅ TEACHER SCREENS (now in 'teachers' folder)
import TeacherDashboardScreen from '../screens/teachers/TeacherDashboardScreen';
import TeacherAddStoryScreen from '../screens/teachers/TeacherAddStoryScreen';
import TeacherUsersScreen from '../screens/teachers/TeacherUsersScreen';
import TeacherNotificationsScreen from '../screens/teachers/TeacherNotificationsScreen';
import TeacherFeedbackScreen from '../screens/teachers/TeacherFeedbackScreen';
import TeacherMessagesScreen from '../screens/teachers/TeacherMessagesScreen';
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
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';

// PARENT SCREENS
import ParentDashboardScreen from '../screens/parents/ParentDashboardScreen';
import ParentProgressScreen from '../screens/parents/ParentProgressScreen';
import ParentMessagesScreen from '../screens/parents/ParentMessagesScreen';
import ParentAssignmentsScreen from '../screens/parents/ParentAssignmentsScreen';
import ParentActivityLogScreen from '../screens/parents/ParentActivityLogScreen';
import ParentLinkChildScreen from '../screens/parents/ParentLinkChildScreen';
import ParentEditChildScreen from '../screens/parents/ParentEditChildScreen';

// ADMIN SCREENS
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminEnrollmentScreen from '../screens/admin/AdminEnrollmentScreen';
import AdminParentLinksScreen from '../screens/admin/AdminParentLinksScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import TeacherSpellingScreen from '../screens/teachers/TeacherSpellingScreen';
import TeacherPhonicsActivityScreen from '../screens/teachers/TeacherPhonicsActivityScreen';
import TeacherPhonologicalScreen from '../screens/teachers/TeacherPhonologicalScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// React Navigation v6 wraps the tab bar in a SafeAreaView that already
// adds insets.bottom as padding. Do NOT add insets.bottom here too or it
// doubles the bottom gap and pushes labels off-screen on iPhone.
const TAB_BAR_STYLE = {
  backgroundColor: '#fff',
  height: 64,
  paddingBottom: 6,
  paddingTop: 8,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
};

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard')  iconName = focused ? 'home'          : 'home-outline';
          else if (route.name === 'Reading')   iconName = focused ? 'book'          : 'book-outline';
          else if (route.name === 'Phonics')   iconName = focused ? 'volume-high'  : 'volume-high-outline';
          else if (route.name === 'Writing')   iconName = focused ? 'pencil'       : 'pencil-outline';
          else if (route.name === 'Scan')      iconName = focused ? 'camera'       : 'camera-outline';
          else if (route.name === 'Settings')  iconName = focused ? 'settings'     : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardSwitcher} />
      <Tab.Screen name="Reading"   component={ReadingScreen} />
      <Tab.Screen name="Phonics"   component={PhonicsScreen} />
      <Tab.Screen name="Writing"   component={WritingScreen} />
      <Tab.Screen name="Scan"      component={ScanScreen} />
      <Tab.Screen name="Settings"  component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
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
      <Tab.Screen name="Dashboard" component={DashboardSwitcher} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function TeacherTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard')   iconName = focused ? 'home'          : 'home-outline';
          else if (route.name === 'Students')    iconName = focused ? 'people'        : 'people-outline';
          else if (route.name === 'Activities')  iconName = focused ? 'book'          : 'book-outline';
          else if (route.name === 'Progress')    iconName = focused ? 'bar-chart'     : 'bar-chart-outline';
          else if (route.name === 'Settings')    iconName = focused ? 'settings'      : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardSwitcher} />
      <Tab.Screen name="Students"   component={TeacherUsersScreen} />
      <Tab.Screen name="Activities" component={TeacherAssignActivitiesScreen} />
      <Tab.Screen name="Progress"   component={TeacherProgressScreen} />
      <Tab.Screen name="Settings"   component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading, profile, profileLoaded } = useAuth();

  const isTeacher = profile?.role === 'teacher';
  const isAdmin   = profile?.role === 'admin';
  const isParent  = profile?.role === 'parent';

  // Wait until auth state AND profile are both resolved before rendering
  if (loading || (session && !profileLoaded)) return <LoadingScreen />;

  // Teacher account awaiting admin approval — show holding screen
  if (session && profile?.role === 'teacher' && profile?.status === 'pending') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, detachPreviousScreen: true }}>
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      </Stack.Navigator>
    );
  }

  // Role-based home tabs
  const HomeComponent = isTeacher ? TeacherTabs
                      : (profile?.role === 'student' || (!isTeacher && !isAdmin && !isParent)) ? StudentTabs
                      : AppTabs;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, detachPreviousScreen: true }}>
      {session ? (
        <>
            {/* User App */}
            <Stack.Screen name="Home" component={HomeComponent} />
            <Stack.Screen name="Phonics" component={PhonicsScreen} />
            <Stack.Screen name="Writing" component={WritingScreen} />
            <Stack.Screen name="Reading" component={ReadingScreen} />
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="Quests" component={QuestsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="StudentEnroll" component={StudentEnrollScreen} />
            <Stack.Screen name="PhonicsActivity" component={PhonicsActivityScreen} />
            <Stack.Screen name="Spelling" component={SpellingScreen} />
            <Stack.Screen name="PhonologicalAwareness" component={PhonologicalAwarenessScreen} />
            <Stack.Screen name="SpeechToText" component={SpeechToTextScreen} />
            <Stack.Screen name="TextToSpeech" component={TextToSpeechScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            {/* Parent routes */}
            {profile?.role === 'parent' && (
              <>
                <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
                <Stack.Screen name="ParentProgress" component={ParentProgressScreen} />
                <Stack.Screen name="ParentMessages" component={ParentMessagesScreen} />
                <Stack.Screen name="ParentAssignments" component={ParentAssignmentsScreen} />
                <Stack.Screen name="ParentActivityLog" component={ParentActivityLogScreen} />
                <Stack.Screen name="ParentLinkChild" component={ParentLinkChildScreen} />
                <Stack.Screen name="ParentEditChild" component={ParentEditChildScreen} />
              </>
            )}
            {(isTeacher || isAdmin) && (
              <>
                <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
                <Stack.Screen name="TeacherAddStory" component={TeacherAddStoryScreen} />
                <Stack.Screen name="TeacherPhonics" component={TeacherPhonicsScreen} />
                <Stack.Screen name="TeacherUsers" component={TeacherUsersScreen} />
                <Stack.Screen name="TeacherNotifications" component={TeacherNotificationsScreen} />
                <Stack.Screen name="TeacherFeedback" component={TeacherFeedbackScreen} />
                <Stack.Screen name="TeacherMessages" component={TeacherMessagesScreen} />
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
                <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
                <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
                <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
                <Stack.Screen name="AdminEnrollment" component={AdminEnrollmentScreen} />
                <Stack.Screen name="AdminParentLinks" component={AdminParentLinksScreen} />
                <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
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