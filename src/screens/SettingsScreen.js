import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import GoBackBtn from '../components/GoBackBtn';
import { xpToLevel } from '../lib/userUtils';

export default function SettingsScreen({ navigation }) {
  const { theme, updateTheme, a11yTextStyle } = useTheme();
  const { profile, signOut, dashboardMode, setDashboardMode } = useAuth();
  const [fontModalVisible, setFontModalVisible] = React.useState(false);

  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';

  // Font style options (name shown in UI → fontFamily value)
  const FONT_STYLES = [
    { label: 'System',          value: 'System'          },
    { label: 'Arial',           value: 'Arial'           },
    { label: 'Open Dyslexic',   value: 'OpenDyslexic'    },
    { label: 'Verdana',         value: 'Verdana'         },
    { label: 'Tahoma',          value: 'Tahoma'          },
    { label: 'Century Gothic',  value: 'Century Gothic'  },
    { label: 'Trebuchet',       value: 'Trebuchet MS'    },
    { label: 'Calibri',         value: 'Calibri'         },
    { label: 'Open Sans',       value: 'Open Sans'       },
  ];

  const currentFont = FONT_STYLES.find(f => f.value === theme.fontStyle) || FONT_STYLES[0];

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
      <Text style={[styles.optionText, theme.letterSpacing === value && styles.optionTextActive, a11yTextStyle]}>{label}</Text>
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
              <Text style={[styles.headerTitle, a11yTextStyle]}>Settings ⚙️</Text>
              <Text style={[styles.headerSub, a11yTextStyle]}>Customize your experience</Text>
          </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* ── DYSLEXIA ACCESSIBILITY ─────────────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="accessibility" size={24} color="#5C6BC0" />
              <Text style={[styles.sectionTitle, { color: '#5C6BC0' }, a11yTextStyle]}>Dyslexia Accessibility</Text>
            </View>

            {/* Dyslexia-Friendly Mode toggle */}
            <View style={styles.accessRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, a11yTextStyle]}>Dyslexia-Friendly Mode</Text>
                <Text style={[styles.accessDesc, a11yTextStyle]}>Larger letter size and extra weight for easier reading</Text>
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
            <Text style={[styles.label, a11yTextStyle]}>Letter Spacing</Text>
            <View style={styles.row}>
              <SpacingBtn label="Normal" value="normal" />
              <SpacingBtn label="Wide"   value="wide"   />
              <SpacingBtn label="Wider"  value="wider"  />
            </View>

            {/* Color Overlay */}
            <Text style={[styles.label, a11yTextStyle]}>Screen Color Tint</Text>
            <Text style={[styles.accessDesc, a11yTextStyle]}>A colored tint can reduce visual stress when reading</Text>
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

          {/* ── FONT STYLE ─────────────────────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="text" size={24} color="#7B1FA2" />
              <Text style={[styles.sectionTitle, { color: '#7B1FA2' }, a11yTextStyle]}>Font Style</Text>
            </View>

            <TouchableOpacity style={styles.fontPickerBtn} onPress={() => setFontModalVisible(true)}>
              <Text style={[styles.fontPickerLabel, a11yTextStyle]}>
                {currentFont.label}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#7B1FA2" />
            </TouchableOpacity>

            <Text style={[styles.accessDesc, a11yTextStyle]}>
              Changes the text font across the whole app.
            </Text>
          </View>

          {/* Font Style Modal */}
          <Modal visible={fontModalVisible} transparent animationType="slide" onRequestClose={() => setFontModalVisible(false)}>
            <TouchableOpacity style={styles.fontModalOverlay} activeOpacity={1} onPress={() => setFontModalVisible(false)}>
              <View style={styles.fontModalCard}>
                <Text style={[styles.fontModalTitle, a11yTextStyle]}>Font Style</Text>
                {FONT_STYLES.map(f => (
                  <TouchableOpacity
                    key={f.value}
                    style={[styles.fontOption, theme.fontStyle === f.value && styles.fontOptionActive]}
                    onPress={() => { updateTheme({ fontStyle: f.value }); setFontModalVisible(false); }}
                  >
                    <Text style={[
                      styles.fontOptionText,
                      { fontFamily: f.value !== 'System' ? f.value : undefined },
                      theme.fontStyle === f.value && styles.fontOptionTextActive,
                    ]}>
                      {f.label}
                    </Text>
                    {theme.fontStyle === f.value && (
                      <Ionicons name="checkmark" size={18} color="#7B1FA2" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ACCOUNT */}
          <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={24} color="#607D8B" />
                  <Text style={[styles.sectionTitle, a11yTextStyle]}>Account</Text>
              </View>
              <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, a11yTextStyle]}>Name</Text>
                  <Text style={[styles.infoValue, a11yTextStyle]}>{profile?.full_name || 'User'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, a11yTextStyle]}>Email</Text>
                  <Text style={[styles.infoValue, a11yTextStyle]} numberOfLines={1}>{profile?.email || '—'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, a11yTextStyle]}>Level</Text>
                  <Text style={[styles.infoValue, a11yTextStyle]}>{xpToLevel(profile?.xp)}</Text>
              </View>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.supportItem}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="create-outline" size={20} color="#607D8B" />
                <Text style={[styles.supportText, a11yTextStyle]}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#CFD8DC" />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.supportItem}
                onPress={() => navigation.navigate('ChangePassword')}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#607D8B" />
                <Text style={[styles.supportText, a11yTextStyle]}>Change Password</Text>
                <Ionicons name="chevron-forward" size={20} color="#CFD8DC" />
              </TouchableOpacity>
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
                <Text style={[styles.supportText, a11yTextStyle]}>Send Feedback</Text>
                <Ionicons name="chevron-forward" size={20} color="#CFD8DC" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={styles.supportItem}
                onPress={() => navigation.navigate('About')}
              >
                <Ionicons name="information-circle-outline" size={20} color="#607D8B" />
                <Text style={[styles.supportText, a11yTextStyle]}>About Us</Text>
                <Ionicons name="chevron-forward" size={20} color="#CFD8DC" />
              </TouchableOpacity>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
              <Text style={[styles.logoutText, a11yTextStyle]}>Log Out</Text>
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
                  <Text style={[styles.adminText, a11yTextStyle]}>Switch to Teacher View</Text>
                  <Text style={[styles.currentModeText, a11yTextStyle]}>(Current: Student)</Text>
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
                  <Text style={[styles.adminText, a11yTextStyle]}>Switch to Student View</Text>
                  <Text style={[styles.currentModeText, a11yTextStyle]}>(Current: {dashboardMode === 'teacher' ? 'Teacher' : 'Auto'})</Text>
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
                <Text style={[styles.enrollText, a11yTextStyle]}>Enroll in Class</Text>
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
  headerContent: { alignItems: 'center', marginTop: 30 },
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
  enrollText: { color: '#0288D1', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  // Font style picker
  fontPickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3E5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
  fontPickerLabel: { fontSize: 16, fontWeight: '600', color: '#4A148C' },
  fontModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  fontModalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  fontModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 18 },
  fontOption: { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fontOptionActive: { backgroundColor: '#EDE7F6' },
  fontOptionText: { fontSize: 16, color: '#555' },
  fontOptionTextActive: { color: '#7B1FA2', fontWeight: 'bold' },
});