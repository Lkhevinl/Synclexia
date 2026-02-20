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
  ScrollView, Animated, StatusBar, ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
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

// ─── Mode Selector ────────────────────────────────────────────────────────────

function ModeSelector({ onSelect, level }) {
  const levelColors = { 1: '#4CAF50', 2: '#FF9800', 3: '#F44336' };
  const levelLabels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  return (
    <ScrollView contentContainerStyle={ms.container}>
      <Text style={ms.title}>Phonological Awareness 🎧</Text>
      <Text style={ms.sub}>Building blocks of reading & spelling</Text>
      <View style={[ms.levelBadge, { backgroundColor: levelColors[level] + '20', borderColor: levelColors[level] }]}>
        <Text style={[ms.levelText, { color: levelColors[level] }]}>
          Adaptive Level: {levelLabels[level]}
        </Text>
      </View>
      {[
        { id: 'syllable', emoji: '👏', label: 'Syllable Clapping', desc: 'How many syllables? Tap on each beat!', color: '#2196F3' },
        { id: 'rime',     emoji: '🎵', label: 'Onset-Rime',        desc: 'Find the word that rhymes',            color: '#9C27B0' },
        { id: 'phoneme',  emoji: '🔤', label: 'Phoneme Isolation',  desc: 'What is the first or last sound?',     color: '#E91E63' },
      ].map(m => (
        <TouchableOpacity key={m.id} style={[ms.card, { borderLeftColor: m.color }]} onPress={() => onSelect(m.id)} activeOpacity={0.8}>
          <Text style={ms.emoji}>{m.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={ms.label}>{m.label}</Text>
            <Text style={ms.desc}>{m.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={m.color} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const ms = StyleSheet.create({
  container:   { padding: 20, paddingTop: 70 },
  title:       { fontSize: 26, fontWeight: 'bold', color: '#37474F', textAlign: 'center' },
  sub:         { fontSize: 14, color: '#78909C', textAlign: 'center', marginBottom: 16, marginTop: 4 },
  levelBadge:  { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, alignSelf: 'center', marginBottom: 24 },
  levelText:   { fontWeight: 'bold', fontSize: 13 },
  card:        { backgroundColor: '#fff', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16, elevation: 3, borderLeftWidth: 5 },
  emoji:       { fontSize: 34, marginRight: 14 },
  label:       { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  desc:        { fontSize: 13, color: '#78909C', marginTop: 2 },
});

// ─── Syllable Game ─────────────────────────────────────────────────────────────

function SyllableGame({ onBack, userId, level, items: rawItems }) {
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

  const speak = () => Speech.speak(current.word, { rate: 0.6 });

  useEffect(() => { speak(); }, [idx]);

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

  if (done) return <FinishScreen score={score} total={items.length} onBack={onBack} color="#2196F3" />;

  return (
    <View style={[g.container, { backgroundColor: '#E3F2FD' }]}>
      <LinearGradient colors={['#2196F3', '#1565C0']} style={g.header}>
        <Text style={g.headerTitle}>Syllable Clapping 👏</Text>
        <Text style={g.headerSub}>{idx + 1}/{items.length}  ⭐ {score}</Text>
      </LinearGradient>
      <View style={g.body}>
        <TouchableOpacity onPress={speak} style={g.wordCard}>
          <Animated.Text style={[g.wordEmoji, { transform: [{ scale: bounceAnim }] }]}>{current.emoji}</Animated.Text>
          <Text style={g.wordText}>{current.word}</Text>
          <View style={g.speakBtn}>
            <Ionicons name="volume-high" size={18} color="#2196F3" />
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
  const count = level === 1 ? 5 : level === 2 ? 7 : 8;
  const [items] = useState(() => shuffleArr(rawItems).slice(0, count));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = items[idx];
  const choices = shuffleArr([current.correct, ...current.distractors]);

  const speak = (w) => Speech.speak(w, { rate: 0.65 });
  useEffect(() => { speak(current.target); }, [idx]);

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

  if (done) return <FinishScreen score={score} total={items.length} onBack={onBack} color="#9C27B0" />;

  return (
    <View style={[g.container, { backgroundColor: '#F3E5F5' }]}>
      <LinearGradient colors={['#9C27B0', '#6A1B9A']} style={g.header}>
        <Text style={g.headerTitle}>Onset-Rime 🎵</Text>
        <Text style={g.headerSub}>{idx + 1}/{items.length}  ⭐ {score}</Text>
      </LinearGradient>
      <View style={g.body}>
        <TouchableOpacity style={g.wordCard} onPress={() => speak(current.target)}>
          <Text style={{ fontSize: 40 }}>🎧</Text>
          <Text style={g.wordText}>{current.target}</Text>
          <View style={g.speakBtn}>
            <Ionicons name="volume-high" size={18} color="#9C27B0" />
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
  const count = level === 1 ? 5 : level === 2 ? 6 : 8;
  const [items] = useState(() => shuffleArr(rawItems).slice(0, count));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = items[idx];
  useEffect(() => { Speech.speak(current.word, { rate: 0.6 }); }, [idx]);

  const handleSelect = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const isCorrect = opt === current.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    isCorrect
      ? Speech.speak('Correct!', { rate: 0.9 })
      : Speech.speak(`The ${current.position} sound is ${current.answer}.`, { rate: 0.8 });
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

  if (done) return <FinishScreen score={score} total={items.length} onBack={onBack} color="#E91E63" />;

  return (
    <View style={[g.container, { backgroundColor: '#FCE4EC' }]}>
      <LinearGradient colors={['#E91E63', '#AD1457']} style={g.header}>
        <Text style={g.headerTitle}>Phoneme Isolation 🔤</Text>
        <Text style={g.headerSub}>{idx + 1}/{items.length}  ⭐ {score}</Text>
      </LinearGradient>
      <View style={g.body}>
        <TouchableOpacity style={g.wordCard} onPress={() => Speech.speak(current.word, { rate: 0.6 })}>
          <Text style={{ fontSize: 40 }}>👂</Text>
          <Text style={g.wordText}>{current.word}</Text>
          <View style={g.speakBtn}>
            <Ionicons name="volume-high" size={18} color="#E91E63" />
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
  const pct = Math.round((score / total) * 100);
  return (
    <LinearGradient colors={[color, color + 'AA']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
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
    </LinearGradient>
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

export default function PhonologicalAwarenessScreen({ navigation }) {
  const { profile } = useAuth();
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={{ marginTop: 12, color: '#78909C' }}>Loading activities…</Text>
      </SafeAreaView>
    );
  }

  if (mode === 'syllable') return <SyllableGame onBack={handleBack} userId={profile?.id} level={level} items={contentMap.syllable} />;
  if (mode === 'rime')     return <RimeGame     onBack={handleBack} userId={profile?.id} level={level} items={contentMap.rime} />;
  if (mode === 'phoneme')  return <PhonemeGame  onBack={handleBack} userId={profile?.id} level={level} items={contentMap.phoneme} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <StatusBar barStyle="dark-content" />
      <GoBackBtn />
      <ModeSelector onSelect={setMode} level={level} />
    </SafeAreaView>
  );
}
