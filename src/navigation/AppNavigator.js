import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, DeviceEventEmitter } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isUserAdmin, isUserParent, isUserTeacher } from '../lib/userUtils';
import LoadingScreen from '../screens/LoadingScreen';
import DashboardSwitcher from '../components/DashboardSwitcher';
import LexiCompanion from '../components/LexiCompanion';

/** Wraps a student activity screen so Lexi floats over it. */
function withLexi(ScreenComponent) {
  const Wrapped = (props) => (
    <View style={{ flex: 1 }}>
      <ScreenComponent {...props} />
      <LexiCompanion />
    </View>
  );
  Wrapped.displayName = `WithLexi(${ScreenComponent.displayName || ScreenComponent.name || 'Screen'})`;
  return Wrapped;
}

// Standard Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
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
import PhonicsActivityScreen from '../screens/students/PhonicsActivityScreen';
import SpellingScreen from '../screens/students/SpellingScreen';
import PhonologicalAwarenessScreen from '../screens/students/PhonologicalAwarenessScreen';
import AIInsightsScreen from '../screens/students/AIInsightsScreen';

const ONBOARDING_KEY = '@synclexia_onboarding_complete';
import SpeechToTextScreen from '../screens/students/SpeechToTextScreen';
import TextToSpeechScreen from '../screens/students/TextToSpeechScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

// PARENT SCREENS
import ParentDashboardScreen from '../screens/parents/ParentDashboardScreen';
import ParentProgressScreen from '../screens/parents/ParentProgressScreen';
import ParentActivityLogScreen from '../screens/parents/ParentActivityLogScreen';
import ParentLinkChildScreen from '../screens/parents/ParentLinkChildScreen';
import ParentEditChildScreen from '../screens/parents/ParentEditChildScreen';

// TEACHER SCREENS (Content Management only)
import TeacherDashboardScreen from '../screens/admin/teachers/TeacherDashboardScreen';
import TeacherAddStoryScreen from '../screens/admin/teachers/TeacherAddStoryScreen.js';
import TeacherPhonicsScreen from '../screens/admin/teachers/TeacherPhonicsScreen.js';
import TeacherSpellingScreen from '../screens/admin/teachers/TeacherSpellingScreen.js';
import TeacherPhonicsActivityScreen from '../screens/admin/teachers/TeacherPhonicsActivityScreen.js';
import TeacherPhonologicalScreen from '../screens/admin/teachers/TeacherPhonologicalScreen.js';

// ADMIN SCREENS
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminParentLinksScreen from '../screens/admin/AdminParentLinksScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import MaintenanceLogsScreen from '../screens/MaintenanceLogsScreen';
import MaintenanceLogDetailScreen from '../screens/MaintenanceLogDetailScreen';
import AddMaintenanceLogScreen from '../screens/admin/AddMaintenanceLogScreen';
import AdminManageContentsScreen from '../screens/admin/AdminManageContentsScreen';
import AdminAddStoryScreen from '../screens/admin/AdminAddStoryScreen';
import AdminPhonicsScreen from '../screens/admin/AdminPhonicsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// React Navigation v6 wraps the tab bar in a SafeAreaView that already
// adds insets.bottom as padding. Do NOT add insets.bottom here too or it
// doubles the bottom gap and pushes labels off-screen on iPhone.
const TAB_BAR_STYLE = {
  position: 'absolute',
  backgroundColor: '#F5EDE6',
  height: 64,
  borderRadius: 50,
  marginHorizontal: 20,
  marginBottom: 20,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 20,
  borderTopWidth: 0,
  overflow: 'hidden',
  elevation: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 20,
};

function StudentTabs() {
  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === 'Dashboard')    iconName = focused ? 'home'    : 'home-outline';
          else if (route.name === 'TTS')     iconName = focused ? 'reader'  : 'reader-outline';
          else if (route.name === 'Scan')    iconName = focused ? 'camera'  : 'camera-outline';
          else if (route.name === 'STT')     iconName = focused ? 'headset' : 'headset-outline';
          else if (route.name === 'Profile') iconName = focused ? 'menu'    : 'menu-outline';
          else                               iconName = 'ellipse-outline';

          return (
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: focused ? '#E8735A' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <Ionicons name={iconName} size={20} color={focused ? '#fff' : '#bbb'} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardSwitcher}  options={{ title: 'Home' }} />
      <Tab.Screen name="TTS"       component={TextToSpeechScreen} options={{ title: 'Listen' }} />
      <Tab.Screen name="Scan"      component={ScanScreen}         options={{ title: 'Scan' }} />
      <Tab.Screen name="STT"       component={SpeechToTextScreen} options={{ title: 'Speak' }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Menu',
          tabBarButton: () => (
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => DeviceEventEmitter.emit('openSidebar')}
              activeOpacity={0.7}
            >
              <Ionicons name="menu-outline" size={20} color="#bbb" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
    <LexiCompanion />
    </View>
  );
}

