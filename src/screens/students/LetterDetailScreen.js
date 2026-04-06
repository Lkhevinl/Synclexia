import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import Icon from '../../components/icons/Icon';
import ScreenWrapper from '../../components/ScreenWrapper';

const { width: SCREEN_W } = Dimensions.get('window');

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';

async function playElevenLabsTTS(text) {
  if (!ELEVENLABS_API_KEY) return false;
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.35, similarity_boost: 0.60, style: 0.55, use_speaker_boost: false },
        }),
      }
    );
    if (!response.ok) return false;
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const { sound } = await Audio.Sound.createAsync(
            { uri: `data:audio/mp3;base64,${base64}` },
            { shouldPlay: true, rate: 0.92 }
          );
          await sound.playAsync();
          resolve(true);
        } catch (e) { reject(e); }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return false;
  }
}

const TABS = ['story', 'action', 'trace', 'song'];

const TAB_COLORS = {
  story:  { bg: '#DBEAFE', active: '#2563EB', text: '#1E3A5F' },
  action: { bg: '#DCFCE7', active: '#16A34A', text: '#14532D' },
  trace:  { bg: '#FEF9C3', active: '#CA8A04', text: '#713F12' },
  song:   { bg: '#F3E8FF', active: '#7C3AED', text: '#3B0764' },
};

