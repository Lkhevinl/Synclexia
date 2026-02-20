import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { logSession } from '../../lib/analyticsHelper';

// Sample Stories (You can move these to Supabase later!)
const STORIES = [
  { id: '1', title: 'The Fat Cat', level: 'Lvl 1', color: '#FF7043', text: 'The fat cat sat on the mat. The rat sat on the hat. The cat saw the rat. The rat ran away!' },
  { id: '2', title: 'Ben’s Red Hen', level: 'Lvl 1', color: '#FFA726', text: 'Ben has a red hen. The hen is in the pen. Ten men see the hen. The hen lays an egg for Ben.' },
  { id: '3', title: 'The Big Pig', level: 'Lvl 2', color: '#EC407A', text: 'Tim saw a big pig. The pig had a wig. The pig did a jig. Tim gave the pig a fig.' },
  { id: '4', title: 'Hot Pot', level: 'Lvl 2', color: '#AB47BC', text: 'Mom has a hot pot. The pot is on the cot. Do not touch the hot pot! It is very hot.' },
  { id: '5', title: 'Sam and Pam', level: 'Lvl 3', color: '#5C6BC0', text: 'Sam and Pam ran to the dam. Sam had some ham. Pam had some jam. They ate ham and jam by the dam.' },
  { id: '6', title: 'Fox in Box', level: 'Lvl 3', color: '#26A69A', text: 'The fox is in the box. The fox has shocks. The fox puts on socks. The fox rocks on the box.' },
];

export default function ReadingScreen() {
  const { profile } = useAuth();
  const [selectedStory, setSelectedStory] = useState(null);
  const readStartTime = useRef(null);

  const handleRead = (story) => {
    setSelectedStory(story);
    readStartTime.current = Date.now();
  };

  const handleSpeak = () => {
    if (selectedStory) {
      Speech.speak(selectedStory.text, { rate: 0.8, pitch: 1.1 });
    }
  };

  const closeBook = () => {
    Speech.stop();
    // Log the reading session
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

      {/* 2. BOOKSHELF GRID */}
      <FlatList
        data={STORIES}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.shelfContainer}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.bookCover, { backgroundColor: item.color }]} 
            onPress={() => handleRead(item)}
            activeOpacity={0.8}
          >
             {/* Book Spine Detail */}
             <View style={styles.spine} />
             
             {/* Book Title */}
             <View style={styles.bookContent}>
                 <Text style={styles.bookLevel}>{item.level}</Text>
                 <Text style={styles.bookTitle}>{item.title}</Text>
                 <Ionicons name="book" size={24} color="rgba(255,255,255,0.5)" style={{marginTop: 10}} />
             </View>
          </TouchableOpacity>
        )}
      />

      {/* 3. READING MODAL (The opened book) */}
      <Modal visible={!!selectedStory} animationType="slide" transparent={true} onRequestClose={closeBook}>
          <View style={styles.modalOverlay}>
              <View style={styles.readerContainer}>
                  
                  {/* Reader Header */}
                  <View style={[styles.readerHeader, { backgroundColor: selectedStory?.color }]}>
                      <Text style={styles.readerTitle}>{selectedStory?.title}</Text>
                      <TouchableOpacity onPress={closeBook} style={styles.closeBtn}>
                          <Ionicons name="close" size={24} color="#fff" />
                      </TouchableOpacity>
                  </View>

                  {/* Story Text */}
                  <ScrollView contentContainerStyle={styles.readerContent}>
                      <Text style={styles.storyText}>{selectedStory?.text}</Text>
                  </ScrollView>

                  {/* Reader Controls */}
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
  mainContainer: { flex: 1, backgroundColor: '#D7CCC8' }, // Beige/Wood color theme
  
  // Header
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerTitleBox: { alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', fontFamily: 'serif' },
  headerSub: { color: '#BCAAA4', fontSize: 14, fontStyle: 'italic' },

  // Bookshelf
  shelfContainer: { padding: 20, paddingTop: 30 },
  bookCover: { 
      width: '47%', 
      aspectRatio: 0.7, // Rectangular book shape
      borderRadius: 12, 
      marginBottom: 20, 
      elevation: 6,
      boxShadow: '4px 4px 5px rgba(0,0,0,0.3)',
      borderRightWidth: 5, borderRightColor: 'rgba(0,0,0,0.1)', // 3D effect
      borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  spine: { position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  bookContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10, paddingLeft: 15 },
  bookLevel: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', marginBottom: 5 },
  bookTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', fontFamily: 'serif' },

  // Reader Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  readerContainer: { width: '90%', height: '80%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  
  readerHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  closeBtn: { padding: 5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20 },
  
  readerContent: { padding: 25 },
  storyText: { fontSize: 24, lineHeight: 40, color: '#333', textAlign: 'center' }, // Big text for reading
  
  readerControls: { padding: 20, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  speakBtn: { backgroundColor: '#4CAF50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 15 },
  speakText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }
});