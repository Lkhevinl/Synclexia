import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import AppHeader from '../../components/AppHeader';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { logSession } from '../../lib/analyticsHelper';
import { checkQuestProgress } from '../../lib/questHelper';
import { supabase } from '../../lib/supabase';

// Color palette — cycled by level number
const LEVEL_COLORS = ['#FF7043', '#FFA726', '#EC407A', '#AB47BC', '#5C6BC0', '#26A69A', '#42A5F5', '#66BB6A'];
const storyColor = (level) => LEVEL_COLORS[((parseInt(level) || 1) - 1) % LEVEL_COLORS.length];

export default function ReadingScreen() {
  const { profile } = useAuth();
  const { colors, getDyslexiaTextStyle } = useTheme();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const readStartTime = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const speakRunIdRef = useRef(0);

  useEffect(() => {
    supabase
      .from('stories')
      .select('id, title, content, level')
      .order('level', { ascending: true })
      .then(({ data }) => {
        if (data) setStories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRead = (story) => {
    setSelectedStory(story);
    readStartTime.current = Date.now();
    setIsSpeaking(false);
    setActiveWordIndex(-1);
  };

  const tokenize = (text) => {
    const parts = String(text || '').match(/(\s+|[^\s]+)/g) || [];
    const tokens = [];
    let wordCursor = 0;
    for (const part of parts) {
      const isSpace = /^\s+$/.test(part);
      if (isSpace) {
        tokens.push({ text: part, isWord: false, wordIndex: null });
      } else {
        tokens.push({ text: part, isWord: true, wordIndex: wordCursor });
        wordCursor += 1;
      }
    }
    return { tokens, wordCount: wordCursor };
  };

  const stopSpeaking = async () => {
    speakRunIdRef.current += 1; // cancels any pending continuation
    setIsSpeaking(false);
    setActiveWordIndex(-1);
    try { await Speech.stop(); } catch (_) {}
  };

  const speakWordByIndex = (words, idx, runId) => {
    if (runId !== speakRunIdRef.current) return;
    if (!words || idx >= words.length) {
      setIsSpeaking(false);
      setActiveWordIndex(-1);
      return;
    }

    setActiveWordIndex(idx);
    Speech.speak(words[idx], {
      rate: 0.8,
      pitch: 1.1,
      onDone: () => speakWordByIndex(words, idx + 1, runId),
      onStopped: () => {
        if (runId === speakRunIdRef.current) {
          setIsSpeaking(false);
          setActiveWordIndex(-1);
        }
      },
      onError: () => {
        if (runId === speakRunIdRef.current) {
          setIsSpeaking(false);
          setActiveWordIndex(-1);
        }
      },
    });
  };

  const handleSpeak = async () => {
    if (!selectedStory?.content) return;
    if (isSpeaking) {
      await stopSpeaking();
      return;
    }

    const { tokens } = tokenize(selectedStory.content);
    const words = tokens.filter(t => t.isWord).map(t => t.text);
    if (words.length === 0) return;

    await Speech.stop();
    setIsSpeaking(true);
    const runId = (speakRunIdRef.current += 1);
    speakWordByIndex(words, 0, runId);
  };

  const closeBook = () => {
    stopSpeaking();
    if (profile?.id && selectedStory && readStartTime.current) {
      const duration = Math.round((Date.now() - readStartTime.current) / 1000);
      logSession({
        studentId: profile.id,
        activityType: 'reading',
        score: 1,
        total: 1,
        durationSeconds: duration,
        details: { storyId: selectedStory.id, storyTitle: selectedStory.title, level: selectedStory.level },
      });
      checkQuestProgress(profile.id, 'Reading');
    }
    setSelectedStory(null);
  };

  const storyTokens = selectedStory?.content ? tokenize(selectedStory.content).tokens : [];

  return (
    <ScreenWrapper role="student" padded={false} edges={['left', 'right', 'bottom']} style={{ backgroundColor: colors.surface }}>
      <AppHeader title="My Library" subtitle='Tap a book cover to open it, then tap "Read to Me" to hear it!' />

      {/* 2. LOADING / BOOKSHELF GRID */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E8927C" />
          <Text style={{ marginTop: 10, color: '#78909C' }}>Loading library...</Text>
        </View>
      ) : stories.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>📚</Text>
          <Text style={{ color: '#78909C', marginTop: 10 }}>No stories yet. Ask an admin to add content.</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.shelfContainer}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.bookCover, { backgroundColor: storyColor(item.level) }]}
              onPress={() => handleRead(item)}
              activeOpacity={0.8}
            >
              <View style={styles.spine} />
              <View style={styles.bookContent}>
                <Text style={styles.bookLevel}>Lvl {item.level}</Text>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Ionicons name="book" size={24} color="rgba(255,255,255,0.5)" style={{ marginTop: 10 }} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 3. READING MODAL */}
      <Modal visible={!!selectedStory} animationType="slide" transparent onRequestClose={closeBook}>
        <View style={styles.modalOverlay}>
          <View style={styles.readerContainer}>
            <View style={[styles.readerHeader, { backgroundColor: selectedStory ? storyColor(selectedStory.level) : '#5D4037' }]}>
              <Text style={styles.readerTitle}>{selectedStory?.title}</Text>
              <TouchableOpacity onPress={closeBook} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.readerContent}>
              <Text style={[styles.storyText, getDyslexiaTextStyle()]}>
                {storyTokens.map((t, i) => {
                  if (!t.isWord) return <Text key={`ws-${i}`}>{t.text}</Text>;
                  const isActive = isSpeaking && t.wordIndex === activeWordIndex;
                  return (
                    <Text
                      key={`w-${i}`}
                      onPress={() => Speech.speak(t.text, { rate: 0.8, pitch: 1.1 })}
                      style={isActive ? styles.activeWord : null}
                    >
                      {t.text}
                    </Text>
                  );
                })}
              </Text>
            </ScrollView>
            <View style={styles.readerControls}>
              <TouchableOpacity style={[styles.speakBtn, isSpeaking && styles.speakBtnStop]} onPress={handleSpeak}>
                <Ionicons name={isSpeaking ? 'stop' : 'volume-high'} size={24} color="#fff" />
                <Text style={styles.speakText}>{isSpeaking ? 'Stop' : 'Read to Me (Highlight)'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  shelfContainer: { padding: 20, paddingTop: 30 },
  bookCover: { width: '47%', aspectRatio: 0.7, borderRadius: 12, marginBottom: 20, elevation: 6, borderRightWidth: 5, borderRightColor: 'rgba(0,0,0,0.1)', borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.1)' },
  spine: { position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  bookContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10, paddingLeft: 15 },
  bookLevel: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', marginBottom: 5 },
  bookTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  readerContainer: { width: '90%', height: '80%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  readerHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 10 },
  closeBtn: { padding: 5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20 },
  readerContent: { padding: 25 },
  storyText: { fontSize: 24, lineHeight: 40, color: '#333', textAlign: 'center' },
  readerControls: { padding: 20, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  speakBtn: { backgroundColor: '#4CAF50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 15 },
  speakBtnStop: { backgroundColor: '#C62828' },
  speakText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },
  activeWord: { backgroundColor: 'rgba(255, 235, 59, 0.6)' },
});
