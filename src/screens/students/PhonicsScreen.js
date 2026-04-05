import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from '../../components/icons/Icon';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { logSession } from '../../lib/analyticsHelper';
import ScreenWrapper from '../../components/ScreenWrapper';
import StudentCard from '../../components/student/StudentCard';
import StudentButton from '../../components/student/StudentButton';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import c from '../../components/student/candyTokens';

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

export default function PhonicsScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { colors } = useTheme();
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
      const { data, error } = await supabase.from('phonics_items').select('*').order('label');
      if (error) console.warn('[PhonicsScreen] fetch error:', error.message);
      if (data) setItems(data);
    } catch (e) {
      console.warn('[PhonicsScreen] fetchPhonics failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (item) => {
    Speech.speak(item.label, { rate: 0.9, pitch: 1.1 });
    if (profile?.id) {
      tapCountRef.current += 1;
      const now = Date.now();
      // Log a batch session every 60 seconds (score = taps since last log)
      if (now - lastLogRef.current >= 60000) {
        logSession({ studentId: profile.id, activityType: 'phonics', score: tapCountRef.current, total: tapCountRef.current, details: { label: item.label } });
        lastLogRef.current = now;
        tapCountRef.current = 0;
      }
    }
  };

  return (
    <ScreenWrapper role="student" padded={false} edges={['left','right','bottom']} style={{ backgroundColor: colors.surface }}>
      <View style={{ paddingHorizontal: 16 }}>
        <StudentPageHeader title="Phonics" />
        <StudentCard variant="tinted" style={styles.hintCard}>
          <View style={styles.hintRow}>
            <Icon name="info" size="md" color={c.primary} />
            <Text style={styles.hintText}>
              <Text style={{ fontWeight: 'bold' }}>How to use: </Text>
              Tap any card to hear the sound! Use "Phonics Activities" to play interactive games.
            </Text>
          </View>
        </StudentCard>
        <StudentButton
          variant="primary"
          onPress={() => navigation.navigate('PhonicsActivity')}
          style={styles.activitiesBtn}
        >
          <Icon name="gamepad-2" size="md" color="#fff" />
          <Text style={styles.activitiesBtnText}>Phonics Activities</Text>
        </StudentButton>
      </View>
        
        {loading ? (
        <ActivityIndicator size="large" color={c.primary} style={{ margin: 40 }} />
      ) : items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="mic" size="xl" color="#9575CD" />
              <Text style={styles.emptyTitle}>No phonics items yet</Text>
              <Text style={styles.emptyHint}>Ask your teacher to add phonics cards!</Text>
            </View>
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
                    style={[styles.card, { backgroundColor: gradientColors[0], borderRadius: 25, elevation: 8, shadowColor: gradientColors[0], shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:8 }]}
                    onPress={() => handlePress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardInner}>
                      <Icon name={item.icon || 'mic'} size={80} color="#fff" />
                      <Text style={{ fontSize: 48, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#fff' }}>{item.label}</Text>
                      <Icon name="volume-2" size={28} color="rgba(255,255,255,0.8)" />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
        )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hintCard: { marginBottom: 12 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  hintText: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 19 },
  activitiesBtn: { marginBottom: 16, alignSelf: 'stretch' },
  activitiesBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  listContent: { paddingBottom: 40, paddingHorizontal: 20 },
  columnWrapper: { justifyContent: 'space-between' },
  card: { 
    width: '47%', 
    aspectRatio: 1, 
    marginBottom: 20, 
    borderRadius: 25, 
    elevation: 8,
    shadowColor: c.primary,
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.25,
    shadowRadius:8,
  },
  cardInner: { 
    flex: 1, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden' // Keeps the shine inside
  },
  cardLetter: { fontSize: 50, marginBottom: 10, textShadow: 'rgba(0,0,0,0.1) 0px 0px 4px' },
  cardPhonetic: { fontSize: 22, fontWeight: 'bold', color: '#fff', textShadow: 'rgba(0,0,0,0.2) 0px 0px 2px' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: { marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#37474F', marginBottom: 8 },
  emptyHint:  { fontSize: 14, color: '#78909C', textAlign: 'center', lineHeight: 20 },
});