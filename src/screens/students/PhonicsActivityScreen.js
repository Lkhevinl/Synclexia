import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import * as Speech from 'expo-speech';
import Icon from '../../components/icons/Icon';
import ScreenWrapper from '../../components/ScreenWrapper';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import c from '../../components/student/candyTokens';
import { logSession } from '../../lib/analyticsHelper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ─── DB Fetch ─────────────────────────────────────────────────────────────────

const fetchActivityContent = async (gameType) => {
  const { data, error } = await supabase
    .from('phonics_activity_content')
    .select('id, data')
    .eq('game_type', gameType)
    .eq('is_active', true);
  if (error || !data) return [];
  return data.map(row => ({ id: row.id, ...row.data }));
};

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AnimatedCard({ children, style, onPress, delay = 0 }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, delay }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true, delay }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, { toValue: 0.95, useNativeDriver: true, friction: 5 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }], opacity: opacityAnim }]}>
      <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1} style={{ flex: 1 }}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Jolly Phonics group colors
const JP_GROUPS = [
  { letters: ['s','a','t','i','p','n'], color: '#E53935', light: '#FFEBEE', name: 'Group 1' },
  { letters: ['c','k','e','h','r','m','d'], color: '#FB8C00', light: '#FFF3E0', name: 'Group 2' },
  { letters: ['g','o','u','l','f','b'], color: '#FFD600', light: '#FFFDE7', name: 'Group 3' },
  { letters: ['ai','j','oa','ie','ee','or'], color: '#43A047', light: '#E8F5E9', name: 'Group 4' },
  { letters: ['z','w','ng','v','oo','oo'], color: '#1E88E5', light: '#E3F2FD', name: 'Group 5' },
  { letters: ['y','x','ch','sh','th','th'], color: '#8E24AA', light: '#F3E5F5', name: 'Group 6' },
  { letters: ['qu','ou','oi','ue','er','ar'], color: '#00897B', light: '#E0F2F1', name: 'Group 7' },
];

function JollyLetterTile({ letter, groupIdx, delay = 0 }) {
  const group = JP_GROUPS[groupIdx % JP_GROUPS.length];
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 5, delay }).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ scale: anim }], opacity: anim }}>
      <View style={[ms.jollyTile, { backgroundColor: group.color, shadowColor: group.color }]}>
        <Text style={ms.jollyTileLetter}>{letter}</Text>
      </View>
    </Animated.View>
  );
}

function ModeSelector({ onSelect }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const modes = [
    { 
      id: 'blend',   
      label: 'Blend It!',        
      emoji: '🔗',
      color: '#E53935', 
      light: '#FFEBEE',
      desc: 'Put sounds together', 
      letter: 'B',
      skill: 'Blending'
    },
    { 
      id: 'rhyme',   
      label: 'Rhyme Time!',       
      emoji: '🎵',
      color: '#FB8C00', 
      light: '#FFF3E0',
      desc: 'Find rhyming words', 
      letter: 'R',
      skill: 'Rhyming'
    },
    { 
      id: 'segment', 
      label: 'Sound Count!', 
      emoji: '🥁',
      color: '#FFD600', 
      light: '#FFFDE7',
      desc: 'Count the sounds!', 
      letter: 'S',
      skill: 'Segmenting',
      textColor: '#5D4037',
    },
    { 
      id: 'sounds', 
      label: 'Sound Match!', 
      emoji: '👂',
      color: '#43A047', 
      light: '#E8F5E9',
      desc: 'Match sounds to letters', 
      letter: 'M',
      skill: 'Hearing Sounds'
    },
    { 
      id: 'build', 
      label: 'Word Builder!', 
      emoji: '🧱',
      color: '#1E88E5', 
      light: '#E3F2FD',
      desc: 'Build words with blocks', 
      letter: 'W',
      skill: 'Spelling'
    },
    { 
      id: 'tricky', 
      label: 'Tricky Words!', 
      emoji: '⚡',
      color: '#8E24AA', 
      light: '#F3E5F5',
      desc: 'Words that break rules!', 
      letter: 'T',
      skill: 'Sight Words'
    },
  ];

  // Sample letters for the animated ticker
  const tickerLetters = ['s','a','t','i','p','n','c','k','e','h','r','m'];

  return (
    <ScrollView contentContainerStyle={ms.container} showsVerticalScrollIndicator={false}>

      {/* ── Jolly Phonics Header ── */}
      <Animated.View style={{ transform: [{ scale: headerAnim }], opacity: headerAnim, marginBottom: 18 }}>
        <LinearGradient colors={['#E53935','#FB8C00','#FFD600','#43A047','#1E88E5','#8E24AA']} start={{x:0,y:0}} end={{x:1,y:0}} style={ms.rainbowBanner}>
          <Text style={ms.bannerTitle}>🎉 Jolly Phonics! 🎉</Text>
          <Text style={ms.bannerSub}>Learn sounds the fun way!</Text>
        </LinearGradient>
      </Animated.View>

      {/* ── Letter Tiles Row ── */}
      <View style={ms.letterRow}>
        {tickerLetters.map((lt, i) => (
          <JollyLetterTile key={i} letter={lt} groupIdx={i} delay={i * 50} />
        ))}
      </View>

      {/* ── Section Label ── */}
      <View style={ms.sectionHeader}>
        <Text style={ms.sectionTitle}>🎮 Choose Your Game</Text>
      </View>

      {/* ── Activity Cards Grid ── */}
      <View style={ms.grid}>
        {modes.map((m, index) => (
          <AnimatedCard key={m.id} style={ms.cardWrapper} onPress={() => onSelect(m.id)} delay={200 + index * 80}>
            <View style={[ms.jollyCard, { borderColor: m.color, backgroundColor: m.light }]}>
              {/* Top stripe */}
              <View style={[ms.cardStripe, { backgroundColor: m.color }]}>
                <Text style={[ms.cardBigLetter, { color: m.textColor || '#fff' }]}>{m.letter}</Text>
              </View>
              {/* Card body */}
              <View style={ms.jollyCardBody}>
                <Text style={ms.cardEmojiBig}>{m.emoji}</Text>
                <Text style={[ms.jollyCardLabel, { color: m.color }]}>{m.label}</Text>
                <View style={[ms.jollySkillTag, { backgroundColor: m.color }]}>
                  <Text style={ms.jollySkillTagText}>{m.skill}</Text>
                </View>
                <Text style={ms.jollyCardDesc}>{m.desc}</Text>
              </View>
              {/* Play button */}
              <View style={[ms.jollyPlayBtn, { backgroundColor: m.color }]}>
                <Text style={ms.jollyPlayBtnText}>▶ PLAY</Text>
              </View>
            </View>
          </AnimatedCard>
        ))}
      </View>

      {/* ── Phonics Groups Reference ── */}
      <View style={ms.groupsCard}>
        <Text style={ms.groupsTitle}>📚 Jolly Phonics Groups</Text>
        {JP_GROUPS.slice(0, 4).map((g, i) => (
          <View key={i} style={ms.groupRow}>
            <View style={[ms.groupDot, { backgroundColor: g.color }]} />
            <Text style={ms.groupName}>{g.name}:</Text>
            <Text style={ms.groupLetters}>{g.letters.join('  ')}</Text>
          </View>
        ))}
      </View>

      {/* ── Tip ── */}
      <View style={ms.tipsCard}>
        <Text style={ms.tipsEmoji}>💡</Text>
        <Text style={ms.tipsText}>
          <Text style={{ fontWeight: 'bold' }}>Jolly Tip: </Text>
          Say each sound out loud and use the actions!
        </Text>
      </View>
    </ScrollView>
  );
}

