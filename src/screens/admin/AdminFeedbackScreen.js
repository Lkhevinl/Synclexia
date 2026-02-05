import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';

export default function AdminFeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => { fetchFeedback(); }, []);

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*, profiles(full_name, email)') // Join with profiles to get name
      .order('created_at', { ascending: false });
    if (data) setFeedbacks(data);
  };

  const sendReply = async () => {
    if (!replyText) return;
    const { error } = await supabase
      .from('feedback')
      .update({ reply: replyText })
      .eq('id', selectedId);
    
    if (!error) {
      Alert.alert("Sent", "Reply sent to user.");
      setReplyText("");
      setSelectedId(null);
      fetchFeedback();
    }
  };

  return (
    <View style={styles.container}>
      <GoBackBtn />
      <Text style={styles.headerTitle}>User Feedback</Text>

      <FlatList 
        data={feedbacks}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.card}>
             <View style={styles.row}>
                 <View style={styles.avatar}>
                    <Text style={{color:'#fff', fontWeight:'bold'}}>
                        {item.profiles?.full_name?.charAt(0) || "U"}
                    </Text>
                 </View>
                 <View style={{flex: 1, marginLeft: 10}}>
                     <Text style={styles.name}>{item.profiles?.full_name || "Unknown"}</Text>
                     <View style={{flexDirection:'row'}}>
                        {[...Array(item.rating || 5)].map((_,i)=><Ionicons key={i} name="star" size={12} color="#FBC02D"/>)}
                     </View>
                 </View>
                 <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
             </View>

             <Text style={styles.message}>{item.message}</Text>

             {/* REPLY SECTION */}
             {item.reply ? (
                 <View style={styles.adminReply}>
                     <Text style={styles.replyLabel}>You replied:</Text>
                     <Text style={styles.replyText}>{item.reply}</Text>
                 </View>
             ) : (
                 <View style={styles.replyBox}>
                     <TextInput 
                        placeholder="Write a reply..." 
                        style={styles.input}
                        value={selectedId === item.id ? replyText : ""}
                        onChangeText={(t) => {
                            setSelectedId(item.id);
                            setReplyText(t);
                        }}
                     />
                     <TouchableOpacity onPress={sendReply}>
                         <Ionicons name="send" size={24} color="#0288D1" />
                     </TouchableOpacity>
                 </View>
             )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0277BD', marginBottom: 20, textAlign: 'center' },
  card: { padding: 15, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0288D1', justifyContent: 'center', alignItems: 'center' },
  name: { fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#999' },
  message: { fontSize: 16, color: '#444', marginBottom: 10 },
  adminReply: { backgroundColor: '#E1F5FE', padding: 10, borderRadius: 8, marginTop: 5 },
  replyLabel: { fontSize: 10, fontWeight: 'bold', color: '#0277BD' },
  replyText: { color: '#01579B' },
  replyBox: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  input: { flex: 1, backgroundColor: '#f9f9f9', padding: 8, borderRadius: 20, marginRight: 10 }
});