import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '../lib/supabase';
import GoBackBtn from '../components/GoBackBtn';
import ScreenWrapper from '../components/ScreenWrapper';
import { checkQuestProgress } from '../lib/questHelper';
import { useAuth } from '../context/AuthContext';

export default function PhonicsScreen() {
  const { profile } = useAuth();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchPhonics();
  }, []);

  const fetchPhonics = async () => {
    const { data } = await supabase.from('phonics_items').select('*').order('id');
    
    if (data) {
      // GROUP DATA BY CATEGORY
      const grouped = data.reduce((acc, item) => {
        // If item has no category, put it in 'Other'
        const cat = item.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});

      // CONVERT TO SECTION LIST FORMAT
      const sectionsArray = Object.keys(grouped).map(key => ({
        title: key.toUpperCase(),
        data: grouped[key]
      }));

      setSections(sectionsArray);
    }
  };

  const handlePlay = (text) => {
    Speech.speak(text);
    checkQuestProgress(profile.id, 'Phonics'); 
    checkQuestProgress(profile.id, 'Practice'); 
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, {backgroundColor: item.bg_color || '#fff'}]} 
      onPress={() => handlePlay(item.label)}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{item.icon || "🔊"}</Text>
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <GoBackBtn />
      <Text style={styles.header}>Phonics Library 📚</Text>
      
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index, section }) => {
          // Logic to render items in a grid (2 columns) inside a SectionList
          if (index % 2 !== 0) return null; // Skip every second item (it's handled by the previous one)

          const nextItem = section.data[index + 1];

          return (
            <View style={styles.row}>
              {renderItem({ item })}
              {nextItem ? renderItem({ item: nextItem }) : <View style={styles.cardInvisible} />}
            </View>
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 50 }}
        stickySectionHeadersEnabled={false}
      />
    </ScreenWrapper>
  );
}

// Layout Math
const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 15) / 2; // (Screen - Padding - Gap) / 2

const styles = StyleSheet.create({
  header: { fontSize: 26, fontWeight: 'bold', color: '#E91E63', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  
  sectionHeader: { marginTop: 20, marginBottom: 10, paddingVertical: 5, borderBottomWidth: 2, borderColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#880E4F', letterSpacing: 1 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },

  card: { 
    width: cardWidth, 
    height: 140, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width:0, height:2}
  },
  cardInvisible: { width: cardWidth, backgroundColor: 'transparent' }, // Placeholder for odd numbers

  icon: { fontSize: 45, marginBottom: 5 },
  label: { fontSize: 20, fontWeight: 'bold', color: '#333' }
});