import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, Animated, Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../../components/GoBackBtn';
import { checkQuestProgress } from '../../lib/questHelper';
import { logSession } from '../../lib/analyticsHelper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ─── Game Data ─────────────────────────────────────────────────────────────────

const BLENDING_WORDS = [
  { phonemes: ['c', 'a', 't'],     word: 'cat',     emoji: '🐱' },
  { phonemes: ['d', 'o', 'g'],     word: 'dog',     emoji: '🐶' },
  { phonemes: ['s', 'u', 'n'],     word: 'sun',     emoji: '☀️' },
  { phonemes: ['h', 'a', 't'],     word: 'hat',     emoji: '🎩' },
  { phonemes: ['b', 'u', 's'],     word: 'bus',     emoji: '🚌' },
  { phonemes: ['f', 'i', 'sh'],    word: 'fish',    emoji: '🐟' },
  { phonemes: ['fr', 'o', 'g'],    word: 'frog',    emoji: '🐸' },
  { phonemes: ['cl', 'a', 'p'],    word: 'clap',    emoji: '👏' },
];

const RHYMING_ROUNDS = [
  { target: 'cat',   options: ['bat', 'dog', 'sun'],  correct: 'bat',   emoji: '🐱' },
  { target: 'hop',   options: ['mop', 'cat', 'pen'],  correct: 'mop',   emoji: '🐰' },
  { target: 'big',   options: ['map', 'pig', 'sun'],  correct: 'pig',   emoji: '🐷' },
  { target: 'ring',  options: ['sing', 'cat', 'hop'], correct: 'sing',  emoji: '💍' },
  { target: 'bee',   options: ['cat', 'tree', 'hop'], correct: 'tree',  emoji: '🐝' },
  { target: 'run',   options: ['sit', 'sun', 'cat'],  correct: 'sun',   emoji: '🏃' },
  { target: 'ship',  options: ['cat', 'drip', 'tip'], correct: 'tip',   emoji: '🚢' },
  { target: 'night', options: ['light', 'day', 'cat'],correct: 'light', emoji: '🌙' },
];

