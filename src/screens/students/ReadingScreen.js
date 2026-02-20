import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { logSession } from '../../lib/analyticsHelper';
import { supabase } from '../../lib/supabase';

// Color palette — cycled by level number
const LEVEL_COLORS = ['#FF7043', '#FFA726', '#EC407A', '#AB47BC', '#5C6BC0', '#26A69A', '#42A5F5', '#66BB6A'];
const storyColor = (level) => LEVEL_COLORS[((parseInt(level) || 1) - 1) % LEVEL_COLORS.length];

export default function ReadingScreen() {
  const { profile } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const readStartTime = useRef(null);

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
  };

  const handleSpeak = () => {
    if (selectedStory) {
      Speech.speak(selectedStory.content, { rate: 0.8, pitch: 1.1 });
    }
  };

  const closeBook = () => {
    Speech.stop();
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
    }
    setSelectedStory(null);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* 1. LIBRARY HEADER */}
      <LinearGradient colors={['#5D4037', '#4E342E']} style={styles.header}>
        <GoBackBtn />
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.headerSub}>Select a book to read</Text>
        </View>
      </LinearGradient>

      {/* 2. LOADING / BOOKSHELF GRID */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5D4037" />
          <Text style={{ marginTop: 10, color: '#78909C' }}>Loading library...</Text>
        </View>
      ) : stories.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>📚</Text>
          <Text style={{ color: '#78909C', marginTop: 10 }}>No stories yet. Ask your teacher!</Text>
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
              <Text style={styles.storyText}>{selectedStory?.content}</Text>
            </ScrollView>
            <View style={styles.readerControls}>
              <TouchableOpacity style={styles.speakBtn} onPress={handleSpeak}>
                <Ionicons name="volume-high" size={24} color="#fff" />
                <Text style={styles.speakText}>Read to Me</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#D7CCC8' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerTitleBox: { alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', fontFamily: 'serif' },
  headerSub: { color: '#BCAAA4', fontSize: 14, fontStyle: 'italic' },
  shelfContainer: { padding: 20, paddingTop: 30 },
  bookCover: { width: '47%', aspectRatio: 0.7, borderRadius: 12, marginBottom: 20, elevation: 6, borderRightWidth: 5, borderRightColor: 'rgba(0,0,0,0.1)', borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.1)' },
  spine: { position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  bookContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10, paddingLeft: 15 },
  bookLevel: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', marginBottom: 5 },
  bookTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', fontFamily: 'serif' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  readerContainer: { width: '90%', height: '80%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  readerHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 10 },
  closeBtn: { padding: 5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20 },
  readerContent: { padding: 25 },
  storyText: { fontSize: 24, lineHeight: 40, color: '#333', textAlign: 'center' },
  readerControls: { padding: 20, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  speakBtn: { backgroundColor: '#4CAF50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 15 },
  speakText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },
});
