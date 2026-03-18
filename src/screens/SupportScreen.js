import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function SupportScreen() {
  const { profile } = useAuth();
  // Acceptability testing should include students too.
  // We still require an authenticated user to submit.
  const canSendFeedback = !!profile?.id;
  const [tab, setTab] = useState('Help'); // Help | Rate | About
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const submitFeedback = async () => {
    if (!canSendFeedback) {
      alert('Please sign in to send feedback.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (!feedback.trim() && !rating) {
        alert('Please add a rating or a short message.');
        return;
      }
      await supabase.from('feedback').insert([{ user_id: user.id, message: feedback.trim(), rating }]);
      setFeedback('');
      setRating(0);
      alert("Thank you for your feedback!");
    }
  };

  const renderContent = () => {
    if (tab === 'Help') return (
      <View>
        <Text style={styles.qTitle}>Where can I find font style?</Text>
        <Text style={styles.qBody}>Go to hamburger icon in the upper right...</Text>
        <Text style={styles.qTitle}>Where is my progress?</Text>
        <Text style={styles.qBody}>You can see it on the dashboard.</Text>
      </View>
    );

    if (tab === 'Rate') return (
      <View style={{alignItems:'center'}}>
        <View style={{flexDirection:'row', marginBottom: 20}}>
            {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons name={star <= rating ? "star" : "star-outline"} size={40} color="#FBC02D"/>
                </TouchableOpacity>
            ))}
        </View>
        <TextInput 
            style={styles.textArea} 
            multiline 
            placeholder="Your feedback..." 
            value={feedback}
            onChangeText={setFeedback}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={submitFeedback}>
            <Text style={{fontWeight:'bold'}}>Submit</Text>
        </TouchableOpacity>
      </View>
    );

    if (tab === 'About') return (
       <View style={{alignItems: 'center'}}>
           <Text style={styles.aboutTitle}>Synclexia</Text>
           <Text style={styles.aboutBody}>
              Composed of college students taking up Bachelor of Science in Information Technology 
              in University of Cebu Lapu-lapu and Mandaue.
           </Text>
           
           {/* TEAM MEMBERS GRID */}
           <View style={styles.teamGrid}>
               {/* Project Manager */}
               <View style={styles.memberCard}>
                   <View style={styles.avatarCircle}><Ionicons name="person" size={30} color="#fff"/></View>
                   <Text style={styles.roleText}>Project Manager</Text>
               </View>

               <View style={styles.row}>
                   <View style={styles.memberCard}>
                       <View style={styles.avatarCircle}><Ionicons name="person" size={30} color="#fff"/></View>
                       <Text style={styles.roleText}>Lead Developer</Text>
                   </View>
                   <View style={styles.memberCard}>
                       <View style={styles.avatarCircle}><Ionicons name="person" size={30} color="#fff"/></View>
                       <Text style={styles.roleText}>UI/UX Designer</Text>
                   </View>
               </View>

               <View style={styles.row}>
                   <View style={styles.memberCard}>
                       <View style={styles.avatarCircle}><Ionicons name="person" size={30} color="#fff"/></View>
                       <Text style={styles.roleText}>Business Analyst</Text>
                   </View>
                   <View style={styles.memberCard}>
                       <View style={styles.avatarCircle}><Ionicons name="person" size={30} color="#fff"/></View>
                       <Text style={styles.roleText}>QA Tester</Text>
                   </View>
               </View>
           </View>
       </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Help & Support" colors={['#FBC02D', '#F57F17']} backColor="#333" />
      <View style={styles.innerContent}>
      <View style={styles.tabs}>
            {(['Help', 'Rate', 'About']).map(t => (
              <TouchableOpacity key={t} onPress={()=>setTab(t)} style={[styles.tabBtn, tab===t && styles.activeTab]}>
                  <Text style={[styles.tabText, tab===t && {color:'#333'}]}>{t}</Text>
              </TouchableOpacity>
          ))}
      </View>
      <ScrollView style={styles.contentBox}>{renderContent()}</ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  innerContent: { flex: 1, padding: 20 },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tabBtn: { padding: 10, borderBottomWidth: 2, borderColor: 'transparent' },
  activeTab: { borderColor: '#FBC02D' },
  tabText: { fontWeight: 'bold', color: '#aaa', fontSize: 16 },
  contentBox: { flex: 1, padding: 10 },
  qTitle: { fontWeight: 'bold', color: '#FBC02D', fontSize: 18, marginTop: 10 },
  qBody: { color: '#555', marginBottom: 15 },
  textArea: { width: '100%', height: 150, backgroundColor: '#FFF9C4', borderRadius: 10, padding: 15, textAlignVertical: 'top' },
  submitBtn: { marginTop: 20, backgroundColor: '#FBC02D', paddingHorizontal: 40, paddingVertical: 10, borderRadius: 20 },
  aboutTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  aboutBody: { textAlign: 'center', color: '#666', marginVertical: 20 },
  teamGrid: { marginTop: 20, width: '100%', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 40, marginTop: 20 },
  memberCard: { alignItems: 'center' },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  roleText: { fontSize: 12, color: '#666' }
});