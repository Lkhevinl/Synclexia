import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import GoBackBtn from '../components/GoBackBtn';

export default function SettingsScreen({ navigation }) {
  const { theme, updateTheme } = useTheme(); 
  const { profile, signOut, dashboardMode, setDashboardMode } = useAuth();

  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';

  const handleLogout = async () => {
    try {
      await signOut();
      // AuthContext clears the session which causes AppNavigator
      // to automatically redirect to Login — no manual reset needed.
    } catch (error) {
      Alert.alert("Error", "Failed to logout: " + error.message);
    }
  };

  // ── Accessibility helpers ─────────────────────────────────────────────────
  const SpacingBtn = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.optionBtn, theme.letterSpacing === value && styles.optionBtnActive]}
      onPress={() => updateTheme({ letterSpacing: value })}
    >
      <Text style={[styles.optionText, theme.letterSpacing === value && styles.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const OVERLAY_OPTIONS = [
    { value: 'none',   emoji: '🚫', label: 'None'   },
    { value: 'yellow', emoji: '🟡', label: 'Yellow' },
    { value: 'blue',   emoji: '🔵', label: 'Blue'   },
    { value: 'green',  emoji: '🟢', label: 'Green'  },
    { value: 'pink',   emoji: '🩷', label: 'Pink'   },
    { value: 'orange', emoji: '🟠', label: 'Orange' },
  ];

  return (
    <View style={styles.mainContainer}>
      
      {/* HEADER */}
      <LinearGradient colors={['#607D8B', '#455A64']} style={styles.header}>
          <GoBackBtn />
          <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Settings ⚙️</Text>
              <Text style={styles.headerSub}>Customize your experience</Text>
          </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* ── DYSLEXIA ACCESSIBILITY ─────────────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="accessibility" size={24} color="#5C6BC0" />
              <Text style={[styles.sectionTitle, { color: '#5C6BC0' }]}>Dyslexia Accessibility</Text>
            </View>

            {/* Dyslexia-Friendly Mode toggle */}
            <View style={styles.accessRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Dyslexia-Friendly Mode</Text>
                <Text style={styles.accessDesc}>Larger letter size and extra weight for easier reading</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, theme.dyslexiaFont && styles.toggleBtnOn]}
                onPress={() => updateTheme({ dyslexiaFont: !theme.dyslexiaFont })}
              >
                <Text style={[styles.toggleText, theme.dyslexiaFont && styles.toggleTextOn]}>
                  {theme.dyslexiaFont ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Letter Spacing */}
            <Text style={styles.label}>Letter Spacing</Text>
            <View style={styles.row}>
              <SpacingBtn label="Normal" value="normal" />
              <SpacingBtn label="Wide"   value="wide"   />
              <SpacingBtn label="Wider"  value="wider"  />
            </View>

            {/* Color Overlay */}
            <Text style={styles.label}>Screen Color Tint</Text>
            <Text style={styles.accessDesc}>A colored tint can reduce visual stress when reading</Text>
            <View style={styles.overlayRow}>
              {OVERLAY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.overlayBtn, theme.colorOverlay === opt.value && styles.overlayBtnActive]}
                  onPress={() => updateTheme({ colorOverlay: opt.value })}
                >
                  <Text style={styles.overlayEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.overlayLabel, theme.colorOverlay === opt.value && styles.overlayLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ACCOUNT */}
          <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={24} color="#607D8B" />
                  <Text style={styles.sectionTitle}>Account</Text>
              </View>
              <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{profile?.full_name || "Student"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Level</Text>
                  <Text style={styles.infoValue}>{Math.floor((profile?.xp || 0)/100) + 1}</Text>
              </View>
          </View>

          {/* SUPPORT */}
          <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                  <Ionicons name="help-circle" size={24} color="#607D8B" />
                  <Text style={styles.sectionTitle}>Support</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.supportItem}
                onPress={() => navigation.navigate('Support')}
              >
                <Ionicons name="chatbubbles-outline" size={20} color="#607D8B" />
                <Text style={styles.supportText}>Send Feedback</Text>
                <Ionicons name="chevron-forward" size={20} color="#CFD8DC" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={styles.supportItem}
                onPress={() => navigation.navigate('About')}
              >
                <Ionicons name="information-circle-outline" size={20} color="#607D8B" />
                <Text style={styles.supportText}>About Us</Text>
                <Ionicons name="chevron-forward" size={20} color="#CFD8DC" />
              </TouchableOpacity>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {/* VIEW MODE SWITCHER: Only for Admin */}
          {profile?.role === 'admin' && (
            <View style={styles.switchSection}>
              <Text style={styles.switchSectionLabel}>VIEW MODE</Text>
              {dashboardMode === 'student' ? (
                <TouchableOpacity 
                  style={styles.adminBtn} 
                  onPress={() => {
                    setDashboardMode('teacher');
                    setTimeout(() => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      });
                    }, 100);
                  }}
                >
                  <Ionicons name="swap-horizontal" size={24} color="#607D8B" />
                  <Text style={styles.adminText}>Switch to Teacher View</Text>
                  <Text style={styles.currentModeText}>(Current: Student)</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.adminBtn} 
                  onPress={() => {
                    setDashboardMode('student');
                    setTimeout(() => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      });
                    }, 100);
                  }}
                >
                  <Ionicons name="swap-horizontal" size={24} color="#607D8B" />
                  <Text style={styles.adminText}>Switch to Student View</Text>
                  <Text style={styles.currentModeText}>(Current: {dashboardMode === 'teacher' ? 'Teacher' : 'Auto'})</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* STUDENT ENROLLMENT BUTTON */}
          {isStudent && (
            <TouchableOpacity 
              style={styles.enrollBtn} 
              onPress={() => navigation.navigate('StudentEnroll')}
            >
                <Ionicons name="qr-code" size={24} color="#0288D1" />
                <Text style={styles.enrollText}>Enroll in Class</Text>
            </TouchableOpacity>
          )}

          {/* Bottom spacer to avoid tab bar overlap */}
          <View style={{height: 150}} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#ECEFF1' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#CFD8DC', fontSize: 14 },
  scrollContent: { padding: 20 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#455A64', marginLeft: 10 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#90A4AE', marginBottom: 10, marginTop: 5 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  optionBtn: { flex: 1, paddingVertical: 12, borderWidth: 2, borderColor: '#ECEFF1', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionBtnActive: { borderColor: '#607D8B', backgroundColor: '#ECEFF1' },
  optionText: { color: '#B0BEC5', fontWeight: 'bold' },
  optionTextActive: { color: '#455A64' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { color: '#78909C' },
  infoValue: { fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  
  // Accessibility styles
  accessRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  accessDesc: { fontSize: 12, color: '#B0BEC5', marginBottom: 8 },
  toggleBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#CFD8DC', backgroundColor: '#ECEFF1' },
  toggleBtnOn: { backgroundColor: '#5C6BC0', borderColor: '#3949AB' },
  toggleText: { fontWeight: 'bold', color: '#90A4AE', fontSize: 13 },
  toggleTextOn: { color: '#fff' },
  overlayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  overlayBtn: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderColor: '#ECEFF1', backgroundColor: '#F5F7FA', minWidth: 56 },
  overlayBtnActive: { borderColor: '#5C6BC0', backgroundColor: '#EDE7F6' },
  overlayEmoji: { fontSize: 22, marginBottom: 2 },
  overlayLabel: { fontSize: 10, color: '#90A4AE', fontWeight: 'bold' },
  overlayLabelActive: { color: '#5C6BC0' },

  supportItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  supportText: { flex: 1, marginLeft: 12, fontSize: 15, color: '#455A64' },
  
  logoutBtn: { flexDirection: 'row', backgroundColor: '#FF5252', borderRadius: 15, padding: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  switchSection: { marginTop: 10, marginBottom: 20 },
  switchSectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#90A4AE', marginBottom: 8, marginLeft: 5 },
  adminBtn: { flexDirection: 'row', backgroundColor: '#ECEFF1', borderRadius: 15, padding: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CFD8DC' },
  adminText: { color: '#607D8B', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  currentModeText: { fontSize: 12, color: '#90A4AE', marginLeft: 5 },
  
  enrollBtn: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderRadius: 15, padding: 15, justifyContent: 'center', alignItems: 'center', marginTop: 15, marginBottom: 20, borderWidth: 1, borderColor: '#90CAF9' },
  enrollText: { color: '#0288D1', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});