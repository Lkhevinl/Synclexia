import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import tokens from '../theme/tokens';

export default function SettingsScreen({ navigation }) {
  const { theme, updateTheme, a11yTextStyle, resolveFontFamily, colors } = useTheme();
  const { profile, signOut, dashboardMode, setDashboardMode } = useAuth();
  const [fontModalVisible, setFontModalVisible] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const isStudent = profile?.role === 'student';
  const isAdmin = profile?.role === 'admin';

  const FONT_STYLES = [
    { label: 'Inter',          value: 'Inter'          },
    { label: 'Inter Medium',   value: 'Inter Medium'   },
    { label: 'Inter SemiBold', value: 'Inter SemiBold' },
    { label: 'Inter Bold',     value: 'Inter Bold'     },
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
      style={[styles.chipBtn, { borderColor: colors.border }, theme.letterSpacing === value && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
      onPress={() => updateTheme({ letterSpacing: value })}
    >
      <Text style={[styles.chipText, { color: colors.onSurfaceMuted }, theme.letterSpacing === value && { color: colors.onSurface }, a11yTextStyle]}>{label}</Text>
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

  const SettingRow = ({ icon, iconColor = '#607D8B', label, onPress, children }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.rowIconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <AppText variant="body" style={[styles.rowLabel, { color: colors.onSurface }]}>{label}</AppText>
      {children ?? <Ionicons name="chevron-forward" size={17} color={colors.border} />}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper padded={false} edges={['left', 'right', 'bottom']}>
      <AppHeader title="Settings" subtitle="Preferences & account" />

      <ScrollView
        style={{ backgroundColor: colors.surface }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.surface }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <AppText variant="heading" style={{ color: colors.onPrimary, fontWeight: 'bold' }}>
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </AppText>
          </View>
          <View style={styles.profileInfo}>
            <AppText variant="body" style={[styles.profileName, { color: colors.onSurface }]} numberOfLines={1}>{profile?.full_name || 'User'}</AppText>
            <AppText variant="caption" style={{ color: colors.onSurfaceMuted, marginTop: 2 }} numberOfLines={1}>{profile?.email || '—'}</AppText>
          </View>
          {!isStudent && (
            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.primaryLight }]} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Account */}
        {!isStudent && (
          <>
            <AppText variant="label" style={[styles.groupLabel, { color: colors.onSurfaceMuted }]}>ACCOUNT</AppText>
            <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
              <SettingRow icon="create-outline" iconColor="#0288D1" label="Edit Profile" onPress={() => navigation.navigate('Profile')} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow icon="lock-closed-outline" iconColor="#7B1FA2" label="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
            </View>
          </>
        )}

        {/* Accessibility */}
        <AppText variant="label" style={[styles.groupLabel, { color: colors.onSurfaceMuted }]}>ACCESSIBILITY</AppText>
        <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <View style={styles.settingBlock}>
            <AppText variant="label" style={[styles.blockLabel, { color: colors.onSurface }]}>Font Size</AppText>
            <View style={styles.sizeRow}>
              <TouchableOpacity style={[styles.sizeBtn, { backgroundColor: colors.surface }]} onPress={() => updateTheme({ fontSize: Math.max(10, theme.fontSize - 1) })}>
                <Ionicons name="remove" size={18} color={colors.onSurface} />
              </TouchableOpacity>
              <AppText variant="body" style={[styles.sizeVal, { color: colors.onSurface }]}>{theme.fontSize}</AppText>
              <TouchableOpacity style={[styles.sizeBtn, { backgroundColor: colors.surface }]} onPress={() => updateTheme({ fontSize: Math.min(17, theme.fontSize + 1) })}>
                <Ionicons name="add" size={18} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingBlock}>
            <AppText variant="label" style={[styles.blockLabel, { color: colors.onSurface }]}>Letter Spacing</AppText>
            <View style={styles.chipRow}>
              <SpacingBtn label="Normal" value="normal" />
              <SpacingBtn label="Wide"   value="wide"   />
              <SpacingBtn label="Wider"  value="wider"  />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.settingRow} onPress={() => setFontModalVisible(true)}>
            <View style={[styles.rowIconWrap, { backgroundColor: '#7B1FA218' }]}>
              <Ionicons name="text" size={18} color="#7B1FA2" />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body" style={[styles.rowLabel, { color: colors.onSurface }]}>Font Style</AppText>
              <AppText variant="caption" style={{ color: colors.onSurfaceMuted, marginTop: 1 }}>{currentFont.label}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.border} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingBlock}>
            <AppText variant="label" style={[styles.blockLabel, { color: colors.onSurface }]}>Screen Color Tint</AppText>
            <AppText variant="caption" style={{ color: colors.onSurfaceMuted, marginBottom: tokens.spacing.sm }}>Reduces visual stress while reading</AppText>
            <View style={styles.overlayRow}>
              {OVERLAY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.overlayBtn, { borderColor: colors.border, backgroundColor: colors.surface }, theme.colorOverlay === opt.value && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
                  onPress={() => updateTheme({ colorOverlay: opt.value })}
                >
                  <Text style={styles.overlayEmoji}>{opt.emoji}</Text>
                  <AppText variant="caption" style={[{ color: colors.onSurfaceMuted }, theme.colorOverlay === opt.value && { color: colors.onSurface }]}>
                    {opt.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* System (Admin only) */}
        {isAdmin && (
          <>
            <AppText variant="label" style={[styles.groupLabel, { color: colors.onSurfaceMuted }]}>SYSTEM</AppText>
            <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
              <SettingRow icon="construct-outline" iconColor="#607D8B" label="View Maintenance Logs" onPress={() => navigation.navigate('MaintenanceLogs')} />
            </View>
          </>
        )}

        {/* Support (Parent/Teacher) */}
        {!isStudent && !isAdmin && (
          <>
            <AppText variant="label" style={[styles.groupLabel, { color: colors.onSurfaceMuted }]}>SUPPORT</AppText>
            <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
              <SettingRow icon="information-circle-outline" iconColor="#1976D2" label="About" onPress={() => navigation.navigate('Support', { initialTab: 'About' })} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow icon="chatbubble-ellipses-outline" iconColor="#2E7D32" label="Send Feedback to Admin" onPress={() => navigation.navigate('Support', { initialTab: 'Rate' })} />
            </View>
          </>
        )}

        {/* Admin view switch */}
        {profile?.role === 'admin' && (
          <>
            <AppText variant="label" style={[styles.groupLabel, { color: colors.onSurfaceMuted }]}>ADMIN</AppText>
            <View style={[styles.card, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
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
                  <AppText variant="body" style={[styles.rowLabel, { color: colors.onSurface }]}>Switch View</AppText>
                  <AppText variant="caption" style={{ color: colors.onSurfaceMuted, marginTop: 1 }}>
                    Current: {dashboardMode === 'admin' ? 'Admin' : 'Student'} — tap to switch
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={17} color={colors.border} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Log Out */}
        {confirmLogout ? (
          <View style={[styles.confirmBox, { backgroundColor: colors.surfaceCard, borderColor: '#FFCDD2' }]}>
            <AppText variant="body" style={[styles.confirmText, { color: colors.onSurface }]}>Are you sure you want to log out?</AppText>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={[styles.confirmCancel, { borderColor: colors.border }]} onPress={() => setConfirmLogout(false)}>
                <AppText variant="label" style={{ color: colors.onSurface }}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmLogoutBtn} onPress={() => { setConfirmLogout(false); signOut(); }}>
                <AppText variant="label" style={{ color: '#fff' }}>Log Out</AppText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.surfaceCard, borderColor: '#FFCDD2' }]} onPress={handleLogout}>
            <Ionicons name="exit-outline" size={20} color="#EF5350" />
            <AppText variant="body" style={{ fontWeight: '700', color: '#EF5350' }}>Log Out</AppText>
          </TouchableOpacity>
        )}

        <View style={{ height: tokens.spacing.sm }} />
      </ScrollView>

      {/* Font Style Modal */}
      <Modal visible={fontModalVisible} transparent animationType="slide" onRequestClose={() => setFontModalVisible(false)}>
        <TouchableOpacity style={styles.fontModalOverlay} activeOpacity={1} onPress={() => setFontModalVisible(false)}>
          <View style={[styles.fontModalCard, { backgroundColor: colors.surfaceCard }]}>
            <View style={[styles.fontModalHandle, { backgroundColor: colors.border }]} />
            <AppText variant="heading" style={[styles.fontModalTitle, { color: colors.onSurface }]}>Choose Font</AppText>
            {FONT_STYLES.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[styles.fontOption, theme.fontStyle === f.value && { backgroundColor: colors.primaryLight }]}
                onPress={() => { updateTheme({ fontStyle: f.value }); setFontModalVisible(false); }}
              >
                <Text style={[
                  styles.fontOptionText,
                  { color: colors.onSurfaceMuted, fontFamily: resolveFontFamily ? resolveFontFamily(f.value) : undefined },
                  theme.fontStyle === f.value && { fontWeight: '700', color: colors.onSurface },
                ]}>
                  {f.label}
                </Text>
                {theme.fontStyle === f.value && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: tokens.spacing.md, paddingTop: tokens.spacing.lg, paddingBottom: tokens.spacing.lg },

  groupLabel: { letterSpacing: 1, marginBottom: tokens.spacing.sm, marginLeft: tokens.spacing.xs, marginTop: tokens.spacing.xs },

  card: { borderRadius: tokens.radius.lg, marginBottom: tokens.spacing.lg, overflow: 'hidden' },

  profileCard: { borderRadius: tokens.radius.lg, padding: tokens.spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: tokens.spacing.lg },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1, marginLeft: tokens.spacing.md },
  profileName: { fontWeight: '700' },
  editAvatarBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },

  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: tokens.spacing.md, paddingVertical: tokens.spacing.md, gap: tokens.spacing.sm },
  rowIconWrap: { width: 34, height: 34, borderRadius: tokens.radius.sm, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { flex: 1, fontWeight: '500' },

  settingBlock: { paddingHorizontal: tokens.spacing.md, paddingVertical: tokens.spacing.md },
  blockLabel: { marginBottom: tokens.spacing.sm },

  divider: { height: 1, marginLeft: 62 },

  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md },
  sizeBtn: { width: 36, height: 36, borderRadius: tokens.radius.sm, justifyContent: 'center', alignItems: 'center' },
  sizeVal: { fontWeight: '700', minWidth: 24, textAlign: 'center' },

  chipRow: { flexDirection: 'row', gap: tokens.spacing.sm },
  chipBtn: { flex: 1, paddingVertical: tokens.spacing.sm, borderRadius: tokens.radius.sm, borderWidth: 1.5, alignItems: 'center' },
  chipText: { fontWeight: '600' },

  overlayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  overlayBtn: { alignItems: 'center', paddingHorizontal: tokens.spacing.sm, paddingVertical: tokens.spacing.sm, borderRadius: tokens.radius.md, borderWidth: 1.5, minWidth: 54 },
  overlayEmoji: { fontSize: 20, marginBottom: 3 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing.sm, borderRadius: tokens.radius.md, paddingVertical: tokens.spacing.md, marginBottom: tokens.spacing.sm, borderWidth: 1.5 },

  confirmBox: { borderRadius: tokens.radius.md, padding: tokens.spacing.md, marginBottom: tokens.spacing.sm, borderWidth: 1.5 },
  confirmText: { marginBottom: tokens.spacing.sm, textAlign: 'center' },
  confirmBtns: { flexDirection: 'row', gap: tokens.spacing.sm },
  confirmCancel: { flex: 1, paddingVertical: tokens.spacing.sm, borderRadius: tokens.radius.sm, borderWidth: 1.5, alignItems: 'center' },
  confirmLogoutBtn: { flex: 1, paddingVertical: tokens.spacing.sm, borderRadius: tokens.radius.sm, backgroundColor: '#EF5350', alignItems: 'center' },

  fontModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  fontModalCard: { borderTopLeftRadius: tokens.radius.xl, borderTopRightRadius: tokens.radius.xl, padding: tokens.spacing.lg, paddingBottom: 44 },
  fontModalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: tokens.spacing.lg },
  fontModalTitle: { textAlign: 'center', marginBottom: tokens.spacing.md },
  fontOption: { paddingVertical: tokens.spacing.md, paddingHorizontal: tokens.spacing.md, borderRadius: tokens.radius.md, marginBottom: tokens.spacing.xs, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fontOptionText: { fontSize: tokens.fontSize.md },
});
