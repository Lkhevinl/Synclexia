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

export default function ParentMessagesScreen({ route }) {
  const { profile } = useAuth();
  const { child } = route.params || {};
  const sid = child?.profiles?.id ?? child?.student_id;

  const [teacherId, setTeacherId] = useState(null);
  const [teacherName, setTeacherName] = useState('Teacher');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const subRef = useRef(null);
  const teacherIdRef = useRef(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    // Find the teacher linked to this child via enrollments
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('teacher_id')
      .eq('student_id', sid)
      .limit(1)
      .maybeSingle();

    if (enrollment?.teacher_id) {
      const tid = enrollment.teacher_id;
      setTeacherId(tid);
      teacherIdRef.current = tid;
      const { data: tp } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', tid)
        .maybeSingle();
      if (tp) setTeacherName(tp.full_name);
      await fetchMessages(tid);

      // Real-time: listen for new messages in this conversation
      subRef.current?.unsubscribe();
      subRef.current = supabase
        .channel(`parent-chat-${profile?.id}-${tid}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'parent_messages', filter: `receiver_id=eq.${profile?.id}` },
          () => { fetchMessages(tid); })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parent_messages', filter: `receiver_id=eq.${profile?.id}` },
          () => { fetchMessages(tid); })
        .subscribe();
    }
    setLoading(false);
  };

  useEffect(() => {
    return () => subRef.current?.unsubscribe();
  }, []);

  const fetchMessages = useCallback(async (tid) => {
    const tId = tid ?? teacherIdRef.current;
    if (!tId) return;
    const { data } = await supabase
      .from('parent_messages')
      .select('*')
      .or(`and(sender_id.eq.${profile?.id},receiver_id.eq.${tId}),and(sender_id.eq.${tId},receiver_id.eq.${profile?.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    // Mark unread messages as read
    await supabase
      .from('parent_messages')
      .update({ is_read: true })
      .eq('receiver_id', profile?.id)
      .eq('sender_id', tId)
      .eq('is_read', false);
  }, [profile?.id]);

  const sendMessage = async () => {
    if (!text.trim() || !teacherId) return;
    setSending(true);
    const { error } = await supabase.from('parent_messages').insert({
      sender_id: profile?.id,
      receiver_id: teacherId,
      parent_id: profile?.id,
      student_id: sid,
      message: text.trim(),
      is_read: false,
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setText('');
      await fetchMessages();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
    setSending(false);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => new Date(ts).toLocaleDateString();

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender_id === profile?.id;
    const prev = messages[index - 1];
    const showDate = !prev || formatDate(prev.created_at) !== formatDate(item.created_at);
    return (
      <>
        {showDate && (
          <View style={s.dateSep}>
            <Text style={s.dateText}>{formatDate(item.created_at)}</Text>
          </View>
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

  return (
    <SafeAreaView style={s.container}>
      <LinearGradient colors={['#7B1FA2','#4A148C']} style={s.header}>
        <View style={s.headerRow}>
          <GoBackBtn />
          <View style={s.headerInfo}>
            <View style={s.teacherAvatar}>
              <Text style={s.teacherAvatarText}>{teacherName[0]?.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={s.headerName}>{teacherName}</Text>
              <Text style={s.headerSub}>Class Teacher</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color="#7B1FA2" /></View>
      ) : !teacherId ? (
        <View style={s.centered}>
          <Ionicons name="school-outline" size={60} color="#ddd" />
          <Text style={s.emptyTitle}>No teacher found</Text>
          <Text style={s.emptyHint}>Your child needs to be enrolled in a class first.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                <Text style={s.emptyChatHint}>Start a conversation with {teacherName}</Text>
              </View>
            }
          />
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={text}
              onChangeText={setText}
              placeholder={`Message ${teacherName}...`}
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
                : <Ionicons name="send" size={20} color="#fff" />
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F0FF' },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  header:          { paddingTop: 10, paddingBottom: 16, paddingHorizontal: 16 },
  headerRow:       { flexDirection: 'row', alignItems: 'center' },
  headerInfo:      { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  teacherAvatar:   { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  teacherAvatarText:{ color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerName:      { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  headerSub:       { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  list:            { padding: 16, paddingBottom: 8 },
  dateSep:         { alignItems: 'center', marginVertical: 12 },
  dateText:        { fontSize: 11, color: '#999', backgroundColor: '#F0EAF8', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  bubble:          { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6 },
  bubbleMe:        { alignSelf: 'flex-end', backgroundColor: '#7B1FA2', borderBottomRightRadius: 4 },
  bubbleThem:      { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1 },
  bubbleText:      { fontSize: 14, lineHeight: 20 },
  bubbleTextMe:    { color: '#fff' },
  bubbleTextThem:  { color: '#333' },
  bubbleTime:      { fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 10 },
  input:           { flex: 1, backgroundColor: '#F5F0FF', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100, color: '#333' },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7B1FA2', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#CE93D8' },
  emptyChat:       { alignItems: 'center', paddingTop: 80 },
  emptyChatText:   { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 14 },
  emptyChatHint:   { fontSize: 13, color: '#999', marginTop: 6 },
  emptyTitle:      { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 16 },
  emptyHint:       { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },
});
