// screens/students/PhonologicalAwarenessScreen.js
// Three clinically-grounded phonological awareness tasks:
//   1. Syllable Clapping    — tap once per syllable
//   2. Onset-Rime          — identify which word shares the rime
//   3. Phoneme Isolation   — identify the first/last sound
// All content is fetched dynamically from the phonological_content table.
// Adaptive difficulty filters which items are shown per session.

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import StudentCard from '../../components/student/StudentCard';
import c from '../../components/student/candyTokens';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAdaptive } from '../../context/AdaptiveContext';
import { logSession } from '../../lib/analyticsHelper';
import { supabase } from '../../lib/supabase';

const ACTIVITY_TYPE = 'phonological_awareness';

// ─── DB Fetch ─────────────────────────────────────────────────────────────────

/**
 * Fetch active content for a task_type at a given difficulty level.
 * Returns rows where difficulty_level = level OR difficulty_level IS NULL.
 */
const fetchContent = async (taskType, level) => {
  const { data, error } = await supabase
    .from('phonological_content')
    .select('id, data')
    .eq('task_type', taskType)
    .eq('is_active', true)
    .or(`difficulty_level.eq.${level},difficulty_level.is.null`);

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

// ─── Animated Components ──────────────────────────────────────────────────────

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

// ─── Mode Selector ────────────────────────────────────────────────────────────

function ModeSelector({ onSelect, level }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const levelColors = { 1: '#4CAF50', 2: '#FF9800', 3: '#F44336' };
  const levelLabels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const levelEmojis = { 1: '🌱', 2: '🌿', 3: '🌳' };

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, []);

  const modes = [
    { id: 'syllable', emoji: '👏', label: 'Syllable Clapping', desc: 'How many syllables? Tap on each beat!', gradient: ['#2196F3', '#1565C0'] },
    { id: 'rime',     emoji: '🎵', label: 'Onset-Rime',        desc: 'Find the word that rhymes',            gradient: ['#9C27B0', '#6A1B9A'] },
    { id: 'phoneme',  emoji: '🔤', label: 'Phoneme Isolation',  desc: 'What is the first or last sound?',     gradient: ['#E91E63', '#AD1457'] },
  ];

  return (
    <ScrollView contentContainerStyle={ms.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ transform: [{ scale: headerAnim }], opacity: headerAnim }}>
        <View style={[ms.headerCard, { backgroundColor: c.primary }]}>
          <Text style={ms.headerEmoji}>🎧</Text>
          <Text style={ms.title}>Phonological Awareness</Text>
          <Text style={ms.sub}>Building blocks of reading & spelling</Text>
          <View style={[ms.levelPill, { backgroundColor: levelColors[level] + '30', borderColor: levelColors[level] }]}>
            <Text style={ms.levelEmoji}>{levelEmojis[level]}</Text>
            <Text style={[ms.levelText, { color: levelColors[level] }]}>
              Level: {levelLabels[level]}
            </Text>
          </View>
        </View>
      </Animated.View>

      {modes.map((m, index) => (
        <AnimatedCard key={m.id} style={ms.cardWrapper} onPress={() => onSelect(m.id)} delay={index * 100}>
          <View style={[ms.card, { backgroundColor: m.gradient[0] }]}>
            <View style={ms.cardContent}>
              <View style={ms.emojiCircle}>
                <Text style={ms.cardEmoji}>{m.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ms.cardLabel}>{m.label}</Text>
                <Text style={ms.cardDesc}>{m.desc}</Text>
              </View>
              <View style={ms.playBtn}>
                <Ionicons name="play" size={20} color="#fff" />
              </View>
            </View>
            <View style={ms.cardShine} />
          </View>
        </AnimatedCard>
      ))}
    </ScrollView>
  );
}

