import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import Icon from '../../components/icons/Icon';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';
import { TABLES } from '../../lib/constants';
import * as ttsService from '../../lib/ttsService';
import { useTheme } from '../../context/ThemeContext';

const CARD_WIDTH = (Dimensions.get('window').width - 54) / 2;

// ─── Sound Card ───────────────────────────────────────────────────────────────

function SoundCard({ item, delay, onPress }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, delay }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true, delay }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      cardStyles.wrapper,
      { transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }], opacity: opacityAnim },
    ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => Animated.spring(pressAnim, { toValue: 0.94, useNativeDriver: true, friction: 5 }).start()}
        onPressOut={() => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start()}
        onPress={onPress}
        style={{
          width: CARD_WIDTH, borderRadius: 16,
          backgroundColor: '#ffffff', padding: 12,
          justifyContent: 'flex-start',
        }}
      >
        {/* Category badge */}
        <View style={{ backgroundColor: colors.primary, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start' }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{item.category}</Text>
        </View>

        {/* IPA symbol */}
        <Text style={{ fontSize: 36, fontWeight: '900', textAlign: 'center', color: '#111', marginTop: 8, marginBottom: 2 }}>{item.ipa}</Text>

        {/* Spelling patterns */}
        <Text style={{ fontSize: 12, textAlign: 'center', color: '#333', marginBottom: 4 }}>{item.spellings}</Text>

        {/* Example word */}
        <Text style={{ fontSize: 13, textAlign: 'center', color: '#aaa', marginBottom: 10 }}>{item.word}</Text>

      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Category Filter Groups ─────────────────────────────────────────────────

const FILTER_GROUPS = [
  { label: 'Schwa',                    cats: ['Schwa'] },
  { label: 'Consonant',                cats: ['Consonant'] },
  { label: 'Short Vowel',              cats: ['Short Vowel'] },
  { label: 'Digraph',                  cats: ['Digraph'] },
  { label: 'Long Vowel',               cats: ['Long Vowel'] },
  { label: 'Vowels and r',             cats: ['Vowel and r'] },
  { label: 'Soft and Silent Consonant(s)', cats: ['Soft Consonant', 'Silent Consonant'] },
  { label: 'Other Vowel Teams',        cats: ['Other Vowel Teams'] },
];

const ALL_LABELS = FILTER_GROUPS.map(g => g.label);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PhonicsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [phonemes, setPhonemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set(ALL_LABELS));
  const [toast, setToast] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }, 2200);
  }, [toastAnim]);

  useEffect(() => {
    supabase
      .from(TABLES.PHONEME_REFERENCE)
      .select('key, category, ipa, spellings, word')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setPhonemes(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRefCardPress = useCallback((item) => {
    ttsService.speakPhonics(item.key);
    showToast(`${item.ipa} — ${item.word}`);
  }, [showToast]);

  const toggleFilter = useCallback((label) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }, []);

  const activeCats = new Set(
    FILTER_GROUPS.filter(g => selected.has(g.label)).flatMap(g => g.cats)
  );

  const visiblePhonemes = phonemes.filter(p => activeCats.has(p.category));

  return (
    <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>
      <View style={styles.blobTopRight} pointerEvents="none" />
      <View style={styles.blobBottomLeft} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Icon name="chevron-left" size={24} color="#3D3D3D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phonics</Text>
          <Text style={styles.headerMascot}>🔊</Text>
        </View>

        {/* Activities Button */}
        <View style={styles.activitiesSection}>
          <TouchableOpacity
            style={[styles.activitiesButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('PhonicsActivity')}
            activeOpacity={0.85}
          >
            <View style={styles.activitiesIcon}>
              <Text style={{ fontSize: 20 }}>🎮</Text>
            </View>
            <View style={styles.activitiesTextBlock}>
              <Text style={styles.activitiesTitle}>Phonics Activities</Text>
              <Text style={styles.activitiesSub}>Games · Quizzes · Stories</Text>
            </View>
            <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.60)" />
          </TouchableOpacity>
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>All Sound Patterns</Text>

        {/* Category Filter */}
        <View style={styles.filterHeader}>
          <Text style={styles.filterLabel}>Filter by category:</Text>
          <View style={styles.filterChips}>
            {FILTER_GROUPS.map(g => {
              const on = selected.has(g.label);
              return (
                <TouchableOpacity
                  key={g.label}
                  onPress={() => toggleFilter(g.label)}
                  activeOpacity={0.75}
                  style={[styles.chip, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                >
                  {on && <Text style={styles.chipCheck}>✓ </Text>}
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{g.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reference Grid — filtered phonemes */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
        <View style={styles.grid}>
          {visiblePhonemes.map((item, i) => (
            <SoundCard
              key={item.key}
              item={item}
              delay={i * 20}
              onPress={() => handleRefCardPress(item)}
            />
          ))}
          {visiblePhonemes.length === 0 && (
            <Text style={{ color: '#bbb', fontSize: 13, marginTop: 12, marginLeft: 4 }}>No categories selected.</Text>
          )}
        </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Toast */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
          },
        ]}
      >
        <Text style={styles.toastText}>{toast}</Text>
      </Animated.View>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  blobTopRight: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#FFD6E0', opacity: 0.55,
  },
  blobBottomLeft: {
    position: 'absolute', bottom: 80, left: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: '#D4F0FF', opacity: 0.50,
  },
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backButton: {
    width: 42, height: 42, backgroundColor: '#fff', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10, shadowRadius: 6,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#3D3D3D' },
  headerMascot: { fontSize: 30 },
  activitiesSection: { paddingHorizontal: 20, marginBottom: 20 },
  activitiesButton: {
    backgroundColor: '#555', borderRadius: 18,
    paddingVertical: 15, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8,
  },
  activitiesIcon: {
    width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 11, justifyContent: 'center', alignItems: 'center',
  },
  activitiesTextBlock: { flex: 1 },
  activitiesTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  activitiesSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 1 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#aaa', letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: 14, marginLeft: 20,
  },
  filterHeader: { paddingHorizontal: 20, marginBottom: 16 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 8 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#CCC', backgroundColor: '#F5F5F5',
  },
  chipOn: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#777' },
  chipTextOn: { color: '#fff' },
  chipCheck: { fontSize: 12, fontWeight: '700', color: '#fff' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 14,
  },
  toast: {
    position: 'absolute', bottom: 32, alignSelf: 'center',
    backgroundColor: '#3D3D3D', borderRadius: 40,
    paddingHorizontal: 22, paddingVertical: 12,
    elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 10,
    maxWidth: '85%', zIndex: 100,
  },
  toastText: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
});

const cardStyles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 14,
  },
  card: {
    width: CARD_WIDTH,
    height: 170,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  letter: {
    fontSize: 72,
    fontWeight: '900',
    color: '#888',
    marginBottom: 12,
  },
  speakerCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});