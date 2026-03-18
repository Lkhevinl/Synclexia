import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { isUserAdmin, isUserParent, isUserTeacher } from '../lib/userUtils';
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
import PhonicsActivityScreen from '../screens/students/PhonicsActivityScreen';
import SpellingScreen from '../screens/students/SpellingScreen';
import PhonologicalAwarenessScreen from '../screens/students/PhonologicalAwarenessScreen';
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
  boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.06)',
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
          if (route.name === 'Dashboard')   iconName = focused ? 'home'        : 'home-outline';
          else if (route.name === 'TTS')    iconName = focused ? 'volume-high' : 'volume-high-outline';
          else if (route.name === 'STT')    iconName = focused ? 'mic'         : 'mic-outline';
          else if (route.name === 'Scan')   iconName = focused ? 'camera'      : 'camera-outline';
          else                              iconName = 'ellipse-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardSwitcher} />
      <Tab.Screen name="TTS"       component={TextToSpeechScreen}  options={{ title: 'Text-to-Speech' }} />
      <Tab.Screen name="Scan"      component={ScanScreen} />
      <Tab.Screen name="STT"       component={SpeechToTextScreen}  options={{ title: 'Speech-to-Text' }} />
    </Tab.Navigator>
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

  // Safety-net: if profileLoaded never fires (e.g. Supabase hangs after the
  // 8s fetchProfile timeout), stop showing the loading screen after 10s.
  React.useEffect(() => {
    if (profileLoaded) { setTimedOut(false); return; }
    const t = setTimeout(() => setTimedOut(true), 10000);
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
      <Stack.Screen name="Phonics" component={PhonicsScreen} />
      <Stack.Screen name="Writing" component={WritingScreen} />
      <Stack.Screen name="Reading" component={ReadingScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Quests" component={QuestsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PhonicsActivity" component={PhonicsActivityScreen} />
      <Stack.Screen name="Spelling" component={SpellingScreen} />
      <Stack.Screen name="PhonologicalAwareness" component={PhonologicalAwarenessScreen} />
      <Stack.Screen name="SpeechToText" component={SpeechToTextScreen} />
      <Stack.Screen name="TextToSpeech" component={TextToSpeechScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
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
      {isAdmin && (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
          <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
          <Stack.Screen name="AdminParentLinks" component={AdminParentLinksScreen} />
          <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
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

  if (loading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, detachPreviousScreen: true }}>
      {!session ? (
        <>
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