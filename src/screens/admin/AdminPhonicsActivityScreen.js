// screens/admin/AdminPhonicsActivityScreen.js
// CRUD management for phonics_activity_content table.
// Admin can add, edit, toggle, and delete blend & segment items.

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import Icon from '../../components/icons/Icon';
import { supabase } from '../../lib/supabase';
import { TABLES } from '../../lib/constants';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';

const GAME_TYPES = [
  { id: 'blend',   label: 'Blend It',      color: '#FF9800' },
  { id: 'segment', label: 'Count Sounds',   color: '#4CAF50' },
];
const LEVELS = [1, 2, 3];

// UI helpers for form fields per game type
const FORM_HINTS = {
  blend:   'phonemes: c,a,t  |  word: cat  |  emoji: 🐱',
  segment: 'word: cat  |  phonemes: c,a,t  |  count: 3  |  emoji: 🐱',
};

const parseBlend   = (f) => ({ phonemes: f.phonemes.split(',').map(s => s.trim()), word: f.word.trim(), emoji: f.emoji.trim() });
const parseSegment = (f) => ({ word: f.word.trim(), phonemes: f.phonemes.split(',').map(s => s.trim()), count: parseInt(f.count), emoji: f.emoji.trim() });

const blendToForm   = (d) => ({ phonemes: d.phonemes?.join(',') || '', word: d.word || '', emoji: d.emoji || '', count: '' });
const segmentToForm = (d) => ({ phonemes: d.phonemes?.join(',') || '', word: d.word || '', emoji: d.emoji || '', count: d.count?.toString() || '' });