const ms = StyleSheet.create({
  container:   { padding: 20, paddingTop: 70, paddingBottom: 40 },
  headerCard:  { borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24, elevation: 6 },
  headerEmoji: { fontSize: 50, marginBottom: 8 },
  title:       { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  sub:         { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4, marginBottom: 12 },
  levelPill:   { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  levelEmoji:  { fontSize: 18 },
  levelText:   { fontWeight: 'bold', fontSize: 14 },
  cardWrapper: { marginBottom: 16, borderRadius: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  card:        { borderRadius: 20, padding: 20, overflow: 'hidden' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  emojiCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardEmoji:   { fontSize: 28 },
  cardLabel:   { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  cardDesc:    { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 18 },
  playBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  cardShine:   { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.1)', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});

// ─── Syllable Game ─────────────────────────────────────────────────────────────

function SyllableGame({ onBack, userId, level, items: rawItems }) {
  const { colors } = useTheme();
  const count = level === 1 ? 6 : level === 2 ? 8 : 10;
  const [items] = useState(() => shuffleArr(rawItems).slice(0, count));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const current = items[idx];
  const options = Array.from({ length: Math.min(4, 4) }, (_, i) => i + 1).filter(n => n <= 5);

  const speak = () => { if (current) Speech.speak(current.word, { rate: 0.6 }); };

  useEffect(() => { if (current) speak(); }, [idx]);

  const handleSelect = (n) => {
    if (feedback) return;
    setSelected(n);
    const isCorrect = n === current.syllables;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore(s => s + 1);
      Speech.speak('Correct!', { rate: 0.9 });
      Animated.spring(bounceAnim, { toValue: 1.25, useNativeDriver: true, friction: 4 }).start(() =>
        bounceAnim.setValue(1));
    } else {
      Speech.speak(`${current.word} has ${current.syllables} syllable${current.syllables > 1 ? 's' : ''}.`, { rate: 0.8 });
    }
    setTimeout(() => {
      if (idx + 1 >= items.length) {
        setDone(true);
        if (userId) logSession({ studentId: userId, activityType: ACTIVITY_TYPE, score: score + (isCorrect ? 1 : 0), total: items.length, details: { subType: 'syllable', level } });
      } else {
        setIdx(i => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 1200);
  };

  if (!items.length || !current) return <FinishScreen score={0} total={0} onBack={onBack} color="#2196F3" />;
  if (done) return <FinishScreen score={score} total={items.length} onBack={onBack} color="#2196F3" />;

  return (
    <View style={[g.container, { backgroundColor: colors.surface }]}>
      <StudentPageHeader
        title="Syllable Clapping 👏"
        onBack={onBack}
        right={<Text style={g.headerSub}>{idx + 1}/{items.length}  ⭐ {score}</Text>}
      />
      <View style={g.body}>
        <TouchableOpacity onPress={speak} style={g.wordCard}>
          <Animated.Text style={[g.wordEmoji, { transform: [{ scale: bounceAnim }] }]}>{current.emoji}</Animated.Text>
          <Text style={g.wordText}>{current.word}</Text>
          <View style={g.speakBtn}>
            <Ionicons name="volume-high" size={22} color="#2196F3" />
            <Text style={[g.speakText, { color: '#2196F3' }]}>Tap to hear</Text>
          </View>
        </TouchableOpacity>
        <Text style={g.question}>How many syllables?</Text>
        <View style={g.optionRow}>
          {[1, 2, 3, 4].map(n => (
            <TouchableOpacity
              key={n}
              style={[g.numBtn,
                selected === n && feedback === 'correct' && { backgroundColor: '#4CAF50' },
                selected === n && feedback === 'wrong'   && { backgroundColor: '#F44336' },
              ]}
              onPress={() => handleSelect(n)}>
              <Text style={g.numText}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Rime Game ────────────────────────────────────────────────────────────────

function RimeGame({ onBack, userId, level, items: rawItems }) {
  const { colors } = useTheme();
  const count = level === 1 ? 5 : level === 2 ? 7 : 8;
  const [items] = useState(() => shuffleArr(rawItems).slice(0, count));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = items[idx];
  const choices = current ? shuffleArr([current.correct, ...current.distractors]) : [];

  const speak = (w) => Speech.speak(w, { rate: 0.65 });
  useEffect(() => { if (current) speak(current.target); }, [idx]);

  const handleSelect = (choice) => {
    if (feedback) return;
    setSelected(choice);
    const isCorrect = choice === current.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore(s => s + 1);
      Speech.speak('Yes! They rhyme!', { rate: 0.9 });
    } else {
      Speech.speak(`${current.target} and ${current.correct} rhyme.`, { rate: 0.8 });
    }
    setTimeout(() => {
      if (idx + 1 >= items.length) {
        setDone(true);
        if (userId) logSession({ studentId: userId, activityType: ACTIVITY_TYPE, score: score + (isCorrect ? 1 : 0), total: items.length, details: { subType: 'rime', level } });
      } else {
        setIdx(i => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 1200);
  };

  if (!items.length || !current) return <FinishScreen score={0} total={0} onBack={onBack} color="#9C27B0" />;
  if (done) return <FinishScreen score={score} total={items.length} onBack={onBack} color="#9C27B0" />;

  return (
    <View style={[g.container, { backgroundColor: colors.surface }]}>
      <StudentPageHeader
        title="Onset-Rime 🎵"
        onBack={onBack}
        right={<Text style={g.headerSub}>{idx + 1}/{items.length}  ⭐ {score}</Text>}
      />
      <View style={g.body}>
        <TouchableOpacity style={g.wordCard} onPress={() => speak(current.target)}>
          <Text style={{ fontSize: 40 }}>🎧</Text>
          <Text style={g.wordText}>{current.target}</Text>
          <View style={g.speakBtn}>
            <Ionicons name="volume-high" size={22} color="#9C27B0" />
            <Text style={[g.speakText, { color: '#9C27B0' }]}>Tap to hear</Text>
          </View>
        </TouchableOpacity>
        <Text style={g.question}>Which word rhymes with <Text style={{ fontWeight: 'bold' }}>{current.target}</Text>?</Text>
        <View style={g.choiceCol}>
          {choices.map(c => (
            <TouchableOpacity
              key={c}
              style={[g.choiceBtn,
                selected === c && feedback === 'correct' && { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
                selected === c && feedback === 'wrong'   && { backgroundColor: '#F44336', borderColor: '#F44336' },
              ]}
              onPress={() => { handleSelect(c); speak(c); }}>
              <Text style={[g.choiceText, selected === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Phoneme Game ─────────────────────────────────────────────────────────────

function PhonemeGame({ onBack, userId, level, items: rawItems }) {
  const { colors } = useTheme();
  const count = level === 1 ? 5 : level === 2 ? 6 : 8;
  const [items] = useState(() => shuffleArr(rawItems).slice(0, count));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = items[idx];
  useEffect(() => { if (current) Speech.speak(current.word, { rate: 0.6 }); }, [idx]);

  const handleSelect = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const normalize = (v) => String(v ?? '').trim().toLowerCase();
    const isCorrect = normalize(opt) === normalize(current.answer);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore(s => s + 1);
      Speech.speak('Correct!', { rate: 0.9 });
    } else {
      Speech.speak(`The ${current.position} sound is ${current.answer}.`, { rate: 0.8 });
    }
    setTimeout(() => {
      if (idx + 1 >= items.length) {
        setDone(true);
        if (userId) logSession({ studentId: userId, activityType: ACTIVITY_TYPE, score: score + (isCorrect ? 1 : 0), total: items.length, details: { subType: 'phoneme', level } });
      } else {
        setIdx(i => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 1200);
  };

  if (!items.length || !current) return <FinishScreen score={0} total={0} onBack={onBack} color="#E91E63" />;
  if (done) return <FinishScreen score={score} total={items.length} onBack={onBack} color="#E91E63" />;

  return (
    <View style={[g.container, { backgroundColor: colors.surface }]}>
      <StudentPageHeader
        title="Phoneme Isolation 🔤"
        onBack={onBack}
        right={<Text style={g.headerSub}>{idx + 1}/{items.length}  ⭐ {score}</Text>}
      />
      <View style={g.body}>
        <TouchableOpacity style={g.wordCard} onPress={() => Speech.speak(current.word, { rate: 0.6 })}>
          <Text style={{ fontSize: 40 }}>👂</Text>
          <Text style={g.wordText}>{current.word}</Text>
          <View style={g.speakBtn}>
            <Ionicons name="volume-high" size={22} color="#E91E63" />
            <Text style={[g.speakText, { color: '#E91E63' }]}>Tap to hear</Text>
          </View>
        </TouchableOpacity>
        <Text style={g.question}>
          What is the <Text style={{ fontWeight: 'bold' }}>{current.position}</Text> sound in "{current.word}"?
        </Text>
        <View style={g.optionRow}>
          {current.options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[g.numBtn, { width: 72 },
                selected === opt && feedback === 'correct' && { backgroundColor: '#4CAF50' },
                selected === opt && feedback === 'wrong'   && { backgroundColor: '#F44336' },
              ]}
              onPress={() => handleSelect(opt)}>
              <Text style={[g.numText, { fontSize: 24 }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Finish Screen ────────────────────────────────────────────────────────────

function FinishScreen({ score, total, onBack, color }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: color }}>
      <Text style={{ fontSize: 64 }}>{pct >= 70 ? '🏆' : pct >= 40 ? '👍' : '💪'}</Text>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 16 }}>
        {score} / {total}
      </Text>
      <Text style={{ fontSize: 16, color: '#fff', marginTop: 8, opacity: 0.9 }}>{pct}% accuracy</Text>
      <Text style={{ fontSize: 14, color: '#fff', marginTop: 4, opacity: 0.8 }}>
        {pct >= 70 ? 'Excellent work!' : pct >= 40 ? 'Good effort — keep going!' : 'Practice makes perfect!'}
      </Text>
      <TouchableOpacity style={{ marginTop: 30, backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 36, paddingVertical: 14 }} onPress={onBack}>
        <Text style={{ fontWeight: 'bold', color: color, fontSize: 16 }}>Try Another</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Shared Game Styles ───────────────────────────────────────────────────────

const g = StyleSheet.create({
  container:  { flex: 1 },
  header:     { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle:{ fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub:  { fontSize: 14, color: '#fff', opacity: 0.85, marginTop: 4 },
  body:       { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  wordCard:   { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: '100%', elevation: 4, marginBottom: 24 },
  wordEmoji:  { fontSize: 56 },
  wordText:   { fontSize: 36, fontWeight: 'bold', color: '#37474F', marginTop: 8 },
  speakBtn:   { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  speakText:  { fontSize: 13 },
  question:   { fontSize: 18, color: '#37474F', textAlign: 'center', marginBottom: 20 },
  optionRow:  { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  numBtn:     { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  numText:    { fontSize: 22, fontWeight: 'bold', color: '#37474F' },
  choiceCol:  { width: '100%', gap: 12 },
  choiceBtn:  { backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#eee' },
  choiceText: { fontSize: 22, fontWeight: 'bold', color: '#37474F' },
});

// ─── Root Screen ──────────────────────────────────────────────────────────────

export default function PhonologicalAwarenessScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const { refreshLevel, getLevel } = useAdaptive();
  const [mode, setMode] = useState(null);
  const [contentMap, setContentMap] = useState({ syllable: [], rime: [], phoneme: [] });
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setContentLoading(true);
      await refreshLevel(ACTIVITY_TYPE);
      const lvl = getLevel(ACTIVITY_TYPE) || 1;
      const [syllable, rime, phoneme] = await Promise.all([
        fetchContent('syllable', lvl),
        fetchContent('rime',     lvl),
        fetchContent('phoneme',  lvl),
      ]);
      if (!cancelled) {
        setContentMap({ syllable, rime, phoneme });
        setContentLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const level = getLevel(ACTIVITY_TYPE);
  const handleBack = () => setMode(null);

  if (contentLoading) {
    return (
      <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={{ marginTop: 12, color: '#78909C' }}>Loading activities…</Text>
      </ScreenWrapper>
    );
  }

  if (mode === 'syllable') return <SyllableGame onBack={handleBack} userId={profile?.id} level={level} items={contentMap.syllable} />;
  if (mode === 'rime')     return <RimeGame     onBack={handleBack} userId={profile?.id} level={level} items={contentMap.rime} />;
  if (mode === 'phoneme')  return <PhonemeGame  onBack={handleBack} userId={profile?.id} level={level} items={contentMap.phoneme} />;

  return (
    <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>
      <StudentPageHeader title="Sound Games" />
      <StudentCard variant="tinted" style={paRoot.hintCard}>
        <View style={paRoot.hintRow}>
          <Ionicons name="information-circle" size={22} color={c.primary} />
          <Text style={paRoot.hintText}>
            <Text style={{ fontWeight: 'bold' }}>How to use: </Text>
            Pick a game! Clap Syllables counts word parts, Onset-Rime finds rhyming words, Phoneme Isolation identifies sounds.
          </Text>
        </View>
      </StudentCard>
      <ModeSelector onSelect={setMode} level={level} />
    </ScreenWrapper>
  );
}

const paRoot = StyleSheet.create({
  hintCard: { margin: 16, marginBottom: 4 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  hintText: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 19 },
});
