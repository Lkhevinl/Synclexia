import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Alert, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { TABLES } from '../../lib/constants';
import * as Speech from 'expo-speech';
import Icon from '../../components/icons/Icon';
import ScreenWrapper from '../../components/ScreenWrapper';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import StudentCard from '../../components/student/StudentCard';
import c from '../../components/student/candyTokens';
import { logSession } from '../../lib/analyticsHelper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ─── DB Fetch ─────────────────────────────────────────────────────────────────

const fetchSpellingWords = async () => {
  const { data, error } = await supabase
    .from(TABLES.SPELLING_WORDS)
    .select('id, word, emoji, hint, difficulty_level')
    .eq('is_active', true)
    .order('difficulty_level', { ascending: true });
  if (error || !data) return [];
  return data;
};

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

function AnimatedModeCard({ children, style, onPress, delay = 0 }) {
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

function ModeSelector({ onSelect }) {
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, []);

  const modes = [
    { id: 'dictation', icon: 'volume-2',  label: 'Listen & Spell',   desc: 'Hear the word, then tap the letters to spell it', gradient: ['#2196F3', '#1565C0'] },
    { id: 'hint',      icon: 'lightbulb', label: 'Picture Spelling',  desc: 'See the picture and hint, then spell the word',    gradient: ['#9C27B0', '#6A1B9A'] },
  ];

  return (
    <ScrollView contentContainerStyle={ms.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ transform: [{ scale: headerAnim }], opacity: headerAnim }}>
        <View style={[ms.headerCard, { backgroundColor: c.primary }]}>
          <Icon name="type" size="xl" color="rgba(255,255,255,0.9)" style={{ marginBottom: 8 }} />
          <Text style={ms.title}>Spelling Practice</Text>
          <Text style={ms.sub}>Choose how you want to learn</Text>
        </View>
      </Animated.View>

      {modes.map((m, index) => (
        <AnimatedModeCard key={m.id} style={ms.cardWrapper} onPress={() => onSelect(m.id)} delay={index * 100}>
          <View style={[ms.card, { backgroundColor: m.gradient[0] }]}>
            <View style={ms.cardContent}>
              <View style={ms.emojiCircle}>
                <Icon name={m.icon} size="md" color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ms.cardLabel}>{m.label}</Text>
                <Text style={ms.cardDesc}>{m.desc}</Text>
              </View>
              <View style={ms.playBtn}>
                <Icon name="play" size="md" color="#fff" />
              </View>
            </View>
            <View style={ms.cardShine} />
          </View>
        </AnimatedModeCard>
      ))}
    </ScrollView>
  );
}

