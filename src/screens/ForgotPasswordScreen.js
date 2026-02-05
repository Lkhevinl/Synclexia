import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return Alert.alert("Error", "Please enter your email.");
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://example.com/update-password', // In production, this needs a real deep link
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Check your email", "We sent you a password reset link!");
      navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={28} color="#333" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subTitle}>Enter your email to receive a reset code</Text>

      <View style={styles.inputBox}>
          <TextInput 
            style={styles.input} 
            placeholder="example@email.com" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
          />
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={handleReset} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Sending..." : "Send Code"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7', padding: 25, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  subTitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
  inputBox: { backgroundColor: '#FFF9C4', padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  input: { fontSize: 18, textAlign: 'center', fontWeight: 'bold', letterSpacing: 1 },
  mainBtn: { backgroundColor: '#FBC02D', padding: 15, borderRadius: 25, alignItems: 'center' },
  btnText: { color: '#333', fontWeight: 'bold', fontSize: 16 }
});