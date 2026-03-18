import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, SectionList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoBackBtn from '../../../components/GoBackBtn';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800','#F44336','#FF5722'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const showAlert = (title, msg) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n${msg}`); }
  else { Alert.alert(title, msg); }
};

// ──────────────────────────────────────────────────────────────────────────────
// Inbox view – Messages tab + Students tab with parent drill-down
// ──────────────────────────────────────────────────────────────────────────────
function InboxView({ profile, onSelectConversation }) {
  const [conversations,    setConversations]    = useState([]);
  const [allLinkedParents, setAllLinkedParents] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [activeTab,        setActiveTab]        = useState('messages');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);

    // ── 1. Enrolled student IDs ─────────────────────────────────────────────
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('teacher_id', profile.id);
    const enrolledIds = (enrollments || []).map(e => e.student_id);

    // ── 2. Enrolled student profiles (names only, for display) ───────────────
    let studentProfiles = [];
    if (enrolledIds.length > 0) {
      const { data: sp } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', enrolledIds);
      studentProfiles = sp || [];
    }
    const studentNameMap = {};
    studentProfiles.forEach(s => { studentNameMap[s.id] = s.full_name; });

    // ── 3. Parent links for enrolled students ───────────────────────────────
    let linkedParents = [];
    if (enrolledIds.length > 0) {
      const { data: links } = await supabase
        .from('parent_links')
        .select('parent_id, student_id')
        .in('student_id', enrolledIds);
      linkedParents = links || [];
    }

    // ── 4. Fetch all linked parent profiles ─────────────────────────────────
    const allLinkedParentIds = [...new Set(linkedParents.map(l => l.parent_id))];
    const parentProfileMap = {};
    if (allLinkedParentIds.length > 0) {
      const { data: pp } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', allLinkedParentIds);
      (pp || []).forEach(p => { parentProfileMap[p.id] = p; });
    }

    // ── 5. Build flat all-linked-parents list (for Parents tab) ─────────────
    const flatLinkedParents = linkedParents.map(link => ({
      key:           `${link.parent_id}-${link.student_id}`,
      parentProfile: parentProfileMap[link.parent_id] || { id: link.parent_id, full_name: 'Unknown Parent' },
      studentId:     link.student_id,
      studentName:   studentNameMap[link.student_id] || null,
    }));
    // deduplicate by parent_id, keep first occurrence
    const seen = new Set();
    const dedupedLinked = flatLinkedParents.filter(p => {
      if (seen.has(p.parentProfile.id)) return false;
      seen.add(p.parentProfile.id);
      return true;
    });
    setAllLinkedParents(dedupedLinked);

    // ── 6. Existing conversations ────────────────────────────────────────────
    const { data: rows, error } = await supabase
      .from('parent_messages')
      .select('*')
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });
    if (error) console.error('[TeacherMessages] fetchAll:', error.message);

    const convMap = new Map();
    for (const row of (rows || [])) {
      const otherId = row.sender_id === profile.id ? row.receiver_id : row.sender_id;
      if (!convMap.has(otherId)) convMap.set(otherId, row);
    }

    // ── 7. Fetch extra profiles (parents who messaged but aren't in parent_links)
    const extraIds = [...convMap.keys()].filter(id => !parentProfileMap[id]);
    if (extraIds.length > 0) {
      const { data: extra } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', extraIds);
      (extra || []).forEach(p => { parentProfileMap[p.id] = p; });
    }

    // ── 8. Build conversation list (union: linked parents + msg history) ────
    const allParentIds = new Set([
      ...linkedParents.map(l => l.parent_id),
      ...convMap.keys(),
    ]);

    if (allParentIds.size === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const withProfiles = await Promise.all([...allParentIds].map(async (parentId) => {
      const lastMsg  = convMap.get(parentId) || null;
      const link     = linkedParents.find(l => l.parent_id === parentId);
      const studentId   = link?.student_id || lastMsg?.student_id || null;
      const studentName = studentId ? (studentNameMap[studentId] || null) : null;
      let unreadCount = 0;
      if (lastMsg) {
        const { count } = await supabase
          .from('parent_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', parentId)
          .eq('receiver_id', profile.id)
          .eq('is_read', false);
        unreadCount = count || 0;
      }
      return {
        otherId: parentId,
        lastMsg,
        parentProfile: parentProfileMap[parentId] || { id: parentId, full_name: 'Unknown Parent' },
        unreadCount,
        studentName,
        studentId,
        hasConversation: lastMsg !== null,
      };
    }));

    withProfiles.sort((a, b) => {
      if (a.hasConversation && !b.hasConversation) return -1;
      if (!a.hasConversation && b.hasConversation) return 1;
      if (a.lastMsg && b.lastMsg) return new Date(b.lastMsg.created_at) - new Date(a.lastMsg.created_at);
      return (a.parentProfile.full_name || '').localeCompare(b.parentProfile.full_name || '');
    });
    setConversations(withProfiles);
    setLoading(false);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const diff = Date.now() - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  };

  const TabBar = () => {
    const unreadCount = conversations.filter(c => c.unreadCount > 0).length;
    return (
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'messages' && s.tabBtnActive]}
          onPress={() => setActiveTab('messages')}
        >
          <Ionicons name="chatbubbles" size={16} color={activeTab === 'messages' ? '#2E7D32' : '#999'} />
          <Text style={activeTab === 'messages' ? s.tabTxtActive : s.tabTxt}>Messages</Text>
          {unreadCount > 0 && (
            <View style={s.tabBadge}><Text style={s.tabBadgeText}>{unreadCount}</Text></View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'parents' && s.tabBtnActive]}
          onPress={() => setActiveTab('parents')}
        >
          <Ionicons name="people" size={16} color={activeTab === 'parents' ? '#2E7D32' : '#999'} />
          <Text style={activeTab === 'parents' ? s.tabTxtActive : s.tabTxt}>Parents</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <View style={s.centered}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  // ── Parents tab: flat list of all linked parents ─────────────────────────
  if (activeTab === 'parents') {
    return (
      <View style={{ flex: 1 }}>
        <TabBar />
        {allLinkedParents.length === 0 ? (
          <View style={s.centered}>
            <Ionicons name="people-outline" size={64} color="#ddd" />
            <Text style={s.emptyTitle}>No parents linked yet</Text>
            <Text style={s.emptyHint}>Once parents link their children to your class, they will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={allLinkedParents}
            keyExtractor={item => item.key}
            contentContainerStyle={{ paddingVertical: 8 }}
            onRefresh={fetchAll}
            refreshing={loading}
            renderItem={({ item }) => {
              const name = item.parentProfile.full_name || 'Parent';
              const conv = conversations.find(c => c.otherId === item.parentProfile.id);
              return (
                <TouchableOpacity
                  style={s.convoRow}
                  onPress={() => onSelectConversation({
                    otherId:         item.parentProfile.id,
                    lastMsg:         conv?.lastMsg || null,
                    parentProfile:   item.parentProfile,
                    unreadCount:     conv?.unreadCount || 0,
                    studentName:     item.studentName,
                    studentId:       item.studentId,
                    hasConversation: !!(conv?.hasConversation),
                  })}
                  activeOpacity={0.75}
                >
                  <View style={[s.convoAvatar, { backgroundColor: avatarColor(name) }]}>
                    <Text style={s.convoAvatarText}>{name[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.convoName}>{name}</Text>
                    {item.studentName && <Text style={s.convoStudent}>Parent of {item.studentName}</Text>}
                    {conv?.hasConversation
                      ? <Text style={s.convoPreview} numberOfLines={1}>{conv.lastMsg?.message}</Text>
                      : <Text style={s.convoNew}>Tap to start a conversation</Text>}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    {conv?.lastMsg && <Text style={s.convoTime}>{formatTime(conv.lastMsg.created_at)}</Text>}
                    {(conv?.unreadCount || 0) > 0 && (
                      <View style={s.unreadBadge}>
                        <Text style={s.unreadBadgeText}>{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  }

  // ── Messages tab ──────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <TabBar />
      {conversations.length === 0 ? (
        <View style={s.centered}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ddd" />
          <Text style={s.emptyTitle}>No messages yet</Text>
          <Text style={s.emptyHint}>Switch to the Parents tab to see all parents linked to your enrolled students and start a conversation.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.otherId}
          contentContainerStyle={{ paddingVertical: 8 }}
          onRefresh={fetchAll}
          refreshing={loading}
          renderItem={({ item }) => {
            const name    = item.parentProfile?.full_name || 'Parent';
            const preview = item.lastMsg?.message || '';
            return (
              <TouchableOpacity style={s.convoRow} onPress={() => onSelectConversation(item)} activeOpacity={0.75}>
                <View style={[s.convoAvatar, { backgroundColor: avatarColor(name) }]}>
                  <Text style={s.convoAvatarText}>{name[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.convoName}>{name}</Text>
                  {item.studentName && <Text style={s.convoStudent}>Re: {item.studentName}</Text>}
                  {item.hasConversation
                    ? <Text style={s.convoPreview} numberOfLines={1}>{preview}</Text>
                    : <Text style={s.convoNew}>Tap to start a conversation</Text>}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {item.lastMsg && <Text style={s.convoTime}>{formatTime(item.lastMsg.created_at)}</Text>}
                  {item.unreadCount > 0 && (
                    <View style={s.unreadBadge}>
                      <Text style={s.unreadBadgeText}>{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Chat view – messages in a single conversation
// ──────────────────────────────────────────────────────────────────────────────
function ChatView({ profile, conversation, onBack }) {
  const { parentProfile, studentName, lastMsg } = conversation;
  const otherId = parentProfile.id;
  const studentId = conversation.studentId || lastMsg?.student_id || null;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    subRef.current = supabase
      .channel(`teacher-chat-${profile.id}-${otherId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'parent_messages',
        filter: `receiver_id=eq.${profile.id}` }, fetchMessages)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parent_messages',
        filter: `receiver_id=eq.${profile.id}` }, fetchMessages)
      .subscribe();

    return () => subRef.current?.unsubscribe();
  }, []);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('parent_messages')
      .select('*')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoading(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    // Mark incoming as read
    await supabase
      .from('parent_messages')
      .update({ is_read: true })
      .eq('sender_id', otherId)
      .eq('receiver_id', profile.id)
      .eq('is_read', false);
  }, [profile.id, otherId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    const { error } = await supabase.from('parent_messages').insert({
      sender_id:   profile.id,
      receiver_id: otherId,
      parent_id:   otherId,
      student_id:  studentId,
      message:     text.trim(),
      is_read:     false,
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setText('');
      await fetchMessages();
    }
    setSending(false);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts) => new Date(ts).toLocaleDateString();

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender_id === profile.id;
    const prev = messages[index - 1];
    const showDate = !prev || formatDate(prev.created_at) !== formatDate(item.created_at);
    return (
      <>
        {showDate && (
          <View style={s.dateSep}><Text style={s.dateText}>{formatDate(item.created_at)}</Text></View>
        )}
        <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
          <Text style={[s.bubbleText, isMe ? s.bubbleTextMe : s.bubbleTextThem]}>{item.message}</Text>
          <Text style={[s.bubbleTime, isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: '#bbb' }]}>
            {formatTime(item.created_at)}
            {isMe && <Text> {item.is_read ? ' ✓✓' : ' ✓'}</Text>}
          </Text>
        </View>
      </>
    );
  };

  const parentName = parentProfile?.full_name || 'Parent';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Chat sub-header */}
      <View style={s.chatHeader}>
        <TouchableOpacity style={s.backArrow} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={[s.chatAvatar, { backgroundColor: avatarColor(parentName) }]}>
          <Text style={s.chatAvatarText}>{parentName[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.chatName}>{parentName}</Text>
          {studentName && <Text style={s.chatSub}>Re: {studentName}</Text>}
        </View>
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color="#4CAF50" /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={s.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={s.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={60} color="#ddd" />
              <Text style={s.emptyChatText}>No messages yet</Text>
              <Text style={s.emptyChatHint}>Send the first reply to {parentName}</Text>
            </View>
          }
        />
      )}

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder={`Reply to ${parentName}...`}
          placeholderTextColor="#bbb"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!text.trim() || sending) && s.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="send" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────────────────────────
export default function TeacherMessagesScreen() {
  const { profile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <LinearGradient colors={['#2E7D32', '#1B5E20']} style={s.header}>
        <View style={s.headerRow}>
          {selectedConversation
            ? <TouchableOpacity onPress={() => setSelectedConversation(null)} style={s.headerBack}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
            : <GoBackBtn tintColor="#fff" />}
          <Text style={s.headerTitle}>
            {selectedConversation
              ? (selectedConversation.parentProfile?.full_name || 'Chat')
              : 'Parent Messages'}
          </Text>
          <View style={{ width: 36 }} />
        </View>
        {!selectedConversation && (
          <Text style={s.headerSub}>Message parents of your enrolled students</Text>
        )}
      </LinearGradient>

      {selectedConversation ? (
        <ChatView
          profile={profile}
          conversation={selectedConversation}
          onBack={() => setSelectedConversation(null)}
        />
      ) : (
        <InboxView
          profile={profile}
          onSelectConversation={setSelectedConversation}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#F9FBF9' },
  centered:            { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  // Header
  header:              { paddingTop: 8, paddingBottom: 14, paddingHorizontal: 16 },
  headerRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBack:          { width: 36, alignItems: 'flex-start' },
  headerTitle:         { fontSize: 17, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  headerSub:           { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 3 },

  // Empty
  emptyTitle:          { fontSize: 17, fontWeight: '600', color: '#555', marginTop: 14, textAlign: 'center' },
  emptyHint:           { fontSize: 13, color: '#aaa', marginTop: 8, textAlign: 'center', lineHeight: 20 },

  // Search
  searchBar:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E8F5E9', elevation: 1 },
  searchInput:         { flex: 1, fontSize: 14, color: '#333', padding: 0 },

  // Section
  sectionHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F9FBF9' },
  sectionTitle:        { fontSize: 11, fontWeight: '700', color: '#4CAF50', textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionCount:        { fontSize: 11, color: '#aaa', backgroundColor: '#E8F5E9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },

  // Conversation rows
  convoRow:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F0F4F0', gap: 12 },
  convoAvatar:         { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  convoAvatarText:     { color: '#fff', fontWeight: 'bold', fontSize: 19 },
  avatarBadge:         { position: 'absolute', top: -2, right: -2, backgroundColor: '#E53935', borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#fff' },
  avatarBadgeText:     { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  convoName:           { fontWeight: '600', color: '#1a1a1a', fontSize: 15, flex: 1, marginRight: 8 },
  convoTime:           { fontSize: 11, color: '#aaa', flexShrink: 0 },
  studentTag:          { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2, marginBottom: 1 },
  studentTagText:      { fontSize: 11, color: '#4CAF50', fontWeight: '500' },
  convoPreview:        { fontSize: 13, color: '#999' },
  convoPreviewUnread:  { color: '#333', fontWeight: '600' },
  newConvoTag:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  newConvoText:        { fontSize: 12, color: '#4CAF50', fontStyle: 'italic' },

  // Tab bar (Messages | Students)
  tabBar:              { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E8F5E9' },
  tabBtn:              { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  tabBtnActive:        { borderBottomWidth: 2, borderBottomColor: '#2E7D32' },
  tabTxt:              { fontSize: 13, fontWeight: '600', color: '#999' },
  tabTxtActive:        { fontSize: 13, fontWeight: '700', color: '#2E7D32' },
  tabBadge:            { backgroundColor: '#E53935', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  tabBadgeText:        { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  // Breadcrumb (student drill-down header)
  breadcrumb:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#E8F5E9', gap: 8, borderBottomWidth: 1, borderColor: '#C8E6C9' },
  breadcrumbText:      { fontSize: 14, fontWeight: '700', color: '#2E7D32' },
  // Row sub-text aliases
  convoStudent:        { fontSize: 11, color: '#4CAF50', fontWeight: '500', marginTop: 1 },
  convoNew:            { fontSize: 12, color: '#4CAF50', fontStyle: 'italic', marginTop: 2 },
  unreadBadge:         { backgroundColor: '#E53935', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadBadgeText:     { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Chat sub-header
  chatHeader:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  backArrow:           { padding: 4 },
  chatAvatar:          { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  chatAvatarText:      { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  chatName:            { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  chatSub:             { color: 'rgba(255,255,255,0.72)', fontSize: 11, marginTop: 1 },

  // Messages
  list:                { padding: 16, paddingBottom: 12 },
  dateSep:             { alignItems: 'center', marginVertical: 16 },
  dateText:            { fontSize: 11, color: '#888', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  bubbleWrapper:       { flexDirection: 'row', marginBottom: 3 },
  bubbleWrapperMe:     { justifyContent: 'flex-end' },
  bubbleWrapperThem:   { justifyContent: 'flex-start' },
  bubble:              { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMe:            { backgroundColor: '#2E7D32' },
  bubbleThem:          { backgroundColor: '#fff', elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  bubbleText:          { fontSize: 15, lineHeight: 21 },
  bubbleTextMe:        { color: '#fff' },
  bubbleTextThem:      { color: '#1a1a1a' },
  bubbleMeta:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3 },
  bubbleTime:          { fontSize: 10 },

  emptyChat:           { alignItems: 'center', paddingTop: 70 },
  emptyChatText:       { fontSize: 17, fontWeight: 'bold', color: '#444', marginBottom: 4 },
  emptyChatSub:        { fontSize: 13, color: '#4CAF50', marginBottom: 6 },
  emptyChatHint:       { fontSize: 13, color: '#aaa' },

  // Input
  inputRow:            { flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E8F5E9', gap: 8 },
  input:               { flex: 1, backgroundColor: '#F4F8F4', borderRadius: 22, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 15, maxHeight: 120, color: '#222', borderWidth: 1, borderColor: '#E0ECE0' },
  sendBtn:             { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled:     { backgroundColor: '#A5D6A7' },
});
