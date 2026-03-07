import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function PendingApprovalScreen() {
  const { signOut, fetchProfile, session } = useAuth();
  const pollRef = useRef(null);

  // Poll every 15 seconds — if admin approves, app will re-route automatically
  useEffect(() => {
    if (!session?.user?.id) return;
    pollRef.current = setInterval(() => {
      fetchProfile(session.user.id);
    }, 15000);
    return () => clearInterval(pollRef.current);
  }, [session]);

  const handleSignOut = async () => {
    clearInterval(pollRef.current);
    await signOut();
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={48} color="#E65100" />
        </View>
        <Text style={styles.title}>Account Pending</Text>
        <Text style={styles.message}>
          Your teacher account is awaiting admin approval.{'\n\n'}
          You will be able to log in once an administrator activates your account.
        </Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    width: '100%',
  },
  iconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  message: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  signOutBtn: {
    backgroundColor: '#EF5350',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  signOutText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
