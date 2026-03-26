import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { theme, updateTheme, a11yTextStyle, resolveFontFamily } = useTheme();
  const { profile, signOut, dashboardMode, setDashboardMode } = useAuth();
  const [fontModalVisible, setFontModalVisible] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const isStudent = profile?.role === 'student';
  const isAdmin = profile?.role === 'admin';

  const FONT_STYLES = [
    { label: 'System',         value: 'System'         },
    { label: 'Arial',          value: 'Arial'          },
    { label: 'Open Dyslexic',  value: 'OpenDyslexic'   },
    { label: 'Verdana',        value: 'Verdana'        },
    { label: 'Tahoma',         value: 'Tahoma'         },
    { label: 'Century Gothic', value: 'Century Gothic' },
    { label: 'Trebuchet',      value: 'Trebuchet MS'   },
    { label: 'Calibri',        value: 'Calibri'        },
    { label: 'Open Sans',      value: 'Open Sans'      },
  ];

  const currentFont = FONT_STYLES.find(f => f.value === theme.fontStyle) || FONT_STYLES[0];

  const handleLogout = () => setConfirmLogout(true);

  const SpacingBtn = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.chipBtn, theme.letterSpacing === value && styles.chipBtnActive]}
      onPress={() => updateTheme({ letterSpacing: value })}
    >
      <Text style={[styles.chipText, theme.letterSpacing === value && styles.chipTextActive, a11yTextStyle]}>{label}</Text>
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

  // Shared row item component
  const SettingRow = ({ icon, iconColor = '#607D8B', label, onPress, children }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.rowIconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, a11yTextStyle]}>{label}</Text>
      {children ?? <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <AppHeader
        title="Settings"
        subtitle="Preferences & account"
        colors={['#546E7A', '#37474F']}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── PROFILE CARD ─────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={[styles.profileInitial, a11yTextStyle]}>
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, a11yTextStyle]} numberOfLines={1}>{profile?.full_name || 'User'}</Text>
            <Text style={[styles.profileEmail, a11yTextStyle]} numberOfLines={1}>{profile?.email || '—'}</Text>
          </View>
          {!isStudent && (
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="pencil" size={16} color="#546E7A" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── ACCOUNT ──────────────────────────────────────── */}
        {!isStudent && (
          <>
            <Text style={[styles.groupLabel, a11yTextStyle]}>ACCOUNT</Text>
            <View style={styles.card}>
              <SettingRow icon="create-outline" iconColor="#0288D1" label="Edit Profile" onPress={() => navigation.navigate('Profile')} />
              <View style={styles.divider} />
              <SettingRow icon="lock-closed-outline" iconColor="#7B1FA2" label="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
            </View>
          </>
        )}

        {/* ── ACCESSIBILITY ─────────────────────────────────── */}
        <Text style={[styles.groupLabel, a11yTextStyle]}>ACCESSIBILITY</Text>
        <View style={styles.card}>
          {/* Letter Spacing */}
          <View style={styles.settingBlock}>
            <Text style={[styles.blockLabel, a11yTextStyle]}>Font Size</Text>
            <View style={styles.sizeRow}>
              <TouchableOpacity style={styles.sizeBtn} onPress={() => updateTheme({ fontSize: Math.max(10, theme.fontSize - 1) })}>
                <Ionicons name="remove" size={18} color="#546E7A" />
              </TouchableOpacity>
              <Text style={[styles.sizeVal, a11yTextStyle]}>{theme.fontSize}</Text>
              <TouchableOpacity style={styles.sizeBtn} onPress={() => updateTheme({ fontSize: Math.min(17, theme.fontSize + 1) })}>
                <Ionicons name="add" size={18} color="#546E7A" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Letter Spacing */}
          <View style={styles.settingBlock}>
            <Text style={[styles.blockLabel, a11yTextStyle]}>Letter Spacing</Text>
            <View style={styles.chipRow}>
              <SpacingBtn label="Normal" value="normal" />
              <SpacingBtn label="Wide"   value="wide"   />
              <SpacingBtn label="Wider"  value="wider"  />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Font Style */}
          <TouchableOpacity style={styles.settingRow} onPress={() => setFontModalVisible(true)}>
            <View style={[styles.rowIconWrap, { backgroundColor: '#7B1FA218' }]}>
              <Ionicons name="text" size={18} color="#7B1FA2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, a11yTextStyle]}>Font Style</Text>
              <Text style={[styles.rowDesc, a11yTextStyle]}>{currentFont.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Color Overlay */}
          <View style={styles.settingBlock}>
            <Text style={[styles.blockLabel, a11yTextStyle]}>Screen Color Tint</Text>
            <Text style={[styles.rowDesc, { marginBottom: 10 }, a11yTextStyle]}>Reduces visual stress while reading</Text>
            <View style={styles.overlayRow}>
              {OVERLAY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.overlayBtn, theme.colorOverlay === opt.value && styles.overlayBtnActive]}
                  onPress={() => updateTheme({ colorOverlay: opt.value })}
                >
                  <Text style={styles.overlayEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.overlayLabel, theme.colorOverlay === opt.value && styles.overlayLabelActive, a11yTextStyle]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── SYSTEM (Admin only) ───────────────────────────────────────────────────── */}
        {isAdmin && (
          <>
            <Text style={[styles.groupLabel, a11yTextStyle]}>SYSTEM</Text>
            <View style={styles.card}>
              <SettingRow icon="construct-outline" iconColor="#607D8B" label="View Maintenance Logs" onPress={() => navigation.navigate('MaintenanceLogs')} />
            </View>
          </>
        )}

        {/* ── SUPPORT (Parent/Teacher) ─────────────────────────────────────────────── */}
        {!isStudent && !isAdmin && (
          <>
            <Text style={[styles.groupLabel, a11yTextStyle]}>SUPPORT</Text>
            <View style={styles.card}>
              <SettingRow icon="information-circle-outline" iconColor="#1976D2" label="About" onPress={() => navigation.navigate('Support', { initialTab: 'About' })} />
              <View style={styles.divider} />
              <SettingRow icon="chatbubble-ellipses-outline" iconColor="#2E7D32" label="Send Feedback to Admin" onPress={() => navigation.navigate('Support', { initialTab: 'Rate' })} />
            </View>
          </>
        )}

        {/* ── ADMIN VIEW SWITCH ────────────────────────────── */}
        {profile?.role === 'admin' && (
          <>
            <Text style={[styles.groupLabel, a11yTextStyle]}>ADMIN</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  const next = dashboardMode === 'admin' ? 'student' : 'admin';
                  setDashboardMode(next);
                  setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }), 100);
                }}
              >
                <View style={[styles.rowIconWrap, { backgroundColor: '#FF980018' }]}>
                  <Ionicons name="swap-horizontal" size={18} color="#F57C00" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, a11yTextStyle]}>Switch View</Text>
                  <Text style={[styles.rowDesc, a11yTextStyle]}>
                    Current: {dashboardMode === 'admin' ? 'Admin' : 'Student'} — tap to switch
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#D0D9E0" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── LOG OUT ──────────────────────────────────────── */}
        {confirmLogout ? (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Are you sure you want to log out?</Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmLogout(false)}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmLogoutBtn} onPress={() => { setConfirmLogout(false); signOut(); }}>
                <Text style={styles.confirmLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="exit-outline" size={20} color="#EF5350" />
            <Text style={[styles.logoutText, a11yTextStyle]}>Log Out</Text>
          </TouchableOpacity>
        )}

      <View style={{ height: 10 }} />
      </ScrollView>

      {/* Font Style Modal */}
      <Modal visible={fontModalVisible} transparent animationType="slide" onRequestClose={() => setFontModalVisible(false)}>
        <TouchableOpacity style={styles.fontModalOverlay} activeOpacity={1} onPress={() => setFontModalVisible(false)}>
          <View style={styles.fontModalCard}>
            <View style={styles.fontModalHandle} />
            <Text style={[styles.fontModalTitle, a11yTextStyle]}>Choose Font</Text>
            {FONT_STYLES.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[styles.fontOption, theme.fontStyle === f.value && styles.fontOptionActive]}
                onPress={() => { updateTheme({ fontStyle: f.value }); setFontModalVisible(false); }}
              >
                <Text style={[
                  styles.fontOptionText,
                  { fontFamily: resolveFontFamily ? resolveFontFamily(f.value) : (f.value !== 'System' ? f.value : undefined) },
                  theme.fontStyle === f.value && styles.fontOptionTextActive,
                ]}>
                  {f.label}
                </Text>
                {theme.fontStyle === f.value && <Ionicons name="checkmark-circle" size={20} color="#546E7A" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F0F2F5' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },

  // Group labels
  groupLabel: {
    fontSize: 11, fontWeight: '700', color: '#90A4AE',
    letterSpacing: 1, marginBottom: 8, marginLeft: 4, marginTop: 4,
  },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 20,
    boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.06)', elevation: 2,
    overflow: 'hidden',
  },

  // Profile card
  profileCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.07)', elevation: 3,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#546E7A', justifyContent: 'center', alignItems: 'center',
  },
  profileInitial: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#263238' },
  profileEmail: { fontSize: 12, color: '#90A4AE', marginTop: 2 },
  profileBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 3 },
  profileBadgeText: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },
  editAvatarBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#ECEFF1', justifyContent: 'center', alignItems: 'center',
  },

  // Row items
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#263238' },
  rowDesc: { fontSize: 12, color: '#90A4AE', marginTop: 1 },

  // Settings blocks (non-pressable content inside a card)
  settingBlock: { paddingHorizontal: 16, paddingVertical: 14 },
  blockLabel: { fontSize: 13, fontWeight: '600', color: '#455A64', marginBottom: 10 },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 62 },

  // Toggle switch
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: '#CFD8DC', justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: '#546E7A' },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff', alignSelf: 'flex-start',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)', elevation: 2,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // Chips (letter spacing)
  chipRow: { flexDirection: 'row', gap: 8 },
  chipBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E8ECF0',
    alignItems: 'center', backgroundColor: '#F8F9FB',
  },
  chipBtnActive: { borderColor: '#546E7A', backgroundColor: '#ECEFF1' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#B0BEC5' },
  chipTextActive: { color: '#37474F' },

  // Color overlay
  overlayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  overlayBtn: {
    alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E8ECF0',
    backgroundColor: '#F8F9FB', minWidth: 54,
  },
  overlayBtnActive: { borderColor: '#546E7A', backgroundColor: '#ECEFF1' },
  overlayEmoji: { fontSize: 20, marginBottom: 3 },
  overlayLabel: { fontSize: 10, color: '#90A4AE', fontWeight: '600' },
  overlayLabelActive: { color: '#37474F' },


  // Logout button
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15,
    marginBottom: 12, borderWidth: 1.5, borderColor: '#FFCDD2',
    boxShadow: '0px 2px 6px rgba(239, 83, 80, 0.08)', elevation: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF5350' },

  // Inline logout confirm
  confirmBox: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#FFCDD2',
  },
  confirmText: { fontSize: 14, color: '#263238', marginBottom: 12, textAlign: 'center' },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  confirmCancel: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#CFD8DC', alignItems: 'center',
  },
  confirmCancelText: { color: '#546E7A', fontWeight: '600' },
  confirmLogoutBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#EF5350', alignItems: 'center',
  },
  confirmLogoutText: { color: '#fff', fontWeight: '700' },

  // Font modal
  fontModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  fontModalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 44,
  },
  fontModalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginBottom: 20,
  },
  fontModalTitle: { fontSize: 17, fontWeight: '700', color: '#263238', textAlign: 'center', marginBottom: 14 },
  fontOption: {
    paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  fontOptionActive: { backgroundColor: '#ECEFF1' },
  fontOptionText: { fontSize: 15, color: '#546E7A' },
  fontOptionTextActive: { fontWeight: '700', color: '#263238' },
});