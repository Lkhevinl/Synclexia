import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Sidebar({ visible, onClose }) {
  const { theme, updateTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const navigation = useNavigation();

  // Helper for fonts
  const globalFont = theme.fontStyle === 'System' ? undefined : theme.fontStyle;

  const handleLogout = async () => {
    onClose();
    await signOut();
    // Navigation is handled automatically by AppNavigator
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
         {/* DRAWER CONTENT */}
         <View style={styles.drawer}>
             <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                 <Ionicons name="close" size={30} color="#333" />
             </TouchableOpacity>

             {/* USER INFO */}
             <View style={styles.userInfo}>
                 <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </Text>
                 </View>
                 <View>
                    <Text style={[styles.name, {fontFamily: globalFont}]}>
                        {profile?.full_name || "Student"}
                    </Text>
                    <Text style={styles.email}>{profile?.email}</Text>
                 </View>
             </View>

             <View style={styles.divider} />

             {/* MENU OPTIONS */}
             <Text style={styles.sectionLabel}>Appearance</Text>
             
             {/* Font Size Toggles */}
             <View style={styles.row}>
                 <Text style={styles.label}>Size</Text>
                 <View style={styles.toggleBox}>
                    <TouchableOpacity onPress={() => updateTheme('fontSize', Math.max(12, theme.fontSize - 2))} style={styles.tinyBtn}><Text>-</Text></TouchableOpacity>
                    <Text>{theme.fontSize}</Text>
                    <TouchableOpacity onPress={() => updateTheme('fontSize', Math.min(30, theme.fontSize + 2))} style={styles.tinyBtn}><Text>+</Text></TouchableOpacity>
                 </View>
             </View>

             {/* Background Color Toggles */}
             <View style={styles.row}>
                 <Text style={styles.label}>Color</Text>
                 <View style={{flexDirection:'row', gap: 5}}>
                    {['#FFF9C4', '#E1F5FE', '#F3E5F5'].map(c => (
                        <TouchableOpacity 
                            key={c} 
                            style={[styles.colorDot, {backgroundColor: c, borderWidth: theme.bgColor === c ? 2 : 0}]} 
                            onPress={() => updateTheme('bgColor', c)}
                        />
                    ))}
                 </View>
             </View>

             <View style={styles.divider} />

             <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); navigation.navigate('Support'); }}>
                 <Ionicons name="help-circle-outline" size={24} color="#555" />
                 <Text style={[styles.menuText, {fontFamily: globalFont}]}>Help & About</Text>
             </TouchableOpacity>

             <TouchableOpacity style={[styles.menuItem, {marginTop: 'auto'}]} onPress={handleLogout}>
                 <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
                 <Text style={[styles.menuText, {fontFamily: globalFont, color: '#D32F2F'}]}>Logout</Text>
             </TouchableOpacity>
         </View>
         
         {/* Click outside to close */}
         <TouchableOpacity style={{flex: 1}} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawer: { width: '80%', backgroundColor: '#fff', padding: 20, paddingTop: 50, elevation: 5 },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FBC02D', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 18, fontWeight: 'bold' },
  email: { fontSize: 12, color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  sectionLabel: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 16, color: '#333' },
  toggleBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 10 },
  tinyBtn: { padding: 10 },
  colorDot: { width: 24, height: 24, borderRadius: 12, borderColor: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15 },
  menuText: { fontSize: 16, fontWeight: 'bold', color: '#333' }
});