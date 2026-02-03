import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../components/GoBackBtn';

export default function SettingsScreen({ navigation }) {
  // --- STATE ---
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [isSoundEffects, setIsSoundEffects] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState('Normal');
  const [isDailyReminder, setIsDailyReminder] = useState(false);
  
  // NEW: Background Tint (Irlen Filters)
  const [bgColor, setBgColor] = useState('#F5F5F5'); // Default Gray-White

  // NEW: Profile Data
  const [studentName, setStudentName] = useState("Learner");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => navigation.replace('Login') }
    ]);
  };

  const saveProfile = () => {
    setStudentName(tempName || studentName); // Save the name
    setShowProfileModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}> 
      <GoBackBtn />
      <Text style={styles.header}>Settings</Text>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- SECTION 1: VISUAL AIDS (NEW) --- */}
        <Text style={styles.sectionTitle}>Visual Comfort (Irlen Filters)</Text>
        <View style={styles.card}>
            <Text style={styles.settingLabel}>Background Tint</Text>
            <Text style={styles.settingSubLabel}>Select a color to reduce eye strain.</Text>
            
            <View style={styles.colorRow}>
                {/* White (Default) */}
                <TouchableOpacity style={[styles.colorBtn, {backgroundColor: '#F5F5F5', borderWidth: 1}]} onPress={() => setBgColor('#F5F5F5')}>
                    {bgColor === '#F5F5F5' && <Ionicons name="checkmark" size={20} color="#333"/>}
                </TouchableOpacity>
                {/* Soft Yellow */}
                <TouchableOpacity style={[styles.colorBtn, {backgroundColor: '#FFF9C4'}]} onPress={() => setBgColor('#FFF9C4')}>
                     {bgColor === '#FFF9C4' && <Ionicons name="checkmark" size={20} color="#333"/>}
                </TouchableOpacity>
                {/* Cool Blue */}
                <TouchableOpacity style={[styles.colorBtn, {backgroundColor: '#E3F2FD'}]} onPress={() => setBgColor('#E3F2FD')}>
                     {bgColor === '#E3F2FD' && <Ionicons name="checkmark" size={20} color="#333"/>}
                </TouchableOpacity>
                {/* Soft Green */}
                <TouchableOpacity style={[styles.colorBtn, {backgroundColor: '#E8F5E9'}]} onPress={() => setBgColor('#E8F5E9')}>
                     {bgColor === '#E8F5E9' && <Ionicons name="checkmark" size={20} color="#333"/>}
                </TouchableOpacity>
            </View>
        </View>

        {/* --- SECTION 2: ACCESSIBILITY --- */}
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.settingLabel}>Dyslexia Friendly Font</Text>
            <Text style={styles.settingSubLabel}>Increases letter spacing</Text>
          </View>
          <Switch value={isDyslexicFont} onValueChange={setIsDyslexicFont} trackColor={{true: "#81b0ff"}} />
        </View>

        <View style={styles.column}>
            <Text style={styles.settingLabel}>Voice Speed</Text>
            <View style={styles.segmentControl}>
                <TouchableOpacity style={[styles.segmentBtn, voiceSpeed === 'Slow' && styles.activeSegment]} onPress={() => setVoiceSpeed('Slow')}>
                    <Text style={[styles.segmentText, voiceSpeed === 'Slow' && styles.activeText]}>Slow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.segmentBtn, voiceSpeed === 'Normal' && styles.activeSegment]} onPress={() => setVoiceSpeed('Normal')}>
                    <Text style={[styles.segmentText, voiceSpeed === 'Normal' && styles.activeText]}>Normal</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* --- SECTION 3: ALERTS (NEW) --- */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.settingLabel}>Daily Study Reminder</Text>
          <Switch value={isDailyReminder} onValueChange={setIsDailyReminder} trackColor={{true: "#4CAF50"}} />
        </View>

        {/* --- SECTION 4: ACCOUNT --- */}
        <Text style={styles.sectionTitle}>Account</Text>
        
        {/* Updated: Opens the Modal now! */}
        <TouchableOpacity style={styles.rowBtn} onPress={() => { setTempName(studentName); setShowProfileModal(true); }}>
            <View>
                <Text style={styles.settingLabel}>Edit Profile Name</Text>
                <Text style={styles.settingSubLabel}>Current: {studentName}</Text>
            </View>
            <Ionicons name="pencil" size={20} color="#006064" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* --- EDIT PROFILE MODAL --- */}
      <Modal visible={showProfileModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.label}>Student Name:</Text>
                
                <TextInput 
                    style={styles.input} 
                    value={tempName} 
                    onChangeText={setTempName}
                    placeholder="Enter name..."
                />

                <View style={styles.modalBtns}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProfileModal(false)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                        <Text style={styles.saveText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  content: { paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#006064', marginTop: 25, marginBottom: 10, marginLeft: 5 },
  
  // Card/Row Styles
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 2, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2 },
  column: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2 },
  rowBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2 },
  
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  settingSubLabel: { fontSize: 12, color: '#888', marginTop: 2 },

  // Color Filter Buttons
  colorRow: { flexDirection: 'row', marginTop: 15, gap: 15 },
  colorBtn: { width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3 },

  // Segment Buttons
  segmentControl: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, padding: 4, marginTop: 10 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeSegment: { backgroundColor: '#fff', elevation: 2 },
  segmentText: { color: '#888', fontWeight: 'bold' },
  activeText: { color: '#006064' },

  // Logout
  logoutBtn: { marginTop: 30, backgroundColor: '#FFEBEE', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2' },
  logoutText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#006064', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, fontSize: 18, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { padding: 12 },
  cancelText: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  saveBtn: { backgroundColor: '#006064', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});