// AppTabs (parent/admin) — Settings removed; Sidebar handles all settings
function AppTabs(props) {
  return <DashboardSwitcher {...props} />;
}

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, detachPreviousScreen: true }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Renamed — internal screens, not exported
function AppScreens() {
  const { profile, profileLoaded, profileError, retryFetchProfile, signOut, session } = useAuth();
  const [timedOut, setTimedOut] = React.useState(false);

  // Safety-net: fetchProfile can take up to ~20s (15s timeout + 3x1.5s retries).
  // Only show the error screen if it still hasn't resolved after 25s.
  React.useEffect(() => {
    if (profileLoaded) { setTimedOut(false); return; }
    const t = setTimeout(() => setTimedOut(true), 35000);
    return () => clearTimeout(t);
  }, [profileLoaded]);

  const isAdmin   = isUserAdmin(profile);
  const isParent  = isUserParent(profile);
  const isTeacher = isUserTeacher(profile);

  if (!profileLoaded && !timedOut) return <LoadingScreen />;

  // Profile failed to load (or timed out) — show error screen instead of
  // silently falling back to the student dashboard
  if ((profileError || timedOut) && !profile) {
    return (
      <View style={navStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#E53935" />
        <Text style={navStyles.errorTitle}>Couldn't Load Your Profile</Text>
        <Text style={navStyles.errorMsg}>
          {timedOut
            ? "The connection is taking longer than expected. Please check your internet connection and try again."
            : profileError === 'network_error'
            ? "Network connection failed. Please check your internet connection and try again."
            : "There was a problem connecting to the server. Please check your internet connection and try again."
          }
        </Text>
        <TouchableOpacity style={navStyles.retryBtn} onPress={() => {
          // Clear the timeout state and retry profile fetch
          setTimedOut(false);
          retryFetchProfile(session?.user?.id);
        }}>
          <Text style={navStyles.retryTxt}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={navStyles.signOutBtn} onPress={signOut}>
          <Text style={navStyles.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Role-based home tabs
  // Only students use the learner bottom tabs; parent/admin/teacher use the dashboard switcher.
  const HomeComponent = profile?.role === 'student' ? StudentTabs : AppTabs;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, detachPreviousScreen: true }}>
      {/* User App */}
      <Stack.Screen name="Home" component={HomeComponent} />
      <Stack.Screen name="Phonics"                 component={withLexi(PhonicsScreen)} />
      <Stack.Screen name="Writing"                 component={withLexi(WritingScreen)} />
      <Stack.Screen name="Reading"                 component={withLexi(ReadingScreen)} />
      <Stack.Screen name="Scan"                    component={ScanScreen} />
      <Stack.Screen name="Quests"                  component={withLexi(QuestsScreen)} />
      <Stack.Screen name="Leaderboard"             component={withLexi(LeaderboardScreen)} />
      <Stack.Screen name="Support"                 component={SupportScreen} />
      <Stack.Screen name="About"                   component={AboutScreen} />
      <Stack.Screen name="Settings"                component={SettingsScreen} />
      <Stack.Screen name="PhonicsActivity"         component={withLexi(PhonicsActivityScreen)} />
      <Stack.Screen name="Spelling"                component={withLexi(SpellingScreen)} />
      <Stack.Screen name="PhonologicalAwareness"   component={withLexi(PhonologicalAwarenessScreen)} />
      <Stack.Screen name="AIInsights" component={AIInsightsScreen} />
      <Stack.Screen name="SpeechToText" component={SpeechToTextScreen} />
      <Stack.Screen name="TextToSpeech" component={TextToSpeechScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="MaintenanceLogs" component={MaintenanceLogsScreen} />
      <Stack.Screen name="MaintenanceLogDetail" component={MaintenanceLogDetailScreen} />
      {/* Teacher routes (Content Management only) */}
      {(isTeacher || isAdmin) && (
        <>
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
          <Stack.Screen name="TeacherAddStory" component={TeacherAddStoryScreen} />
          <Stack.Screen name="TeacherPhonics" component={TeacherPhonicsScreen} />
          <Stack.Screen name="TeacherSpelling" component={TeacherSpellingScreen} />
          <Stack.Screen name="TeacherPhonicsActivity" component={TeacherPhonicsActivityScreen} />
          <Stack.Screen name="TeacherPhonological" component={TeacherPhonologicalScreen} />
        </>
      )}
      {/* Parent routes */}
      {profile?.role === 'parent' && (
        <>
          <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
          <Stack.Screen name="ParentProgress" component={ParentProgressScreen} />
          <Stack.Screen name="ParentActivityLog" component={ParentActivityLogScreen} />
          <Stack.Screen name="ParentLinkChild" component={ParentLinkChildScreen} />
          <Stack.Screen name="ParentEditChild" component={ParentEditChildScreen} />
        </>
      )}
      {/* Maintenance Log screen for all authenticated users */}
      <Stack.Screen name="AddMaintenanceLog" component={AddMaintenanceLogScreen} />
      {isAdmin && (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
          <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
          <Stack.Screen name="AdminParentLinks" component={AdminParentLinksScreen} />
          <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
          <Stack.Screen name="AdminManageContents" component={AdminManageContentsScreen} />
          <Stack.Screen name="AdminAddStory" component={AdminAddStoryScreen} />
          <Stack.Screen name="AdminPhonics" component={AdminPhonicsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
// Uses React Navigation's recommended conditional auth flow pattern:
// auth screens and app screens live in ONE Stack. When session becomes null
// React Navigation instantly replaces the stack with Login — no NavigationContainer
// remounting, no race conditions, no manual navigation calls needed.
const navStyles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  errorTitle:     { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 16, textAlign: 'center' },
  errorMsg:       { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  retryBtn:       { marginTop: 28, backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 40 },
  retryTxt:       { color: '#fff', fontWeight: '700', fontSize: 15 },
  signOutBtn:     { marginTop: 12, paddingVertical: 10, paddingHorizontal: 40 },
  signOutTxt:     { color: '#E53935', fontWeight: '600', fontSize: 14 },
});

export default function RootNavigator() {
  const { session, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setShowOnboarding(value !== 'true');
    } catch (e) {
      setShowOnboarding(true);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  if (loading || checkingOnboarding) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, detachPreviousScreen: true }}>
      {!session ? (
        <>
          {showOnboarding && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <Stack.Screen name="AppRoot" component={AppScreens} />
      )}
    </Stack.Navigator>
  );
}