export default function AdminPhonicsActivityScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gameType, setGameType] = useState('blend');
  const [level, setLevel] = useState(null); // null = all levels
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ phonemes: '', word: '', emoji: '', count: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLES.PHONICS_ACTIVITY_CONTENT)
      .select('*')
      .order('game_type')
      .order('difficulty_level', { nullsFirst: true });
    if (error) Alert.alert('Error', error.message);
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ phonemes: '', word: '', emoji: '', count: '' });
    setLevel(null);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setGameType(item.game_type);
    setLevel(item.difficulty_level);
    setEditingId(item.id);
    if (item.game_type === 'blend')   setForm(blendToForm(item.data));
    if (item.game_type === 'segment') setForm(segmentToForm(item.data));
  };

  const buildData = () => {
    try {
      if (gameType === 'blend')   return parseBlend(form);
      if (gameType === 'segment') return parseSegment(form);
    } catch { return null; }
  };

  const handleSave = async () => {
    const data = buildData();
    if (!data) return Alert.alert('Error', 'Please fill all required fields correctly.');
    const payload = { game_type: gameType, difficulty_level: level, data };

    if (editingId) {
      const { error } = await supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).update(payload).eq('id', editingId);
      if (error) return Alert.alert('Error', error.message);
      Alert.alert('Updated', 'Item updated.');
    } else {
      const { error } = await supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).insert([payload]);
      if (error) return Alert.alert('Error', error.message);
      Alert.alert('Added', 'Item added.');
    }
    resetForm();
    fetchItems();
  };

  const handleToggle = async (item) => {
    await supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).update({ is_active: !item.is_active }).eq('id', item.id);
    fetchItems();
  };

  const handleDelete = (item) => {
    Alert.alert('Delete', 'Delete this item?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).delete().eq('id', item.id);
        fetchItems();
      }},
    ]);
  };

  const t = (key) => [
    { id: 'phonemes', label: 'Phonemes (comma-separated)', show: ['blend', 'segment'] },
    { id: 'word',     label: 'Word',                        show: ['blend', 'segment'] },
    { id: 'count',    label: 'Phoneme count (number)',        show: ['segment'] },
    { id: 'emoji',    label: 'Emoji',                        show: ['blend', 'segment'] },
  ].find(f => f.id === key);

  const fields = [
    'phonemes', 'word', 'count', 'emoji',
  ].filter(f => t(f)?.show.includes(gameType));

  const gameColor = GAME_TYPES.find(g => g.id === gameType)?.color || '#2196F3';

  return (
    <ScreenWrapper role="admin" padded={false} style={{ backgroundColor: colors.surface }}>
      <GoBackBtn />
      <Text style={styles.header}>Phonics Activity Content</Text>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{editingId ? 'Edit Item' : 'Add New Item'}</Text>

        {/* Game type picker */}
        <Text style={styles.fieldLabel}>Game Type</Text>
        <View style={styles.typeRow}>
          {GAME_TYPES.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.typeBtn, gameType === g.id && { backgroundColor: g.color }]}
              onPress={() => { setGameType(g.id); setForm({ phonemes: '', word: '', emoji: '', count: '' }); }}
            >
              <Text style={[styles.typeBtnText, gameType === g.id && { color: '#fff' }]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Level picker */}
        <Text style={styles.fieldLabel}>Difficulty Level (empty = all levels)</Text>
        <View style={styles.levelRow}>
          {[null, 1, 2, 3].map(l => (
            <TouchableOpacity
              key={String(l)}
              style={[styles.levelBtn, level === l && { backgroundColor: gameColor }]}
              onPress={() => setLevel(l)}
            >
              <Text style={[styles.levelBtnText, level === l && { color: '#fff' }]}>{l === null ? 'All' : `L${l}`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hintText}>Format: {FORM_HINTS[gameType]}</Text>

        {fields.map(f => (
          <TextInput
            key={f}
            style={styles.input}
            placeholder={t(f)?.label}
            value={form[f]}
            onChangeText={v => setForm(prev => ({ ...prev, [f]: v }))}
            placeholderTextColor="#90A4AE"
          />
        ))}

        <View style={styles.btnRow}>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: gameColor }]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{editingId ? 'Update' : 'Add Item'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Text style={styles.sectionLabel}>All Items ({items.length})</Text>
      {loading ? (
        <ActivityIndicator color="#FF9800" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const gt = GAME_TYPES.find(g => g.id === item.game_type);
            const preview = item.data?.word || item.data?.target || JSON.stringify(item.data).slice(0, 40);
            return (
              <View style={[styles.card, !item.is_active && styles.cardInactive]}>
                <View style={[styles.typeDot, { backgroundColor: gt?.color || '#90A4AE' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardType}>{gt?.label}</Text>
                  <Text style={styles.cardPreview}>{preview}</Text>
                  <Text style={styles.cardLevel}>L{item.difficulty_level ?? '—'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggle(item)} style={styles.iconBtn}>
                  <Icon name={item.is_active ? 'eye' : 'eye-off'} size="md" color={item.is_active ? '#4CAF50' : '#90A4AE'} />
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
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#37474F', textAlign: 'center', marginBottom: 10 },
  form: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, maxHeight: 400, elevation: 2 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#78909C', marginHorizontal: 16, marginTop: 8, marginBottom: 6 },
  fieldLabel: { fontSize: 13, color: '#78909C', marginBottom: 6, marginTop: 4 },
  hintText: { fontSize: 11, color: '#B0BEC5', marginBottom: 8, fontStyle: 'italic' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, fontSize: 14, color: '#37474F', marginBottom: 8, backgroundColor: '#FAFAFA' },
  typeRow: { gap: 6, marginBottom: 10 },
  typeBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA', marginBottom: 4 },
  typeBtnText: { fontWeight: 'bold', color: '#78909C', fontSize: 13 },
  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  levelBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA' },
  levelBtnText: { fontWeight: 'bold', color: '#78909C', fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { flex: 1, backgroundColor: '#ECEFF1', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#78909C', fontWeight: 'bold', fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12, elevation: 2 },
  cardInactive: { opacity: 0.45 },
  typeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  cardType: { fontSize: 12, fontWeight: 'bold', color: '#90A4AE' },
  cardPreview: { fontSize: 14, color: '#37474F', marginTop: 2 },
  cardLevel: { fontSize: 11, color: '#B0BEC5', marginTop: 2 },
  iconBtn: { padding: 8 },
});
