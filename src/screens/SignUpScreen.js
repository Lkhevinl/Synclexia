import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import Slider from '@react-native-community/slider'; // <--- Requires install
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = Email/Pass, 2 = Details
  
  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(7); // Default age

  const handleSignUp = async () => {
    if (!name) return Alert.alert("Required", "Please tell us your name!");

    try {
      // 1. Create Auth User
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (user) {
        // 2. Create Profile with Age & Name
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id, 
              email: email, 
              full_name: name, 
              age: age,
              role: 'user',
              xp: 0
            }
          ]);
          
        if (profileError) throw profileError;
        
        Alert.alert("Welcome!", "Account created successfully.");
        navigation.replace('Dashboard');
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // RENDER STEP 1: CREDENTIALS
  if (step === 1) {
    return (
      <View style={styles.container}>
         <View style={styles.logoBox}>
            <Text style={styles.logoText}>S</Text>
         </View>
         <Text style={styles.title}>Sign Up</Text>

         <Text style={styles.label}>Email</Text>
         <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />

         <Text style={styles.label}>Password</Text>
         <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

         <TouchableOpacity style={styles.mainBtn} onPress={() => setStep(2)}>
             <Text style={styles.btnText}>Next</Text>
         </TouchableOpacity>

         <View style={styles.footer}>
             <Text>Already have an account? </Text>
             <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                 <Text style={styles.link}>Log In here.</Text>
             </TouchableOpacity>
         </View>
      </View>
    );
  }

  // RENDER STEP 2: PROFILE DETAILS (Age Slider)
  return (
    <View style={styles.container}>
       <View style={styles.headerRow}>
         <TouchableOpacity onPress={() => setStep(1)}>
            <Ionicons name="chevron-back" size={28} color="#333" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Creating Account</Text>
       </View>

       {/* Name Card */}
       <View style={styles.card}>
           <Text style={styles.cardTitle}>Welcome to Synclexia!</Text>
           <Text style={styles.cardSub}>Please tell us what you want to be called?</Text>
           <TextInput 
              style={styles.nameInput} 
              placeholder="Your Name" 
              value={name} 
              onChangeText={setName} 
           />
       </View>

       {/* Age Card */}
       <View style={styles.card}>
           <Text style={styles.cardTitle}>How old are you?</Text>
           <Text style={styles.cardSub}>Drag from left to right.</Text>
           
           <View style={styles.sliderBox}>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={4}
                maximumValue={15}
                step={1}
                value={age}
                onValueChange={setAge}
                minimumTrackTintColor="#006064"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#006064"
              />
              <View style={styles.ageDisplay}>
                  <Text style={styles.ageText}>{age}</Text>
              </View>
           </View>
       </View>

       <TouchableOpacity style={styles.mainBtn} onPress={handleSignUp}>
           <Text style={styles.btnText}>Create Account</Text>
       </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7', padding: 25, justifyContent: 'center' },
  logoBox: { alignSelf: 'center', width: 60, height: 60, borderRadius: 10, borderWidth: 2, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: 30, fontWeight: 'bold', color: '#5C6BC0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', alignSelf: 'center', marginBottom: 30 },
  label: { color: '#666', marginBottom: 5, fontWeight: 'bold' },
  input: { backgroundColor: '#F9FBE7', padding: 15, borderRadius: 25, marginBottom: 20 },
  mainBtn: { backgroundColor: '#FBC02D', padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  footer: { marginTop: 30, flexDirection: 'row', justifyContent: 'center' },
  link: { fontWeight: 'bold', color: '#333' },

  // Step 2 Styles
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: '#333' },
  card: { backgroundColor: '#FFF9C4', padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  cardSub: { fontSize: 14, color: '#666', marginBottom: 15 },
  nameInput: { backgroundColor: '#fff', padding: 10, borderRadius: 10, textAlign: 'center', fontWeight: 'bold' },
  sliderBox: { alignItems: 'center' },
  ageDisplay: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#333', marginTop: 10 },
  ageText: { fontSize: 18, fontWeight: 'bold' }
});