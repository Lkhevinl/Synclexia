import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder, Modal, StatusBar, Alert, ScrollView, TextInput, ActivityIndicator, Linking } from 'react-native';
import Svg, { Path, Circle, G, Polygon, Text as SvgText } from 'react-native-svg';
import Icon from '../../components/icons/Icon';
import * as ttsService from '../../lib/ttsService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { TABLES } from '../../lib/constants';
import { logSession } from '../../lib/analyticsHelper';
import ScreenWrapper from '../../components/ScreenWrapper';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import StudentCard from '../../components/student/StudentCard';
import c from '../../components/student/candyTokens';
import { useTheme } from '../../context/ThemeContext';

// Optional dependency: expo-speech-recognition (dev/production build, not Expo Go)
let ExpoSpeechRecognitionModule, useSpeechRecognitionEvent;
try {
  const mod = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch (_) {
  ExpoSpeechRecognitionModule = null;
  useSpeechRecognitionEvent = () => {};
}

const STT_AVAILABLE = !!ExpoSpeechRecognitionModule;

// ── Replace this with your actual tutorial video URL ──────────────────────────
const VIDEO_TUTORIAL_URL = 'https://www.youtube.com/results?search_query=letter+tracing+tutorial+for+kids+dyslexia';

// ── Normalized [x,y] waypoints (0-1) for each letter's strokes ────────────────
// Used to animate a tracing dot showing how to draw each letter
const LETTER_PATHS = {
  A: [[[0.5,0.05],[0.15,0.92]], [[0.5,0.05],[0.85,0.92]], [[0.28,0.55],[0.72,0.55]]],
  B: [[[0.22,0.08],[0.22,0.92],[0.65,0.88],[0.72,0.7],[0.65,0.5],[0.22,0.5],[0.68,0.46],[0.74,0.28],[0.68,0.12],[0.22,0.08]]],
  C: [[[0.82,0.22],[0.62,0.06],[0.38,0.06],[0.15,0.22],[0.08,0.5],[0.15,0.78],[0.38,0.94],[0.62,0.94],[0.82,0.78]]],
  D: [[[0.22,0.08],[0.22,0.92]], [[0.22,0.08],[0.6,0.12],[0.82,0.3],[0.82,0.7],[0.6,0.88],[0.22,0.92]]],
  E: [[[0.25,0.08],[0.25,0.92]], [[0.25,0.08],[0.78,0.08]], [[0.25,0.5],[0.65,0.5]], [[0.25,0.92],[0.78,0.92]]],
  F: [[[0.25,0.08],[0.25,0.92]], [[0.25,0.08],[0.78,0.08]], [[0.25,0.5],[0.65,0.5]]],
  G: [[[0.82,0.22],[0.62,0.06],[0.38,0.06],[0.15,0.22],[0.08,0.5],[0.15,0.78],[0.38,0.94],[0.62,0.94],[0.82,0.78],[0.82,0.5],[0.55,0.5]]],
  H: [[[0.2,0.08],[0.2,0.92]], [[0.8,0.08],[0.8,0.92]], [[0.2,0.5],[0.8,0.5]]],
  I: [[[0.35,0.08],[0.65,0.08]], [[0.5,0.08],[0.5,0.92]], [[0.35,0.92],[0.65,0.92]]],
  J: [[[0.65,0.08],[0.65,0.75],[0.5,0.9],[0.3,0.82],[0.25,0.68]]],
  K: [[[0.22,0.08],[0.22,0.92]], [[0.78,0.08],[0.22,0.5],[0.78,0.92]]],
  L: [[[0.28,0.08],[0.28,0.92],[0.78,0.92]]],
  M: [[[0.12,0.92],[0.12,0.08],[0.5,0.55],[0.88,0.08],[0.88,0.92]]],
  N: [[[0.18,0.92],[0.18,0.08],[0.82,0.92],[0.82,0.08]]],
  O: [[[0.5,0.05],[0.82,0.15],[0.95,0.5],[0.82,0.85],[0.5,0.95],[0.18,0.85],[0.05,0.5],[0.18,0.15],[0.5,0.05]]],
  P: [[[0.22,0.08],[0.22,0.92]], [[0.22,0.08],[0.65,0.12],[0.72,0.28],[0.65,0.46],[0.22,0.5]]],
  Q: [[[0.5,0.05],[0.82,0.15],[0.95,0.5],[0.82,0.85],[0.5,0.95],[0.18,0.85],[0.05,0.5],[0.18,0.15],[0.5,0.05]], [[0.62,0.72],[0.85,0.92]]],
  R: [[[0.22,0.08],[0.22,0.92]], [[0.22,0.08],[0.65,0.12],[0.72,0.28],[0.65,0.46],[0.22,0.5],[0.78,0.92]]],
  S: [[[0.78,0.18],[0.55,0.06],[0.25,0.12],[0.15,0.3],[0.35,0.46],[0.65,0.54],[0.85,0.7],[0.75,0.88],[0.45,0.94],[0.22,0.82]]],
  T: [[[0.1,0.08],[0.9,0.08]], [[0.5,0.08],[0.5,0.92]]],
  U: [[[0.18,0.08],[0.18,0.72],[0.3,0.9],[0.5,0.95],[0.7,0.9],[0.82,0.72],[0.82,0.08]]],
  V: [[[0.12,0.08],[0.5,0.92],[0.88,0.08]]],
  W: [[[0.08,0.08],[0.25,0.88],[0.5,0.62],[0.75,0.88],[0.92,0.08]]],
  X: [[[0.12,0.08],[0.88,0.92]], [[0.88,0.08],[0.12,0.92]]],
  Y: [[[0.12,0.08],[0.5,0.5],[0.88,0.08]], [[0.5,0.5],[0.5,0.92]]],
  Z: [[[0.12,0.08],[0.88,0.08],[0.12,0.92],[0.88,0.92]]],
};

// Normalized [x,y] waypoints (0-1) for lowercase letters
// Y range: ascenders ~0.08, x-height top ~0.28, baseline ~0.78, descenders ~0.95
const LETTER_PATHS_LOWER = {
  a: [[[0.72,0.32],[0.48,0.22],[0.26,0.32],[0.2,0.5],[0.26,0.68],[0.48,0.78],[0.68,0.7],[0.72,0.5],[0.72,0.78]]],
  b: [[[0.28,0.08],[0.28,0.78]], [[0.28,0.4],[0.5,0.25],[0.72,0.35],[0.75,0.52],[0.72,0.68],[0.5,0.78],[0.28,0.78]]],
  c: [[[0.75,0.35],[0.55,0.22],[0.32,0.25],[0.2,0.42],[0.2,0.58],[0.32,0.75],[0.55,0.78],[0.75,0.65]]],
  d: [[[0.72,0.08],[0.72,0.78]], [[0.72,0.4],[0.5,0.25],[0.28,0.35],[0.24,0.52],[0.28,0.68],[0.5,0.78],[0.72,0.78]]],
  e: [[[0.2,0.52],[0.75,0.52],[0.75,0.38],[0.6,0.25],[0.38,0.22],[0.2,0.36],[0.18,0.52],[0.22,0.68],[0.42,0.78],[0.65,0.75]]],
  f: [[[0.62,0.12],[0.45,0.08],[0.32,0.18],[0.3,0.35],[0.3,0.78]], [[0.18,0.42],[0.52,0.42]]],
  g: [[[0.72,0.28],[0.5,0.2],[0.28,0.3],[0.22,0.5],[0.28,0.68],[0.5,0.78],[0.72,0.68],[0.72,0.28],[0.72,0.88],[0.55,0.95],[0.32,0.9]]],
  h: [[[0.25,0.08],[0.25,0.78]], [[0.25,0.45],[0.45,0.25],[0.68,0.32],[0.72,0.52],[0.72,0.78]]],
  i: [[[0.5,0.32],[0.5,0.78]], [[0.5,0.14],[0.5,0.17]]],
  j: [[[0.55,0.32],[0.55,0.88],[0.42,0.95],[0.28,0.88]], [[0.55,0.14],[0.55,0.17]]],
  k: [[[0.28,0.08],[0.28,0.78]], [[0.7,0.28],[0.28,0.55],[0.7,0.78]]],
  l: [[[0.5,0.08],[0.5,0.78]]],
  m: [[[0.15,0.32],[0.15,0.78]], [[0.15,0.48],[0.32,0.28],[0.5,0.35],[0.5,0.78]], [[0.5,0.48],[0.65,0.28],[0.8,0.35],[0.8,0.78]]],
  n: [[[0.22,0.32],[0.22,0.78]], [[0.22,0.48],[0.45,0.26],[0.65,0.32],[0.72,0.52],[0.72,0.78]]],
  o: [[[0.5,0.22],[0.72,0.3],[0.78,0.5],[0.72,0.7],[0.5,0.78],[0.28,0.7],[0.22,0.5],[0.28,0.3],[0.5,0.22]]],
  p: [[[0.28,0.32],[0.28,0.95]], [[0.28,0.42],[0.5,0.25],[0.72,0.35],[0.75,0.52],[0.72,0.68],[0.5,0.78],[0.28,0.78]]],
  q: [[[0.72,0.32],[0.5,0.22],[0.28,0.32],[0.22,0.5],[0.28,0.68],[0.5,0.78],[0.72,0.68],[0.72,0.32]], [[0.72,0.32],[0.72,0.95]]],
  r: [[[0.25,0.32],[0.25,0.78]], [[0.25,0.44],[0.42,0.28],[0.62,0.25],[0.72,0.32]]],
  s: [[[0.72,0.32],[0.52,0.22],[0.28,0.28],[0.22,0.42],[0.45,0.52],[0.7,0.62],[0.72,0.72],[0.55,0.8],[0.28,0.75]]],
  t: [[[0.5,0.1],[0.5,0.78],[0.6,0.82]], [[0.28,0.35],[0.68,0.35]]],
  u: [[[0.22,0.32],[0.22,0.65],[0.35,0.78],[0.5,0.8],[0.65,0.78],[0.72,0.65],[0.72,0.32],[0.72,0.78]]],
  v: [[[0.2,0.32],[0.5,0.78],[0.78,0.32]]],
  w: [[[0.12,0.32],[0.28,0.78],[0.5,0.55],[0.72,0.78],[0.88,0.32]]],
  x: [[[0.2,0.32],[0.78,0.78]], [[0.78,0.32],[0.2,0.78]]],
  y: [[[0.2,0.32],[0.5,0.62]], [[0.78,0.32],[0.5,0.62],[0.38,0.82],[0.25,0.9]]],
  z: [[[0.2,0.32],[0.78,0.32],[0.2,0.78],[0.78,0.78]]],
};

// Combined lookup: uppercase key = 'A', lowercase key = 'a'
const ALL_LETTER_PATHS = { ...LETTER_PATHS };
Object.entries(LETTER_PATHS_LOWER).forEach(([k, v]) => { ALL_LETTER_PATHS[k] = v; });

const DEFAULT_LETTERS_UPPER = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const DEFAULT_LETTERS_LOWER = Array.from("abcdefghijklmnopqrstuvwxyz");
const COLORS = ['#000000', '#F44336', '#2196F3', '#4CAF50', '#FFEB3B'];

// Helper function for level colors
const getLevelColor = (level) => {
  const colors = {
    1: '#4CAF50', // Green - Easy
    2: '#2196F3', // Blue - Medium
    3: '#FF9800', // Orange - Advanced
    4: '#E91E63', // Pink - Difficult
    5: '#9C27B0', // Purple - Expert
  };
  return colors[level] || '#607D8B';
};

// Compare student's text with original story
const compareTexts = (original, studentText) => {
  const normalize = (text) => text.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const originalWords = normalize(original).split(/\s+/).filter(Boolean);
  const studentWords = normalize(studentText).split(/\s+/).filter(Boolean);

  let correctCount = 0;
  const wordResults = [];

  // Compare word by word
  const maxLen = Math.max(originalWords.length, studentWords.length);
  for (let i = 0; i < maxLen; i++) {
    const origWord = originalWords[i] || '';
    const studWord = studentWords[i] || '';

    if (origWord === studWord) {
      correctCount++;
      wordResults.push({ word: studWord, correct: true, expected: origWord });
    } else if (studWord) {
      wordResults.push({ word: studWord, correct: false, expected: origWord });
    } else {
      wordResults.push({ word: '___', correct: false, expected: origWord, missing: true });
    }
  }

  // Extra words typed by student
  if (studentWords.length > originalWords.length) {
    for (let i = originalWords.length; i < studentWords.length; i++) {
      wordResults.push({ word: studentWords[i], correct: false, expected: '', extra: true });
    }
  }

  const accuracy = originalWords.length > 0
    ? Math.round((correctCount / originalWords.length) * 100)
    : 0;

  return {
    accuracy,
    correctCount,
    totalWords: originalWords.length,
    wordResults,
    isPassing: accuracy >= 80, // 80% or higher is passing
  };
};

export default function WritingScreen() {
  const { profile } = useAuth();
  const { colors, a11yTextStyle } = useTheme();

  // Mode: tracing, story selection, or composition
  const [mode, setMode] = useState('trace'); // 'trace' | 'stories' | 'compose'

  // STATE
  const [letterCase, setLetterCase] = useState('upper'); // 'upper' | 'lower'
  const [items, setItems] = useState(DEFAULT_LETTERS_UPPER.map(l => ({ id: l, label: l })));
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const letters = letterCase === 'upper' ? DEFAULT_LETTERS_UPPER : DEFAULT_LETTERS_LOWER;
    setItems(letters.map(l => ({ id: l, label: l })));
  }, [letterCase]);

  // Stories from admin
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loadingStories, setLoadingStories] = useState(false);

  // Comparison/Validation state for story copying
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // ── COMPOSITION STATE ─────────────────────────────────────────────
  const [draft, setDraft] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [composeSpeaking, setComposeSpeaking] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);
  const [checking, setChecking] = useState(false);
  const [matches, setMatches] = useState([]);
  const [ltError, setLtError] = useState(null);
  const draftRef = useRef('');
  const composeStartRef = useRef(null);
  
  // DRAWING STATE
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [strokeColor, setStrokeColor] = useState(COLORS[0]);
  const [canvasLayout, setCanvasLayout] = useState({ width: 350, height: 500 });

  const [successVisible, setSuccessVisible] = useState(false);
  const [demoVisible, setDemoVisible] = useState(false);

  // Animation dot for live canvas guide and demo modal
  const [animDot, setAnimDot] = useState(null);
  const animTimerRef = useRef(null);
  const animRunningRef = useRef(false);

  // --- REFS (The Fix for "Disappearing" & "Wrong Color") ---
  // These keep track of live data without waiting for re-renders
  const colorRef = useRef(strokeColor);
  
  useEffect(() => { colorRef.current = strokeColor; }, [strokeColor]);

  // ── Letter tracing animation ────────────────────────────────────────────────
  const startLetterAnimation = (label, cW, cH) => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    const strokes = LETTER_PATHS[label] || [];
    if (!strokes.length) { setAnimDot(null); return; }

    // Flatten all stroke waypoints into a sequence
    const pts = [];
    strokes.forEach((stroke, si) => {
      stroke.forEach((pt, pi) => {
        pts.push({ x: pt[0] * cW, y: pt[1] * cH, pause: pi === 0 && si > 0 });
      });
      // Hold at end of each stroke briefly
      const last = stroke[stroke.length - 1];
      for (let i = 0; i < 4; i++) pts.push({ x: last[0] * cW, y: last[1] * cH, pause: true });
    });

    let idx = 0;
    animRunningRef.current = true;

    const tick = () => {
      if (!animRunningRef.current) return;
      setAnimDot({ x: pts[idx].x, y: pts[idx].y });
      idx = (idx + 1) % pts.length;
      const delay = pts[idx]?.pause ? 80 : 30;
      animTimerRef.current = setTimeout(tick, delay);
    };
    tick();
  };

  const stopLetterAnimation = () => {
    animRunningRef.current = false;
    if (animTimerRef.current) { clearTimeout(animTimerRef.current); animTimerRef.current = null; }
    setAnimDot(null);
  };

  // Run animation whenever a letter is selected (canvas guide) or demo modal opens
  useEffect(() => {
    if (selectedItem) {
      startLetterAnimation(selectedItem.label, 200, 200);
    } else {
      stopLetterAnimation();
    }
    return stopLetterAnimation;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.label]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from(TABLES.WRITING_PRACTICE).select('*').order('label');
      if (data && data.length > 0) setItems(data);
    };
    fetchItems();
  }, []);

  // Fetch stories from admin for writing practice
  useEffect(() => {
    const fetchStories = async () => {
      setLoadingStories(true);
      const { data, error } = await supabase
        .from(TABLES.STORIES)
        .select('*')
        .order('level', { ascending: true });
      if (data && data.length > 0) {
        setStories(data);
      }
      setLoadingStories(false);
    };
    fetchStories();
  }, []);

  // ── Speech recognition events (composition mode) ──────────────────
  useSpeechRecognitionEvent('result', (event) => {
    if (!isListening) return;
    const nextText = event?.results?.[0]?.transcript ?? '';
    if (nextText) {
      // Append dictation to existing draft with spacing
      const base = draftRef.current || '';
      const sep = base && !/\s$/.test(base) ? ' ' : '';
      const appended = (base + sep + nextText).replace(/\s+/g, ' ').trimStart();
      draftRef.current = appended;
      setDraft(appended);
    }
  });
  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });
  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    const msg = event?.message ?? 'Recognition error';
    Alert.alert('Speech Recognition', msg);
  });

  // Keep draftRef synced
  useEffect(() => { draftRef.current = draft; }, [draft]);

  // Debounced LanguageTool check (real-time-ish)
  useEffect(() => {
    if (mode !== 'compose') return;
    if (!autoCheck) return;
    if (!draft.trim() || draft.trim().length < 10) {
      setMatches([]);
      setLtError(null);
      return;
    }
    const handle = setTimeout(() => {
      checkLanguageTool(draft);
    }, 650);
    return () => clearTimeout(handle);
  }, [draft, autoCheck, mode]);

  const checkLanguageTool = async (textToCheck) => {
    setChecking(true);
    setLtError(null);
    try {
      // Default: public LanguageTool API (rate-limited). Override via env if needed.
      const baseUrl = process.env.EXPO_PUBLIC_LANGUAGETOOL_URL || 'https://api.languagetool.org/v2/check';
      const body = new URLSearchParams({
        language: 'en-US',
        text: textToCheck,
      }).toString();
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) {
        throw new Error(`LanguageTool error (${res.status})`);
      }
      const json = await res.json();
      const next = Array.isArray(json?.matches) ? json.matches : [];
      setMatches(next.slice(0, 10));
    } catch (e) {
      setMatches([]);
      setLtError('Could not check grammar/spelling (internet/API).');
    } finally {
      setChecking(false);
    }
  };

  const applyReplacement = (match, replacementValue) => {
    const t = draftRef.current || '';
    const offset = match?.offset ?? 0;
    const length = match?.length ?? 0;
    if (offset < 0 || length <= 0 || offset + length > t.length) return;
    const before = t.slice(0, offset);
    const after = t.slice(offset + length);
    const next = before + replacementValue + after;
    draftRef.current = next;
    setDraft(next);
    // Re-check soon after apply
    if (autoCheck) setTimeout(() => checkLanguageTool(next), 250);
  };

  const toggleDictation = async () => {
    if (!STT_AVAILABLE) {
      Alert.alert(
        'Not Available',
        'Speech recognition requires a development build (not Expo Go).\n\nInstall: npx expo install expo-speech-recognition\nThen rebuild with EAS.',
      );
      return;
    }
    if (isListening) {
      try { ExpoSpeechRecognitionModule.stop(); } catch (_) {}
      setIsListening(false);
      return;
    }
    const { granted } = await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Denied', 'Microphone permission is required for dictation.');
      return;
    }
    setIsListening(true);
    try {
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: false });
    } catch (e) {
      setIsListening(false);
      Alert.alert('Speech Recognition', 'Could not start dictation.');
    }
  };

  const speakDraft = async () => {
    const t = (draftRef.current || '').trim();
    if (!t) {
      Alert.alert('Nothing to Read', 'Type or dictate something first.');
      return;
    }
    if (composeSpeaking) {
      ttsService.stop();
      setComposeSpeaking(false);
      return;
    }
    setComposeSpeaking(true);
    if (!composeStartRef.current) composeStartRef.current = Date.now();
    ttsService.speak(t).then(() => setComposeSpeaking(false));
  };

  const logComposeSession = () => {
    if (!profile?.id) return;
    const durationSeconds = composeStartRef.current
      ? Math.round((Date.now() - composeStartRef.current) / 1000)
      : 0;
    const wordCount = (draftRef.current || '').trim().split(/\s+/).filter(Boolean).length;
    logSession({
      studentId: profile.id,
      activityType: 'writing_composition',
      score: wordCount > 0 ? 1 : 0,
      total: 1,
      durationSeconds,
      details: { word_count: wordCount, char_count: (draftRef.current || '').length },
    });
  };

  // Check student's copy against the original story
  const checkMyCopy = () => {
    if (!selectedStory) {
      Alert.alert('No Story Selected', 'Please select a story first.');
      return;
    }
    const studentText = (draftRef.current || '').trim();
    if (!studentText) {
      Alert.alert('Empty Text', 'Please write something first!');
      return;
    }

    const result = compareTexts(selectedStory.content, studentText);
    setComparisonResult(result);
    setShowComparisonModal(true);

    // Log the session with accuracy score
    if (profile?.id) {
      logSession({
        studentId: profile.id,
        activityType: 'writing_copy',
        score: result.correctCount,
        total: result.totalWords,
        durationSeconds: composeStartRef.current
          ? Math.round((Date.now() - composeStartRef.current) / 1000)
          : 0,
        details: {
          story_id: selectedStory.id,
          story_title: selectedStory.title,
          accuracy: result.accuracy,
        },
      });
      if (result.isPassing) {
        ttsService.speak(`Great job! You got ${result.accuracy} percent correct!`);
      } else {
        ttsService.speak(`You got ${result.accuracy} percent. Keep practicing!`);
      }
    }
  };

  // Stop speech when leaving compose mode
  useEffect(() => {
    if (mode !== 'compose') {
      setComposeSpeaking(false);
      setIsListening(false);
      setMatches([]);
      setLtError(null);
      setComparisonResult(null);
      composeStartRef.current = null;
      ttsService.stop();
      try { if (STT_AVAILABLE) ExpoSpeechRecognitionModule.stop(); } catch (_) {}
    } else {
      composeStartRef.current = Date.now();
    }
  }, [mode]);

  // --- DRAWING ENGINE ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // Stop the tracing guide once the user starts drawing
        animRunningRef.current = false;
        if (animTimerRef.current) { clearTimeout(animTimerRef.current); animTimerRef.current = null; }
        setAnimDot(null);
        setCurrentPath([]);
      },
      
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const point = `${locationX.toFixed(0)},${locationY.toFixed(0)}`;
        setCurrentPath((prev) => [...prev, point]);
      },
      
      onPanResponderRelease: () => {
        // We use a callback here to ensure we get the latest 'currentPath'
        setCurrentPath((latestCurrentPath) => {
             if (latestCurrentPath.length > 0) {
                 const coords = latestCurrentPath.map(point => {
                   const [x, y] = point.split(',').map(Number);
                   return { x, y };
                 });
                 const xs = coords.map(p => p.x);
                 const ys = coords.map(p => p.y);
                 const bounds = {
                   minX: Math.min(...xs),
                   maxX: Math.max(...xs),
                   minY: Math.min(...ys),
                   maxY: Math.max(...ys),
                 };

                 const d = `M ${latestCurrentPath.join(' L ')}`;
                 // Store pts for validation + color from live ref
                 setPaths((prevPaths) => [
                     ...prevPaths,
                     { d, color: colorRef.current, pts: latestCurrentPath, bounds }
                 ]);
             }
             return []; // Clear current path
        });
      },
    })
  ).current;

  // --- VALIDATION ---
  const validateDrawing = () => {
    const { width: cW, height: cH } = canvasLayout;

    // Collect all drawn points from stored paths
    const allPts = [];
    paths.forEach(p => {
      (p.pts || []).forEach(pt => {
        const [x, y] = pt.split(',').map(Number);
        allPts.push({ x, y });
      });
    });

    if (allPts.length < 20) {
      return { valid: false, reason: 'Keep tracing! Your drawing is too short.' };
    }

    // Compute overall drawn bounding box
    const drawnBounds = paths.reduce((acc, p) => ({
      minX: Math.min(acc.minX, p.bounds?.minX ?? Infinity),
      maxX: Math.max(acc.maxX, p.bounds?.maxX ?? -Infinity),
      minY: Math.min(acc.minY, p.bounds?.minY ?? Infinity),
      maxY: Math.max(acc.maxY, p.bounds?.maxY ?? -Infinity),
    }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

    const drawnW = drawnBounds.maxX - drawnBounds.minX;
    const drawnH = drawnBounds.maxY - drawnBounds.minY;

    // Must span at least 20% of canvas in both directions (no tiny scribbles)
    if (drawnW < cW * 0.2 || drawnH < cH * 0.2) {
      return { valid: false, reason: 'Make your letter bigger! Trace the full guide.' };
    }

    // At least 55% of drawn points must fall within the letter guide area
    // (centre 76% of canvas in each direction)
    const padX = cW * 0.12;
    const padY = cH * 0.05;
    const inRegion = allPts.filter(p =>
      p.x >= padX && p.x <= cW - padX &&
      p.y >= padY && p.y <= cH - padY
    );
    const coverage = inRegion.length / allPts.length;

    if (coverage < 0.55) {
      return { valid: false, reason: 'Stay inside the letter guide and trace over it.' };
    }

    return { valid: true };
  };

  // --- ACTIONS ---
  const handleCheck = () => {
    ttsService.speak('Proceed to the next letter!');
    setSuccessVisible(true);
    if (profile?.id) {
      logSession({ studentId: profile.id, activityType: 'writing', score: 1, total: 1, details: { letter: selectedItem.label } });
    }
  };

  const nextItem = () => {
    setSuccessVisible(false);
    setPaths([]); 
    setCurrentPath([]);
    
    const idx = items.findIndex(i => i.id === selectedItem.id);
    setSelectedItem(idx < items.length - 1 ? items[idx + 1] : items[0]);
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
    // Restart the tracing guide after clearing
    if (selectedItem) startLetterAnimation(selectedItem.label, 200, 200);
  };

  // --- DEMO ANIMATION ---
  const playDemo = () => {
      setDemoVisible(true);
  };

  // --- RENDER: STORIES SELECTION ---
  if (mode === 'stories') {
    return (
      <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>

        <StudentPageHeader
          title="Story Writing"
          onBack={() => setMode('trace')}
          right={
            <TouchableOpacity onPress={() => setMode('trace')} style={styles.modePillCandy}>
              <Icon name="brush" size="md" color={c.primary} />
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.storiesContainer}>
          {loadingStories ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#673AB7" />
              <Text style={[styles.loadingText, a11yTextStyle]}>Loading stories...</Text>
            </View>
          ) : stories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="book-open" size="xl" color="#9575CD" />
              <Text style={[styles.emptyText, a11yTextStyle]}>No stories available yet.</Text>
              <Text style={[styles.emptySubtext, a11yTextStyle]}>Ask your teacher to add some stories!</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.storiesHeader, a11yTextStyle]}>Select a story to practice copying:</Text>
              {stories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyCard}
                  onPress={() => {
                    setSelectedStory(story);
                    setDraft('');
                    draftRef.current = '';
                    setMode('compose');
                  }}
                >
                  <View style={styles.storyCardHeader}>
                    <Text style={[styles.storyTitle, a11yTextStyle]} numberOfLines={1}>{story.title}</Text>
                  </View>
                  <Text style={[styles.storyPreview, a11yTextStyle]} numberOfLines={2}>{story.content}</Text>
                  <View style={styles.storyMeta}>
                    <Text style={styles.storyMetaText}>{story.content.split(' ').length} words</Text>
                    <Icon name="chevron-forward" size="md" color="#9575CD" />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // --- RENDER: COMPOSE MODE ---
  if (mode === 'compose') {
    return (
      <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>

        <StudentPageHeader
          title={selectedStory ? selectedStory.title : 'Free Writing'}
          onBack={() => { logComposeSession(); setMode('stories'); setSelectedStory(null); }}
          right={
            <TouchableOpacity onPress={() => { logComposeSession(); setMode('stories'); setSelectedStory(null); }} style={styles.modePillCandy}>
              <Icon name="library" size="md" color={c.primary} />
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.composeBody} keyboardShouldPersistTaps="handled">
          {/* Story Reference Card */}
          {selectedStory && (
            <View style={styles.storyRefCard}>
              <View style={styles.storyRefHeader}>
                <Text style={[styles.storyRefLabel, a11yTextStyle]}>Story to Copy:</Text>
              </View>
              <Text style={[styles.storyRefText, a11yTextStyle]}>{selectedStory.content}</Text>
              <TouchableOpacity
                style={styles.speakStoryBtn}
                onPress={() => ttsService.speak(selectedStory.content)}
              >
                <Icon name="volume-2" size="md" color="#fff" />
                <Text style={styles.speakStoryText}>Hear Story</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.composeCard}>
            <Text style={[styles.composeLabel, a11yTextStyle]}>
              {selectedStory ? 'Your copy:' : 'Your text'}
            </Text>
            <TextInput
              value={draft}
              onChangeText={(t) => { setDraft(t); draftRef.current = t; }}
              style={[styles.composeInput, a11yTextStyle]}
              placeholder="Write a sentence..."
              multiline
              textAlignVertical="top"
              nativeID="compose-input"
            />

            <View style={styles.composeBtnRow}>
              <TouchableOpacity style={[styles.composeBtn, isListening && styles.composeBtnStop]} onPress={toggleDictation}>
                <Icon name={isListening ? 'square' : 'mic'} size="md" color="#fff" />
                <Text style={styles.composeBtnText}>{isListening ? 'Stop' : 'Dictate'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.composeBtn, composeSpeaking && styles.composeBtnStop]} onPress={speakDraft}>
                <Icon name={composeSpeaking ? 'square' : 'volume-2'} size="md" color="#fff" />
                <Text style={styles.composeBtnText}>{composeSpeaking ? 'Stop' : 'Read Aloud'}</Text>
              </TouchableOpacity>

              {/* Show "Check My Copy" for story mode, "Check Grammar" for free compose */}
              {selectedStory ? (
                <TouchableOpacity
                  style={[styles.composeBtn, styles.composeBtnSubmit]}
                  onPress={checkMyCopy}
                >
                  <Icon name="check-circle" size="md" color="#fff" />
                  <Text style={styles.composeBtnText}>Check Copy</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.composeBtn, styles.composeBtnCheck]}
                  onPress={() => checkLanguageTool(draftRef.current || '')}
                  disabled={checking}
                >
                  {checking ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Icon name="sparkles" size="md" color="#fff" />
                      <Text style={styles.composeBtnText}>Check</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.autoRow}>
              <Text style={[styles.autoLabel, a11yTextStyle]}>Auto-check</Text>
              <TouchableOpacity
                style={[styles.toggle, autoCheck && styles.toggleOn]}
                onPress={() => setAutoCheck(v => !v)}
              >
                <View style={[styles.toggleThumb, autoCheck && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>

            {ltError && <Text style={styles.ltError}>{ltError}</Text>}
          </View>

          <View style={styles.suggestCard}>
            <View style={styles.suggestHeader}>
              <Text style={[styles.suggestTitle, a11yTextStyle]}>Suggestions</Text>
              <Text style={[styles.suggestSub, a11yTextStyle]}>{matches.length} found</Text>
            </View>

            {matches.length === 0 ? (
              <Text style={[styles.suggestEmpty, a11yTextStyle]}>
                {draft.trim().length < 10 ? 'Type a bit more to check.' : 'No issues detected (or not checked yet).'}
              </Text>
            ) : (
              matches.map((m, idx) => {
                const firstRep = m?.replacements?.[0]?.value;
                const msg = m?.message || 'Suggestion';
                const short = msg.length > 90 ? msg.slice(0, 90) + '…' : msg;
                return (
                  <View key={`m-${idx}`} style={styles.matchRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.matchMsg, a11yTextStyle]}>{short}</Text>
                      {m?.context?.text ? (
                        <Text style={styles.matchCtx} numberOfLines={2}>
                          {m.context.text}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      style={[styles.applyBtn, !firstRep && styles.applyBtnDisabled]}
                      onPress={() => firstRep && applyReplacement(m, firstRep)}
                      disabled={!firstRep}
                    >
                      <Text style={styles.applyText}>{firstRep ? `Apply: ${firstRep}` : 'No fix'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Comparison Result Modal */}
        <Modal visible={showComparisonModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.comparisonCard}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonTitle}>
                  {comparisonResult?.isPassing ? 'Great Job!' : 'Keep Practicing!'}
                </Text>
                <TouchableOpacity onPress={() => setShowComparisonModal(false)}>
                  <Icon name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Accuracy Score */}
              <View style={[
                styles.accuracyBadge,
                { backgroundColor: comparisonResult?.isPassing ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.accuracyText}>{comparisonResult?.accuracy || 0}%</Text>
                <Text style={styles.accuracyLabel}>Accuracy</Text>
              </View>

              <Text style={styles.comparisonStats}>
                {comparisonResult?.correctCount || 0} of {comparisonResult?.totalWords || 0} words correct
              </Text>

              {/* Word-by-word breakdown */}
              <ScrollView style={styles.wordResultsContainer}>
                <Text style={styles.wordResultsTitle}>Your Results:</Text>
                <View style={styles.wordResultsWrap}>
                  {comparisonResult?.wordResults?.map((wr, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.wordChip,
                        wr.correct ? styles.wordCorrect : styles.wordWrong,
                        wr.missing && styles.wordMissing,
                        wr.extra && styles.wordExtra,
                      ]}
                    >
                      <Text style={[styles.wordChipText, !wr.correct && styles.wordChipTextWrong]}>
                        {wr.word}
                      </Text>
                      {!wr.correct && wr.expected && !wr.extra && (
                        <Text style={styles.expectedText}>→ {wr.expected}</Text>
                      )}
                      {wr.extra && <Text style={styles.expectedText}>(extra)</Text>}
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.comparisonBtnRow}>
                <TouchableOpacity
                  style={styles.tryAgainBtn}
                  onPress={() => {
                    setShowComparisonModal(false);
                    setDraft('');
                    draftRef.current = '';
                  }}
                >
                  <Icon name="refresh-cw" size="md" color="#fff" />
                  <Text style={styles.tryAgainText}>Try Again</Text>
                </TouchableOpacity>

                {comparisonResult?.isPassing && (
                  <TouchableOpacity
                    style={styles.nextStoryBtn}
                    onPress={() => {
                      setShowComparisonModal(false);
                      setSelectedStory(null);
                      setDraft('');
                      draftRef.current = '';
                      setMode('stories');
                    }}
                  >
                    <Text style={styles.nextStoryText}>Next Story</Text>
                    <Icon name="arrow-right" size="md" color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </ScreenWrapper>
    );
  }

  if (!selectedItem) {
    return (
      <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>

        <StudentPageHeader
          title="Writing Lab"
          right={
            <TouchableOpacity onPress={() => setMode('stories')} style={styles.modePillCandy}>
              <Icon name="library" size="md" color={c.primary} />
            </TouchableOpacity>
          }
        />

        {/* Instruction hint + video tutorial button */}
        <View style={styles.mainHintRow}>
          <View style={styles.mainHint}>
            <Icon name="info" size="md" color="#E8927C" />
            <Text style={styles.mainHintText}>Tap a letter to start tracing, or tap "Stories" to practice copying.</Text>
          </View>
          <TouchableOpacity style={styles.watchVideoBtn} onPress={() => Linking.openURL(VIDEO_TUTORIAL_URL)} activeOpacity={0.85}>
            <Icon name="play-circle" size="md" color="#fff" />
            <Text style={styles.watchVideoBtnText}>Watch Tutorial</Text>
          </TouchableOpacity>
        </View>

        {/* Uppercase / Lowercase toggle */}
        <View style={styles.caseTabRow}>
          <TouchableOpacity
            style={[styles.caseTab, letterCase === 'upper' && styles.caseTabActive]}
            onPress={() => setLetterCase('upper')}
          >
            <Text style={[styles.caseTabText, letterCase === 'upper' && styles.caseTabTextActive]}>A  Uppercase</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.caseTab, letterCase === 'lower' && styles.caseTabActive]}
            onPress={() => setLetterCase('lower')}
          >
            <Text style={[styles.caseTabText, letterCase === 'lower' && styles.caseTabTextActive]}>a  Lowercase</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.gridContainer}>
           {items.map((item) => (
               <TouchableOpacity key={item.id} style={styles.gridCard} onPress={() => setSelectedItem(item)}>
                   <Text style={styles.gridText}>{item.label}</Text>
               </TouchableOpacity>
           ))}
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // --- RENDER 2: CANVAS ---
  return (
    <ScreenWrapper role="student" padded={false} style={{ backgroundColor: colors.surface }}>

      
      {/* Header */}
      <View style={styles.canvasHeaderCandy}>
        <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.candyNavBtn}>
          <Icon name="chevron-left" size="md" color={c.primary} />
        </TouchableOpacity>
        <Text style={styles.canvasLetterTitle}>{selectedItem.label}</Text>
        <TouchableOpacity onPress={playDemo} style={styles.candyNavBtn}>
          <Icon name="play-circle" size="md" color={c.primary} />
        </TouchableOpacity>
      </View>

      {/* DRAWING AREA */}
      <View
        style={styles.canvasContainer}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          setCanvasLayout({ width, height });
        }}
      >
         {/* Layer 1: Dotted SVG Guide — stroke paths with numbered order & arrows */}
         <View style={[styles.layer, { pointerEvents: 'none' }]}>
           <Svg width={canvasLayout.width} height={canvasLayout.height}>
             {(ALL_LETTER_PATHS[selectedItem.label] || []).map((stroke, strokeIdx) => {
               const pts = stroke.map(([nx, ny]) => [nx * canvasLayout.width, ny * canvasLayout.height]);
               const d = 'M ' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ');
               const [sx, sy] = pts[0];
               const [ex, ey] = pts[pts.length - 1];
               const prev = pts.length > 1 ? pts[pts.length - 2] : pts[0];
               const dx = ex - prev[0];
               const dy = ey - prev[1];
               const angle = Math.atan2(dy, dx) * 180 / Math.PI;
               const dotSize = Math.max(canvasLayout.width, canvasLayout.height) * 0.028;
               const numR = dotSize * 1.3;
               return (
                 <G key={`g-${strokeIdx}`}>
                   <Path d={d} stroke="rgba(232,146,124,0.18)" strokeWidth={dotSize * 2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                   <Path d={d} stroke="#E8927C" strokeWidth={dotSize * 1.1} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${dotSize * 1.2} ${dotSize * 1.6}`} fill="none" opacity={0.7} />
                   {pts.length > 1 && (
                     <G transform={`translate(${ex.toFixed(1)},${ey.toFixed(1)}) rotate(${angle.toFixed(1)})`}>
                       <Polygon points={`${dotSize*1.8},0 ${-dotSize*1.0},${-dotSize*0.9} ${-dotSize*1.0},${dotSize*0.9}`} fill="#E8927C" opacity={0.85} />
                     </G>
                   )}
                   <Circle cx={sx.toFixed(1)} cy={sy.toFixed(1)} r={numR.toFixed(1)} fill="#E8927C" />
                   <SvgText x={sx.toFixed(1)} y={(sy + numR * 0.38).toFixed(1)} textAnchor="middle" fill="#fff" fontSize={(numR * 1.1).toFixed(1)} fontWeight="bold">{strokeIdx + 1}</SvgText>
                 </G>
               );
             })}
           </Svg>
         </View>

         {/* Layer 2: Animated tracing dot (shows stroke direction guide) */}
         {animDot && paths.length === 0 && (
           <View
             style={[styles.animDotOuter, {
               position: 'absolute',
               left: (animDot.x / 200) * canvasLayout.width - 14,
               top: (animDot.y / 200) * canvasLayout.height - 14,
               zIndex: 8,
               pointerEvents: 'none',
             }]}
           >
             <View style={styles.animDotInner} />
           </View>
         )}

         {/* Layer 3: The Ink (SVG) */}
         <View style={[styles.layer, { pointerEvents: 'none' }]}> 
            <Svg height="100%" width="100%">
                {paths.map((p, i) => (
                  <Path 
                    key={`path-${i}`} // Unique Key
                    d={p.d} 
                    stroke={p.color} 
                    strokeWidth={25} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    fill="none" 
                  />
                ))}
                {currentPath.length > 0 && (
                  <Path 
                    d={`M ${currentPath.join(' L ')}`} 
                    stroke={strokeColor} 
                    strokeWidth={25} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    fill="none" 
                  />
                )}
            </Svg>
         </View>

         {/* Layer 4: Touch Handler */}
         <View style={styles.layer} {...panResponder.panHandlers} />

      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
          <View style={styles.colorRow}>
              {COLORS.map(c => (
                  <TouchableOpacity 
                    key={c} 
                    style={[styles.colorDot, { backgroundColor: c }, strokeColor === c && styles.activeColor]} 
                    onPress={() => setStrokeColor(c)}
                  />
              ))}
          </View>

          <View style={styles.btnRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearCanvas}>
                  <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkBtn} onPress={handleCheck}>
                  <Text style={styles.checkText}>DONE</Text>
              </TouchableOpacity>
          </View>
      </View>

      {/* Success Modal */}
      <Modal visible={successVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={styles.successCard}>
                  <Icon name="star" size="xl" color="#FFD700" />
                  <Text style={styles.successTitle}>Awesome!</Text>
                  <Text style={styles.successSub}>Proceed to next letter!</Text>
                  <TouchableOpacity style={styles.nextBtn} onPress={nextItem}>
                      <Text style={styles.nextText}>Next 👉</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      {/* Demo/Instruction Modal */}
      <Modal visible={demoVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
              <View style={styles.demoCard}>
                  <View style={styles.demoHeader}>
                      <View style={styles.demoHeaderLeft}>
                        <View style={styles.demoLetterBadge}>
                          <Text style={styles.demoLetterText}>{selectedItem?.label}</Text>
                        </View>
                        <Text style={styles.demoTitle}>How to Write "{selectedItem?.label}"</Text>
                      </View>
                      <TouchableOpacity onPress={() => setDemoVisible(false)}>
                          <Icon name="x" size="xl" color="#333" />
                      </TouchableOpacity>
                  </View>

                  {/* Animated letter preview */}
                  <View style={styles.demoPreviewCanvas}>
                    <Text style={styles.demoPreviewGhost}>{selectedItem?.label}</Text>
                    {animDot && (
                      <View style={[styles.animDotOuter, {
                        position: 'absolute',
                        left: animDot.x - 14,
                        top: animDot.y - 14,
                      }]}>
                        <View style={styles.animDotInner} />
                      </View>
                    )}
                    <View style={styles.demoPreviewLabel}>
                      <Text style={styles.demoPreviewLabelText}>Follow the dot</Text>
                    </View>
                  </View>

                  {/* Video Tutorial Button */}
                  <TouchableOpacity
                    style={styles.videoBtn}
                    onPress={() => Linking.openURL(VIDEO_TUTORIAL_URL)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.videoBtnIcon}>
                      <Icon name="play-circle" size="xl" color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.videoBtnTitle}>Watch Video Tutorial</Text>
                      <Text style={styles.videoBtnSub}>See how to trace letters step by step</Text>
                    </View>
                    <Icon name="external-link" size="md" color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>

                  <ScrollView style={styles.demoContent}>
                      <Text style={styles.demoSectionLabel}>Steps to follow:</Text>
                      {[
                        { num: '1', text: 'Look at the faded letter guide in the background' },
                        { num: '2', text: 'Place your finger at the starting point of the letter' },
                        { num: '3', text: 'Slowly trace over the letter, following its shape' },
                        { num: '4', text: 'Lift your finger, then trace again to practice more' },
                        { num: '5', text: 'Tap "DONE" when you feel confident' },
                      ].map(({ num, text }) => (
                        <View key={num} style={styles.demoStep}>
                          <View style={styles.demoStepNum}>
                            <Text style={styles.demoStepNumText}>{num}</Text>
                          </View>
                          <Text style={styles.demoText}>{text}</Text>
                        </View>
                      ))}

                      <Text style={[styles.demoSectionLabel, { marginTop: 16 }]}>Tips:</Text>
                      {[
                        'Pick a color you like from the color dots at the bottom',
                        'Tap "Clear" if you want to start your trace over',
                        "Don't worry about being perfect — just keep practicing!",
                      ].map((tip, i) => (
                        <View key={i} style={styles.demoTip}>
                          <Icon name="lightbulb" size="md" color="#E8927C" />
                          <Text style={[styles.demoText, { flex: 1 }]}>{tip}</Text>
                        </View>
                      ))}

                      <View style={{ height: 16 }} />
                  </ScrollView>

                  <TouchableOpacity style={styles.demoCloseBtn} onPress={() => setDemoVisible(false)}>
                      <Icon name="pencil" size="md" color="#fff" />
                      <Text style={styles.demoCloseText}>Got it! Start Tracing</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  
  canvasHeaderCandy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#FFF0E8', borderBottomWidth: 2, borderBottomColor: '#E8927C20' },
  canvasLetterTitle: { fontSize: 42, fontWeight: '900', color: '#E8927C', letterSpacing: 2 },
  candyNavBtn: { width: 40, height: 40, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E8927C40', elevation: 2 },
  modePillCandy: { width: 40, height: 40, borderRadius: 22, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E8927C40' },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },

  modePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  modePillText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  backBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 12 },
  backText: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
  demoBtn: { padding: 5 },
  demoBtnLarge: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 12 },
  demoHint: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginTop: 2 },

  mainHintRow: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, gap: 10 },
  mainHint: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0E8', borderRadius: 12, padding: 10, gap: 8, borderWidth: 1, borderColor: '#E8927C20' },
  mainHintText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  watchVideoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8927C', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start' },
  watchVideoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  caseTabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 10, gap: 10 },
  caseTab: { flex: 1, paddingVertical: 10, borderRadius: 14, borderWidth: 2, borderColor: '#E8927C', alignItems: 'center', backgroundColor: '#fff' },
  caseTabActive: { backgroundColor: '#E8927C' },
  caseTabText: { fontSize: 15, fontWeight: 'bold', color: '#E8927C' },
  caseTabTextActive: { color: '#fff' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 16, gap: 12 },
  gridCard: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, borderWidth: 2, borderColor: '#E8927C40' },
  gridText: { fontSize: 38, fontWeight: 'bold', color: '#E8927C' },

  canvasContainer: {
      flex: 1,
      backgroundColor: '#fff',
      marginHorizontal: 12,
      marginTop: 12,
      marginBottom: 8,
      borderRadius: 20,
      elevation: 5,
      overflow: 'hidden',
      position: 'relative',
      minHeight: 220,
  },
  
  layer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 },

  // Tracing animation dot
  animDotOuter: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(232, 146, 124, 0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  animDotInner: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#E8927C',
  },

  // Demo modal letter preview
  demoPreviewCanvas: {
    width: 200, height: 200, alignSelf: 'center',
    backgroundColor: '#FFF8F5', borderRadius: 20,
    borderWidth: 2, borderColor: '#E8927C30',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, overflow: 'hidden',
  },
  demoPreviewGhost: {
    fontSize: 140, fontWeight: '900',
    color: 'rgba(232, 146, 124, 0.25)',
    includeFontPadding: false,
  },
  demoPreviewLabel: {
    position: 'absolute', bottom: 8,
    backgroundColor: 'rgba(232,146,124,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  demoPreviewLabelText: { fontSize: 11, color: '#E8927C', fontWeight: '700' },

  controls: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  colorDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff', elevation: 2 },
  activeColor: { borderWidth: 3, borderColor: '#333', transform: [{scale: 1.15}] },

  btnRow: { flexDirection: 'row', gap: 10 },
  clearBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 2, borderColor: '#E8927C', alignItems: 'center' },
  clearText: { color: '#E8927C', fontWeight: 'bold' },
  checkBtn: { flex: 2, paddingVertical: 12, backgroundColor: '#E8927C', borderRadius: 14, alignItems: 'center', elevation: 5 },
  checkText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  successCard: { width: '80%', backgroundColor: '#fff', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 10 },
  emoji: { fontSize: 60, marginBottom: 10 },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#673AB7' },
  successSub: { fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 10 },
  nextBtn: { backgroundColor: '#FF4081', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, marginTop: 10 },
  nextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Demo modal styles
  demoCard: { width: '95%', backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 10, maxHeight: '92%' },
  demoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12 },
  demoHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  demoLetterBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E8927C40' },
  demoLetterText: { fontSize: 22, fontWeight: 'bold', color: '#E8927C' },
  demoTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },

  videoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8927C', borderRadius: 16, padding: 14, marginBottom: 16, gap: 12 },
  videoBtnIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  videoBtnTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  videoBtnSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },

  demoSectionLabel: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  demoStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  demoStepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E8927C', justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  demoStepNumText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  demoTip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  demoContent: { maxHeight: '65%', marginBottom: 14 },
  demoText: { fontSize: 14, color: '#555', lineHeight: 20, flex: 1 },
  demoCloseBtn: { backgroundColor: '#E8927C', borderRadius: 15, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  demoCloseText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // ── Compose mode styles ───────────────────────────────────────────
  composeContainer: { flex: 1 },
  composeHeader: { paddingTop: 60, paddingBottom: 18, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  composeTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  composeSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  composeBody: { padding: 16, paddingBottom: 40 },
  composeCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, elevation: 2 },
  composeLabel: { fontSize: 12, fontWeight: 'bold', color: '#607D8B', marginBottom: 8, textTransform: 'uppercase' },
  composeInput: { minHeight: 160, borderRadius: 14, backgroundColor: '#F5F7FA', padding: 12, borderWidth: 1, borderColor: '#E0E0E0', color: '#263238' },
  composeBtnRow: { flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'space-between' },
  composeBtn: { flex: 1, backgroundColor: '#607D8B', borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  composeBtnStop: { backgroundColor: '#C62828' },
  composeBtnCheck: { backgroundColor: '#7B1FA2' },
  composeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  autoRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  autoLabel: { color: '#455A64', fontWeight: 'bold' },
  toggle: { width: 52, height: 28, borderRadius: 14, backgroundColor: '#CFD8DC', padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: '#80CBC4' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  ltError: { marginTop: 10, color: '#D32F2F', fontWeight: '600' },

  suggestCard: { marginTop: 14, backgroundColor: '#fff', borderRadius: 18, padding: 14, elevation: 2 },
  suggestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  suggestTitle: { fontWeight: 'bold', color: '#37474F', fontSize: 16 },
  suggestSub: { color: '#90A4AE', fontWeight: '700' },
  suggestEmpty: { color: '#90A4AE', textAlign: 'center', paddingVertical: 10 },
  matchRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#ECEFF1' },
  matchMsg: { color: '#37474F', fontWeight: '700' },
  matchCtx: { color: '#90A4AE', marginTop: 4, fontSize: 12 },
  applyBtn: { backgroundColor: '#0288D1', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 12, maxWidth: 140 },
  applyBtnDisabled: { backgroundColor: '#CFD8DC' },
  applyText: { color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },

  // ── Stories mode styles ─────────────────────────────────────────────
  storiesContainer: { padding: 16, paddingBottom: 40 },
  storiesHeader: { fontSize: 16, fontWeight: 'bold', color: '#5E35B1', marginBottom: 16 },
  storyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#673AB7' },
  storyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  storyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  levelText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  storyPreview: { color: '#666', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  storyMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storyMetaText: { color: '#9575CD', fontSize: 12, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, color: '#673AB7', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#888', textAlign: 'center' },

  // ── Story reference card (in compose) ───────────────────────────────
  storyRefCard: { backgroundColor: '#EDE7F6', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#D1C4E9' },
  storyRefHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  storyRefLabel: { fontSize: 14, fontWeight: 'bold', color: '#5E35B1' },
  storyRefText: { fontSize: 15, color: '#333', lineHeight: 24, backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10 },
  speakStoryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7E57C2', borderRadius: 12, paddingVertical: 10, gap: 6 },
  speakStoryText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // ── Submit button style ─────────────────────────────────────────────
  composeBtnSubmit: { backgroundColor: '#4CAF50' },

  // ── Comparison Modal styles ─────────────────────────────────────────
  comparisonCard: { width: '92%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 10, maxHeight: '85%' },
  comparisonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  comparisonTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  accuracyBadge: { alignSelf: 'center', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, marginBottom: 12 },
  accuracyText: { fontSize: 48, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  accuracyLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: '600' },
  comparisonStats: { textAlign: 'center', color: '#666', fontSize: 15, marginBottom: 16 },
  wordResultsContainer: { maxHeight: 200, marginBottom: 16 },
  wordResultsTitle: { fontSize: 14, fontWeight: 'bold', color: '#5E35B1', marginBottom: 10 },
  wordResultsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 4 },
  wordCorrect: { backgroundColor: '#C8E6C9' },
  wordWrong: { backgroundColor: '#FFCDD2' },
  wordMissing: { backgroundColor: '#FFE0B2', borderStyle: 'dashed', borderWidth: 1, borderColor: '#FF9800' },
  wordExtra: { backgroundColor: '#E1BEE7' },
  wordChipText: { color: '#2E7D32', fontWeight: '600', fontSize: 13 },
  wordChipTextWrong: { color: '#C62828' },
  expectedText: { color: '#666', fontSize: 10, marginTop: 2 },
  comparisonBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  tryAgainBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF9800', paddingVertical: 14, borderRadius: 14, gap: 6 },
  tryAgainText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  nextStoryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 14, gap: 6 },
  nextStoryText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});