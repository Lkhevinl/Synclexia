import React, { useState, useEffect, useRef } from 'react';
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

// ─── Word Bank ─────────────────────────────────────────────────────────────────
// Words grouped by difficulty (CVC → 4-letter → 5-letter)

const WORD_BANK = [
  // Level 1 — CVC (3-letter)
  { word: 'cat',  emoji: '🐱', hint: 'A fluffy pet that meows' },
  { word: 'dog',  emoji: '🐶', hint: 'A pet that barks' },
  { word: 'sun',  emoji: '☀️', hint: 'It shines in the sky' },
  { word: 'hat',  emoji: '🎩', hint: 'You wear it on your head' },
  { word: 'bug',  emoji: '🐛', hint: 'A small crawling creature' },
  { word: 'pig',  emoji: '🐷', hint: 'A pink farm animal' },
  { word: 'map',  emoji: '🗺️', hint: 'Used to find your way' },
  { word: 'cup',  emoji: '🥤', hint: 'You drink from it' },
  // Level 2 — 4-letter
  { word: 'frog', emoji: '🐸', hint: 'Jumps and says ribbit' },
  { word: 'ship', emoji: '🚢', hint: 'Sails on the ocean' },
  { word: 'clap', emoji: '👏', hint: 'You do this with your hands' },
  { word: 'flag', emoji: '🚩', hint: 'Waves in the wind' },
  { word: 'drum', emoji: '🥁', hint: 'You bang on it to make music' },
  { word: 'bell', emoji: '🔔', hint: 'It rings loudly' },
  // Level 3 — 5-letter
  { word: 'smile', emoji: '😊', hint: 'What a happy face makes' },
  { word: 'crane', emoji: '🏗️', hint: 'Lifts heavy things at a building site' },
  { word: 'grass', emoji: '🌿', hint: 'Green plants on the ground' },
  { word: 'light', emoji: '💡', hint: 'A bulb gives you this' },
  { word: 'cloud', emoji: '☁️', hint: 'Floats in the sky' },
  { word: 'stone', emoji: '🪨', hint: 'A hard piece of rock' },
];

// Shuffle an array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build letter tiles with unique IDs (handles duplicate letters)
function buildTiles(word) {
  return shuffle(word.split('').map((ch, i) => ({ id: `${ch}-${i}`, letter: ch })));
}

// ─── Mode Selector ────────────────────────────────────────────────────────────

