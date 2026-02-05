import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import CustomInput from '../components/CustomInput'; // <--- Using Reusable Component
import CustomButton from '../components/CustomButton'; // <--- Using Reusable Component

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert("Login Failed", error.message);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}><Text style={styles.logoText}>S</Text></View>
      <Text style={styles.title}>Log In</Text>

      <CustomInput label="Email" value={email} onChangeText={setEmail} placeholder="Enter your email" />
      <CustomInput label="Password" value={password} onChangeText={setPassword} secure placeholder="Enter your password" />

      <CustomButton title="Log In" onPress={handleLogin} loading={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPass}>Forgot password?</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}>Sign up here.</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7', padding: 25, justifyContent: 'center' },
  logoBox: { alignSelf: 'center', width: 70, height: 70, borderRadius: 15, borderWidth: 2, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#fff' },
  logoText: { fontSize: 35, fontWeight: 'bold', color: '#5C6BC0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', alignSelf: 'center', marginBottom: 40 },
  forgotPass: { alignSelf: 'center', color: '#666', marginTop: 15, fontWeight: 'bold' },
  footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'center' },
  link: { fontWeight: 'bold', color: '#333', textDecorationLine: 'underline' }
});