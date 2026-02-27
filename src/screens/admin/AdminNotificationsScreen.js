import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';

export default function AdminNotificationsScreen() {
  const [activeTab, setActiveTab] = useState('Posted'); // 'Posted' | 'Drafts'
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all'); // 'all' | 'student' | 'teacher' | 'parent'
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    const isDraft = activeTab === 'Drafts';
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_draft', isDraft)
      .order('created_at', { ascending: false });
      
    if (data) setNotifications(data);
    if (error) Alert.alert("Error", error.message);
    setLoading(false);
  };

  const handlePost = async (asDraft = false) => {
    if (!title || !content) return Alert.alert("Error", "Please fill all fields");

    try {
      if (editingId) {
        const { error } = await supabase
          .from('notifications')
          .update({ title, content, is_draft: asDraft, target_role: targetRole })
          .eq('id', editingId);

        if (error) throw error;
        Alert.alert("Success", "Notification updated!");
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('notifications')
          .insert([{ title, content, is_draft: asDraft, target_role: targetRole }]);

        if (error) throw error;
        Alert.alert("Success", asDraft ? "Saved to Drafts" : "Posted!");
      }

      setTitle('');
      setContent('');
      setTargetRole('all');
      fetchNotifications();

    } catch (error) {
      Alert.alert("Error", error.message);
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
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
          await supabase.from('notifications').delete().eq('id', id);
          setTitle('');
          setContent('');
          setTargetRole('all');
          setEditingId(null);
          fetchNotifications();
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <GoBackBtn />
      <Text style={styles.headerTitle}>Notification Manager</Text>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => { setActiveTab('Posted'); setEditingId(null); setTitle(''); setContent(''); }} style={[styles.tab, activeTab === 'Posted' && styles.activeTab]}>
           <Text style={[styles.tabText, activeTab === 'Posted' && styles.activeTabText]}>Posted</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setActiveTab('Drafts'); setEditingId(null); setTitle(''); setContent(''); }} style={[styles.tab, activeTab === 'Drafts' && styles.activeTab]}>
           <Text style={[styles.tabText, activeTab === 'Drafts' && styles.activeTabText]}>Drafts</Text>
        </TouchableOpacity>
      </View>

      {/* INPUT AREA */}
      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>{editingId ? "Editing Post..." : "New Announcement"}</Text>
        <TextInput 
            placeholder="Enter Title" 
            value={title} 
            onChangeText={setTitle} 
            style={styles.input} 
        />
        <TextInput 
            placeholder="Message content..." 
            value={content} 
            onChangeText={setContent} 
            multiline 
            style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
        />
        
        <Text style={styles.inputLabel}>Target Audience</Text>
        <View style={styles.roleContainer}>
          {[
            { key: 'all', label: 'All Users' },
            { key: 'student', label: 'Students' },
            { key: 'teacher', label: 'Teachers' },
            { key: 'parent', label: 'Parents' }
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

      {/* LIST */}
      {loading ? <ActivityIndicator size="large" color="#0288D1" /> : (
        <FlatList 
            data={notifications}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
            <View style={styles.card}>
                <View style={{flex: 1}}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardBody}>{item.content}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.targetBadge}>{item.target_role === 'all' ? 'All Users' : item.target_role}</Text>
                      <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
                
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                        <Ionicons name="pencil" size={22} color="#0288D1" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={22} color="red" />
                    </TouchableOpacity>
                </View>
            </View>
            )}
            ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20, color:'#888'}}>No notifications found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0277BD', marginBottom: 20, textAlign: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#E1F5FE', borderRadius: 10, padding: 5, marginBottom: 20 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#0288D1' },
  tabText: { color: '#0288D1', fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  
  inputBox: { backgroundColor: '#FFF9C4', padding: 15, borderRadius: 10, marginBottom: 20, elevation: 2 },
  inputLabel: { fontWeight: 'bold', color: '#FBC02D', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  
  actionRow: { flexDirection: 'row', gap: 10 },
  postBtn: { flex: 1, backgroundColor: '#0288D1', padding: 12, borderRadius: 8, alignItems: 'center' },
  draftBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#0288D1', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnTextDraft: { color: '#0288D1', fontWeight: 'bold' },
  
  card: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee', elevation: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  cardBody: { color: '#555', marginTop: 4 },
  date: { fontSize: 10, color: '#999', marginTop: 5 },
  cardActions: { justifyContent: 'space-around', paddingLeft: 10 },
  iconBtn: { padding: 5 },
  
  roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  roleBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#eee' },
  roleBtnActive: { backgroundColor: '#0288D1' },
  roleText: { color: '#666', fontSize: 12 },
  roleTextActive: { color: '#fff', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  targetBadge: { backgroundColor: '#E1F5FE', color: '#0277BD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 10, fontWeight: 'bold' },
});