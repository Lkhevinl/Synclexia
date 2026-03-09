import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get setSession to force update the app state immediately upon success
  const { setSession } = useAuth(); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);

    try {
        // 1. Attempt Login with Supabase (trim + lowercase email to prevent mismatches)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (error) {
          Alert.alert('Login Failed', error.message);
        } else {
          // 2. Check ban status before letting the user in.
          // Wrap in try/catch — if the DB has an error (e.g. RLS misconfiguration),
          // don't block the login. AuthContext will enforce ban on profile load.
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('is_banned')
              .eq('id', data.session.user.id)
              .single();
            if (profileData?.is_banned) {
              await supabase.auth.signOut();
              Alert.alert('Access Denied', 'Your account has been suspended. Please contact support.');
              return;
            }
          } catch (_) {
            // DB error during ban check — let the user in, AuthContext handles it
          }
          // 3. Force App Context to Update
          if (setSession) {
             setSession(data.session);
          }
          // The AppNavigator will automatically detect the session change and switch to Dashboard
        }
    } catch (err) {
        Alert.alert("Error", "Something went wrong. Check your internet.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f9a8c9', '#f7c5a0', '#f9a8c9']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* 1. THE LOGO SECTION */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appName}>SYNCLEXIA</Text>
              <Text style={styles.tagline}>Learning made accessible.</Text>
            </View>

            {/* 2. THE GLASS LOGIN CARD */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Welcome Back</Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginBtnText}>SIGN IN</Text>
                    )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signupText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },

  // Logo Styles
  logoContainer: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  logoCircle: {
      width: 110, height: 110, borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.5)',
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
      marginBottom: 15,
      overflow: 'hidden',
  },
  logoImage: { width: 100, height: 100, borderRadius: 24 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#7B2D52', letterSpacing: 2 },
  tagline: { fontSize: 14, color: '#9E5070', letterSpacing: 0.5 },

  // Card Styles
  card: {
      backgroundColor: '#fff',
      borderRadius: 25,
      padding: 30,
      elevation: 10,
      boxShadow: '0px 10px 10px rgba(0,0,0,0.25)',
      marginBottom: 20
  },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },

  // Input Styles
  inputContainer: { 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: '#f5f5f5', borderRadius: 12, 
      marginBottom: 15, paddingHorizontal: 15, height: 50
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontWeight: '600' },

  // Button Styles
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#666', fontSize: 13, fontWeight: '600' },

  loginBtn: {
      backgroundColor: '#C06080',
      borderRadius: 12,
      height: 55,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      boxShadow: '0px 4px 5px rgba(192,96,128,0.3)',
      elevation: 5
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666' },
  signupText: { color: '#C06080', fontWeight: 'bold' }
});