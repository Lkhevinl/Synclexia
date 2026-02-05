import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// --- SCREENS ---
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

import DashboardScreen from '../screens/DashboardScreen';
import PhonicsScreen from '../screens/PhonicsScreen';
import ReadingScreen from '../screens/ReadingScreen';
import WritingScreen from '../screens/WritingScreen'; 
import SettingsScreen from '../screens/SettingsScreen';
import ScanScreen from '../screens/ScanScreen';
import SupportScreen from '../screens/SupportScreen';
import TextToSpeechScreen from '../screens/TextToSpeechScreen';
import SpeechToTextScreen from '../screens/SpeechToTextScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import QuestScreen from '../screens/QuestScreen'; // <--- NEW IMPORT

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminAddStoryScreen from '../screens/admin/AdminAddStoryScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FFFDE7'}}>
        <ActivityIndicator size="large" color="#FBC02D" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {!user ? (
        // === AUTH STACK (Guest) ===
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Group>
      ) : profile?.role === 'admin' ? (
        // === ADMIN STACK ===
        <Stack.Group>
           <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
           <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
           <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
           <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
           <Stack.Screen name="AdminAddStory" component={AdminAddStoryScreen} />
           <Stack.Screen name="Dashboard" component={DashboardScreen} />
        </Stack.Group>
      ) : (
        // === USER STACK ===
        <Stack.Group>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Phonics" component={PhonicsScreen} />
          <Stack.Screen name="Reading" component={ReadingScreen} />
          <Stack.Screen name="Writing" component={WritingScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="TextToSpeech" component={TextToSpeechScreen} />
          <Stack.Screen name="SpeechToText" component={SpeechToTextScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Quests" component={QuestScreen} /> 
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}