const ms = StyleSheet.create({
  container: { padding: 14, paddingTop: 16, paddingBottom: 40 },
  // Rainbow banner
  rainbowBanner: { borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  bannerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.95)', marginTop: 4, fontWeight: '600' },
  // Letter tiles row
  letterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 },
  jollyTile: { width: 38, height: 42, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
  jollyTileLetter: { fontSize: 20, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  // Section header
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  // Game cards grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 20 },
  cardWrapper: { width: '47%', borderRadius: 18, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 6 },
  jollyCard: { borderRadius: 18, borderWidth: 3, overflow: 'hidden' },
  cardStripe: { paddingVertical: 10, alignItems: 'center' },
  cardBigLetter: { fontSize: 36, fontWeight: 'bold', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  jollyCardBody: { padding: 12, alignItems: 'center' },
  cardEmojiBig: { fontSize: 28, marginBottom: 4 },
  jollyCardLabel: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  jollySkillTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  jollySkillTagText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  jollyCardDesc: { fontSize: 11, color: '#546E7A', textAlign: 'center', lineHeight: 14 },
  jollyPlayBtn: { marginHorizontal: 12, marginBottom: 12, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  jollyPlayBtnText: { fontSize: 14, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  // Phonics groups reference
  groupsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#ECEFF1' },
  groupsTitle: { fontSize: 15, fontWeight: 'bold', color: '#37474F', marginBottom: 10 },
  groupRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  groupDot: { width: 12, height: 12, borderRadius: 6 },
  groupName: { fontSize: 12, fontWeight: '700', color: '#37474F', width: 60 },
  groupLetters: { fontSize: 12, color: '#546E7A', flex: 1, letterSpacing: 1 },
  // Tip
  tipsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDE7', borderRadius: 14, padding: 14, gap: 10, borderWidth: 2, borderColor: '#FFD600' },
  tipsEmoji: { fontSize: 22 },
  tipsText: { flex: 1, fontSize: 12, color: '#795548', lineHeight: 17 },
});

// ─── Blend It Game ─────────────────────────────────────────────────────────────

function EmptyContent({ label, color, onBack }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#FAFAFA' }}>
      <Text style={{ fontSize: 72, marginBottom: 16 }}>📭</Text>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#37474F', textAlign: 'center', marginBottom: 8 }}>{label}</Text>
      <Text style={{ fontSize: 14, color: '#78909C', textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>{'No activities yet.\nAsk your teacher to add content!'}</Text>
      <TouchableOpacity style={{ backgroundColor: color, borderRadius: 18, paddingHorizontal: 36, paddingVertical: 14, elevation: 4, shadowColor: color, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 }} onPress={onBack}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 1 }}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

function BlendGame({ onBack, userId, items }) {
  const words = useState(() => shuffleArr(items))[0];
  const [idx, setIdx] = useState(0);
  const [tappedPhonemes, setTappedPhonemes] = useState([]);
  const [activePhonemeIndex, setActivePhonemeIndex] = useState(null);
  const [blended, setBlended] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const speechRunIdRef = useRef(0);

  const current = words[idx];

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const stopSpeech = () => {
    speechRunIdRef.current += 1;
    Speech.stop();
    setActivePhonemeIndex(null);
  };

  const speakWithHighlight = (phoneme, phonemeIndex, opts = {}) => {
    stopSpeech();
    const runId = speechRunIdRef.current;
    setActivePhonemeIndex(phonemeIndex);
    Speech.speak(phoneme, {
      rate: 0.8,
      pitch: 1.1,
      ...opts,
      onDone: () => {
        if (runId !== speechRunIdRef.current) return;
        setActivePhonemeIndex(null);
        opts.onDone?.();
      },
      onStopped: () => {
        if (runId !== speechRunIdRef.current) return;
        setActivePhonemeIndex(null);
        opts.onStopped?.();
      },
      onError: (e) => {
        if (runId !== speechRunIdRef.current) return;
        setActivePhonemeIndex(null);
        opts.onError?.(e);
      },
    });
  };

  const speakPhonemeSequenceThenWord = (phonemes, word) => {
    stopSpeech();
    const runId = speechRunIdRef.current;

    const speakNext = (i) => {
      if (runId !== speechRunIdRef.current) return;
      if (i >= phonemes.length) {
        setActivePhonemeIndex(null);
        Speech.speak(word, {
          rate: 0.75,
          pitch: 1.1,
          onDone: () => {
            if (runId !== speechRunIdRef.current) return;
            setActivePhonemeIndex(null);
          },
          onStopped: () => {
            if (runId !== speechRunIdRef.current) return;
            setActivePhonemeIndex(null);
          },
          onError: () => {
            if (runId !== speechRunIdRef.current) return;
            setActivePhonemeIndex(null);
          },
        });
        return;
      }

      const phoneme = phonemes[i];
      setActivePhonemeIndex(i);
      Speech.speak(phoneme, {
        rate: 0.8,
        pitch: 1.1,
        onDone: () => speakNext(i + 1),
        onStopped: () => {
          if (runId !== speechRunIdRef.current) return;
          setActivePhonemeIndex(null);
        },
        onError: () => {
          if (runId !== speechRunIdRef.current) return;
          setActivePhonemeIndex(null);
        },
      });
    };

    speakNext(0);
  };

  const speakPhoneme = (ph, phonemeIndex) => {
    speakWithHighlight(ph, phonemeIndex);
    if (!tappedPhonemes.includes(phonemeIndex)) {
      setTappedPhonemes(prev => [...prev, phonemeIndex]);
    }
  };

  const handleBlend = () => {
    if (tappedPhonemes.length < current.phonemes.length) {
      // Shake reminder
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      Speech.speak('Tap each sound first!', { rate: 0.9 });
      return;
    }
    // Phoneme-synced playback: highlight each phoneme as it is spoken, then speak the whole word.
    speakPhonemeSequenceThenWord(current.phonemes, current.word);
    setBlended(true);
    setScore(s => s + 1);
  };

  const handleNext = () => {
    stopSpeech();
    if (idx + 1 >= words.length) {
      // Log session when game finishes
      if (userId) logSession({ studentId: userId, activityType: 'phonics_blend', score, total: words.length, details: { game: 'Blend It' } });
      setFinished(true);
      return;
    }
    setIdx(i => i + 1);
    setTappedPhonemes([]);
    setActivePhonemeIndex(null);
    setBlended(false);
  };

  if (!words.length) return <EmptyContent label="Blend It!" color="#E53935" onBack={onBack} />;
  if (finished) return <ScoreScreen score={score} total={words.length} onBack={onBack} label="Blend It!" color="#E53935" />;

  const speakInstruction = () => {
    Speech.speak('Tap each sound, then BLEND!', { rate: 0.85 });
  };

  return (
    <View style={bg.container}>
      <StudentPageHeader
        title="Blend It!"
        onBack={onBack}
        right={
          <TouchableOpacity onPress={speakInstruction} style={bg.helpBtn}>
            <Icon name="help-circle" size="md" color={c.primary} />
          </TouchableOpacity>
        }
      />

      <View style={bg.card}>
        <Text style={bg.emoji}>{current.emoji}</Text>
        <Text style={bg.instruction}>Tap each sound, then BLEND!</Text>

        <View style={bg.phonemeRow}>
          {current.phonemes.map((ph, i) => {
            const tapped = tappedPhonemes.includes(i);
            const active = activePhonemeIndex === i;
            return (
              <TouchableOpacity
                key={i}
                style={[bg.phonemeTile, active && bg.phonemeTileActive, tapped && bg.phonemeTileTapped, active && tapped && bg.phonemeTileActiveTapped]}
                onPress={() => speakPhoneme(ph, i)}
                activeOpacity={0.7}
              >
                <Text style={[bg.phonemeText, active && bg.phonemeTextActive, tapped && bg.phonemeTextTapped]}>/{ph}/</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <TouchableOpacity style={[bg.blendBtn, blended && bg.blendBtnDone]} onPress={blended ? handleNext : handleBlend} activeOpacity={0.8}>
            <Text style={bg.blendBtnText}>{blended ? `"${current.word}"  →  Next` : 'BLEND!'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const bg = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFEBEE' },
  helpBtn: { padding: 6, backgroundColor: 'rgba(229,57,53,0.15)', borderRadius: 20 },
  card: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 6, borderWidth: 2, borderColor: '#E53935' },
  emoji: { fontSize: 80, marginBottom: 8 },
  instruction: { fontSize: 15, color: '#B71C1C', fontWeight: '600', marginBottom: 20, backgroundColor: '#FFEBEE', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  phonemeRow: { flexDirection: 'row', gap: 10, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' },
  phonemeTile: { backgroundColor: '#FFEBEE', borderWidth: 3, borderColor: '#E53935', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, minWidth: 58, alignItems: 'center', elevation: 3, shadowColor: '#E53935', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  phonemeTileActive: { borderWidth: 3, borderColor: '#B71C1C', transform: [{ scale: 1.1 }] },
  phonemeTileTapped: { backgroundColor: '#E53935', borderColor: '#B71C1C' },
  phonemeTileActiveTapped: { borderWidth: 3, borderColor: '#fff' },
  phonemeText: { fontSize: 26, fontWeight: 'bold', color: '#E53935' },
  phonemeTextActive: { color: '#B71C1C' },
  phonemeTextTapped: { color: '#fff' },
  blendBtn: { backgroundColor: '#E53935', borderRadius: 18, paddingHorizontal: 44, paddingVertical: 16, elevation: 4, shadowColor: '#E53935', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
  blendBtnDone: { backgroundColor: '#43A047' },
  blendBtnText: { fontSize: 22, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
});

// ─── Rhyme Time Game ───────────────────────────────────────────────────────────

function RhymeGame({ onBack, userId, items }) {
  const rounds = useState(() => shuffleArr(items))[0];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = rounds[idx];

  const speak = (word) => Speech.speak(word, { rate: 0.8, pitch: 1.1 });

  const speakInstruction = () => {
    Speech.speak('Listen to the word. Then find the word that rhymes with it!', { rate: 0.85 });
  };

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === current.correct;
    if (isCorrect) {
      Speech.speak('Great job! They rhyme!', { rate: 0.85 });
      setScore(s => s + 1);
    } else {
      Speech.speak(`Not quite! ${current.correct} rhymes with ${current.target}.`, { rate: 0.85 });
    }
  };

  const handleNext = () => {
    if (idx + 1 >= rounds.length) {
      if (userId) logSession({ studentId: userId, activityType: 'phonics_rhyme', score, total: rounds.length, details: { game: 'Rhyme Time' } });
      setFinished(true);
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
  };

  if (!rounds.length) return <EmptyContent label="Rhyme Time!" color="#FB8C00" onBack={onBack} />;
  if (finished) return <ScoreScreen score={score} total={rounds.length} onBack={onBack} label="Rhyme Time!" color="#FB8C00" />;

  return (
    <View style={rg.container}>
      <StudentPageHeader
        title="Rhyme Time!"
        onBack={onBack}
        right={
          <TouchableOpacity onPress={speakInstruction} style={rg.helpBtn}>
            <Icon name="help-circle" size="md" color={c.primary} />
          </TouchableOpacity>
        }
      />

      <View style={rg.card}>
        <TouchableOpacity onPress={() => speak(current.target)} activeOpacity={0.8} style={rg.targetBox}>
          <Text style={rg.targetEmoji}>{current.emoji}</Text>
          <Text style={rg.targetWord}>{current.target}</Text>
          <Text style={rg.tapHint}>Tap to hear</Text>
        </TouchableOpacity>

        <Text style={rg.question}>Which word RHYMES with  "{current.target}"?</Text>

        <View style={rg.optionRow}>
          {current.options.map((opt, i) => {
            let tileStyle = rg.optionTile;
            if (selected === opt) {
              tileStyle = opt === current.correct ? rg.optionCorrect : rg.optionWrong;
            } else if (selected && opt === current.correct) {
              tileStyle = rg.optionCorrect;
            }
            return (
              <TouchableOpacity key={i} style={tileStyle} onPress={() => { speak(opt); handleSelect(opt); }} activeOpacity={0.8}>
                <Text style={rg.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected && (
          <TouchableOpacity style={rg.nextBtn} onPress={handleNext}>
            <Text style={rg.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const rg = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF3E0' },
  helpBtn: { padding: 6, backgroundColor: 'rgba(251,140,0,0.15)', borderRadius: 20 },
  card: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 6, borderWidth: 2, borderColor: '#FB8C00' },
  targetBox: { alignItems: 'center', backgroundColor: '#FFF3E0', borderRadius: 20, padding: 18, width: '72%', marginBottom: 16, borderWidth: 2, borderColor: '#FB8C00' },
  targetEmoji: { fontSize: 60, marginBottom: 6 },
  targetWord: { fontSize: 38, fontWeight: 'bold', color: '#E65100' },
  tapHint: { fontSize: 12, color: '#FB8C00', marginTop: 4, fontWeight: '600' },
  question: { fontSize: 15, color: '#5D4037', marginBottom: 18, textAlign: 'center', fontWeight: '600' },
  optionRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 },
  optionTile: { backgroundColor: '#FFF3E0', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, borderWidth: 3, borderColor: '#FB8C00', elevation: 3, shadowColor: '#FB8C00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  optionCorrect: { backgroundColor: '#E8F5E9', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, borderWidth: 3, borderColor: '#43A047' },
  optionWrong: { backgroundColor: '#FFEBEE', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, borderWidth: 3, borderColor: '#E53935' },
  optionText: { fontSize: 22, fontWeight: 'bold', color: '#37474F' },
  nextBtn: { backgroundColor: '#FB8C00', borderRadius: 16, paddingHorizontal: 44, paddingVertical: 14, elevation: 4, shadowColor: '#FB8C00', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});

// ─── Segment Game ──────────────────────────────────────────────────────────────

function SegmentGame({ onBack, userId, items }) {
  const segWords = useState(() => shuffleArr(items))[0];
  const [idx, setIdx] = useState(0);
  const [taps, setTaps] = useState(0);
  const [activeTapIndex, setActiveTapIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const tapAnim = useRef(new Animated.Value(1)).current;
  const speechRunIdRef = useRef(0);

  const current = segWords[idx];

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speakWord = () => Speech.speak(current.word, { rate: 0.65, pitch: 1.1 });

  const handleTap = () => {
    if (answered) return;
    const next = taps + 1;
    setTaps(next);
    speechRunIdRef.current += 1;
    const runId = speechRunIdRef.current;
    Speech.stop();
    const nextIndex = next - 1;
    setActiveTapIndex(nextIndex);
    Speech.speak(current.phonemes[nextIndex] || '', {
      rate: 0.8,
      onDone: () => {
        if (runId !== speechRunIdRef.current) return;
        setActiveTapIndex(null);
      },
      onStopped: () => {
        if (runId !== speechRunIdRef.current) return;
        setActiveTapIndex(null);
      },
      onError: () => {
        if (runId !== speechRunIdRef.current) return;
        setActiveTapIndex(null);
      },
    });
    // Pulse animation
    Animated.sequence([
      Animated.timing(tapAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(tapAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleCheck = () => {
    if (answered) {
      if (idx + 1 >= segWords.length) {
        if (userId) logSession({ studentId: userId, activityType: 'phonics_segment', score, total: segWords.length, details: { game: 'Count the Sounds' } });
        setFinished(true);
        return;
      }
      setIdx(i => i + 1);
      setTaps(0);
      setActiveTapIndex(null);
      setAnswered(false);
      return;
    }
    setAnswered(true);
    const isCorrect = taps === current.count;
    if (isCorrect) {
      Speech.speak(`That's right! ${current.word} has ${current.count} sounds.`, { rate: 0.85 });
      setScore(s => s + 1);
    } else {
      Speech.speak(`${current.word} has ${current.count} sounds. Let's try again next time!`, { rate: 0.85 });
    }
  };

  if (!segWords.length) return <EmptyContent label="Count the Sounds!" color="#FFD600" onBack={onBack} />;
  if (finished) return <ScoreScreen score={score} total={segWords.length} onBack={onBack} label="Count the Sounds!" color="#FFD600" />;

  const isCorrect = answered && taps === current.count;

  return (
    <View style={sg.container}>
      <StudentPageHeader
        title="Count the Sounds!"
        onBack={onBack}
        right={<Text style={sg.headerSub}>{idx + 1} / {segWords.length}</Text>}
      />

      <View style={sg.card}>
        <TouchableOpacity onPress={speakWord} style={sg.wordBox} activeOpacity={0.7}>
          <Text style={sg.wordEmoji}>{current.emoji}</Text>
          <Text style={sg.wordText}>{current.word}</Text>
          <Text style={sg.tapHint}>Hear the word</Text>
        </TouchableOpacity>

        <Text style={sg.instruction}>Tap the drum for each sound you hear:</Text>

        <Animated.View style={{ transform: [{ scale: tapAnim }] }}>
          <TouchableOpacity style={sg.drum} onPress={handleTap} activeOpacity={0.7}>
            <Text style={{ fontSize: 32 }}>🥁</Text>
            <Text style={sg.drumCount}>{taps}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sound boxes */}
        <View style={sg.boxRow}>
          {Array.from({ length: Math.max(taps, current.count) }).map((_, i) => (
            <View key={i} style={[sg.soundBox, i < taps && sg.soundBoxFilled, i === activeTapIndex && sg.soundBoxActive]}>
              {answered && i < current.phonemes.length && (
                <Text style={sg.phonemeInBox}>/{current.phonemes[i]}/</Text>
              )}
            </View>
          ))}
        </View>

        {answered && (
          <Text style={[sg.result, isCorrect ? sg.resultCorrect : sg.resultWrong]}>
            {isCorrect ? 'Correct!' : `Not quite — ${current.word} has ${current.count} sounds`}
          </Text>
        )}

        <TouchableOpacity style={[sg.checkBtn, answered && isCorrect && sg.checkBtnNext]} onPress={handleCheck}>
          <Text style={sg.checkBtnText}>{answered ? 'Next →' : 'Check ✓'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sg = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7' },
  headerSub: { color: '#F57F17', fontSize: 14, fontWeight: '700' },
  card: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 6, borderWidth: 2, borderColor: '#FFD600' },
  wordBox: { alignItems: 'center', backgroundColor: '#FFFDE7', borderRadius: 20, padding: 16, width: '68%', marginBottom: 14, borderWidth: 2, borderColor: '#FFD600' },
  wordEmoji: { fontSize: 52 },
  wordText: { fontSize: 32, fontWeight: 'bold', color: '#F57F17', marginTop: 4 },
  tapHint: { fontSize: 12, color: '#FF8F00', marginTop: 4, fontWeight: '600' },
  instruction: { fontSize: 14, color: '#5D4037', fontWeight: '600', marginBottom: 14, textAlign: 'center' },
  drum: { backgroundColor: '#FFD600', borderRadius: 50, width: 110, height: 110, justifyContent: 'center', alignItems: 'center', elevation: 6, marginBottom: 18, shadowColor: '#FFD600', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
  drumText: { fontSize: 40 },
  drumCount: { fontSize: 24, fontWeight: 'bold', color: '#5D4037' },
  boxRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  soundBox: { width: 48, height: 48, borderWidth: 3, borderColor: '#FFD600', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDE7' },
  soundBoxFilled: { backgroundColor: '#FFD600', borderColor: '#F57F17' },
  soundBoxActive: { borderColor: '#F57F17', borderWidth: 3 },
  phonemeInBox: { fontSize: 12, fontWeight: 'bold', color: '#5D4037' },
  result: { fontSize: 17, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' },
  resultCorrect: { color: '#43A047' },
  resultWrong: { color: '#E53935' },
  checkBtn: { backgroundColor: '#FFD600', borderRadius: 16, paddingHorizontal: 44, paddingVertical: 14, elevation: 4, shadowColor: '#FFD600', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 6 },
  checkBtnNext: { backgroundColor: '#FF8F00' },
  checkBtnText: { color: '#5D4037', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});

// ─── Score Screen ──────────────────────────────────────────────────────────────

function ScoreScreen({ score, total, onBack, label, color }) {
  const percent = Math.round((score / total) * 100);
  const msg = percent >= 80 ? 'Amazing!' : percent >= 50 ? 'Good effort!' : 'Keep practising!';
  React.useEffect(() => {
    Speech.speak(`${msg} You got ${score} out of ${total}.`, { rate: 0.85 });
  }, []);
  const stars = percent >= 80 ? ['⭐','⭐','⭐'] : percent >= 50 ? ['⭐','⭐','☆'] : ['⭐','☆','☆'];
  return (
    <View style={[ss.container, { backgroundColor: color + '20' }]}>
      <View style={[ss.card, { borderColor: color }]}>
        <Text style={ss.trophyEmoji}>{percent >= 80 ? '🏆' : percent >= 50 ? '🎉' : '💪'}</Text>
        <View style={ss.starsRow}>
          {stars.map((s, i) => <Text key={i} style={ss.starEmoji}>{s}</Text>)}
        </View>
        <Text style={ss.label}>{label}</Text>
        <Text style={[ss.score, { color }]}>{score} / {total}</Text>
        <Text style={ss.percent}>{percent}%</Text>
        <Text style={ss.msg}>{msg}</Text>
        <TouchableOpacity style={[ss.btn, { backgroundColor: color }]} onPress={onBack}>
          <Text style={ss.btnText}>🎮 Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 36, alignItems: 'center', elevation: 8, width: '100%', borderWidth: 3 },
  trophyEmoji: { fontSize: 70, marginBottom: 4 },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  starEmoji: { fontSize: 28 },
  label: { fontSize: 18, color: '#78909C', marginBottom: 6, fontWeight: '600' },
  score: { fontSize: 68, fontWeight: 'bold', letterSpacing: -2 },
  percent: { fontSize: 24, color: '#90A4AE', marginBottom: 10, fontWeight: '700' },
  msg: { fontSize: 24, fontWeight: 'bold', color: '#37474F', marginBottom: 28, textAlign: 'center' },
  btn: { borderRadius: 18, paddingHorizontal: 52, paddingVertical: 16, elevation: 4 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEW JOLLY PHONICS ACTIVITY GAMES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Sound Match Game ───────────────────────────────────────────────────────────
const SAMPLE_SOUNDS = [
  { letter: 's', sound: 'ssss', options: ['ssss', 'mmm', 'nnn', 'k-k-k'] },
  { letter: 'a', sound: 'a-a-a', options: ['e-e-e', 'a-a-a', 'i-i-i', 'o-o-o'] },
  { letter: 't', sound: 't-t-t', options: ['p-p-p', 't-t-t', 'd-d-d', 'b-b-b'] },
  { letter: 'm', sound: 'mmm', options: ['nnn', 'mmm', 'rrr', 'l-l-l'] },
  { letter: 'c', sound: 'k-k-k', options: ['k-k-k', 's-s-s', 'z-z-z', 'sh'] },
];

function SoundMatchGame({ onBack, userId }) {
  const items = useState(() => shuffleArr(SAMPLE_SOUNDS))[0];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = items[idx];

  const speak = (sound) => Speech.speak(sound, { rate: 0.7, pitch: 1.1 });

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === current.sound;
    if (isCorrect) {
      Speech.speak('Great job! That\'s the right sound!', { rate: 0.85 });
      setScore(s => s + 1);
    } else {
      Speech.speak(`Not quite! ${current.letter} says ${current.sound}`, { rate: 0.85 });
    }
  };

  const handleNext = () => {
    if (idx + 1 >= items.length) {
      if (userId) logSession({ studentId: userId, activityType: 'phonics_sound_match', score, total: items.length, details: { game: 'Sound Match' } });
      setFinished(true);
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
  };

  if (finished) return <ScoreScreen score={score} total={items.length} onBack={onBack} label="Sound Match!" color="#43A047" />;

  return (
    <View style={smg.container}>
      <StudentPageHeader title="Sound Match!" onBack={onBack} right={<Text style={smg.headerSub}>{idx + 1}/{items.length}</Text>} />
      <View style={smg.card}>
        <Text style={smg.emoji}>👂</Text>
        <Text style={smg.question}>What sound does</Text>
        <Text style={smg.letter}>{current.letter}</Text>
        <Text style={smg.question2}>make?</Text>

        <View style={smg.optionsRow}>
          {current.options.map((opt, i) => {
            let style = smg.optionBtn;
            if (selected === opt) {
              style = opt === current.sound ? smg.optionCorrect : smg.optionWrong;
            } else if (selected && opt === current.sound) {
              style = smg.optionCorrect;
            }
            return (
              <TouchableOpacity key={i} style={style} onPress={() => { speak(opt); handleSelect(opt); }} activeOpacity={0.8}>
                <Text style={smg.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected && (
          <TouchableOpacity style={smg.nextBtn} onPress={handleNext}>
            <Text style={smg.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const smg = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  headerSub: { color: '#2E7D32', fontSize: 14, fontWeight: '700' },
  card: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 6, borderWidth: 2, borderColor: '#43A047' },
  emoji: { fontSize: 60, marginBottom: 12 },
  question: { fontSize: 17, color: '#2E7D32', fontWeight: '600', marginBottom: 6 },
  letter: { fontSize: 90, fontWeight: 'bold', color: '#43A047', marginBottom: 6, textShadowColor: 'rgba(67,160,71,0.2)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  question2: { fontSize: 17, color: '#2E7D32', fontWeight: '600', marginBottom: 22 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 },
  optionBtn: { backgroundColor: '#E8F5E9', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 3, borderColor: '#43A047', minWidth: 100, alignItems: 'center', elevation: 3, shadowColor: '#43A047', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  optionCorrect: { backgroundColor: '#C8E6C9', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 3, borderColor: '#43A047', minWidth: 100, alignItems: 'center' },
  optionWrong: { backgroundColor: '#FFEBEE', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 3, borderColor: '#E53935', minWidth: 100, alignItems: 'center' },
  optionText: { fontSize: 20, fontWeight: 'bold', color: '#37474F' },
  nextBtn: { backgroundColor: '#43A047', borderRadius: 16, paddingHorizontal: 44, paddingVertical: 14, elevation: 4, shadowColor: '#43A047', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});

// ─── Word Builder Game ────────────────────────────────────────────────────────
const BUILDER_WORDS = [
  { word: 'cat', phonemes: ['c', 'a', 't'], emoji: '🐱' },
  { word: 'dog', phonemes: ['d', 'o', 'g'], emoji: '🐕' },
  { word: 'sun', phonemes: ['s', 'u', 'n'], emoji: '☀️' },
  { word: 'hat', phonemes: ['h', 'a', 't'], emoji: '🎩' },
  { word: 'bed', phonemes: ['b', 'e', 'd'], emoji: '🛏️' },
];

function WordBuilderGame({ onBack, userId }) {
  const words = useState(() => shuffleArr(BUILDER_WORDS))[0];
  const [idx, setIdx] = useState(0);
  const [built, setBuilt] = useState([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = words[idx];
  const shuffledPhonemes = useState(() => shuffleArr(current.phonemes))[0];

  const speak = (text) => Speech.speak(text, { rate: 0.7, pitch: 1.1 });

  const handlePhonemePress = (ph) => {
    if (built.includes(ph)) {
      setBuilt(b => b.filter(p => p !== ph));
    } else {
      setBuilt(b => [...b, ph]);
    }
  };

  const handleCheck = () => {
    const builtWord = built.join('');
    const isCorrect = builtWord === current.word;
    
    if (isCorrect) {
      Speech.speak(`Great job! You built ${current.word}!`, { rate: 0.85 });
      setScore(s => s + 1);
    } else {
      Speech.speak(`Almost! The word is ${current.word}. Try again!`, { rate: 0.85 });
    }

    setTimeout(() => {
      if (idx + 1 >= words.length) {
        if (userId) logSession({ studentId: userId, activityType: 'phonics_word_build', score: isCorrect ? score + 1 : score, total: words.length, details: { game: 'Word Builder' } });
        setFinished(true);
      } else {
        setIdx(i => i + 1);
        setBuilt([]);
      }
    }, 1500);
  };

  if (finished) return <ScoreScreen score={score} total={words.length} onBack={onBack} label="Word Builder!" color="#1E88E5" />;

  const isComplete = built.length === current.phonemes.length;

  return (
    <View style={wbg.container}>
      <StudentPageHeader title="Word Builder!" onBack={onBack} right={<Text style={wbg.headerSub}>{idx + 1}/{words.length}</Text>} />
      <View style={wbg.card}>
        <Text style={wbg.emoji}>{current.emoji}</Text>
        <Text style={wbg.instruction}>Build the word:</Text>

        {/* Building area */}
        <View style={wbg.buildArea}>
          {built.length === 0 ? (
            <Text style={wbg.placeholder}>Tap letters below ↓</Text>
          ) : (
            built.map((ph, i) => (
              <TouchableOpacity key={i} style={wbg.builtTile} onPress={() => handlePhonemePress(ph)}>
                <Text style={wbg.builtText}>{ph}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Phoneme bank */}
        <View style={wbg.phonemeBank}>
          {shuffledPhonemes.map((ph, i) => (
            <TouchableOpacity 
              key={i} 
              style={[wbg.phonemeTile, built.includes(ph) && wbg.phonemeUsed]} 
              onPress={() => handlePhonemePress(ph)}
              disabled={built.includes(ph)}
            >
              <Text style={[wbg.phonemeText, built.includes(ph) && wbg.phonemeTextUsed]}>{ph}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[wbg.checkBtn, !isComplete && wbg.checkBtnDisabled]} 
          onPress={handleCheck}
          disabled={!isComplete}
        >
          <Text style={wbg.checkBtnText}>Check ✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const wbg = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  headerSub: { color: '#1565C0', fontSize: 14, fontWeight: '700' },
  card: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 6, borderWidth: 2, borderColor: '#1E88E5' },
  emoji: { fontSize: 65, marginBottom: 10 },
  instruction: { fontSize: 17, color: '#1565C0', fontWeight: '600', marginBottom: 18 },
  buildArea: { flexDirection: 'row', gap: 8, minHeight: 72, backgroundColor: '#E3F2FD', borderRadius: 16, padding: 14, marginBottom: 22, alignItems: 'center', justifyContent: 'center', width: '100%', borderWidth: 2, borderColor: '#1E88E5', borderStyle: 'dashed' },
  placeholder: { color: '#90CAF9', fontSize: 15, fontWeight: '600' },
  builtTile: { backgroundColor: '#1E88E5', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, borderWidth: 2, borderColor: '#1565C0', elevation: 3 },
  builtText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  phonemeBank: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  phonemeTile: { backgroundColor: '#BBDEFB', borderRadius: 14, paddingHorizontal: 22, paddingVertical: 16, elevation: 4, borderWidth: 2, borderColor: '#1E88E5', shadowColor: '#1E88E5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  phonemeUsed: { backgroundColor: '#ECEFF1', elevation: 0, borderColor: '#CFD8DC' },
  phonemeText: { fontSize: 24, fontWeight: 'bold', color: '#1565C0' },
  phonemeTextUsed: { color: '#B0BEC5' },
  checkBtn: { backgroundColor: '#1E88E5', borderRadius: 16, paddingHorizontal: 52, paddingVertical: 16, elevation: 4, shadowColor: '#1E88E5', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
  checkBtnDisabled: { backgroundColor: '#90CAF9', elevation: 0 },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});

// ─── Tricky Words Game ──────────────────────────────────────────────────────────
const TRICKY_WORDS_GAME = [
  { word: 'I', sentence: '___ like ice cream!' },
  { word: 'he', sentence: '___ is my friend.' },
  { word: 'she', sentence: '___ has a cat.' },
  { word: 'we', sentence: '___ go to school.' },
  { word: 'me', sentence: 'Can you see ___?' },
  { word: 'the', sentence: 'Look at ___ dog!' },
];

function TrickyWordsGame({ onBack, userId }) {
  const words = useState(() => shuffleArr(TRICKY_WORDS_GAME))[0];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = words[idx];
  const options = useState(() => {
    const wrong = ['was', 'to', 'do', 'are', 'all'].filter(w => w !== current.word).slice(0, 3);
    return shuffleArr([current.word, ...wrong]);
  })[0];

  const handleSelect = (word) => {
    if (selected) return;
    setSelected(word);
    const isCorrect = word === current.word;
    if (isCorrect) {
      Speech.speak('Excellent! Tricky word mastered!', { rate: 0.85 });
      setScore(s => s + 1);
    } else {
      Speech.speak(`Remember! The word is ${current.word}`, { rate: 0.85 });
    }
  };

  const handleNext = () => {
    if (idx + 1 >= words.length) {
      if (userId) logSession({ studentId: userId, activityType: 'phonics_tricky', score, total: words.length, details: { game: 'Tricky Words' } });
      setFinished(true);
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
  };

  if (finished) return <ScoreScreen score={score} total={words.length} onBack={onBack} label="Tricky Words!" color="#8E24AA" />;

  return (
    <View style={twg.container}>
      <StudentPageHeader title="Tricky Words!" onBack={onBack} right={<Text style={twg.headerSub}>{idx + 1}/{words.length}</Text>} />
      <View style={twg.card}>
        <Text style={twg.emoji}>⚡</Text>
        <Text style={twg.title}>Tricky Word!</Text>
        
        <View style={twg.sentenceBox}>
          <Text style={twg.sentence}>{current.sentence.replace('___', '____')}</Text>
        </View>

        <Text style={twg.question}>Which word fits?</Text>

        <View style={twg.optionsRow}>
          {options.map((opt, i) => {
            let style = twg.optionBtn;
            if (selected === opt) {
              style = opt === current.word ? twg.optionCorrect : twg.optionWrong;
            } else if (selected && opt === current.word) {
              style = twg.optionCorrect;
            }
            return (
              <TouchableOpacity key={i} style={style} onPress={() => handleSelect(opt)} activeOpacity={0.8}>
                <Text style={twg.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected && (
          <TouchableOpacity style={twg.nextBtn} onPress={handleNext}>
            <Text style={twg.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const twg = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3E5F5' },
  headerSub: { color: '#6A1B9A', fontSize: 14, fontWeight: '700' },
  card: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 6, borderWidth: 2, borderColor: '#8E24AA' },
  emoji: { fontSize: 52, marginBottom: 6 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#6A1B9A', marginBottom: 16 },
  sentenceBox: { backgroundColor: '#F3E5F5', borderRadius: 16, padding: 18, width: '100%', marginBottom: 18, borderWidth: 2, borderColor: '#8E24AA' },
  sentence: { fontSize: 22, color: '#37474F', textAlign: 'center', fontWeight: '600' },
  question: { fontSize: 15, color: '#6A1B9A', fontWeight: '600', marginBottom: 18 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 18 },
  optionBtn: { backgroundColor: '#F3E5F5', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 3, borderColor: '#8E24AA', minWidth: 90, alignItems: 'center', elevation: 3, shadowColor: '#8E24AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  optionCorrect: { backgroundColor: '#E8F5E9', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 3, borderColor: '#43A047', minWidth: 90, alignItems: 'center' },
  optionWrong: { backgroundColor: '#FFEBEE', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 3, borderColor: '#E53935', minWidth: 90, alignItems: 'center' },
  optionText: { fontSize: 22, fontWeight: 'bold', color: '#37474F' },
  nextBtn: { backgroundColor: '#8E24AA', borderRadius: 16, paddingHorizontal: 44, paddingVertical: 14, elevation: 4, shadowColor: '#8E24AA', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

export default function PhonicsActivityScreen() {
  const { profile } = useAuth();
  const { colors, getOverlayColor } = useTheme();
  const [mode, setMode] = useState(null);
  const [contentMap, setContentMap] = useState({ blend: [], rhyme: [], segment: [], sounds: [], build: [], tricky: [] });
  const [loading, setLoading] = useState(true);
  const overlayColor = getOverlayColor ? getOverlayColor() : null;

  useEffect(() => {
    Promise.all([
      fetchActivityContent('blend'),
      fetchActivityContent('rhyme'),
      fetchActivityContent('segment'),
    ]).then(([blend, rhyme, segment]) => {
      setContentMap({ blend, rhyme, segment, sounds: [], build: [], tricky: [] });
      setLoading(false);
    });
  }, []);

  const handleBack = () => setMode(null);

  const renderGame = () => {
    if (mode === 'blend')   return <BlendGame   onBack={handleBack} userId={profile?.id} items={contentMap.blend} />;
    if (mode === 'rhyme')   return <RhymeGame   onBack={handleBack} userId={profile?.id} items={contentMap.rhyme} />;
    if (mode === 'segment') return <SegmentGame onBack={handleBack} userId={profile?.id} items={contentMap.segment} />;
    if (mode === 'sounds')  return <SoundMatchGame onBack={handleBack} userId={profile?.id} />;
    if (mode === 'build')   return <WordBuilderGame onBack={handleBack} userId={profile?.id} />;
    if (mode === 'tricky')  return <TrickyWordsGame onBack={handleBack} userId={profile?.id} />;
    return null;
  };

  return (
    <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>
        <StudentPageHeader title="Phonics Games" />
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={{ marginTop: 10, color: '#78909C' }}>Loading activities...</Text>
          </View>
        ) : mode ? renderGame() : <ModeSelector onSelect={setMode} />}
      {overlayColor && (
        <View style={[styles.overlay, { backgroundColor: overlayColor, pointerEvents: 'none' }]} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
});
