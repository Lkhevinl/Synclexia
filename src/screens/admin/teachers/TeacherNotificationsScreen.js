import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native';
import Icon from '../../../components/icons/Icon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { TABLES } from '../../../lib/constants';
import GoBackBtn from '../../../components/GoBackBtn';
import ScreenWrapper from '../../../components/ScreenWrapper';
import tokens from '../../../theme/tokens';
import { useTheme } from '../../../context/ThemeContext';

const showAlert = (title, msg) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n${msg}`); }
  else { Alert.alert(title, msg); }
};

export default function TeacherNotificationsScreen() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('Posted');
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    const isDraft = activeTab === 'Drafts';
    const { data, error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .select('*')
      .eq('is_draft', isDraft)
      .eq('teacher_id', profile?.id)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
    if (error) Alert.alert("Error", error.message);
    setLoading(false);
  };

  const handlePost = async (asDraft = false) => {
    if (!title || !content) return showAlert("Error", "Please fill all fields");
    try {
      if (editingId) {
        const { error } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .update({ title, content, is_draft: asDraft, target_role: targetRole })
          .eq('id', editingId);
        if (error) throw error;
        showAlert("Success", "Notification updated!");
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .insert([{ title, content, is_draft: asDraft, target_role: targetRole, teacher_id: profile?.id }]);
        if (error) throw error;
        showAlert("Success", asDraft ? "Saved to Drafts" : "Posted!");
      }
      setTitle('');
      setContent('');
      setTargetRole('all');
      fetchNotifications();
    } catch (error) {
      showAlert("Error", error.message);
    }
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setContent(item.content);
    setTargetRole(item.target_role || 'all');
    setEditingId(item.id);
    setActiveTab(item.is_draft ? 'Drafts' : 'Posted');
  };

  const handleDelete = async (id) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Delete this notification?')) return;
      await supabase.from(TABLES.NOTIFICATIONS).delete().eq('id', id);
      fetchNotifications();
    } else {
      Alert.alert("Delete", "Are you sure?", [
        { text: "Cancel" },
        { text: "Delete", style: 'destructive', onPress: async () => {
            await supabase.from(TABLES.NOTIFICATIONS).delete().eq('id', id);
            fetchNotifications();
        }}
      ]);
    }
  };

  const { colors } = useTheme();

  return (
    <ScreenWrapper role="teacher" scrollable>
      <GoBackBtn />
      <Text style={[styles.headerTitle, { color: colors.primary }]}>Notification Manager</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => { setActiveTab('Posted'); setEditingId(null); setTitle(''); setContent(''); }} style={[styles.tab, activeTab === 'Posted' && styles.activeTab]}>
           <Text style={[styles.tabText, activeTab === 'Posted' && styles.activeTabText]}>Posted</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setActiveTab('Drafts'); setEditingId(null); setTitle(''); setContent(''); }} style={[styles.tab, activeTab === 'Drafts' && styles.activeTab]}>
           <Text style={[styles.tabText, activeTab === 'Drafts' && styles.activeTabText]}>Drafts</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>{editingId ? "Editing Post..." : "New Announcement"}</Text>
        <TextInput 
            placeholder="Enter Title"
            placeholderTextColor={colors.onSurfaceMuted}
            value={title} 
            onChangeText={setTitle} 
            style={[styles.input, { color: colors.onSurface, borderColor: colors.border }]} 
        />
        <TextInput 
            placeholder="Message content..."
            placeholderTextColor={colors.onSurfaceMuted}
            value={content} 
            onChangeText={setContent} 
            multiline 
            style={[styles.input, { height: 80, textAlignVertical: 'top', color: colors.onSurface, borderColor: colors.border }]} 
        />
        <Text style={styles.inputLabel}>Send To</Text>
        <View style={styles.roleContainer}>
          {[
            { key: 'all', label: 'Students & Parents' },
            { key: 'student', label: 'Students Only' },
            { key: 'parent', label: 'Parents Only' },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.roleBtn, targetRole === key && styles.roleBtnActive]}
              onPress={() => setTargetRole(key)}
            >
              <Text style={[styles.roleText, targetRole === key && styles.roleTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handlePost(false)} style={styles.postBtn}>
                <Text style={styles.btnText}>{editingId ? "Update Post" : "Post Now"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePost(true)} style={styles.draftBtn}>
                <Text style={styles.btnTextDraft}>{editingId ? "Save as Draft" : "Save Draft"}</Text>
            </TouchableOpacity>
        </View>
        {editingId && (
            <TouchableOpacity onPress={() => { setEditingId(null); setTitle(''); setContent(''); setTargetRole('all'); }} style={{marginTop: 10, alignItems: 'center'}}>
                <Text style={{color: 'red'}}>Cancel Editing</Text>
            </TouchableOpacity>
        )}
      </View>
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
        <FlatList 
            data={notifications}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            renderItem={({item}) => (
            <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <View style={{flex: 1}}>
                    <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{item.title}</Text>
                    <Text style={[styles.cardBody, { color: colors.onSurfaceMuted }]}>{item.content}</Text>
                    <View style={{flexDirection:'row', alignItems:'center', gap:8, marginTop:5}}>
                      <Text style={styles.targetBadge}>
                        {item.target_role === 'all' ? 'Students & Parents' : item.target_role === 'student' ? 'Students Only' : item.target_role === 'parent' ? 'Parents Only' : item.target_role ?? 'All'}
                      </Text>
                      <Text style={[styles.date, { color: colors.onSurfaceMuted }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                        <Icon name="pencil" size="md" color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                        <Icon name="trash" size="md" color="red" />
                    </TouchableOpacity>
                </View>
            </View>
            )}
            ListEmptyComponent={<Text style={{textAlign:'center', marginTop: tokens.spacing.lg, color: colors.onSurfaceMuted}}>No notifications found.</Text>}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: tokens.spacing.lg, textAlign: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#E1F5FE', borderRadius: 10, padding: 5, marginBottom: tokens.spacing.lg },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: tokens.radius.sm },
  activeTab: { backgroundColor: '#0288D1' },
  tabText: { color: '#0288D1', fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  inputBox: { backgroundColor: '#FFF9C4', padding: 15, borderRadius: 10, marginBottom: tokens.spacing.lg, elevation: 2 },
  inputLabel: { fontWeight: 'bold', color: '#FBC02D', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: tokens.radius.sm, padding: 10, marginBottom: 10, borderWidth: 1 },
  actionRow: { flexDirection: 'row', gap: 10 },
  postBtn: { flex: 1, backgroundColor: '#0288D1', padding: tokens.spacing.md, borderRadius: tokens.radius.sm, alignItems: 'center' },
  draftBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#0288D1', padding: tokens.spacing.md, borderRadius: tokens.radius.sm, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnTextDraft: { color: '#0288D1', fontWeight: 'bold' },
  card: { flexDirection: 'row', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, elevation: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  cardBody: { marginTop: 4 },
  date: { fontSize: 10 },
  cardActions: { justifyContent: 'space-around', paddingLeft: 10 },
  iconBtn: { padding: 5 },
  roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm, marginBottom: 10 },
  roleBtn: { paddingVertical: 6, paddingHorizontal: tokens.spacing.md, borderRadius: tokens.radius.lg, backgroundColor: '#eee' },
  roleBtnActive: { backgroundColor: '#0288D1' },
  roleText: { color: '#555', fontSize: 13 },
  roleTextActive: { color: '#fff', fontWeight: 'bold' },
  targetBadge: { fontSize: 10, color: '#0288D1', backgroundColor: '#E1F5FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
});