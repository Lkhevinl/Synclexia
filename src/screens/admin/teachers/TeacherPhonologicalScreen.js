// screens/teachers/TeacherPhonologicalScreen.js
// Teacher CRUD screen for phonological_content table.
// Full management: add, edit, toggle active, delete syllable/rime/phoneme items.

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../lib/supabase';
import GoBackBtn from '../../../components/GoBackBtn';
import { useAuth } from '../../../context/AuthContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import tokens from '../../../theme/tokens';
import { useTheme } from '../../../context/ThemeContext';

const TASK_TYPES = [
  { id: 'syllable', label: 'Syllable 👏', color: '#2196F3' },
  { id: 'rime',     label: 'Rime 🎵',     color: '#9C27B0' },
  { id: 'phoneme',  label: 'Phoneme 🔤',  color: '#E91E63' },
];

const FORM_HINTS = {
  syllable: 'word: cat  |  syllables: 1  |  emoji: 🐱',
  rime:     'target: cat  |  correct: hat  |  distractors: dog,sun',
  phoneme:  'word: sun  |  position: first or last  |  answer: s  |  options: s,m,b',
};

export default function TeacherPhonologicalScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [taskType, setTaskType]   = useState('syllable');
  const [level, setLevel]         = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    word: '', syllables: '', emoji: '',
    target: '', correct: '', distractors: '',
    position: '', answer: '', options: '',
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('phonological_content')
      .select('*')
      .order('task_type')
      .order('difficulty_level', { nullsFirst: true });
    if (error) Alert.alert('Load Error', error.message);
    if (data)  setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ word: '', syllables: '', emoji: '', target: '', correct: '', distractors: '', position: '', answer: '', options: '' });
    setLevel(null);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setTaskType(item.task_type);
    setLevel(item.difficulty_level);
    setEditingId(item.id);
    const d = item.data;
    setForm({
      word:        d.word        || '',
      syllables:   d.syllables?.toString() || '',
      emoji:       d.emoji       || '',
      target:      d.target      || '',
      correct:     d.correct     || '',
      distractors: d.distractors?.join(',') || '',
      position:    d.position    || '',
      answer:      d.answer      || '',
      options:     d.options?.join(',')     || '',
    });
  };

  const buildData = () => {
    if (taskType === 'syllable') {
      if (!form.word || !form.syllables) return null;
      return { word: form.word.trim(), syllables: parseInt(form.syllables), emoji: form.emoji.trim() };
    }
    if (taskType === 'rime') {
      if (!form.target || !form.correct || !form.distractors) return null;
      return { target: form.target.trim(), correct: form.correct.trim(), distractors: form.distractors.split(',').map(s => s.trim()) };
    }
    if (taskType === 'phoneme') {
      if (!form.word || !form.position || !form.answer || !form.options) return null;
      return { word: form.word.trim(), position: form.position.trim(), answer: form.answer.trim(), options: form.options.split(',').map(s => s.trim()) };
    }
    return null;
  };

  const handleSave = async () => {
    if (!profile?.id) return Alert.alert('Error', 'User authentication required. Please log in again.');

    const data = buildData();
    if (!data) return Alert.alert('Missing Fields', 'Please fill all required fields for this task type.');
    const payload = { task_type: taskType, difficulty_level: level, data };
    if (editingId) {
      const { error } = await supabase.from('phonological_content').update(payload).eq('id', editingId);
      if (error) return Alert.alert('Update Error', error.message);
      Alert.alert('✅ Updated', 'Item updated successfully.');
    } else {
      const { error } = await supabase.from('phonological_content').insert([{ ...payload, is_active: true, created_by: profile.id }]);
      if (error) return Alert.alert('Save Error', error.message);
      Alert.alert('✅ Added', 'Item added successfully.');
    }
    resetForm();
    fetchItems();
  };

  const handleToggle = async (item) => {
    await supabase.from('phonological_content').update({ is_active: !item.is_active }).eq('id', item.id);
    fetchItems();
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('phonological_content').delete().eq('id', item.id);
        fetchItems();
      }},
    ]);
  };

  const taskColor = TASK_TYPES.find(t => t.id === taskType)?.color || '#673AB7';

  const allFields = [
    { id: 'word',        label: 'Word',                             show: ['syllable', 'phoneme'] },
    { id: 'syllables',   label: 'Syllable count (number)',          show: ['syllable'] },
    { id: 'emoji',       label: 'Emoji (optional)',                 show: ['syllable'] },
    { id: 'target',      label: 'Target word',                      show: ['rime'] },
    { id: 'correct',     label: 'Correct rhyme',                    show: ['rime'] },
    { id: 'distractors', label: 'Distractors (comma-separated)',    show: ['rime'] },
    { id: 'position',    label: 'Position (first / last)',          show: ['phoneme'] },
    { id: 'answer',      label: 'Correct sound (e.g. s)',           show: ['phoneme'] },
    { id: 'options',     label: 'Options (comma-sep, e.g. s,m,b)', show: ['phoneme'] },
  ].filter(f => f.show.includes(taskType));

  return (
    <ScreenWrapper role="teacher" padded={false} style={{ backgroundColor: colors.surface }}>

      {/* ── HEADER ── */}
      <LinearGradient colors={['#7B1FA2', '#4A148C']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Phonological Awareness 🎧</Text>
        <Text style={styles.headerSub}>Manage syllable, rime & phoneme tasks</Text>

        {/* Task-type pills */}
        <View style={styles.typeRow}>
          {TASK_TYPES.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeBtn, taskType === t.id && { backgroundColor: '#fff' }]}
              onPress={() => { setTaskType(t.id); resetForm(); }}
            >
              <Text style={[styles.typeBtnText, taskType === t.id && { color: t.color }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ── ADD / EDIT FORM ── */}
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>{editingId ? '✏️ Edit Item' : '➕ Add New Item'}</Text>

        <Text style={styles.fieldLabel}>Difficulty Level</Text>
        <View style={styles.levelRow}>
          {[null, 1, 2, 3].map(l => (
            <TouchableOpacity
              key={String(l)}
              style={[styles.levelBtn, level === l && { backgroundColor: taskColor }]}
              onPress={() => setLevel(l)}
            >
              <Text style={[styles.levelBtnText, level === l && { color: '#fff' }]}>
                {l === null ? 'All' : `Level ${l}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hintText}>📌 Format hint: {FORM_HINTS[taskType]}</Text>

        {allFields.map(f => (
          <TextInput
            key={f.id}
            style={styles.input}
            placeholder={f.label}
            value={form[f.id]}
            onChangeText={v => setForm(prev => ({ ...prev, [f.id]: v }))}
            placeholderTextColor="#90A4AE"
            autoCapitalize="none"
          />
        ))}

        <View style={styles.btnRow}>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: taskColor }]} onPress={handleSave}>
            <Ionicons name={editingId ? 'checkmark-circle' : 'add-circle'} size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{editingId ? 'Update' : 'Add Item'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── ITEM LIST ── */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>All Items</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{items.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#673AB7" size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
          renderItem={({ item }) => {
            const tt = TASK_TYPES.find(t => t.id === item.task_type);
            const preview = item.data?.word || item.data?.target || '—';
            return (
              <View style={[styles.card, !item.is_active && styles.cardInactive]}>
                <View style={[styles.typeDot, { backgroundColor: tt?.color || '#90A4AE' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardType}>{tt?.label}</Text>
                  <Text style={styles.cardPreview}>{preview}</Text>
                  <Text style={styles.cardLevel}>Level {item.difficulty_level ?? 'All'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggle(item)} style={styles.iconBtn}>
                  <Ionicons name={item.is_active ? 'eye' : 'eye-off'} size={20} color={item.is_active ? '#4CAF50' : '#B0BEC5'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                  <Ionicons name="pencil" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                  <Ionicons name="trash" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="ear-outline" size={50} color="#E0E0E0" />
              <Text style={styles.emptyText}>No items yet. Add one above!</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4, marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.12)' },
  typeBtnText: { fontWeight: 'bold', color: '#fff', fontSize: 12 },

  // Form
  form: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 16, maxHeight: 380, elevation: 3 },
  formTitle: { fontSize: 15, fontWeight: 'bold', color: '#37474F', marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#78909C', marginBottom: 6, marginTop: 4 },
  hintText: { fontSize: 11, color: '#B0BEC5', marginBottom: 10, fontStyle: 'italic' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, fontSize: 14, color: '#37474F', marginBottom: 8, backgroundColor: '#FAFAFA' },
  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  levelBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA' },
  levelBtnText: { fontWeight: 'bold', color: '#78909C', fontSize: 12 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtn: { flex: 1, borderRadius: 10, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { flex: 1, backgroundColor: '#ECEFF1', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  cancelBtnText: { color: '#78909C', fontWeight: 'bold', fontSize: 15 },

  // List
  listHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, marginBottom: 8 },
  listTitle: { fontSize: 15, fontWeight: 'bold', color: '#37474F' },
  countBadge: { marginLeft: 8, backgroundColor: '#7B1FA2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginBottom: 8, borderRadius: 14, padding: 12, elevation: 2 },
  cardInactive: { opacity: 0.4 },
  typeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  cardType: { fontSize: 11, fontWeight: 'bold', color: '#90A4AE', textTransform: 'uppercase' },
  cardPreview: { fontSize: 15, color: '#37474F', fontWeight: '600', marginTop: 2 },
  cardLevel: { fontSize: 11, color: '#B0BEC5', marginTop: 2 },
  iconBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#B0BEC5', marginTop: 12 },
});
