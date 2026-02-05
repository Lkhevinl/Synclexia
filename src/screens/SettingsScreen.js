import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Required for avatar upload
import GoBackBtn from '../components/GoBackBtn';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

export default function SettingsScreen({ navigation }) {
  const { theme, updateTheme } = useTheme(); 
  const [modalVisible, setModalVisible] = useState(null); // 'size', 'color', 'style', or null
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUri, setAvatarUri] = useState(null);

  // 1. LOAD USER DATA
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // Fetch extra profile data like full_name or avatar_url
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (data) {
             setProfile(data);
             // If we had a real URL in DB, we would set it here.
             // For now, we use local state or just the placeholder.
          }
        }
      } catch (error) {
        console.log("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  // 2. CHANGE AVATAR FUNCTION
  const changeAvatar = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
        // Note: In a production app, you would upload this file to Supabase Storage here
        // and then update the 'profiles' table with the public URL.
        Alert.alert("Success", "Profile picture updated locally!");
      }
    } catch (error) {
      Alert.alert("Error", "Could not open gallery.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  // --- MODAL CONTENT RENDERER ---
  const renderModalContent = () => {
    const colors = ['#FFFFFF', '#FFF9C4', '#E1F5FE', '#E8F5E9', '#FCE4EC', '#F3E5F5'];
    const fonts = ['System', 'Roboto', 'Serif', 'Monospace']; 
    const getFont = (f) => f === 'System' ? undefined : f;

    switch (modalVisible) {
      case 'size':
        return (
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Font Size</Text>
            <View style={styles.sliderContainer}>
                <TouchableOpacity onPress={() => updateTheme('fontSize', Math.max(12, theme.fontSize - 2))} style={styles.sizeBtn}>
                    <Text style={styles.sizeBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={{fontSize: 24, fontWeight:'bold'}}>{theme.fontSize}</Text>
                <TouchableOpacity onPress={() => updateTheme('fontSize', Math.min(30, theme.fontSize + 2))} style={styles.sizeBtn}>
                    <Text style={styles.sizeBtnText}>+</Text>
                </TouchableOpacity>
            </View>
            <Text style={[styles.sampleText, { fontSize: theme.fontSize, fontFamily: getFont(theme.fontStyle) }]}>Sample Text</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(null)}><Text style={styles.closeText}>Done</Text></TouchableOpacity>
          </View>
        );
      case 'color':
        return (
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Background Color</Text>
            <View style={styles.colorGrid}>
                {colors.map((c) => (
                    <TouchableOpacity 
                        key={c} 
                        style={[styles.colorSwatch, { backgroundColor: c, borderWidth: theme.bgColor === c ? 3 : 1 }]} 
                        onPress={() => updateTheme('bgColor', c)} 
                    />
                ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(null)}><Text style={styles.closeText}>Done</Text></TouchableOpacity>
          </View>
        );
      case 'style':
        return (
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Font Style</Text>
            {fonts.map((f) => (
                <TouchableOpacity key={f} style={styles.radioRow} onPress={() => updateTheme('fontStyle', f)}>
                    <Ionicons name={theme.fontStyle === f ? "radio-button-on" : "radio-button-off"} size={24} color="#006064" />
                    <Text style={[styles.radioText, { fontFamily: getFont(f) }]}>{f}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(null)}><Text style={styles.closeText}>Done</Text></TouchableOpacity>
          </View>
        );
      default: return null;
    }
  };

  const globalFont = theme.fontStyle === 'System' ? undefined : theme.fontStyle;

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <GoBackBtn />
      
      {/* PROFILE HEADER */}
      <View style={styles.profileHeader}>
         <TouchableOpacity onPress={changeAvatar} style={styles.avatar}>
             {avatarUri ? (
               <Image source={{ uri: avatarUri }} style={{ width: 60, height: 60, borderRadius: 30 }} />
             ) : (
               <Text style={styles.avatarText}>{user ? user.email.charAt(0).toUpperCase() : "?"}</Text>
             )}
             
             {/* Camera Badge */}
             <View style={styles.editIconBadge}>
                 <Ionicons name="camera" size={12} color="#fff" />
             </View>
         </TouchableOpacity>

         <View>
             <Text style={[styles.userName, { fontFamily: globalFont }]}>
                {loading ? "Loading..." : (profile?.full_name || "Student")} 
             </Text>
             <Text style={styles.userEmail}>
                {user ? user.email : "Not logged in"}
             </Text>
         </View>
      </View>

      <Text style={[styles.sectionTitle, { fontSize: theme.fontSize, fontFamily: globalFont }]}>Customization</Text>

      {/* MENU ITEMS */}
      <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible('size')}>
              <Ionicons name="text" size={24} color="#555" />
              <Text style={[styles.menuText, { fontSize: theme.fontSize, fontFamily: globalFont }]}>Font Size</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible('style')}>
              <Ionicons name="documents-outline" size={24} color="#555" />
              <Text style={[styles.menuText, { fontSize: theme.fontSize, fontFamily: globalFont }]}>Font Style</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible('color')}>
              <Ionicons name="color-palette-outline" size={24} color="#555" />
              <Text style={[styles.menuText, { fontSize: theme.fontSize, fontFamily: globalFont }]}>Background Color</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
          <Text style={[styles.logoutText, { fontFamily: globalFont }]}>Logout</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible !== null} onRequestClose={() => setModalVisible(null)}>
        <View style={styles.modalOverlay}>{renderModalContent()}</View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  
  // Profile
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, backgroundColor: 'rgba(255,255,255,0.6)', padding: 15, borderRadius: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#006064', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', borderRadius: 10, padding: 4, borderWidth: 1, borderColor: '#fff' },
  
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666' },

  sectionTitle: { fontWeight: 'bold', color: '#888', marginBottom: 10, marginTop: 10 },
  
  // Menu
  menuContainer: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuText: { flex: 1, marginLeft: 15, color: '#333' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  
  sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
  sizeBtn: { backgroundColor: '#eee', padding: 10, borderRadius: 10, width: 50, alignItems: 'center' },
  sizeBtnText: { fontSize: 20, fontWeight: 'bold' },
  sampleText: { marginBottom: 20, textAlign: 'center' },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 20 },
  colorSwatch: { width: 50, height: 50, borderRadius: 25, borderColor: '#333' },

  radioRow: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  radioText: { fontSize: 16, marginLeft: 10 },

  closeBtn: { backgroundColor: '#006064', padding: 10, borderRadius: 10, marginTop: 10, width: '100%', alignItems: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});