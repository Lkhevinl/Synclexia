import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return Alert.alert("Error", "Please enter your email.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return Alert.alert("Error", "Please enter a valid email address.");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'synclexia://update-password',
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Check your email ",
          "We sent a password reset link to " + email.trim().toLowerCase() + ". Check your inbox (and spam folder).",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#f9a8c9', '#fde8d8', '#f9b8d0']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>

        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#7B2D52" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Image source={require('../../assets/icon.png')} style={styles.logoImg} resizeMode="contain" />
        </View>

        {/* Heading */}
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subTitle}>No worries! Enter your email and we'll send you a reset link.</Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color="#C06080" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity style={styles.mainBtn} onPress={handleReset} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Send Reset Link</Text>
                </>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToLogin}>
            <Ionicons name="arrow-back" size={14} color="#C06080" />
            <Text style={styles.backToLoginText}> Back to Login</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  backBtn: {
    position: 'absolute', top: 55, left: 20,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },

  logoWrapper: {
    width: 90, height: 90, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  logoImg: { width: 80, height: 80, borderRadius: 20 },

  title: {
    fontSize: 26, fontWeight: '900', color: '#7B2D52',
    textAlign: 'center', marginBottom: 8, letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 14, color: '#9E5070',
    textAlign: 'center', marginBottom: 28,
    lineHeight: 20, paddingHorizontal: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 6,
    shadowColor: '#C06080',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  inputLabel: { fontSize: 12, fontWeight: '700', color: '#9E5070', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F5', borderRadius: 14,
    paddingHorizontal: 14, height: 52,
    marginBottom: 20,
    borderWidth: 1, borderColor: '#f9a8c9',
  },
  input: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },

  mainBtn: {
    backgroundColor: '#C06080',
    borderRadius: 14, height: 52,
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  backToLogin: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  backToLoginText: { color: '#C06080', fontWeight: '600', fontSize: 14 },
});