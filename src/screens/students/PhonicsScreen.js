import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, StatusBar } from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import { checkQuestProgress } from '../../lib/questHelper';
import { logSession } from '../../lib/analyticsHelper';
import { useAuth } from '../../context/AuthContext';

// Helper for colors
const getGradientColors = (hexColor) => {
  if (!hexColor) return ['#4FC3F7', '#0288D1'];
  
  const c = hexColor.toLowerCase();
  if (c.includes('f44336')) return ['#FF8A80', '#D32F2F'];
  if (c.includes('e91e63')) return ['#FF80AB', '#C2185B'];
  if (c.includes('9c27b0')) return ['#EA80FC', '#7B1FA2'];
  if (c.includes('2196f3')) return ['#82B1FF', '#1976D2'];
  if (c.includes('4caf50')) return ['#B9F6CA', '#388E3C'];
  if (c.includes('ffeb3b')) return ['#FFFF8D', '#FBC02D'];
  if (c.includes('ff9800')) return ['#FFD180', '#F57C00'];
  
  return [hexColor, hexColor];
};

export default function PhonicsScreen({ navigation }) {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Throttle logging — at most one session every 60 s to prevent XP farming
  const lastLogRef = React.useRef(0);
  const tapCountRef = React.useRef(0);

  useEffect(() => {
    fetchPhonics();
  }, []);

  const fetchPhonics = async () => {
    try {
        const { data } = await supabase.from('phonics_items').select('*').order('label');
        if (data) setItems(data);
    } catch (e) {
        // Failed to load phonics items
    } finally {
        setLoading(false);
    }
  };

  const handlePlay = (text) => {
    Speech.speak(text, { rate: 0.9, pitch: 1.1 });
    if (profile?.id) {
        checkQuestProgress(profile.id, 'Phonics');
        checkQuestProgress(profile.id, 'Practice');
        tapCountRef.current += 1;
        const now = Date.now();
        // Log a batch session every 60 seconds (score = taps since last log)
        if (now - lastLogRef.current >= 60000) {
          logSession({ studentId: profile.id, activityType: 'phonics', score: tapCountRef.current, total: tapCountRef.current, details: { label: text } });
          lastLogRef.current = now;
          tapCountRef.current = 0;
        }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        
        <GoBackBtn />
        
        <View style={styles.headerContainer}>
           <Text style={styles.header}>Phonics Fun 🗣️</Text>
           <Text style={styles.subHeader}>Tap a card to hear the sound!</Text>
           <TouchableOpacity
             style={styles.activitiesBtn}
             onPress={() => navigation.navigate('PhonicsActivity')}
             activeOpacity={0.8}
           >
             <Ionicons name="game-controller-outline" size={20} color="#fff" />
             <Text style={styles.activitiesBtnText}>Phonics Activities 🎮</Text>
           </TouchableOpacity>
        </View>
        
        {loading ? (
            <ActivityIndicator size="large" color="#FF9800" style={{marginTop: 50}} />
        ) : (
            <FlatList 
              data={items}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({item}) => {
                const gradientColors = getGradientColors(item.bg_color);

                return (
                  <TouchableOpacity 
                    style={styles.cardContainer} 
                    onPress={() => handlePlay(item.label)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={gradientColors}
                      style={styles.cardGradient}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.icon}>{item.icon}</Text>
                      <Text style={styles.label}>{item.label}</Text>
                      
                      {/* Glossy shine overlay */}
                      <View style={styles.shine} />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }}
            />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F0F4F8' },
  safeArea: { flex: 1 },
  
  headerContainer: { alignItems: 'center', marginTop: 10, marginBottom: 20, paddingTop: 60 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#37474F', letterSpacing: 1 },
  subHeader: { fontSize: 16, color: '#78909C', marginTop: 5, marginBottom: 12 },
  activitiesBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FF9800', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 },
  activitiesBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  listContent: { paddingBottom: 40, paddingHorizontal: 20 },
  columnWrapper: { justifyContent: 'space-between' },

  cardContainer: { 
    width: '47%', 
    aspectRatio: 1, 
    marginBottom: 20, 
    borderRadius: 25, 
    elevation: 8,
    boxShadow: '0px 4px 5px rgba(0,0,0,0.2)',
  },
  
  cardGradient: { 
    flex: 1, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden' // Keeps the shine inside
  },
  
  icon: { fontSize: 50, marginBottom: 10, textShadow: 'rgba(0,0,0,0.1) 0px 0px 4px' },
  label: { fontSize: 22, fontWeight: 'bold', color: '#fff', textShadow: 'rgba(0,0,0,0.2) 0px 0px 2px' },
  
  shine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '40%',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
  }
});