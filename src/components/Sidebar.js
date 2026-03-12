import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { xpToLevel } from '../lib/userUtils';

const FONT_STYLES = [
  { label: 'System',         value: 'System'        },
  { label: 'Arial',          value: 'Arial'         },
  { label: 'Open Dyslexic',  value: 'OpenDyslexic'  },
  { label: 'Verdana',        value: 'Verdana'       },
  { label: 'Tahoma',         value: 'Tahoma'        },
  { label: 'Century Gothic', value: 'Century Gothic'},
  { label: 'Trebuchet',      value: 'Trebuchet MS'  },
  { label: 'Calibri',        value: 'Calibri'       },
  { label: 'Open Sans',      value: 'Open Sans'     },
];

const OVERLAY_OPTIONS = [
  { value: 'none',   emoji: '🚫', label: 'None'   },
  { value: 'yellow', emoji: '🟡', label: 'Yellow' },
  { value: 'blue',   emoji: '🔵', label: 'Blue'   },
  { value: 'green',  emoji: '🟢', label: 'Green'  },
  { value: 'pink',   emoji: '🩷', label: 'Pink'   },
  { value: 'orange', emoji: '🟠', label: 'Orange' },
];

export default function Sidebar({ visible, onClose }) {
  const { theme, updateTheme } = useTheme();
  const { profile, signOut, dashboardMode, setDashboardMode } = useAuth();
  const navigation = useNavigation();
  const [fontModalVisible, setFontModalVisible] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const currentFont = FONT_STYLES.find(f => f.value === theme.fontStyle) || FONT_STYLES[0];
  const isStudent = profile?.role === 'student';
  const isAdmin   = profile?.role === 'admin';

  const navigate = (screen, params) => { onClose(); setTimeout(() => navigation.navigate(screen, params), 200); };

  const handleLogout = () => setConfirmLogout(true);
  const doLogout = () => { setConfirmLogout(false); onClose(); setTimeout(() => signOut(), 50); };

  const SpacingBtn = ({ label, value }) => (
    <TouchableOpacity
      style={[s.chipBtn, theme.letterSpacing === value && s.chipBtnActive]}
      onPress={() => updateTheme({ letterSpacing: value })}
    >
      <Text style={[s.chipText, theme.letterSpacing === value && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={s.overlay}>
          {/* DRAWER */}
          <View style={s.drawer}>

            {/* HEADER */}
            <View style={s.header}>
              {/* Background: custom banner or default gradient */}
              {profile?.banner_url ? (
                <Image source={{ uri: profile.banner_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <LinearGradient colors={['#546E7A', '#37474F']} style={StyleSheet.absoluteFill} />
              )}
              {/* Dark overlay for readability over any background */}
              <View style={s.headerOverlay} />

              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={s.avatarImg} />
              ) : (
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</Text>
                </View>
              )}
              <Text style={s.name}>{profile?.full_name || 'User'}</Text>
              <Text style={s.email}>{profile?.email}</Text>
              <View style={s.badgeRow}>
                <Ionicons name="star" size={11} color="#F59E0B" />
                <Text style={s.badgeText}>Level {xpToLevel(profile?.xp)}</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

              {/* ACCOUNT */}
              <Text style={s.groupLabel}>ACCOUNT</Text>
              <View style={s.card}>
                <TouchableOpacity style={s.row} onPress={() => navigate('Profile')}>
                  <View style={[s.iconWrap, { backgroundColor: '#0288D118' }]}><Ionicons name="create-outline" size={18} color="#0288D1" /></View>
                  <Text style={s.rowLabel}>Edit Profile</Text>
                  <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />
                </TouchableOpacity>
                <View style={s.divider} />
                <TouchableOpacity style={s.row} onPress={() => navigate('ChangePassword')}>
                  <View style={[s.iconWrap, { backgroundColor: '#7B1FA218' }]}><Ionicons name="lock-closed-outline" size={18} color="#7B1FA2" /></View>
                  <Text style={s.rowLabel}>Change Password</Text>
                  <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />
                </TouchableOpacity>
              </View>

              {/* ACCESSIBILITY */}
              <Text style={s.groupLabel}>ACCESSIBILITY</Text>
              <View style={s.card}>
                {/* Dyslexia toggle */}
                <View style={s.row}>
                  <View style={[s.iconWrap, { backgroundColor: '#5C6BC018' }]}><Ionicons name="accessibility" size={18} color="#5C6BC0" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>Dyslexia-Friendly</Text>
                    <Text style={s.rowDesc}>Larger, heavier text</Text>
                  </View>
                  <TouchableOpacity
                    style={[s.toggle, theme.dyslexiaFont && s.toggleOn]}
                    onPress={() => updateTheme({ dyslexiaFont: !theme.dyslexiaFont })}
                  >
                    <View style={[s.toggleThumb, theme.dyslexiaFont && s.toggleThumbOn]} />
                  </TouchableOpacity>
                </View>

                <View style={s.divider} />

                {/* Font Size */}
                <View style={s.block}>
                  <Text style={s.blockLabel}>Font Size</Text>
                  <View style={s.sizeRow}>
                    <TouchableOpacity style={s.sizeBtn} onPress={() => updateTheme({ fontSize: Math.max(12, theme.fontSize - 2) })}>
                      <Ionicons name="remove" size={18} color="#546E7A" />
                    </TouchableOpacity>
                    <Text style={s.sizeVal}>{theme.fontSize}</Text>
                    <TouchableOpacity style={s.sizeBtn} onPress={() => updateTheme({ fontSize: Math.min(30, theme.fontSize + 2) })}>
                      <Ionicons name="add" size={18} color="#546E7A" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={s.divider} />

                {/* Letter Spacing */}
                <View style={s.block}>
                  <Text style={s.blockLabel}>Letter Spacing</Text>
                  <View style={s.chipRow}>
                    <SpacingBtn label="Normal" value="normal" />
                    <SpacingBtn label="Wide"   value="wide"   />
                    <SpacingBtn label="Wider"  value="wider"  />
                  </View>
                </View>

                <View style={s.divider} />

                {/* Font Style */}
                <TouchableOpacity style={s.row} onPress={() => setFontModalVisible(true)}>
                  <View style={[s.iconWrap, { backgroundColor: '#7B1FA218' }]}><Ionicons name="text" size={18} color="#7B1FA2" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>Font Style</Text>
                    <Text style={s.rowDesc}>{currentFont.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />
                </TouchableOpacity>

                <View style={s.divider} />

                {/* Color Overlay */}
                <View style={s.block}>
                  <Text style={s.blockLabel}>Screen Color Tint</Text>
                  <Text style={[s.rowDesc, { marginBottom: 8 }]}>Reduces visual stress while reading</Text>
                  <View style={s.overlayRow}>
                    {OVERLAY_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[s.overlayBtn, theme.colorOverlay === opt.value && s.overlayBtnActive]}
                        onPress={() => updateTheme({ colorOverlay: opt.value })}
                      >
                        <Text style={s.overlayEmoji}>{opt.emoji}</Text>
                        <Text style={[s.overlayLabel, theme.colorOverlay === opt.value && s.overlayLabelActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* SUPPORT */}
              <Text style={s.groupLabel}>SUPPORT</Text>
              <View style={s.card}>
                <TouchableOpacity style={s.row} onPress={() => navigate('Support')}>
                  <View style={[s.iconWrap, { backgroundColor: '#00897B18' }]}><Ionicons name="chatbubbles-outline" size={18} color="#00897B" /></View>
                  <Text style={s.rowLabel}>Send Feedback</Text>
                  <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />
                </TouchableOpacity>
                <View style={s.divider} />
                <TouchableOpacity style={s.row} onPress={() => navigate('About')}>
                  <View style={[s.iconWrap, { backgroundColor: '#0288D118' }]}><Ionicons name="information-circle-outline" size={18} color="#0288D1" /></View>
                  <Text style={s.rowLabel}>About Us</Text>
                  <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />
                </TouchableOpacity>
              </View>

              {/* ADMIN SWITCH */}
              {isAdmin && (
                <>
                  <Text style={s.groupLabel}>ADMIN</Text>
                  <View style={s.card}>
                    <TouchableOpacity style={s.row} onPress={() => {
                      const next = dashboardMode === 'student' ? 'teacher' : 'student';
                      setDashboardMode(next);
                      onClose();
                      setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }), 200);
                    }}>
                      <View style={[s.iconWrap, { backgroundColor: '#FF980018' }]}><Ionicons name="swap-horizontal" size={18} color="#F57C00" /></View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.rowLabel}>Switch View</Text>
                        <Text style={s.rowDesc}>Current: {dashboardMode === 'teacher' ? 'Teacher' : 'Student'}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* ENROLL (students) */}
              {isStudent && (
                <TouchableOpacity style={s.enrollBtn} onPress={() => navigate('StudentEnroll')}>
                  <Ionicons name="qr-code-outline" size={20} color="#0288D1" />
                  <Text style={s.enrollText}>Enroll in Class</Text>
                </TouchableOpacity>
              )}

              {/* LOGOUT */}
              {confirmLogout ? (
                <View style={s.confirmBox}>
                  <Text style={s.confirmText}>Are you sure you want to log out?</Text>
                  <View style={s.confirmBtns}>
                    <TouchableOpacity style={s.confirmCancel} onPress={() => setConfirmLogout(false)}>
                      <Text style={s.confirmCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.confirmLogout} onPress={doLogout}>
                      <Text style={s.confirmLogoutText}>Log Out</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                  <Ionicons name="exit-outline" size={20} color="#EF5350" />
                  <Text style={s.logoutText}>Log Out</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>

          {/* Tap outside to close */}
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        </View>
      </Modal>

      {/* Font Picker Modal */}
      <Modal visible={fontModalVisible} transparent animationType="slide" onRequestClose={() => setFontModalVisible(false)}>
        <TouchableOpacity style={s.fontOverlay} activeOpacity={1} onPress={() => setFontModalVisible(false)}>
          <View style={s.fontCard}>
            <View style={s.fontHandle} />
            <Text style={s.fontTitle}>Choose Font</Text>
            {FONT_STYLES.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[s.fontOption, theme.fontStyle === f.value && s.fontOptionActive]}
                onPress={() => { updateTheme({ fontStyle: f.value }); setFontModalVisible(false); }}
              >
                <Text style={[s.fontOptionText, { fontFamily: f.value !== 'System' ? f.value : undefined }, theme.fontStyle === f.value && s.fontOptionTextActive]}>
                  {f.label}
                </Text>
                {theme.fontStyle === f.value && <Ionicons name="checkmark-circle" size={20} color="#546E7A" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawer: { width: '85%', backgroundColor: '#F0F2F5', elevation: 10 },

  // Header
  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, overflow: 'hidden' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarImg: { width: 56, height: 56, borderRadius: 28, marginBottom: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 17, fontWeight: '700', color: '#fff' },
  email: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },

  scrollContent: { padding: 16 },

  groupLabel: { fontSize: 11, fontWeight: '700', color: '#90A4AE', letterSpacing: 1, marginBottom: 8, marginLeft: 4, marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2, boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.06)' },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#263238' },
  rowDesc: { fontSize: 11, color: '#90A4AE', marginTop: 1 },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 56 },

  block: { paddingHorizontal: 14, paddingVertical: 13 },
  blockLabel: { fontSize: 12, fontWeight: '600', color: '#455A64', marginBottom: 10 },

  // Toggle
  toggle: { width: 40, height: 24, borderRadius: 12, backgroundColor: '#CFD8DC', justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: '#546E7A' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: 'flex-start', elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // Font size stepper
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sizeBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#ECEFF1', justifyContent: 'center', alignItems: 'center' },
  sizeVal: { fontSize: 16, fontWeight: '700', color: '#37474F', minWidth: 28, textAlign: 'center' },

  // Chips
  chipRow: { flexDirection: 'row', gap: 6 },
  chipBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E8ECF0', alignItems: 'center', backgroundColor: '#F8F9FB' },
  chipBtnActive: { borderColor: '#546E7A', backgroundColor: '#ECEFF1' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#B0BEC5' },
  chipTextActive: { color: '#37474F' },

  // Color overlay
  overlayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  overlayBtn: { alignItems: 'center', paddingHorizontal: 7, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: '#E8ECF0', backgroundColor: '#F8F9FB', minWidth: 48 },
  overlayBtnActive: { borderColor: '#546E7A', backgroundColor: '#ECEFF1' },
  overlayEmoji: { fontSize: 18, marginBottom: 2 },
  overlayLabel: { fontSize: 9, color: '#90A4AE', fontWeight: '600' },
  overlayLabelActive: { color: '#37474F' },

  // Enroll
  enrollBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#90CAF9' },
  enrollText: { fontSize: 14, fontWeight: '700', color: '#0288D1' },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#FFCDD2' },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#EF5350' },

  // Inline logout confirm (replaces Alert.alert which silently fails on web)
  confirmBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#FFCDD2' },
  confirmText: { fontSize: 14, color: '#455A64', fontWeight: '500', textAlign: 'center', marginBottom: 14 },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  confirmCancel: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#CFD8DC', alignItems: 'center' },
  confirmCancelText: { fontSize: 14, fontWeight: '600', color: '#607D8B' },
  confirmLogout: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#EF5350', alignItems: 'center' },
  confirmLogoutText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Font modal
  fontOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  fontCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44 },
  fontHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20 },
  fontTitle: { fontSize: 17, fontWeight: '700', color: '#263238', textAlign: 'center', marginBottom: 14 },
  fontOption: { paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fontOptionActive: { backgroundColor: '#ECEFF1' },
  fontOptionText: { fontSize: 15, color: '#546E7A' },
  fontOptionTextActive: { fontWeight: '700', color: '#263238' },
});