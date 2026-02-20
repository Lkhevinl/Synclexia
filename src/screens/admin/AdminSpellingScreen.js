// screens/admin/AdminSpellingScreen.js
// CRUD management for spelling_words table.
// Admin can add, edit, and toggle active/inactive spelling words.

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';

const LEVELS = [
  { value: 1, label: 'Level 1 — CVC / Easy' },
  { value: 2, label: 'Level 2 — 4-letter / Medium' },
  { value: 3, label: 'Level 3 — 5-letter+ / Hard' },
];

export default function AdminSpellingScreen() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState('');
  const [emoji, setEmoji] = useState('');
  const [hint, setHint] = useState('');
  const [level, setLevel] = useState(1);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchWords(); }, []);

  const fetchWords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('spelling_words')
      .select('*')
      .order('difficulty_level')
      .order('word');
    if (error) Alert.alert('Error', error.message);
    if (data) setWords(data);
    setLoading(false);
  };

  const resetForm = () => {
    setWord(''); setEmoji(''); setHint(''); setLevel(1); setEditingId(null);
  };

  const handleEdit = (item) => {
    setWord(item.word);
    setEmoji(item.emoji || '');
    setHint(item.hint || '');
    setLevel(item.difficulty_level);
    setEditingId(item.id);
  };

  const handleSave = async () => {
    if (!word.trim()) return Alert.alert('Error', 'Word is required.');
    const payload = {
      word: word.trim().toLowerCase(),
      emoji: emoji.trim() || null,
      hint: hint.trim() || null,
      difficulty_level: level,
    };
    if (editingId) {
      const { error } = await supabase.from('spelling_words').update(payload).eq('id', editingId);
      if (error) return Alert.alert('Error', error.message);
      Alert.alert('Updated', `"${word}" updated.`);
    } else {
      const { error } = await supabase.from('spelling_words').insert([payload]);
      if (error) return Alert.alert('Error', error.message);
      Alert.alert('Added', `"${word}" added to spelling list.`);
    }
    resetForm();
    fetchWords();
  };

  const handleToggle = async (item) => {
    const { error } = await supabase
      .from('spelling_words')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    if (error) return Alert.alert('Error', error.message);
    fetchWords();
  };

  const handleDelete = (item) => {
    Alert.alert('Delete', `Delete "${item.word}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('spelling_words').delete().eq('id', item.id);
        fetchWords();
      }},
    ]);
  };

  const levelColor = { 1: '#4CAF50', 2: '#FF9800', 3: '#F44336' };

  return (
    <View style={styles.container}>
      <GoBackBtn />
      <Text style={styles.header}>Spelling Words 🔤</Text>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{editingId ? 'Edit Word' : 'Add New Word'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Word (e.g. cat)"
          value={word}
          onChangeText={setWord}
          placeholderTextColor="#90A4AE"
        />
        <TextInput
          style={styles.input}
          placeholder="Emoji (e.g. 🐱)"
          value={emoji}
          onChangeText={setEmoji}
          placeholderTextColor="#90A4AE"
        />
        <TextInput
          style={styles.input}
          placeholder="Hint (e.g. A fluffy pet that meows)"
          value={hint}
          onChangeText={setHint}
          placeholderTextColor="#90A4AE"
        />

        <Text style={styles.fieldLabel}>Difficulty Level</Text>
        <View style={styles.levelRow}>
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l.value}
              style={[styles.levelBtn, level === l.value && { backgroundColor: levelColor[l.value] }]}
              onPress={() => setLevel(l.value)}
            >
              <Text style={[styles.levelBtnText, level === l.value && { color: '#fff' }]}>L{l.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.btnRow}>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{editingId ? 'Update' : 'Add Word'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Text style={styles.sectionLabel}>All Words ({words.length})</Text>
      {loading ? (
        <ActivityIndicator color="#2196F3" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={words}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.is_active && styles.cardInactive]}>
              <Text style={styles.cardEmoji}>{item.emoji || '🔤'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardWord}>{item.word}</Text>
                {item.hint ? <Text style={styles.cardHint}>{item.hint}</Text> : null}
                <View style={[styles.levelPill, { backgroundColor: levelColor[item.difficulty_level] + '20', borderColor: levelColor[item.difficulty_level] }]}>
                  <Text style={[styles.levelPillText, { color: levelColor[item.difficulty_level] }]}>L{item.difficulty_level}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleToggle(item)} style={styles.iconBtn}>
                <Ionicons name={item.is_active ? 'eye' : 'eye-off'} size={20} color={item.is_active ? '#4CAF50' : '#90A4AE'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                <Ionicons name="pencil" size={20} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                <Ionicons name="trash" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 50 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#37474F', textAlign: 'center', marginBottom: 10 },
  form: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, maxHeight: 340, elevation: 2 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#78909C', marginHorizontal: 16, marginTop: 8, marginBottom: 6 },
  fieldLabel: { fontSize: 13, color: '#78909C', marginBottom: 6, marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, fontSize: 15, color: '#37474F', marginBottom: 10, backgroundColor: '#FAFAFA' },
  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  levelBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA' },
  levelBtnText: { fontWeight: 'bold', color: '#78909C' },
  btnRow: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: '#2196F3', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { flex: 1, backgroundColor: '#ECEFF1', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#78909C', fontWeight: 'bold', fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12, elevation: 2 },
  cardInactive: { opacity: 0.45 },
  cardEmoji: { fontSize: 28, marginRight: 12 },
  cardWord: { fontSize: 16, fontWeight: 'bold', color: '#37474F' },
  cardHint: { fontSize: 12, color: '#78909C', marginTop: 2 },
  levelPill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  levelPillText: { fontSize: 11, fontWeight: 'bold' },
  iconBtn: { padding: 8 },
});
