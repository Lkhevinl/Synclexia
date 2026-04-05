import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Alert, ActivityIndicator,
} from 'react-native';
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

function ModeSelector({ onSelect }) {
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, []);

  const modes = [
    { id: 'blend',   label: 'Blend It!',        icon: 'link-2',    color: '#FF9800', desc: 'Put sounds together to make a word', gradient: ['#FF9800', '#F57C00'] },
    { id: 'rhyme',   label: 'Rhyme Time!',       icon: 'music',     color: '#E91E63', desc: 'Find the word that rhymes', gradient: ['#E91E63', '#C2185B'] },
    { id: 'segment', label: 'Count the Sounds!', icon: 'hash',      color: '#4CAF50', desc: 'How many sounds does the word have?', gradient: ['#4CAF50', '#388E3C'] },
  ];
  return (
    <ScrollView contentContainerStyle={ms.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ transform: [{ scale: headerAnim }], opacity: headerAnim }}>
        <View style={[ms.headerCard, { backgroundColor: c.primary }]}>
          <Icon name="gamepad-2" size="xl" color="rgba(255,255,255,0.9)" style={{ marginBottom: 8 }} />
          <Text style={ms.title}>Phonics Activities</Text>
          <Text style={ms.sub}>Choose a game to play</Text>
        </View>
      </Animated.View>

      {modes.map((m, index) => (
        <AnimatedCard key={m.id} style={ms.cardWrapper} onPress={() => onSelect(m.id)} delay={index * 100}>
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
        </AnimatedCard>
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

// ─── Blend It Game ─────────────────────────────────────────────────────────────

function EmptyContent({ label, color, onBack }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <Text style={{ fontSize: 60, marginBottom: 16 }}>📭</Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#37474F', textAlign: 'center', marginBottom: 8 }}>{label}</Text>
      <Text style={{ fontSize: 14, color: '#78909C', textAlign: 'center', marginBottom: 32 }}>No activities yet. Ask an admin to add content.</Text>
      <TouchableOpacity style={{ backgroundColor: color, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 }} onPress={onBack}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>← Back</Text>
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

  if (!words.length) return <EmptyContent label="Blend It!" color="#FF9800" onBack={onBack} />;
  if (finished) return <ScoreScreen score={score} total={words.length} onBack={onBack} label="Blend It!" color="#FF9800" />;

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
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: { paddingTop: 70, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 4 },
  helpBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  card: { flex: 1, margin: 20, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 4 },
  emoji: { fontSize: 80, marginBottom: 16 },
  instruction: { fontSize: 16, color: '#78909C', marginBottom: 24 },
  phonemeRow: { flexDirection: 'row', gap: 12, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' },
  phonemeTile: { backgroundColor: '#FFF3E0', borderWidth: 2, borderColor: '#FF9800', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, minWidth: 60, alignItems: 'center' },
  phonemeTileActive: { borderWidth: 3, borderColor: '#F57C00' },
  phonemeTileTapped: { backgroundColor: '#FF9800', borderColor: '#E65100' },
  phonemeTileActiveTapped: { borderWidth: 3, borderColor: '#fff' },
  phonemeText: { fontSize: 24, fontWeight: 'bold', color: '#FF9800' },
  phonemeTextActive: { color: '#F57C00' },
  phonemeTextTapped: { color: '#fff' },
  blendBtn: { backgroundColor: '#FF9800', borderRadius: 16, paddingHorizontal: 40, paddingVertical: 16 },
  blendBtnDone: { backgroundColor: '#4CAF50' },
  blendBtnText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
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

  if (!rounds.length) return <EmptyContent label="Rhyme Time!" color="#E91E63" onBack={onBack} />;
  if (finished) return <ScoreScreen score={score} total={rounds.length} onBack={onBack} label="Rhyme Time!" color="#E91E63" />;

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

  if (!segWords.length) return <EmptyContent label="Count the Sounds!" color="#4CAF50" onBack={onBack} />;
  if (finished) return <ScoreScreen score={score} total={segWords.length} onBack={onBack} label="Count the Sounds!" color="#4CAF50" />;

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
            <Icon name="music" size="lg" color="#fff" />
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
  soundBoxActive: { borderColor: '#1B5E20' },
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
  const msg = percent >= 80 ? 'Amazing!' : percent >= 50 ? 'Good effort!' : 'Keep practising!';
  React.useEffect(() => {
    Speech.speak(`${msg} You got ${score} out of ${total}.`, { rate: 0.85 });
  }, []);
  return (
    <View style={[ss.container, { backgroundColor: color + '15' }]}>
      <View style={ss.card}>
        <Icon name="trophy" size="xl" color="#FF9800" />
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

export default function PhonicsActivityScreen() {
  const { profile } = useAuth();
  const { colors, getOverlayColor } = useTheme();
  const [mode, setMode] = useState(null);
  const [contentMap, setContentMap] = useState({ blend: [], rhyme: [], segment: [] });
  const [loading, setLoading] = useState(true);
  const overlayColor = getOverlayColor ? getOverlayColor() : null;

  useEffect(() => {
    Promise.all([
      fetchActivityContent('blend'),
      fetchActivityContent('rhyme'),
      fetchActivityContent('segment'),
    ]).then(([blend, rhyme, segment]) => {
      setContentMap({ blend, rhyme, segment });
      setLoading(false);
    });
  }, []);

  const handleBack = () => setMode(null);

  const renderGame = () => {
    if (mode === 'blend')   return <BlendGame   onBack={handleBack} userId={profile?.id} items={contentMap.blend} />;
    if (mode === 'rhyme')   return <RhymeGame   onBack={handleBack} userId={profile?.id} items={contentMap.rhyme} />;
    if (mode === 'segment') return <SegmentGame onBack={handleBack} userId={profile?.id} items={contentMap.segment} />;
    return null;
  };

  return (
    <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>
        <StudentPageHeader title="Phonics Activities" />
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
