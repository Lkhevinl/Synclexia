import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import GoBackBtn from '../components/GoBackBtn';
import ScreenWrapper from '../components/ScreenWrapper';
import { checkQuestProgress } from '../lib/questHelper'; // <--- NEW IMPORT
import { useAuth } from '../context/AuthContext';

export default function ReadingScreen() {
  const { profile } = useAuth();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const { data } = await supabase.from('stories').select('*').order('level');
    if (data) setStories(data);
  };

  const handleFinishStory = async () => {
    // 1. Trigger the Real Quest Logic
    await checkQuestProgress(profile.id, 'Read'); 
    
    // 2. Give feedback
    Alert.alert("Great Job!", "You finished a story. Check your Quests!");
    setSelectedStory(null);
  };

  return (
    <ScreenWrapper>
      <GoBackBtn />
      <Text style={styles.header}>Library 📖</Text>
      <Text style={styles.subHeader}>Choose a story to read</Text>

      <FlatList
        data={stories}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.bookCard} onPress={() => setSelectedStory(item)}>
            <View style={styles.bookIcon}><Text style={{fontSize:30}}>📚</Text></View>
            <View>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookLevel}>Level {item.level}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* READING MODAL */}
      <Modal visible={!!selectedStory} animationType="slide" onRequestClose={() => setSelectedStory(null)}>
          <View style={styles.readerContainer}>
              <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 100}}>
                  <Text style={styles.readerTitle}>{selectedStory?.title}</Text>
                  <Text style={styles.readerContent}>{selectedStory?.content}</Text>
              </ScrollView>

              {/* FINISH BUTTON - THIS IS THE KEY */}
              <TouchableOpacity style={styles.finishBtn} onPress={handleFinishStory}>
                  <Text style={styles.finishText}>I Finished Reading!</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedStory(null)}>
                  <Text style={{color: '#666'}}>Close</Text>
              </TouchableOpacity>
          </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 28, fontWeight: 'bold', color: '#1565C0', marginTop: 40, textAlign: 'center' },
  subHeader: { textAlign: 'center', color: '#666', marginBottom: 20 },
  bookCard: { flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center' },
  bookIcon: { width: 50, height: 50, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  bookTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  bookLevel: { color: '#1565C0', fontWeight: 'bold' },
  
  readerContainer: { flex: 1, backgroundColor: '#fff' },
  readerTitle: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginTop: 50, marginBottom: 20 },
  readerContent: { fontSize: 20, lineHeight: 32, color: '#333' },
  finishBtn: { position: 'absolute', bottom: 80, alignSelf: 'center', backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, elevation: 5 },
  finishText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  closeBtn: { position: 'absolute', top: 50, right: 20, padding: 10 }
});