function ModeSelector({ onSelect }) {
  return (
    <ScrollView contentContainerStyle={ms.container} showsVerticalScrollIndicator={false}>
      <Text style={ms.title}>Spelling Practice 🔤</Text>
      <Text style={ms.sub}>Choose how you want to learn</Text>
      {[
        { id: 'dictation', emoji: '🔊', label: 'Listen & Spell',   desc: 'Hear the word, then tap the letters to spell it', color: '#2196F3' },
        { id: 'hint',      emoji: '💡', label: 'Picture Spelling',  desc: 'See the picture and hint, then spell the word',    color: '#9C27B0' },
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
  container: { padding: 20, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#37474F', textAlign: 'center' },
  sub: { fontSize: 15, color: '#78909C', textAlign: 'center', marginBottom: 30, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16, elevation: 3, borderLeftWidth: 5 },
  emoji: { fontSize: 36, marginRight: 14 },
  label: { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  desc: { fontSize: 13, color: '#78909C', marginTop: 2 },
});

// ─── Core Spelling Game ───────────────────────────────────────────────────────

function SpellingGame({ mode, onBack, userId }) {
  // Shuffle words for this session
  const [wordList] = useState(() => shuffle(WORD_BANK).slice(0, 10));
  const [wordIdx, setWordIdx] = useState(0);
  const [tiles, setTiles] = useState(() => buildTiles(WORD_BANK[0].word));
  const [answer, setAnswer] = useState([]);   // Tiles the user has placed
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const current = wordList[wordIdx];

  // When word changes, reset tiles
  useEffect(() => {
    setTiles(buildTiles(current.word));
    setAnswer([]);
    setChecked(false);
    setCorrect(false);

    // Auto-speak in dictation mode
    if (mode === 'dictation') {
      setTimeout(() => Speech.speak(current.word, { rate: 0.65, pitch: 1.1 }), 300);
    }
  }, [wordIdx]);

  const speakWord = () => Speech.speak(current.word, { rate: 0.65, pitch: 1.1 });

  const handleTileTap = (tile) => {
    if (checked) return;
    if (answer.find(t => t.id === tile.id)) {
      // Remove from answer (unplace)
      setAnswer(prev => prev.filter(t => t.id !== tile.id));
    } else {
      // Add to answer
      setAnswer(prev => [...prev, tile]);
    }
  };

  const handleCheck = () => {
    if (answer.length === 0) return;
    const spelled = answer.map(t => t.letter).join('');
    const isCorrect = spelled.toLowerCase() === current.word.toLowerCase();
    setChecked(true);
    setCorrect(isCorrect);

    if (isCorrect) {
      setScore(s => s + 1);
      if (userId) {
        checkQuestProgress(userId, 'Writing');
        checkQuestProgress(userId, 'Spelling');
      }
      Speech.speak('Correct! Well done!', { rate: 0.85 });
      // Bounce animation
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
    } else {
      Speech.speak(`Almost! The word is ${current.word}.`, { rate: 0.85 });
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (wordIdx + 1 >= wordList.length) {
      // Log spelling session
      if (userId) logSession({ studentId: userId, activityType: 'spelling', score, total: wordList.length, details: { mode } });
      setFinished(true);
      return;
    }
    bounceAnim.setValue(0);
    setWordIdx(i => i + 1);
  };

  const handleClear = () => {
    if (checked) return;
    setAnswer([]);
  };

  if (finished) {
    return <FinishScreen score={score} total={wordList.length} onBack={onBack} />;
  }

  const availableTiles = tiles.filter(t => !answer.find(a => a.id === t.id));
  const spelled = answer.map(t => t.letter).join('');
  const bounceStyle = { transform: [{ scale: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }] };

  const accentColor = mode === 'dictation' ? '#2196F3' : '#9C27B0';

  return (
    <View style={[game.container, { backgroundColor: accentColor + '10' }]}>
      {/* Header */}
      <LinearGradient colors={[accentColor, accentColor + 'CC']} style={game.header}>
        <Text style={game.headerTitle}>{mode === 'dictation' ? 'Listen & Spell 🔊' : 'Picture Spelling 💡'}</Text>
        <Text style={game.headerSub}>{wordIdx + 1} / {wordList.length}   ⭐ {score}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={game.body} keyboardShouldPersistTaps="always">
        {/* Word Card */}
        <View style={game.card}>
          {/* Picture Hint (always in hint mode, hidden in dictation until checked) */}
          {(mode === 'hint' || checked) && (
            <Text style={game.emoji}>{current.emoji}</Text>
          )}
          {mode === 'dictation' && !checked && (
            <Text style={game.emoji}>❓</Text>
          )}
          
          {/* Hint text */}
          {mode === 'hint' && (
            <Text style={game.hintText}>{current.hint}</Text>
          )}

          {/* Speak button */}
          <TouchableOpacity style={[game.speakBtn, { borderColor: accentColor }]} onPress={speakWord}>
            <Ionicons name="volume-high" size={22} color={accentColor} />
            <Text style={[game.speakBtnText, { color: accentColor }]}>
              {mode === 'dictation' ? 'Hear the word again' : 'Hear how it sounds'}
            </Text>
          </TouchableOpacity>

          {/* Answer Row (placed tiles) */}
          <Animated.View style={[game.answerRow, checked && (correct ? game.answerCorrect : game.answerWrong), { transform: [{ translateX: shakeAnim }] }, correct && bounceStyle]}>
            {answer.length === 0 ? (
              <Text style={game.answerPlaceholder}>Tap letters below ↓</Text>
            ) : (
              answer.map((tile, i) => (
                <TouchableOpacity key={tile.id} style={[game.answerTile, { borderColor: accentColor }]} onPress={() => !checked && handleTileTap(tile)}>
                  <Text style={[game.answerTileLetter, { color: accentColor }]}>{tile.letter.toUpperCase()}</Text>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>

          {/* Feedback */}
          {checked && (
            <Text style={[game.feedback, correct ? game.feedbackCorrect : game.feedbackWrong]}>
              {correct ? '🎉 Correct!' : `The word is  "${current.word}"`}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={game.actionRow}>
            {!checked ? (
              <>
                <TouchableOpacity style={[game.clearBtn]} onPress={handleClear}>
                  <Ionicons name="backspace-outline" size={20} color="#78909C" />
                  <Text style={game.clearBtnText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[game.checkBtn, { backgroundColor: accentColor }, answer.length === 0 && game.checkBtnDisabled]}
                  onPress={handleCheck}
                  disabled={answer.length === 0}
                >
                  <Text style={game.checkBtnText}>Check ✓</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[game.nextBtn, { backgroundColor: accentColor }]} onPress={handleNext}>
                <Text style={game.nextBtnText}>
                  {wordIdx + 1 >= wordList.length ? 'See Results 🏆' : 'Next Word →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Letter Tile Bank */}
        {!checked && (
          <View style={game.tileBank}>
            <Text style={game.tileBankLabel}>Available Letters</Text>
            <View style={game.tileRow}>
              {availableTiles.map(tile => (
                <TouchableOpacity key={tile.id} style={game.tile} onPress={() => handleTileTap(tile)} activeOpacity={0.7}>
                  <Text style={game.tileLetter}>{tile.letter.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
              {availableTiles.length === 0 && (
                <Text style={{ color: '#90A4AE', fontSize: 14 }}>All tiles placed!</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const game = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 70, paddingBottom: 18, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 15 },
  body: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 4, marginBottom: 16 },
  emoji: { fontSize: 64, marginBottom: 8 },
  hintText: { fontSize: 15, color: '#78909C', textAlign: 'center', marginBottom: 12 },
  speakBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20, gap: 8 },
  speakBtnText: { fontWeight: 'bold', fontSize: 14 },
  answerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', minHeight: 60, alignItems: 'center', backgroundColor: '#F5F7FA', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16, width: '100%' },
  answerCorrect: { backgroundColor: '#E8F5E9', borderWidth: 2, borderColor: '#4CAF50' },
  answerWrong: { backgroundColor: '#FFEBEE', borderWidth: 2, borderColor: '#F44336' },
  answerPlaceholder: { color: '#B0BEC5', fontSize: 15 },
  answerTile: { backgroundColor: '#fff', borderWidth: 2, borderRadius: 10, width: 44, height: 44, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  answerTileLetter: { fontSize: 22, fontWeight: 'bold' },
  feedback: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  feedbackCorrect: { color: '#2E7D32' },
  feedbackWrong: { color: '#C62828' },
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  clearBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ECEFF1', borderRadius: 14, paddingVertical: 14 },
  clearBtnText: { color: '#78909C', fontWeight: 'bold', fontSize: 16 },
  checkBtn: { flex: 2, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  checkBtnDisabled: { opacity: 0.4 },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  nextBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  tileBank: { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2 },
  tileBankLabel: { fontSize: 13, color: '#90A4AE', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  tile: { backgroundColor: '#E3F2FD', borderRadius: 12, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#90CAF9' },
  tileLetter: { fontSize: 24, fontWeight: 'bold', color: '#1565C0' },
});

// ─── Finish Screen ─────────────────────────────────────────────────────────────

function FinishScreen({ score, total, onBack }) {
  const percent = Math.round((score / total) * 100);
  const msg = percent >= 80 ? '🌟 Spelling Star!' : percent >= 50 ? '👏 Nice Work!' : '📚 Keep Practising!';

  useEffect(() => {
    Speech.speak(`${msg.replace(/[^\w\s!]/g, '')}. You spelled ${score} out of ${total} words correctly!`, { rate: 0.85 });
  }, []);

  return (
    <View style={fin.container}>
      <LinearGradient colors={['#2196F3', '#1565C0']} style={fin.header}>
        <Text style={fin.headerTitle}>Results</Text>
      </LinearGradient>
      <View style={fin.card}>
        <Text style={fin.trophyEmoji}>🏆</Text>
        <Text style={fin.msg}>{msg}</Text>
        <Text style={fin.scoreText}>{score} / {total} words</Text>
        <Text style={fin.percentText}>{percent}% Accuracy</Text>

        {/* Progress bar */}
        <View style={fin.barBg}>
          <View style={[fin.barFill, { width: `${percent}%`, backgroundColor: percent >= 80 ? '#4CAF50' : percent >= 50 ? '#FF9800' : '#F44336' }]} />
        </View>

        <TouchableOpacity style={fin.btn} onPress={onBack}>
          <Text style={fin.btnText}>Play Again 🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const fin = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { paddingTop: 70, paddingBottom: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  card: { flex: 1, margin: 20, backgroundColor: '#fff', borderRadius: 28, padding: 32, alignItems: 'center', elevation: 4 },
  trophyEmoji: { fontSize: 80, marginBottom: 12 },
  msg: { fontSize: 24, fontWeight: 'bold', color: '#37474F', marginBottom: 8 },
  scoreText: { fontSize: 40, fontWeight: 'bold', color: '#2196F3', marginBottom: 4 },
  percentText: { fontSize: 18, color: '#78909C', marginBottom: 24 },
  barBg: { width: '100%', height: 14, backgroundColor: '#ECEFF1', borderRadius: 7, overflow: 'hidden', marginBottom: 32 },
  barFill: { height: '100%', borderRadius: 7 },
  btn: { backgroundColor: '#2196F3', borderRadius: 16, paddingHorizontal: 48, paddingVertical: 16 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function SpellingScreen({ navigation }) {
  const { profile } = useAuth();
  const { getOverlayColor } = useTheme();
  const [mode, setMode] = useState(null);
  const overlayColor = getOverlayColor ? getOverlayColor() : null;

  const handleBack = () => setMode(null);

  return (
    <View style={root.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <GoBackBtn />
        {mode
          ? <SpellingGame mode={mode} onBack={handleBack} userId={profile?.id} />
          : <ModeSelector onSelect={setMode} />
        }
      </SafeAreaView>
      {overlayColor && (
        <View style={[root.overlay, { backgroundColor: overlayColor }]} pointerEvents="none" />
      )}
    </View>
  );
}

const root = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
});
