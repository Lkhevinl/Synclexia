import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder, Modal, StatusBar, Alert, Animated, Easing, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { checkQuestProgress } from '../../lib/questHelper';
import { logSession } from '../../lib/analyticsHelper';
import GoBackBtn from '../../components/GoBackBtn';
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

const DEFAULT_LETTERS = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
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
  const { a11yTextStyle } = useTheme();

  // Mode: tracing, story selection, or composition
  const [mode, setMode] = useState('trace'); // 'trace' | 'stories' | 'compose'

  // STATE
  const [items, setItems] = useState(DEFAULT_LETTERS.map(l => ({ id: l, label: l })));
  const [selectedItem, setSelectedItem] = useState(null);

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
  
  const [successVisible, setSuccessVisible] = useState(false);
  const [demoVisible, setDemoVisible] = useState(false);
  const [demoPath, setDemoPath] = useState(new Animated.Value(0)); // For Demo Animation

  // --- REFS (The Fix for "Disappearing" & "Wrong Color") ---
  // These keep track of live data without waiting for re-renders
  const colorRef = useRef(strokeColor);
  
  // Update the ref whenever the state changes
  useEffect(() => {
    colorRef.current = strokeColor;
  }, [strokeColor]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from('writing_practice').select('*').order('label');
      if (data && data.length > 0) setItems(data);
    };
    fetchItems();
  }, []);

  // Fetch stories from admin for writing practice
  useEffect(() => {
    const fetchStories = async () => {
      setLoadingStories(true);
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
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
      try { await Speech.stop(); } catch (_) {}
      setComposeSpeaking(false);
      return;
    }
    setComposeSpeaking(true);
    if (!composeStartRef.current) composeStartRef.current = Date.now();
    Speech.speak(t, {
      rate: 0.85,
      onDone: () => setComposeSpeaking(false),
      onStopped: () => setComposeSpeaking(false),
      onError: () => setComposeSpeaking(false),
    });
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
    checkQuestProgress(profile.id, 'Writing');
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
        checkQuestProgress(profile.id, 'Writing');
      }
    }

    // Speak feedback
    if (result.isPassing) {
      Speech.speak(`Great job! You got ${result.accuracy} percent correct!`, { rate: 0.9 });
    } else {
      Speech.speak(`You got ${result.accuracy} percent. Keep practicing!`, { rate: 0.9 });
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
      try { Speech.stop(); } catch (_) {}
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
        setCurrentPath([]); // Start fresh stroke
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
                 // Add to history using the LIVE color from the Ref
                 setPaths((prevPaths) => [
                     ...prevPaths, 
                     { d, color: colorRef.current, points: latestCurrentPath.length, bounds }
                 ]);
             }
             return []; // Clear current path
        });
      },
    })
  ).current;

  // --- ACTIONS ---
  const handleCheck = () => {
    if (paths.length === 0) {
      Alert.alert("Canvas Empty", "Please trace something on the canvas!");
      return;
    }

    // Allow any trace, no strict validation required
    Speech.speak(`Great! You completed writing ${selectedItem.label}!`, { rate: 0.9 });
    setSuccessVisible(true);
    if (profile?.id) {
      checkQuestProgress(profile.id, 'Writing');
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
  };

  // --- DEMO ANIMATION ---
  const playDemo = () => {
      setDemoVisible(true);
  };

  // --- RENDER: STORIES SELECTION ---
  if (mode === 'stories') {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#E8927C', '#C87456']} style={styles.header}>
          <GoBackBtn />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Story Writing 📖</Text>
            <Text style={styles.headerSub}>Choose a story to practice writing</Text>
          </View>
          <TouchableOpacity onPress={() => setMode('trace')} style={styles.modePill}>
            <Ionicons name="brush-outline" size={16} color="#fff" />
            <Text style={styles.modePillText}>Trace</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.storiesContainer}>
          {loadingStories ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#673AB7" />
              <Text style={[styles.loadingText, a11yTextStyle]}>Loading stories...</Text>
            </View>
          ) : stories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📚</Text>
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
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(story.level) }]}>
                      <Text style={styles.levelText}>Level {story.level}</Text>
                    </View>
                  </View>
                  <Text style={[styles.storyPreview, a11yTextStyle]} numberOfLines={2}>{story.content}</Text>
                  <View style={styles.storyMeta}>
                    <Text style={styles.storyMetaText}>{story.content.split(' ').length} words</Text>
                    <Ionicons name="chevron-forward" size={18} color="#9575CD" />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // --- RENDER: COMPOSE MODE ---
  if (mode === 'compose') {
    return (
      <View style={styles.composeContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#E8927C', '#C87456']} style={styles.composeHeader}>
          <GoBackBtn />
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[styles.composeTitle, a11yTextStyle]} numberOfLines={1}>
              {selectedStory ? `✍️ ${selectedStory.title}` : 'Writing (Compose) ✍️'}
            </Text>
            <Text style={[styles.composeSub, a11yTextStyle]}>
              {selectedStory ? 'Copy the story below' : 'Dictate, type, then review corrections'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { logComposeSession(); setMode('stories'); setSelectedStory(null); }} style={styles.modePill}>
            <Ionicons name="library-outline" size={16} color="#fff" />
            <Text style={styles.modePillText}>Stories</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.composeBody} keyboardShouldPersistTaps="handled">
          {/* Story Reference Card */}
          {selectedStory && (
            <View style={styles.storyRefCard}>
              <View style={styles.storyRefHeader}>
                <Text style={[styles.storyRefLabel, a11yTextStyle]}>📖 Story to Copy:</Text>
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(selectedStory.level) }]}>
                  <Text style={styles.levelText}>Level {selectedStory.level}</Text>
                </View>
              </View>
              <Text style={[styles.storyRefText, a11yTextStyle]}>{selectedStory.content}</Text>
              <TouchableOpacity
                style={styles.speakStoryBtn}
                onPress={() => Speech.speak(selectedStory.content, { rate: 0.85 })}
              >
                <Ionicons name="volume-high" size={16} color="#fff" />
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
                <Ionicons name={isListening ? 'stop' : 'mic'} size={20} color="#fff" />
                <Text style={styles.composeBtnText}>{isListening ? 'Stop' : 'Dictate'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.composeBtn, composeSpeaking && styles.composeBtnStop]} onPress={speakDraft}>
                <Ionicons name={composeSpeaking ? 'stop' : 'volume-high'} size={20} color="#fff" />
                <Text style={styles.composeBtnText}>{composeSpeaking ? 'Stop' : 'Read Aloud'}</Text>
              </TouchableOpacity>

              {/* Show "Check My Copy" for story mode, "Check Grammar" for free compose */}
              {selectedStory ? (
                <TouchableOpacity
                  style={[styles.composeBtn, styles.composeBtnSubmit]}
                  onPress={checkMyCopy}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
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
                      <Ionicons name="sparkles" size={20} color="#fff" />
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
                  {comparisonResult?.isPassing ? '🎉 Great Job!' : '📝 Keep Practicing!'}
                </Text>
                <TouchableOpacity onPress={() => setShowComparisonModal(false)}>
                  <Ionicons name="close" size={28} color="#333" />
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
                  <Ionicons name="refresh" size={18} color="#fff" />
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
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (!selectedItem) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#E8927C', '#C87456']} style={styles.header}>
            <GoBackBtn />
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Writing Lab ✍️</Text>
                <Text style={styles.headerSub}>Trace letters or practice stories</Text>
            </View>
            <TouchableOpacity onPress={() => setMode('stories')} style={styles.modePill}>
              <Ionicons name="library-outline" size={16} color="#fff" />
              <Text style={styles.modePillText}>Stories</Text>
            </TouchableOpacity>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.gridContainer}>
           {items.map((item) => (
               <TouchableOpacity key={item.id} style={styles.gridCard} onPress={() => setSelectedItem(item)}>
                   <Text style={styles.gridText}>{item.label}</Text>
               </TouchableOpacity>
           ))}
        </ScrollView>
      </View>
    );
  }

  // --- RENDER 2: CANVAS ---
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#673AB7', '#512DA8']} style={styles.header}>
         <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.backBtn}>
             <Ionicons name="grid-outline" size={24} color="#fff" />
             <Text style={styles.backText}>Grid</Text>
         </TouchableOpacity>
         
         <Text style={styles.headerTitle}>{selectedItem.label}</Text>

         {/* DEMO BUTTON */}
         <TouchableOpacity onPress={playDemo} style={styles.demoBtn}>
             <Ionicons name="play-circle" size={28} color="#fff" />
         </TouchableOpacity>
      </LinearGradient>

      {/* DRAWING AREA */}
      <View style={styles.canvasContainer}>
         
         {/* Layer 1: Ghost Guide */}
         <View style={styles.layer}>
            <Text style={[styles.ghostText, { fontSize: selectedItem.label.length > 1 ? 100 : 280 }]}>
                {selectedItem.label}
            </Text>
         </View>

         {/* Layer 2: The Demo Animation (Overlay) */}
         {/* This is a simple visual trick: A moving hand or highlight could go here */}

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
                  <Text style={styles.emoji}>🌟</Text>
                  <Text style={styles.successTitle}>Awesome!</Text>
                  <Text style={styles.successSub}>You wrote {selectedItem.label} perfectly!</Text>
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
                      <Text style={styles.demoTitle}>How to Write {selectedItem?.label}</Text>
                      <TouchableOpacity onPress={() => setDemoVisible(false)}>
                          <Ionicons name="close" size={28} color="#333" />
                      </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.demoContent}>
                      <Text style={styles.demoInstructions}>
                        📝 Instructions:
                      </Text>
                      <Text style={styles.demoText}>
                        1. Look at the letter guide in the background
                      </Text>
                      <Text style={styles.demoText}>
                        2. Trace over the letter with your finger
                      </Text>
                      <Text style={styles.demoText}>
                        3. Try to stay within the lines
                      </Text>
                      <Text style={styles.demoText}>
                        4. You can use different colors if you want
                      </Text>
                      <Text style={styles.demoText}>
                        5. Tap "DONE" when you're finished
                      </Text>
                      
                      <Text style={[styles.demoInstructions, { marginTop: 20 }]}>
                        💡 Tips:
                      </Text>
                      <Text style={styles.demoText}>
                        • Don't worry about being perfect
                      </Text>
                      <Text style={styles.demoText}>
                        • Write slowly and carefully
                      </Text>
                      <Text style={styles.demoText}>
                        • Try writing in different colors
                      </Text>
                      <Text style={styles.demoText}>
                        • Use the "Clear" button to start over
                      </Text>

                      <View style={{ height: 30 }} />
                  </ScrollView>

                  <TouchableOpacity style={styles.demoCloseBtn} onPress={() => setDemoVisible(false)}>
                      <Text style={styles.demoCloseText}>Got it! Let's start ✍️</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAF5F1' },
  
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },

  modePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  modePillText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  backBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 12 },
  backText: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
  demoBtn: { padding: 5 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 20, gap: 15 },
  gridCard: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  gridText: { fontSize: 32, fontWeight: 'bold', color: '#555' },

  canvasContainer: { 
      flex: 1, 
      backgroundColor: '#fff', 
      margin: 20, 
      borderRadius: 20, 
      elevation: 5, 
      overflow: 'hidden',
      position: 'relative'
  },
  
  layer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  ghostText: { fontWeight: 'bold', color: '#E1BEE7', textAlign: 'center' }, // Light purple ghost

  controls: { padding: 20, paddingBottom: 40 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  colorDot: { width: 45, height: 45, borderRadius: 25, borderWidth: 2, borderColor: '#fff', elevation: 2 },
  activeColor: { borderWidth: 3, borderColor: '#333', transform: [{scale: 1.15}] },

  btnRow: { flexDirection: 'row', gap: 15 },
  clearBtn: { flex: 1, padding: 15, backgroundColor: '#fff', borderRadius: 15, borderWidth: 2, borderColor: '#E8927C', alignItems: 'center' },
  clearText: { color: '#E8927C', fontWeight: 'bold' },
  checkBtn: { flex: 2, padding: 15, backgroundColor: '#E8927C', borderRadius: 15, alignItems: 'center', elevation: 5 },
  checkText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  successCard: { width: '80%', backgroundColor: '#fff', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 10 },
  emoji: { fontSize: 60, marginBottom: 10 },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#673AB7' },
  successSub: { fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 10 },
  nextBtn: { backgroundColor: '#FF4081', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, marginTop: 10 },
  nextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Demo modal styles
  demoCard: { width: '95%', backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 10, maxHeight: '90%' },
  demoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingBottom: 12 },
  demoTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  demoContent: { maxHeight: '70%', marginBottom: 16 },
  demoInstructions: { fontSize: 16, fontWeight: 'bold', color: '#673AB7', marginBottom: 8 },
  demoText: { fontSize: 14, color: '#555', marginBottom: 8, lineHeight: 20 },
  demoCloseBtn: { backgroundColor: '#673AB7', borderRadius: 15, paddingVertical: 14, alignItems: 'center' },
  demoCloseText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // ── Compose mode styles ───────────────────────────────────────────
  composeContainer: { flex: 1, backgroundColor: '#FAF5F1' },
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