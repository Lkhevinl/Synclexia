/**
 * TeacherMessagesScreen
 *
 * Shows a list of parent conversations.  Tapping one opens the thread.
 * Teachers can reply to parents of their enrolled students.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ──────────────────────────────────────────────────────────────────────────────
// Inbox view – list of parents who have messaged this teacher
// ──────────────────────────────────────────────────────────────────────────────
function InboxView({ profile, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchConversations(); }, []);

  const fetchConversations = async () => {
    setLoading(true);
    // Get all messages where this teacher is sender or receiver
    const { data: rows, error } = await supabase
      .from('parent_messages')
      .select('*')
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TeacherMessages] fetchConversations:', error.message);
      setLoading(false);
      return;
    }

    if (!rows || rows.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Group by the other participant (the parent)
    const seen = new Set();
    const grouped = [];
    for (const row of rows) {
      const otherId = row.sender_id === profile.id ? row.receiver_id : row.sender_id;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        grouped.push({ otherId, lastMsg: row });
      }
    }

    // Fetch parent profiles in batch
    const parentIds = grouped.map(g => g.otherId);
    const { data: parentProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('id', parentIds);

    const profileMap = {};
    (parentProfiles || []).forEach(p => { profileMap[p.id] = p; });

    // Count unread for each conversation
    const withProfiles = await Promise.all(grouped.map(async (g) => {
      const { count } = await supabase
        .from('parent_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', g.otherId)
        .eq('receiver_id', profile.id)
        .eq('is_read', false);

      // Fetch linked student name via parent_id on messages
      let studentName = null;
      if (g.lastMsg.student_id) {
        const { data: sp } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', g.lastMsg.student_id)
          .maybeSingle();
        studentName = sp?.full_name || null;
      }

      return {
        ...g,
        parentProfile: profileMap[g.otherId] || { id: g.otherId, full_name: 'Unknown Parent' },
        unreadCount: count || 0,
        studentName,
      };
    }));

    setConversations(withProfiles);
    setLoading(false);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  };

  if (loading) {
    return <View style={s.centered}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  if (conversations.length === 0) {
    return (
      <View style={s.centered}>
        <Ionicons name="chatbubbles-outline" size={64} color="#ddd" />
        <Text style={s.emptyTitle}>No messages yet</Text>
        <Text style={s.emptyHint}>Parents of your enrolled students can send you messages here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={item => item.otherId}
      contentContainerStyle={{ paddingVertical: 8 }}
      onRefresh={fetchConversations}
      refreshing={loading}
      renderItem={({ item }) => {
        const name = item.parentProfile?.full_name || 'Parent';
        const preview = item.lastMsg?.message || '';
        return (
          <TouchableOpacity style={s.convoRow} onPress={() => onSelectConversation(item)} activeOpacity={0.75}>
            <View style={[s.convoAvatar, { backgroundColor: avatarColor(name) }]}>
              <Text style={s.convoAvatarText}>{name[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.convoName}>{name}</Text>
              {item.studentName && (
                <Text style={s.convoStudent}>Re: {item.studentName}</Text>
              )}
              <Text style={s.convoPreview} numberOfLines={1}>{preview}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={s.convoTime}>{formatTime(item.lastMsg.created_at)}</Text>
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
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Chat view – messages in a single conversation
// ──────────────────────────────────────────────────────────────────────────────
function ChatView({ profile, conversation, onBack }) {
  const { parentProfile, studentName, lastMsg } = conversation;
  const otherId = parentProfile.id;

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
      parent_id:   otherId,             // parent is the other side
      student_id:  lastMsg.student_id,  // keep the student context
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
      {/* Header */}
      <LinearGradient colors={['#388E3C', '#1B5E20']} style={s.header}>
        <View style={s.headerRow}>
          {selectedConversation
            ? <View style={{ width: 36 }} />
            : <GoBackBtn tintColor="#fff" />}
          <Text style={s.headerTitle}>
            {selectedConversation ? 'Conversation' : 'Parent Messages'}
          </Text>
          <View style={{ width: 36 }} />
        </View>
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
  container:       { flex: 1, backgroundColor: '#F1F8E9' },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },

  header:          { paddingTop: 10, paddingBottom: 16, paddingHorizontal: 16 },
  headerRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle:     { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },

  emptyTitle:      { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 16, textAlign: 'center' },
  emptyHint:       { fontSize: 13, color: '#999', marginTop: 8, textAlign: 'center', lineHeight: 20 },

  // Inbox
  convoRow:        { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F0F0F0' },
  convoAvatar:     { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  convoAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  convoName:       { fontWeight: 'bold', color: '#222', fontSize: 15 },
  convoStudent:    { fontSize: 11, color: '#4CAF50', marginBottom: 2 },
  convoPreview:    { fontSize: 13, color: '#888' },
  convoTime:       { fontSize: 11, color: '#bbb' },
  unreadBadge:     { backgroundColor: '#4CAF50', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Chat sub-header
  chatHeader:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#388E3C', padding: 12, gap: 10 },
  backArrow:       { padding: 4 },
  chatAvatar:      { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  chatAvatarText:  { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chatName:        { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chatSub:         { color: 'rgba(255,255,255,0.75)', fontSize: 11 },

  // Messages
  list:            { padding: 16, paddingBottom: 8 },
  dateSep:         { alignItems: 'center', marginVertical: 12 },
  dateText:        { fontSize: 11, color: '#999', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  bubble:          { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6 },
  bubbleMe:        { alignSelf: 'flex-end', backgroundColor: '#388E3C' },
  bubbleThem:      { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0' },
  bubbleText:      { fontSize: 15, lineHeight: 21 },
  bubbleTextMe:    { color: '#fff' },
  bubbleTextThem:  { color: '#222' },
  bubbleTime:      { fontSize: 10, marginTop: 4, textAlign: 'right' },

  emptyChat:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyChatText:   { fontSize: 16, fontWeight: 'bold', color: '#555', marginTop: 12 },
  emptyChatHint:   { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center' },

  // Input
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E8F5E9', gap: 8 },
  input:           { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#333' },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: '#388E3C', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#A5D6A7' },
});