const SEGMENTING_WORDS = [
  { word: 'cat',  phonemes: ['c', 'a', 't'],   count: 3, emoji: '🐱' },
  { word: 'it',   phonemes: ['i', 't'],         count: 2, emoji: '👆' },
  { word: 'frog', phonemes: ['fr', 'o', 'g'],  count: 3, emoji: '🐸' },
  { word: 'ship', phonemes: ['sh', 'i', 'p'],  count: 3, emoji: '🚢' },
  { word: 'play', phonemes: ['pl', 'ay'],       count: 2, emoji: '🎮' },
  { word: 'stop', phonemes: ['st', 'o', 'p'],  count: 3, emoji: '🛑' },
  { word: 'tree', phonemes: ['tr', 'ee'],       count: 2, emoji: '🌳' },
  { word: 'best', phonemes: ['b', 'e', 'st'],  count: 3, emoji: '⭐' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function ModeSelector({ onSelect }) {
  const modes = [
    { id: 'blend',   label: 'Blend It!',        emoji: '🔗', color: '#FF9800', desc: 'Put sounds together to make a word' },
    { id: 'rhyme',   label: 'Rhyme Time!',       emoji: '🎵', color: '#E91E63', desc: 'Find the word that rhymes' },
    { id: 'segment', label: 'Count the Sounds!', emoji: '🔢', color: '#4CAF50', desc: 'How many sounds does the word have?' },
  ];
  return (
    <ScrollView contentContainerStyle={ms.container} showsVerticalScrollIndicator={false}>
      <Text style={ms.title}>Phonics Activities</Text>
      <Text style={ms.sub}>Choose a game to play 🎮</Text>
      {modes.map(m => (
        <TouchableOpacity key={m.id} style={[ms.card, { borderLeftColor: m.color }]} onPress={() => onSelect(m.id)} activeOpacity={0.8}>
          <Text style={ms.cardEmoji}>{m.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={ms.cardLabel}>{m.label}</Text>
            <Text style={ms.cardDesc}>{m.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={m.color} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const ms = StyleSheet.create({
  container: { padding: 20, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#37474F', textAlign: 'center' },
  sub: { fontSize: 15, color: '#78909C', textAlign: 'center', marginBottom: 30, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16, elevation: 3, borderLeftWidth: 5 },
  cardEmoji: { fontSize: 36, marginRight: 14 },
  cardLabel: { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  cardDesc: { fontSize: 13, color: '#78909C', marginTop: 2 },
});

// ─── Blend It Game ─────────────────────────────────────────────────────────────

function BlendGame({ onBack, userId }) {
  const [idx, setIdx] = useState(0);
  const [tappedPhonemes, setTappedPhonemes] = useState([]);
  const [blended, setBlended] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const current = BLENDING_WORDS[idx];

  const speakPhoneme = (ph) => {
    Speech.speak(ph, { rate: 0.8, pitch: 1.1 });
    if (!tappedPhonemes.includes(ph)) {
      setTappedPhonemes(prev => [...prev, ph]);
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
    Speech.speak(current.word, { rate: 0.75, pitch: 1.1 });
    setBlended(true);
    setScore(s => s + 1);
    if (userId) checkQuestProgress(userId, 'Phonics');
  };

  const handleNext = () => {
    if (idx + 1 >= BLENDING_WORDS.length) {
      // Log session when game finishes
      if (userId) logSession({ studentId: userId, activityType: 'phonics_blend', score, total: BLENDING_WORDS.length, details: { game: 'Blend It' } });
      setFinished(true);
      return;
    }
    setIdx(i => i + 1);
    setTappedPhonemes([]);
    setBlended(false);
  };

  if (finished) return <ScoreScreen score={score} total={BLENDING_WORDS.length} onBack={onBack} label="Blend It!" color="#FF9800" />;

  return (
    <View style={bg.container}>
      <LinearGradient colors={['#FF9800', '#F57C00']} style={bg.header}>
        <Text style={bg.headerTitle}>Blend It! 🔗</Text>
        <Text style={bg.headerSub}>{idx + 1} / {BLENDING_WORDS.length}</Text>
      </LinearGradient>

      <View style={bg.card}>
        <Text style={bg.emoji}>{current.emoji}</Text>
        <Text style={bg.instruction}>Tap each sound, then BLEND!</Text>

        <View style={bg.phonemeRow}>
          {current.phonemes.map((ph, i) => {
            const tapped = tappedPhonemes.includes(ph);
            return (
              <TouchableOpacity key={i} style={[bg.phonemeTile, tapped && bg.phonemeTileTapped]} onPress={() => speakPhoneme(ph)} activeOpacity={0.7}>
                <Text style={[bg.phonemeText, tapped && bg.phonemeTextTapped]}>/{ph}/</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <TouchableOpacity style={[bg.blendBtn, blended && bg.blendBtnDone]} onPress={blended ? handleNext : handleBlend} activeOpacity={0.8}>
            <Text style={bg.blendBtnText}>{blended ? `"${current.word}" ✓  →  Next` : '🔗 BLEND!'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const bg = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: { paddingTop: 70, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: { flex: 1, margin: 20, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 4 },
  emoji: { fontSize: 80, marginBottom: 16 },
  instruction: { fontSize: 16, color: '#78909C', marginBottom: 24 },
  phonemeRow: { flexDirection: 'row', gap: 12, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' },
  phonemeTile: { backgroundColor: '#FFF3E0', borderWidth: 2, borderColor: '#FF9800', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, minWidth: 60, alignItems: 'center' },
  phonemeTileTapped: { backgroundColor: '#FF9800', borderColor: '#E65100' },
  phonemeText: { fontSize: 24, fontWeight: 'bold', color: '#FF9800' },
  phonemeTextTapped: { color: '#fff' },
  blendBtn: { backgroundColor: '#FF9800', borderRadius: 16, paddingHorizontal: 40, paddingVertical: 16 },
  blendBtnDone: { backgroundColor: '#4CAF50' },
  blendBtnText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
});

// ─── Rhyme Time Game ───────────────────────────────────────────────────────────

function RhymeGame({ onBack, userId }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = RHYMING_ROUNDS[idx];

  const speak = (word) => Speech.speak(word, { rate: 0.8, pitch: 1.1 });

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === current.correct;
    if (isCorrect) {
      Speech.speak('Great job! They rhyme!', { rate: 0.85 });
      setScore(s => s + 1);
      if (userId) checkQuestProgress(userId, 'Phonics');
    } else {
      Speech.speak(`Not quite! ${current.correct} rhymes with ${current.target}.`, { rate: 0.85 });
    }
  };

  const handleNext = () => {
    if (idx + 1 >= RHYMING_ROUNDS.length) {
      if (userId) logSession({ studentId: userId, activityType: 'phonics_rhyme', score, total: RHYMING_ROUNDS.length, details: { game: 'Rhyme Time' } });
      setFinished(true);
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
  };

  if (finished) return <ScoreScreen score={score} total={RHYMING_ROUNDS.length} onBack={onBack} label="Rhyme Time!" color="#E91E63" />;

  return (
    <View style={rg.container}>
      <LinearGradient colors={['#E91E63', '#C2185B']} style={rg.header}>
        <Text style={rg.headerTitle}>Rhyme Time! 🎵</Text>
        <Text style={rg.headerSub}>{idx + 1} / {RHYMING_ROUNDS.length}</Text>
      </LinearGradient>

      <View style={rg.card}>
        <TouchableOpacity onPress={() => speak(current.target)} activeOpacity={0.8} style={rg.targetBox}>
          <Text style={rg.targetEmoji}>{current.emoji}</Text>
          <Text style={rg.targetWord}>{current.target}</Text>
          <Text style={rg.tapHint}>🔊 Tap to hear</Text>
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
  container: { flex: 1, backgroundColor: '#FCE4EC' },
  header: { paddingTop: 70, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: { flex: 1, margin: 20, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 4 },
  targetBox: { alignItems: 'center', backgroundColor: '#FCE4EC', borderRadius: 20, padding: 20, width: '70%', marginBottom: 20 },
  targetEmoji: { fontSize: 60, marginBottom: 8 },
  targetWord: { fontSize: 36, fontWeight: 'bold', color: '#C2185B' },
  tapHint: { fontSize: 12, color: '#AD1457', marginTop: 4 },
  question: { fontSize: 15, color: '#78909C', marginBottom: 20, textAlign: 'center' },
  optionRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 },
  optionTile: { backgroundColor: '#F3E5F5', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, borderWidth: 2, borderColor: '#E91E63' },
  optionCorrect: { backgroundColor: '#E8F5E9', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, borderWidth: 2, borderColor: '#4CAF50' },
  optionWrong: { backgroundColor: '#FFEBEE', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, borderWidth: 2, borderColor: '#F44336' },
  optionText: { fontSize: 22, fontWeight: 'bold', color: '#37474F' },
  nextBtn: { backgroundColor: '#E91E63', borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14 },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

// ─── Segment Game ──────────────────────────────────────────────────────────────

function SegmentGame({ onBack, userId }) {
  const [idx, setIdx] = useState(0);
  const [taps, setTaps] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const tapAnim = useRef(new Animated.Value(1)).current;

  const current = SEGMENTING_WORDS[idx];

  const speakWord = () => Speech.speak(current.word, { rate: 0.65, pitch: 1.1 });

  const handleTap = () => {
    if (answered) return;
    const next = taps + 1;
    setTaps(next);
    Speech.speak(current.phonemes[next - 1] || '', { rate: 0.8 });
    // Pulse animation
    Animated.sequence([
      Animated.timing(tapAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(tapAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleCheck = () => {
    if (answered) {
      if (idx + 1 >= SEGMENTING_WORDS.length) {
        if (userId) logSession({ studentId: userId, activityType: 'phonics_segment', score, total: SEGMENTING_WORDS.length, details: { game: 'Count the Sounds' } });
        setFinished(true);
        return;
      }
      setIdx(i => i + 1);
      setTaps(0);
      setAnswered(false);
      return;
    }
    setAnswered(true);
    const isCorrect = taps === current.count;
    if (isCorrect) {
      Speech.speak(`That's right! ${current.word} has ${current.count} sounds.`, { rate: 0.85 });
      setScore(s => s + 1);
      if (userId) checkQuestProgress(userId, 'Phonics');
    } else {
      Speech.speak(`${current.word} has ${current.count} sounds. Let's try again next time!`, { rate: 0.85 });
    }
  };

  if (finished) return <ScoreScreen score={score} total={SEGMENTING_WORDS.length} onBack={onBack} label="Count the Sounds!" color="#4CAF50" />;

  const isCorrect = answered && taps === current.count;

  return (
    <View style={sg.container}>
      <LinearGradient colors={['#4CAF50', '#388E3C']} style={sg.header}>
        <Text style={sg.headerTitle}>Count the Sounds! 🔢</Text>
        <Text style={sg.headerSub}>{idx + 1} / {SEGMENTING_WORDS.length}</Text>
      </LinearGradient>

      <View style={sg.card}>
        <TouchableOpacity onPress={speakWord} style={sg.wordBox} activeOpacity={0.7}>
          <Text style={sg.wordEmoji}>{current.emoji}</Text>
          <Text style={sg.wordText}>{current.word}</Text>
          <Text style={sg.tapHint}>🔊 Hear the word</Text>
        </TouchableOpacity>

        <Text style={sg.instruction}>Tap the drum for each sound you hear:</Text>

        <Animated.View style={{ transform: [{ scale: tapAnim }] }}>
          <TouchableOpacity style={sg.drum} onPress={handleTap} activeOpacity={0.7}>
            <Text style={sg.drumText}>🥁</Text>
            <Text style={sg.drumCount}>{taps}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sound boxes */}
        <View style={sg.boxRow}>
          {Array.from({ length: Math.max(taps, current.count) }).map((_, i) => (
            <View key={i} style={[sg.soundBox, i < taps && sg.soundBoxFilled]}>
              {answered && i < current.phonemes.length && (
                <Text style={sg.phonemeInBox}>/{current.phonemes[i]}/</Text>
              )}
            </View>
          ))}
        </View>

        {answered && (
          <Text style={[sg.result, isCorrect ? sg.resultCorrect : sg.resultWrong]}>
            {isCorrect ? '🎉 Correct!' : `Not quite — ${current.word} has ${current.count} sounds`}
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
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: { paddingTop: 70, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: { flex: 1, margin: 20, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 4 },
  wordBox: { alignItems: 'center', backgroundColor: '#F1F8E9', borderRadius: 20, padding: 16, width: '65%', marginBottom: 16 },
  wordEmoji: { fontSize: 52 },
  wordText: { fontSize: 30, fontWeight: 'bold', color: '#2E7D32', marginTop: 4 },
  tapHint: { fontSize: 12, color: '#66BB6A', marginTop: 4 },
  instruction: { fontSize: 14, color: '#78909C', marginBottom: 16, textAlign: 'center' },
  drum: { backgroundColor: '#FFF3E0', borderRadius: 50, width: 100, height: 100, justifyContent: 'center', alignItems: 'center', elevation: 4, marginBottom: 20 },
  drumText: { fontSize: 40 },
  drumCount: { fontSize: 18, fontWeight: 'bold', color: '#E65100' },
  boxRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  soundBox: { width: 44, height: 44, borderWidth: 2, borderColor: '#81C784', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FBE7' },
  soundBoxFilled: { backgroundColor: '#4CAF50', borderColor: '#2E7D32' },
  phonemeInBox: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  result: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  resultCorrect: { color: '#2E7D32' },
  resultWrong: { color: '#C62828' },
  checkBtn: { backgroundColor: '#4CAF50', borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14 },
  checkBtnNext: { backgroundColor: '#1B5E20' },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

// ─── Score Screen ──────────────────────────────────────────────────────────────

function ScoreScreen({ score, total, onBack, label, color }) {
  const percent = Math.round((score / total) * 100);
  const msg = percent >= 80 ? '🎉 Amazing!' : percent >= 50 ? '👍 Good effort!' : '💪 Keep practising!';
  React.useEffect(() => {
    Speech.speak(`${msg} You got ${score} out of ${total}.`, { rate: 0.85 });
  }, []);
  return (
    <View style={[ss.container, { backgroundColor: color + '15' }]}>
      <View style={ss.card}>
        <Text style={ss.topEmoji}>🏆</Text>
        <Text style={ss.label}>{label}</Text>
        <Text style={[ss.score, { color }]}>{score} / {total}</Text>
        <Text style={ss.percent}>{percent}%</Text>
        <Text style={ss.msg}>{msg}</Text>
        <TouchableOpacity style={[ss.btn, { backgroundColor: color }]} onPress={onBack}>
          <Text style={ss.btnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 40, alignItems: 'center', elevation: 6, width: '100%' },
  topEmoji: { fontSize: 70, marginBottom: 8 },
  label: { fontSize: 18, color: '#78909C', marginBottom: 8 },
  score: { fontSize: 64, fontWeight: 'bold' },
  percent: { fontSize: 22, color: '#90A4AE', marginBottom: 12 },
  msg: { fontSize: 22, fontWeight: 'bold', color: '#37474F', marginBottom: 32, textAlign: 'center' },
  btn: { borderRadius: 16, paddingHorizontal: 48, paddingVertical: 16 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function PhonicsActivityScreen({ navigation }) {
  const { profile } = useAuth();
  const { getOverlayColor } = useTheme();
  const [mode, setMode] = useState(null);
  const overlayColor = getOverlayColor ? getOverlayColor() : null;

  const handleBack = () => setMode(null);

  const renderGame = () => {
    if (mode === 'blend')   return <BlendGame   onBack={handleBack} userId={profile?.id} />;
    if (mode === 'rhyme')   return <RhymeGame   onBack={handleBack} userId={profile?.id} />;
    if (mode === 'segment') return <SegmentGame onBack={handleBack} userId={profile?.id} />;
    return null;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <GoBackBtn />
        {mode ? renderGame() : <ModeSelector onSelect={setMode} />}
      </SafeAreaView>
      {overlayColor && (
        <View style={[styles.overlay, { backgroundColor: overlayColor }]} pointerEvents="none" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F7FA' },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
});
