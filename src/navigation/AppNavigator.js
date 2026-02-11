import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';

// Standard Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PhonicsScreen from '../screens/PhonicsScreen';
import WritingScreen from '../screens/WritingScreen';
import ReadingScreen from '../screens/ReadingScreen';
import ScanScreen from '../screens/ScanScreen';
import QuestsScreen from '../screens/QuestScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ShopScreen from '../screens/ShopScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SupportScreen from '../screens/SupportScreen';
import AboutScreen from '../screens/AboutScreen';

// ✅ ADMIN SCREENS (Importing from the 'admin' folder)
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminAddStoryScreen from '../screens/admin/AdminAddStoryScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminPhonicsScreen from '../screens/admin/AdminPhonicsScreen';
import AdminEnrollmentScreen from '../screens/admin/AdminEnrollmentScreen';
import AdminAssignActivitiesScreen from '../screens/admin/AdminAssignActivitiesScreen';
import StudentEnrollScreen from '../screens/StudentEnrollScreen';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';

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
            position: 'absolute',
            elevation: 5
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Scan') iconName = focused ? 'camera' : 'camera-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={require('../components/DashboardSwitcher').default} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading, profile } = useAuth();

  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';

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
            <Stack.Screen name="Quests" component={QuestsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Shop" component={ShopScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="StudentEnroll" component={StudentEnrollScreen} />
            {(isTeacher || isAdmin) && (
              <>
                <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
                <Stack.Screen name="AdminAddStory" component={AdminAddStoryScreen} />
                <Stack.Screen name="AdminPhonics" component={AdminPhonicsScreen} />
                <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
                <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
                <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
                <Stack.Screen name="AdminEnrollment" component={AdminEnrollmentScreen} />
                <Stack.Screen name="AdminAssignActivities" component={AdminAssignActivitiesScreen} />
              </>
            )}
            {isAdmin && (
              <>
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              </>
            )}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}