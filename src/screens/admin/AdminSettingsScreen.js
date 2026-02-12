import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import GoBackBtn from '../../components/GoBackBtn';

export default function AdminSettingsScreen({ navigation }) {
  const { theme, updateTheme } = useTheme(); 
  const { profile, signOut, dashboardMode, setDashboardMode } = useAuth();

  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';
  const isStudent = profile?.role === 'student';

  // ✅ New Logic: Check if they are allowed to see the tools
  const canAccessTools = isTeacher || isAdmin;

  const handleLogout = async () => {
    try {
      await signOut();
      setDashboardMode('auto');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert("Error", "Failed to logout: " + error.message);
    }
  };

  const FontSizeBtn = ({ label, value }) => (
    <TouchableOpacity 
      style={[styles.optionBtn, theme.fontSize === value && styles.optionBtnActive]} 
      onPress={() => updateTheme({ fontSize: value })}
    >
        <Text style={[styles.optionText, { fontSize: value }, theme.fontSize === value && styles.optionTextActive]}>
            {label}
        </Text>
    </TouchableOpacity>
  );

  const ColorBtn = ({ color }) => (
    <TouchableOpacity 
      style={[styles.colorCircle, { backgroundColor: color }, theme.bgColor === color && styles.colorActive]} 
      onPress={() => updateTheme({ bgColor: color })}
    />
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <LinearGradient colors={['#607D8B', '#455A64']} style={styles.header}>
          {/* Only show Back button if not on a Tab (optional) */}
          <GoBackBtn /> 
          <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Settings ⚙️</Text>
              <Text style={styles.headerSub}>Customize your experience</Text>
          </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* VISUALS */}
          <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                  <Ionicons name="eye" size={24} color="#607D8B" />
                  <Text style={styles.sectionTitle}>Visuals</Text>
              </View>
              <Text style={styles.label}>Text Size</Text>
              <View style={styles.row}>
                  <FontSizeBtn label="Small" value={14} />
                  <FontSizeBtn label="Medium" value={18} />
                  <FontSizeBtn label="Large" value={24} />
              </View>
              <Text style={styles.label}>Theme</Text>
              <View style={styles.row}>
                  <ColorBtn color="#F5F7FA" /> 
                  <ColorBtn color="#FFF3E0" />
                  <ColorBtn color="#E3F2FD" /> 
                  <ColorBtn color="#F3E5F5" />
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
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <View style={styles.roleBadge}>
                       <Text style={styles.roleText}>{profile?.role?.toUpperCase() || "USER"}</Text>
                  </View>
              </View>
          </View>

          {/* ✅ NEW: TEACHER TOOLS BUTTON */}
          {/* This button opens the specific menu for Writing, Users, etc. */}
          {canAccessTools && (
            <TouchableOpacity 
                style={styles.toolsBtn} 
                onPress={() => navigation.navigate('TeacherDashboard')}
            >
                <LinearGradient 
                    colors={['#fff', '#F5F5F5']} 
                    style={styles.toolsGradient}
                >
                    <View style={styles.toolsIconBox}>
                        <Ionicons name="construct" size={24} color="#fff" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.toolsTitle}>
                            {isAdmin ? "Admin Panel" : "Teacher Tools"}
                        </Text>
                        <Text style={styles.toolsSub}>Manage content & users</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#B0BEC5" />
                </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ADMIN SWITCHER (Your Existing Code) */}
          {/* This toggles the Home Screen View */}
          {isAdmin && (
            <View style={styles.adminSection}>
                <Text style={styles.sectionLabel}>VIEW MODE</Text>
                {dashboardMode === 'student' ? (
                     <TouchableOpacity 
                        style={styles.switchBtn} 
                        onPress={() => {
                            setDashboardMode('teacher');
                            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                        }}
                     >
                        <Ionicons name="swap-horizontal" size={20} color="#607D8B" />
                        <Text style={styles.switchText}>Switch to Teacher View</Text>
                     </TouchableOpacity>
                ) : (
                     <TouchableOpacity 
                        style={styles.switchBtn} 
                        onPress={() => {
                            setDashboardMode('student');
                            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                        }}
                     >
                        <Ionicons name="swap-horizontal" size={20} color="#607D8B" />
                        <Text style={styles.switchText}>Switch to Student View</Text>
                     </TouchableOpacity>
                )}
            </View>
          )}

          {/* SUPPORT */}
          <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                  <Ionicons name="help-circle" size={24} color="#607D8B" />
                  <Text style={styles.sectionTitle}>Support</Text>
              </View>
              
              <TouchableOpacity style={styles.supportItem} onPress={() => navigation.navigate('Support')}>
                <Ionicons name="chatbubbles-outline" size={20} color="#607D8B" />
                <Text style={styles.supportText}>Send Feedback</Text>
                <Ionicons name="chevron-forward" size={20} color="#CFD8DC" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.supportItem} onPress={() => navigation.navigate('About')}>
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

          {/* STUDENT ENROLLMENT */}
          {isStudent && (
            <TouchableOpacity 
              style={styles.enrollBtn} 
              onPress={() => navigation.navigate('StudentEnroll')}
            >
                <Ionicons name="qr-code" size={24} color="#0288D1" />
                <Text style={styles.enrollText}>Enroll in Class</Text>
            </TouchableOpacity>
          )}

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
  colorCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#eee' },
  colorActive: { borderColor: '#607D8B', borderWidth: 3 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, alignItems: 'center' },
  infoLabel: { color: '#78909C' },
  infoValue: { fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  
  // Role Badge
  roleBadge: { backgroundColor: '#ECEFF1', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  roleText: { fontSize: 12, fontWeight: 'bold', color: '#455A64' },
  
  // ✅ NEW STYLES FOR TOOLS BUTTON
  toolsBtn: { marginBottom: 20, borderRadius: 15, elevation: 3, overflow: 'hidden' },
  toolsGradient: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  toolsIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#607D8B', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  toolsTitle: { fontSize: 16, fontWeight: 'bold', color: '#455A64' },
  toolsSub: { fontSize: 12, color: '#90A4AE' },

  // Admin Switcher Section
  adminSection: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#90A4AE', marginBottom: 8, marginLeft: 5 },
  switchBtn: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#CFD8DC', justifyContent: 'center' },
  switchText: { color: '#607D8B', fontWeight: 'bold', fontSize: 15, marginLeft: 10 },

  // Support
  supportItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  supportText: { flex: 1, marginLeft: 12, fontSize: 15, color: '#455A64' },
  
  logoutBtn: { flexDirection: 'row', backgroundColor: '#FF5252', borderRadius: 15, padding: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  enrollBtn: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderRadius: 15, padding: 15, justifyContent: 'center', alignItems: 'center', marginTop: 5, marginBottom: 30, borderWidth: 1, borderColor: '#90CAF9' },
  enrollText: { color: '#0288D1', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});