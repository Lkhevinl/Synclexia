import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
  FlatList, Modal, ActivityIndicator,
} from 'react-native';
import Icon from '../../components/icons/Icon';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';

const LEVEL_COLORS = ['', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];

export default function AdminAddStoryScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [stories, setStories] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form state
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStories(); }, []);

  const fetchStories = async () => {
    setLoadingList(true);
    const { data } = await supabase
      .from('stories')
      .select('id, title, level, created_at')
      .order('created_at', { ascending: false });
    setStories(data || []);
    setLoadingList(false);
  };

  const openAdd = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setLevel('1');
    setFormVisible(true);
  };

  const openEdit = async (story) => {
    // Fetch full content for editing
    const { data } = await supabase.from('stories').select('*').eq('id', story.id).single();
    if (!data) return;
    setEditingId(story.id);
    setTitle(data.title || '');
    setContent(data.content || '');
    setLevel(String(data.level || 1));
    setFormVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Title and content are required.');
      return;
    }
    if (!profile?.id) {
      Alert.alert('Error', 'User authentication required. Please log in again.');
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      content: content.trim(),
      level: parseInt(level),
      created_by: profile.id
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('stories').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('stories').insert([payload]));
    }

    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success ✓', editingId ? 'Story updated!' : 'Story published to library!');
      setFormVisible(false);
      fetchStories();
    }
  };

  const handleDelete = (story) => {
    Alert.alert(
      'Delete Story',
      `Are you sure you want to delete "${story.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('stories').delete().eq('id', story.id);
            if (error) Alert.alert('Error', error.message);
            else fetchStories();
          },
        },
      ],
    );
  };

  return (
    <ScreenWrapper role="admin" padded={false} style={{ backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={styles.header}>
        <GoBackBtn />
        <Text style={styles.header}>Story Library</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Icon name="plus" size="md" color="#fff" />
        </TouchableOpacity>
      </View>

      {loadingList ? (
        <ActivityIndicator size="large" color="#0277BD" style={{ marginTop: 40 }} />
      ) : stories.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="book-open" size="lg" color="#ccc" />
          <Text style={styles.emptyText}>No stories yet. Tap + to add one.</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.storyCard}>
              <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[item.level] || '#607D8B' }]}>
                <Text style={styles.levelBadgeText}>L{item.level}</Text>
              </View>
              <View style={styles.storyInfo}>
                <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.storyDate}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity style={styles.editIconBtn} onPress={() => openEdit(item)}>
                <Icon name="pencil" size="md" color="#0288D1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleDelete(item)}>
                <Icon name="trash" size="md" color="#F44336" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Story' : 'New Story'}</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}>
                <Icon name="x" size="md" color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <CustomInput label="Story Title" value={title} onChangeText={setTitle} placeholder="e.g. The Big Bear" />

              <Text style={styles.label}>Reading Level (1–5)</Text>
              <View style={styles.levelRow}>
                {[1, 2, 3, 4, 5].map(L => (
                  <TouchableOpacity
                    key={L}
                    style={[styles.levelBtn, level == L && { backgroundColor: LEVEL_COLORS[L] }]}
                    onPress={() => setLevel(L.toString())}
                  >
                    <Text style={[styles.levelText, level == L && { color: '#fff' }]}>{L}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <CustomInput
                label="Story Content"
                value={content}
                onChangeText={setContent}
                multiline
                placeholder="Type the story here..."
              />

              <CustomButton
                title={editingId ? 'Update Story' : 'Publish Story'}
                onPress={handleSave}
                loading={saving}
              />
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 55, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: '#0277BD',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center',
  },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 14, textAlign: 'center' },

  storyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1,
  },
  levelBadge: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  levelBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  storyInfo: { flex: 1 },
  storyTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  storyDate: { fontSize: 11, color: '#aaa', marginTop: 3 },
  editIconBtn: { padding: 8 },
  deleteIconBtn: { padding: 8 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0277BD' },
  label: { color: '#666', marginBottom: 10, fontWeight: 'bold', marginLeft: 10 },
  levelRow: { flexDirection: 'row', gap: 10, marginBottom: 20, justifyContent: 'center' },
  levelBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center',
  },
  levelText: { fontWeight: 'bold', color: '#333', fontSize: 16 },
});