const ms = StyleSheet.create({
  container: { padding: 20, paddingTop: 80, paddingBottom: 40 },
  headerCard: { borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24, elevation: 6 },
  headerEmoji: { fontSize: 50, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4 },
  cardWrapper: { marginBottom: 16, borderRadius: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  card: { borderRadius: 20, padding: 20, overflow: 'hidden' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  emojiCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardEmoji: { fontSize: 28 },
  cardLabel: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  cardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 18 },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  cardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.1)', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});

// ─── Core Spelling Game ───────────────────────────────────────────────────────

function SpellingGame({ mode, onBack, userId, wordBank, dyslexiaTextStyle = {} }) {
  // Shuffle words fetched from DB for this session
  const [wordList] = useState(() => shuffle(wordBank).slice(0, Math.min(10, wordBank.length)));
  const [wordIdx, setWordIdx] = useState(0);
  const [tiles, setTiles] = useState(() => wordBank[0] ? buildTiles(wordBank[0].word) : []);
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
    if (!current) return; // guard: no words loaded yet
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

  // No content from DB
  if (!wordList.length || !current) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>📭</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#37474F' }}>No Words Available</Text>
        <Text style={{ fontSize: 14, color: '#78909C', textAlign: 'center', marginBottom: 32 }}>Ask an admin to add spelling words.</Text>
        <TouchableOpacity style={{ backgroundColor: '#9C27B0', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 }} onPress={onBack}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availableTiles = tiles.filter(t => !answer.find(a => a.id === t.id));
  const spelled = answer.map(t => t.letter).join('');
  const bounceStyle = { transform: [{ scale: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }] };

  const accentColor = mode === 'dictation' ? '#2196F3' : '#9C27B0';

  return (
    <View style={[game.container, { backgroundColor: accentColor + '10' }]}>
      {/* Header */}
      <StudentPageHeader
        title={mode === 'dictation' ? 'Listen & Spell' : 'Picture Spelling'}
        onBack={onBack}
        right={<Text style={game.headerSub}>{wordIdx + 1} / {wordList.length}  {score}</Text>}
      />

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
            <Text style={[game.hintText, dyslexiaTextStyle]}>{current.hint}</Text>
          )}

          {/* Speak button */}
          <TouchableOpacity style={[game.speakBtn, { borderColor: accentColor }]} onPress={speakWord}>
            <Icon name="volume-2" size="md" color={accentColor} />
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
              {correct ? 'Correct!' : `The word is "${current.word}"`}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={game.actionRow}>
            {!checked ? (
              <>
                <TouchableOpacity style={[game.clearBtn]} onPress={handleClear}>
                  <Icon name="delete" size="md" color="#78909C" />
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
                  {wordIdx + 1 >= wordList.length ? 'See Results' : 'Next Word'}
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
  const { colors } = useTheme();
  const percent = Math.round((score / total) * 100);
  const msg = percent >= 80 ? 'Spelling Star!' : percent >= 50 ? 'Nice Work!' : 'Keep Practising!';

  useEffect(() => {
    Speech.speak(`${msg.replace(/[^\w\s!]/g, '')}. You spelled ${score} out of ${total} words correctly!`, { rate: 0.85 });
  }, []);

  return (
    <View style={[fin.container, { backgroundColor: colors.surface }]}>
      <StudentPageHeader
        title="Results"
        onBack={onBack}
      />
      <View style={fin.card}>
        <Icon name="trophy" size="xl" color="#FF9800" />
        <Text style={fin.msg}>{msg}</Text>
        <Text style={fin.scoreText}>{score} / {total} words</Text>
        <Text style={fin.percentText}>{percent}% Accuracy</Text>

        {/* Progress bar */}
        <View style={fin.barBg}>
          <View style={[fin.barFill, { width: `${percent}%`, backgroundColor: percent >= 80 ? '#4CAF50' : percent >= 50 ? '#FF9800' : '#F44336' }]} />
        </View>

        <TouchableOpacity style={fin.btn} onPress={onBack}>
          <Text style={fin.btnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const fin = StyleSheet.create({
  container: { flex: 1 },
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

export default function SpellingScreen() {
  const { profile } = useAuth();
  const { colors, getOverlayColor, getDyslexiaTextStyle } = useTheme();
  const [mode, setMode] = useState(null);
  const [wordBank, setWordBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const overlayColor = getOverlayColor ? getOverlayColor() : null;

  useEffect(() => {
    fetchSpellingWords().then(words => {
      setWordBank(words);
      setLoading(false);
    });
  }, []);

  const handleBack = () => setMode(null);

  return (
    <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>
        <StudentPageHeader title="Spelling Practice" />
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={{ marginTop: 10, color: '#78909C' }}>Loading words...</Text>
          </View>
        ) : wordBank.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name="type" size="xl" color="#78909C" />
            <Text style={{ color: '#78909C', marginTop: 10 }}>No words yet. Ask an admin to add content.</Text>
          </View>
        ) : mode ? (
          <SpellingGame mode={mode} onBack={handleBack} userId={profile?.id} wordBank={wordBank} dyslexiaTextStyle={getDyslexiaTextStyle()} />
        ) : (
          <>
            <StudentCard variant="tinted" style={root.hintCard}>
              <View style={root.hintRow}>
                <Icon name="info" size="md" color={c.primary} />
                <Text style={root.hintText}>
                  <Text style={{ fontWeight: 'bold' }}>How to use: </Text>
                  Choose a mode — "Listen & Spell" plays the word aloud, "Picture Spelling" shows a hint. Tap letters in order to spell!
                </Text>
              </View>
            </StudentCard>
            <ModeSelector onSelect={setMode} />
          </>
        )}
      {overlayColor && (
        <View style={[root.overlay, { backgroundColor: overlayColor, pointerEvents: 'none' }]} />
      )}
    </ScreenWrapper>
  );
}

const root = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  hintCard: { margin: 16, marginBottom: 4 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  hintText: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 19 },
});