export default function LetterDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item, allLetters, currentIndex } = route.params;

  const [tab, setTab] = useState('story');
  const [playing, setPlaying] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(false);
  const pressAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const tabAnim = useRef(new Animated.Value(1)).current;

  const totalLetters = allLetters?.length ?? 1;
  const idx = currentIndex ?? 0;

  useEffect(() => {
    return () => Speech.stop();
  }, []);

  const handleSoundPress = async () => {
    if (playing) return;
    setPlaying(true);
    setSoundFeedback(true);
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 600, useNativeDriver: true, delay: 300 }),
    ]).start();

    const text = `${item.story} ... ${item.sound}! Your turn!`;
    const ok = await playElevenLabsTTS(text);
    if (!ok) Speech.speak(item.sound || item.letter, { rate: 0.85, pitch: 1.1 });

    setTimeout(() => {
      setPlaying(false);
      setSoundFeedback(false);
    }, 1200);
  };

  const handleTabChange = (t) => {
    Animated.sequence([
      Animated.timing(tabAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(tabAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setTab(t);
  };

  const handleNext = () => {
    if (!allLetters || idx + 1 >= totalLetters) return;
    navigation.replace('LetterDetail', {
      item: allLetters[idx + 1],
      allLetters,
      currentIndex: idx + 1,
    });
  };

  const handlePrev = () => {
    if (!allLetters || idx <= 0) return;
    navigation.replace('LetterDetail', {
      item: allLetters[idx - 1],
      allLetters,
      currentIndex: idx - 1,
    });
  };

  const feedbackScale = feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  const activeColors = TAB_COLORS[tab];

  return (
    <ScreenWrapper role="student" padded={false} style={{ backgroundColor: '#EFF6FF' }}>
      {/* ── Top Nav ── */}
      <View style={s.topNav}>
        <TouchableOpacity style={s.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Icon name="chevron-left" size={22} color="#374151" />
        </TouchableOpacity>

        {/* Progress dots */}
        <View style={s.progressCol}>
          <View style={s.dotsRow}>
            {(allLetters ?? [item]).map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  i === idx ? s.dotActive : s.dotInactive,
                  i === idx && { width: 28 },
                ]}
              />
            ))}
          </View>
          <View style={s.groupBadge}>
            <Text style={s.groupBadgeText}>Group 1: s, a, t, i, p, n</Text>
          </View>
        </View>

        {/* Placeholder to balance layout */}
        <View style={s.navBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.content}>

          {/* ── Main Layout ── */}
          <View style={s.mainRow}>

            {/* Left: Letter Block */}
            <View style={[s.letterBlock, { borderBottomColor: item.borderColor ?? '#FCD34D' }]}>
              <Text style={[s.bigLetter, { color: '#1F2937' }]}>{item.letter}</Text>

              <Animated.View style={{ transform: [{ scale: feedbackScale }] }}>
                <TouchableOpacity
                  style={[s.soundBtn, { backgroundColor: item.color ?? '#E53935', shadowColor: item.borderColor ?? '#B91C1C' }]}
                  onPress={handleSoundPress}
                  activeOpacity={0.85}
                >
                  {playing ? (
                    <ActivityIndicator size="large" color="#fff" />
                  ) : (
                    <Icon name="volume-2" size={36} color="#fff" />
                  )}
                </TouchableOpacity>
              </Animated.View>

              <Text style={s.soundHint}>Tap to hear sound</Text>

              {soundFeedback && (
                <Text style={[s.soundFeedbackText, { color: item.color ?? '#E53935' }]}>
                  "{item.sound}"
                </Text>
              )}
            </View>

            {/* Right: Tabs + Content (on wider screens) — collapses to bottom on narrow */}
          </View>

          {/* ── Tab Bar ── */}
          <View style={s.tabBar}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.tabBtn, tab === t && { backgroundColor: TAB_COLORS[t].active }]}
                onPress={() => handleTabChange(t)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabText, tab === t ? s.tabTextActive : s.tabTextInactive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Tab Content ── */}
          <Animated.View style={[s.contentCard, { transform: [{ scale: tabAnim }] }]}>

            {/* Story */}
            {tab === 'story' && (
              <View style={s.tabPane}>
                <Text style={[s.storyTitle, { color: TAB_COLORS.story.active }]}>
                  {item.storyTitle ?? 'The Sound Story'}
                </Text>
                <View style={s.divider} />
                <Text style={s.storyBody}>
                  {item.story ?? `Listen carefully for the sound of the letter ${item.letter.toUpperCase()}!`}
                </Text>
                <TouchableOpacity
                  style={[s.listenBtn, { backgroundColor: TAB_COLORS.story.active, shadowColor: TAB_COLORS.story.active }]}
                  onPress={handleSoundPress}
                  activeOpacity={0.85}
                >
                  <Icon name="volume-2" size={20} color="#fff" />
                  <Text style={s.listenBtnText}>Read Story Aloud</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action */}
            {tab === 'action' && (
              <View style={s.tabPane}>
                <Text style={[s.actionTitle, { color: TAB_COLORS.action.active }]}>Action</Text>
                <View style={s.divider} />
                <View style={[s.actionCircle, { borderColor: TAB_COLORS.action.active + '40', backgroundColor: TAB_COLORS.action.bg }]}>
                  <Icon name="hand" size={64} color={TAB_COLORS.action.active} />
                </View>
                <Text style={s.actionBody}>
                  {item.action ?? `Make the action for the sound "${item.sound ?? item.letter}" and say it out loud.`}
                </Text>
              </View>
            )}

            {/* Trace */}
            {tab === 'trace' && (
              <View style={s.tabPane}>
                <Text style={[s.traceTitle, { color: TAB_COLORS.trace.active }]}>Trace the Letter</Text>
                <View style={s.divider} />
                <View style={s.traceBox}>
                  <Text style={s.traceGuide}>{item.letter}</Text>
                  <Text style={s.traceHint}>Trace the letter with your finger</Text>
                </View>
                <View style={s.traceArrows}>
                  <Icon name="move" size={20} color="#9CA3AF" />
                  <Text style={s.traceArrowText}>Follow the direction of the arrows</Text>
                </View>
              </View>
            )}

            {/* Song */}
            {tab === 'song' && (
              <View style={s.tabPane}>
                <Text style={[s.songTitle, { color: TAB_COLORS.song.active }]}>Jolly Song</Text>
                <View style={s.divider} />
                <View style={[s.songLyrics, { borderColor: TAB_COLORS.song.active + '30', backgroundColor: TAB_COLORS.song.bg }]}>
                  <Text style={[s.songText, { color: TAB_COLORS.song.text }]}>
                    {item.song ?? `"${item.letter.toUpperCase()}, ${item.letter.toUpperCase()}, what do you say?\nI say ${item.sound ?? item.letter} every day!\nLet's all learn the sounds we know,\nReady, set, go!"`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.playSongBtn, { backgroundColor: TAB_COLORS.song.active, shadowColor: TAB_COLORS.song.active }]}
                  onPress={() => Speech.speak(
                    item.song ?? `${item.sound ?? item.letter}! ${item.sound ?? item.letter}! ${item.sound ?? item.letter}!`,
                    { rate: 0.75, pitch: 1.15 }
                  )}
                  activeOpacity={0.85}
                >
                  <Icon name="play" size={20} color="#fff" />
                  <Text style={s.playSongBtnText}>Play Song</Text>
                </TouchableOpacity>
              </View>
            )}

          </Animated.View>

          {/* ── Bottom Navigation ── */}
          <View style={s.bottomNav}>
            <TouchableOpacity
              style={[s.prevBtn, idx <= 0 && s.btnDisabled]}
              onPress={handlePrev}
              disabled={idx <= 0}
              activeOpacity={0.8}
            >
              <Icon name="chevron-left" size={20} color={idx <= 0 ? '#D1D5DB' : '#374151'} />
              <Text style={[s.prevBtnText, idx <= 0 && s.btnDisabledText]}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.nextBtn,
                { backgroundColor: '#16A34A', shadowColor: '#15803D' },
                (!allLetters || idx + 1 >= totalLetters) && s.btnDisabled,
              ]}
              onPress={handleNext}
              disabled={!allLetters || idx + 1 >= totalLetters}
              activeOpacity={0.85}
            >
              <Text style={s.nextBtnText}>Next Letter</Text>
              <Icon name="chevron-right" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  // Top nav
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  navBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressCol: { alignItems: 'center', gap: 6 },
  dotsRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#FBBF24' },
  dotInactive: { width: 10, backgroundColor: '#D1D5DB' },
  groupBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  groupBadgeText: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },

  // Main layout
  content: { paddingHorizontal: 16, paddingTop: 8 },
  mainRow: { alignItems: 'center', marginBottom: 20 },

  // Letter block
  letterBlock: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderBottomWidth: 10,
    marginBottom: 4,
  },
  bigLetter: {
    fontSize: 120,
    fontWeight: 'bold',
    lineHeight: 130,
    letterSpacing: -4,
    marginBottom: 20,
  },
  soundBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  soundHint: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  soundFeedbackText: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 28,
    padding: 6,
    gap: 4,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '800' },
  tabTextActive: { color: '#fff' },
  tabTextInactive: { color: '#6B7280' },

  // Content card
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 36,
    padding: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
    minHeight: 300,
    borderWidth: 2,
    borderColor: '#fff',
  },
  tabPane: { alignItems: 'center' },
  divider: { width: '40%', height: 3, borderRadius: 2, backgroundColor: '#F3F4F6', marginBottom: 20, marginTop: 6 },

  // Story tab
  storyTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  storyBody: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 24,
  },
  listenBtn: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  listenBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Action tab
  actionTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  actionCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionBody: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },

  // Trace tab
  traceTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  traceBox: {
    width: '100%',
    height: 200,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  traceGuide: {
    fontSize: 140,
    fontWeight: 'bold',
    color: '#E5E7EB',
    position: 'absolute',
  },
  traceHint: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '700',
    zIndex: 1,
  },
  traceArrows: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  traceArrowText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },

  // Song tab
  songTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  songLyrics: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 4,
    padding: 24,
    marginBottom: 20,
  },
  songText: { fontSize: 18, fontStyle: 'italic', lineHeight: 30, textAlign: 'center', fontWeight: '600' },
  playSongBtn: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  playSongBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },

  // Bottom navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  prevBtnText: { fontSize: 18, fontWeight: '700', color: '#374151' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderBottomWidth: 6,
  },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  btnDisabled: { opacity: 0.35 },
  btnDisabledText: { color: '#D1D5DB' },
});
