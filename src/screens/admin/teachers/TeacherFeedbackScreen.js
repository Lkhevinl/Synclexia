import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import Icon from '../../../components/icons/Icon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import AppHeader from '../../../components/AppHeader';
import ScreenWrapper from '../../../components/ScreenWrapper';
import tokens from '../../../theme/tokens';
import { useTheme } from '../../../context/ThemeContext';

export default function TeacherFeedbackScreen() {
  const { profile } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => { fetchFeedback(); }, []);

  const fetchFeedback = async () => {
    // Only show feedback from enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('teacher_id', profile?.id);
    
    const studentIds = enrollments?.map(e => e.student_id) || [];
    
    if (studentIds.length === 0) {
      setFeedbacks([]);
      return;
    }
    
    const { data: rawFeedback } = await supabase
      .from('feedback')
      .select('*')
      .in('user_id', studentIds)
      .order('created_at', { ascending: false });
    if (rawFeedback && rawFeedback.length > 0) {
      // Fetch user profiles in batch
      const uids = [...new Set(rawFeedback.map(f => f.user_id))];
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').in('id', uids);
      const profMap = {};
      (profs || []).forEach(p => { profMap[p.id] = p; });
      setFeedbacks(rawFeedback.map(f => ({ ...f, profiles: profMap[f.user_id] || null })));
    } else {
      setFeedbacks([]);
    }
  };

  const sendReply = async (itemId) => {
    if (!replyText || selectedId !== itemId) return;
    const { error } = await supabase
      .from('feedback')
      .update({ reply: replyText, has_unread_reply: true })
      .eq('id', itemId);
    if (!error) {
      Alert.alert("Sent", "Reply sent to student.");
      setReplyText("");
      setSelectedId(null);
      fetchFeedback();
    }
  };

  const { colors } = useTheme();

  return (
    <ScreenWrapper role="teacher">
      <AppHeader
        title="Student Feedback"
        subtitle="Review & reply to student feedback"
        colors={['#E91E63', '#880E4F']}
      />
      <FlatList
        data={feedbacks}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: tokens.spacing.md }}
        renderItem={({item}) => (
          <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
             <View style={styles.row}>
                 <View style={styles.avatar}>
                    <Text style={{color:'#fff', fontWeight:'bold'}}>
                        {item.profiles?.full_name?.charAt(0) || "U"}
                    </Text>
                 </View>
                 <View style={{flex: 1, marginLeft: 10}}>
                     <Text style={[styles.name, { color: colors.onSurface }]}>{item.profiles?.full_name || "Unknown"}</Text>
                     <View style={{flexDirection:'row'}}>
                        {[...Array(item.rating || 5)].map((_,i)=><Icon key={i} name="star" size="sm" color="#FBC02D"/>)}
                     </View>
                 </View>
                 <Text style={[styles.date, { color: colors.onSurfaceMuted }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
             </View>
             <Text style={[styles.message, { color: colors.onSurface }]}>{item.message}</Text>
             {item.reply ? (
                 <View style={styles.adminReply}>
                     <Text style={styles.replyLabel}>You replied:</Text>
                     <Text style={styles.replyText}>{item.reply}</Text>
                 </View>
             ) : (
                 <View style={styles.replyBox}>
                     <TextInput 
                        placeholder="Write a reply..." 
                        placeholderTextColor={colors.onSurfaceMuted}
                        style={[styles.input, { color: colors.onSurface }]}
                        value={selectedId === item.id ? replyText : ""}
                        onChangeText={(t) => {
                            setSelectedId(item.id);
                            setReplyText(t);
                        }}
                     />
                     <TouchableOpacity onPress={() => {
                         if (!replyText || selectedId !== item.id) return;
                         supabase.from('feedback')
                           .update({ reply: replyText, has_unread_reply: true })
                           .eq('id', item.id)
                           .then(({ error }) => {
                             if (!error) {
                               Alert.alert('Sent', 'Reply sent to student.');
                               setReplyText('');
                               setSelectedId(null);
                               fetchFeedback();
                             }
                           });
                     }}>
                         <Icon name="send" size="lg" color={colors.primary} />
                     </TouchableOpacity>
                 </View>
             )}
          </View>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { padding: 15, borderBottomWidth: 1, marginBottom: 10, borderRadius: tokens.radius.md },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0288D1', justifyContent: 'center', alignItems: 'center' },
  name: { fontWeight: 'bold' },
  date: { fontSize: 12 },
  message: { fontSize: 16, marginBottom: 10 },
  adminReply: { backgroundColor: '#E1F5FE', padding: 10, borderRadius: tokens.radius.sm, marginTop: 5 },
  replyLabel: { fontSize: 10, fontWeight: 'bold', color: '#0277BD' },
  replyText: { color: '#01579B' },
  replyBox: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  input: { flex: 1, backgroundColor: '#f9f9f9', padding: tokens.spacing.sm, borderRadius: tokens.radius.lg, marginRight: 10 }
});