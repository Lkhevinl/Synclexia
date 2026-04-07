// screens/teachers/TeacherPhonicsActivityScreen.js
// Teacher CRUD screen for phonics_activity_content table.
// Full management: add, edit, toggle active, delete blend/rhyme/segment items.

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, ScrollView, StatusBar,
} from 'react-native';
import Icon from '../../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../lib/supabase';
import { TABLES } from '../../../lib/constants';
import GoBackBtn from '../../../components/GoBackBtn';
import { useAuth } from '../../../context/AuthContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import tokens from '../../../theme/tokens';
import { useTheme } from '../../../context/ThemeContext';

const GAME_TYPES = [
  { id: 'blend',   label: 'Blend It',    color: '#FF9800' },
  { id: 'rhyme',   label: 'Rhyme Time',  color: '#E91E63' },
  { id: 'segment', label: 'Count Sounds', color: '#4CAF50' },
];

const FORM_HINTS = {
  blend:   'phonemes: c,a,t  |  word: cat  |  emoji: 🐱',
  rhyme:   'target: cat  |  options: bat,dog,sun  |  correct: bat  |  emoji: 🐱',
  segment: 'word: cat  |  phonemes: c,a,t  |  count: 3  |  emoji: 🐱',
};

const parseBlend   = (f) => ({ phonemes: f.phonemes.split(',').map(s => s.trim()), word: f.word.trim(), emoji: f.emoji.trim() });
const parseRhyme   = (f) => ({ target: f.target.trim(), options: f.options.split(',').map(s => s.trim()), correct: f.correct.trim(), emoji: f.emoji.trim() });
const parseSegment = (f) => ({ word: f.word.trim(), phonemes: f.phonemes.split(',').map(s => s.trim()), count: parseInt(f.count), emoji: f.emoji.trim() });

const blendToForm   = (d) => ({ phonemes: d.phonemes?.join(',') || '', word: d.word || '', emoji: d.emoji || '', target: '', options: '', correct: '', count: '' });
const rhymeToForm   = (d) => ({ phonemes: '', word: '', emoji: d.emoji || '', target: d.target || '', options: d.options?.join(',') || '', correct: d.correct || '', count: '' });
const segmentToForm = (d) => ({ phonemes: d.phonemes?.join(',') || '', word: d.word || '', emoji: d.emoji || '', target: '', options: '', correct: '', count: d.count?.toString() || '' });

export default function TeacherPhonicsActivityScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [gameType, setGameType]   = useState('blend');
  const [level, setLevel]         = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ phonemes: '', word: '', emoji: '', target: '', options: '', correct: '', count: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLES.PHONICS_ACTIVITY_CONTENT)
      .select('*')
      .order('game_type')
      .order('difficulty_level', { nullsFirst: true });
    if (error) Alert.alert('Load Error', error.message);
    if (data)  setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ phonemes: '', word: '', emoji: '', target: '', options: '', correct: '', count: '' });
    setLevel(null);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setGameType(item.game_type);
    setLevel(item.difficulty_level);
    setEditingId(item.id);
    if (item.game_type === 'blend')   setForm(blendToForm(item.data));
    if (item.game_type === 'rhyme')   setForm(rhymeToForm(item.data));
    if (item.game_type === 'segment') setForm(segmentToForm(item.data));
  };

  const buildData = () => {
    try {
      if (gameType === 'blend')   return parseBlend(form);
      if (gameType === 'rhyme')   return parseRhyme(form);
      if (gameType === 'segment') return parseSegment(form);
    } catch { return null; }
  };

  const handleSave = async () => {
    if (!profile?.id) return Alert.alert('Error', 'User authentication required. Please log in again.');

    const data = buildData();
    if (!data) return Alert.alert('Missing Fields', 'Please fill all required fields for this game type.');
    const payload = { game_type: gameType, difficulty_level: level, data };
    if (editingId) {
      const { error } = await supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).update(payload).eq('id', editingId);
      if (error) return Alert.alert('Update Error', error.message);
      Alert.alert('Updated', 'Item updated successfully.');
    } else {
      const { error } = await supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).insert([{ ...payload, is_active: true, created_by: profile.id }]);
      if (error) return Alert.alert('Save Error', error.message);
      Alert.alert('Added', 'Item added successfully.');
    }
    resetForm();
    fetchItems();
  };

  const handleToggle = async (item) => {
    await supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).update({ is_active: !item.is_active }).eq('id', item.id);
    fetchItems();
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).delete().eq('id', item.id);
        fetchItems();
      }},
    ]);
  };

  const fieldDefs = [
    { id: 'phonemes', label: 'Phonemes (comma-separated)',   show: ['blend', 'segment'] },
    { id: 'word',     label: 'Word',                          show: ['blend', 'segment'] },
    { id: 'target',   label: 'Target word',                   show: ['rhyme'] },
    { id: 'options',  label: 'Options (comma-separated)',     show: ['rhyme'] },
    { id: 'correct',  label: 'Correct answer',                show: ['rhyme'] },
    { id: 'count',    label: 'Phoneme count (number)',         show: ['segment'] },
    { id: 'emoji',    label: 'Emoji (optional)',               show: ['blend', 'rhyme', 'segment'] },
  ].filter(f => f.show.includes(gameType));

  const gameColor = GAME_TYPES.find(g => g.id === gameType)?.color || '#FF9800';

  return (
    <ScreenWrapper role="teacher" padded={false} style={{ backgroundColor: colors.surface }}>

      {/* ── HEADER ── */}
      <LinearGradient colors={['#F57C00', '#E65100']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Phonics Activity</Text>
        <Text style={styles.headerSub}>Manage blend, rhyme & segment games</Text>

        {/* Game-type pills */}
        <View style={styles.typeRow}>
          {GAME_TYPES.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.typeBtn, gameType === g.id && { backgroundColor: '#fff' }]}
              onPress={() => { setGameType(g.id); resetForm(); }}
            >
              <Text style={[styles.typeBtnText, gameType === g.id && { color: g.color }]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ── ADD / EDIT FORM ── */}
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>{editingId ? 'Edit Item' : 'Add New Item'}</Text>

        <Text style={styles.fieldLabel}>Difficulty Level</Text>
        <View style={styles.levelRow}>
          {[null, 1, 2, 3].map(l => (
            <TouchableOpacity
              key={String(l)}
              style={[styles.levelBtn, level === l && { backgroundColor: gameColor }]}
              onPress={() => setLevel(l)}
            >
              <Text style={[styles.levelBtnText, level === l && { color: '#fff' }]}>
                {l === null ? 'All' : `Level ${l}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hintText}>📌 Format hint: {FORM_HINTS[gameType]}</Text>

        {fieldDefs.map(f => (
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
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: gameColor }]} onPress={handleSave}>
            <Icon name={editingId ? 'check-circle' : 'plus-circle'} size="md" color="#fff" />
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
        <ActivityIndicator color="#FF9800" size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
          renderItem={({ item }) => {
            const gt = GAME_TYPES.find(g => g.id === item.game_type);
            const preview = item.data?.word || item.data?.target || JSON.stringify(item.data).slice(0, 40);
            return (
              <View style={[styles.card, !item.is_active && styles.cardInactive]}>
                <View style={[styles.typeDot, { backgroundColor: gt?.color || '#90A4AE' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardType}>{gt?.label}</Text>
                  <Text style={styles.cardPreview}>{preview}</Text>
                  <Text style={styles.cardLevel}>Level {item.difficulty_level ?? 'All'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggle(item)} style={styles.iconBtn}>
                  <Icon name={item.is_active ? 'eye' : 'eye-off'} size="md" color={item.is_active ? '#4CAF50' : '#B0BEC5'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                  <Icon name="pencil" size="md" color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                  <Icon name="trash" size="md" color="#F44336" />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="music" size="lg" color="#E0E0E0" />
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
  headerSub: { color: 'rgba(255,255,255,0.80)', fontSize: 13, marginTop: 4, marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.15)' },
  typeBtnText: { fontWeight: 'bold', color: '#fff', fontSize: 11 },

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
  countBadge: { marginLeft: 8, backgroundColor: '#F57C00', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
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
