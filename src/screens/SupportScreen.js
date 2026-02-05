import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../components/GoBackBtn';
import { supabase } from '../lib/supabase';

export default function SupportScreen() {
  const [tab, setTab] = useState('Help'); // Help | Rate | About
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const submitFeedback = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await supabase.from('feedback').insert([{ user_id: user.id, message: feedback, rating: rating }]);
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
           <Text style={styles.aboutTitle}>SIMS</Text>
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
                       <Text style={styles.roleText}>Hacker</Text>
                   </View>
                   <View style={styles.memberCard}>
                       <View style={styles.avatarCircle}><Ionicons name="person" size={30} color="#fff"/></View>
                       <Text style={styles.roleText}>Hipster</Text>
                   </View>
               </View>

               <View style={styles.row}>
                   <View style={styles.memberCard}>
                       <View style={styles.avatarCircle}><Ionicons name="person" size={30} color="#fff"/></View>
                       <Text style={styles.roleText}>Hustler</Text>
                   </View>
                   <View style={styles.memberCard}>
                       <View style={styles.avatarCircle}><Ionicons name="person" size={30} color="#fff"/></View>
                       <Text style={styles.roleText}>Tester</Text>
                   </View>
               </View>
           </View>
       </View>
    );
  };

  return (
    <View style={styles.container}>
      <GoBackBtn />
      <View style={styles.tabs}>
          {['Help', 'Rate', 'About'].map(t => (
              <TouchableOpacity key={t} onPress={()=>setTab(t)} style={[styles.tabBtn, tab===t && styles.activeTab]}>
                  <Text style={[styles.tabText, tab===t && {color:'#333'}]}>{t}</Text>
              </TouchableOpacity>
          ))}
      </View>
      <ScrollView style={styles.contentBox}>{renderContent()}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
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