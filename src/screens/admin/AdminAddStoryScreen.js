import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import ScreenWrapper from '../../components/ScreenWrapper'; // <--- The new fix

export default function AdminAddStoryScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !content) return Alert.alert("Error", "Missing fields");
    
    setLoading(true);
    const { error } = await supabase
      .from('stories')
      .insert([{ title, content, level: parseInt(level) }]);

    setLoading(false);

    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Success", "Story added to library!");
      setTitle(''); setContent('');
    }
  };

  return (
    <ScreenWrapper style={{ paddingTop: 20 }}>
      <GoBackBtn />
      <Text style={styles.header}>Add New Story 📖</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
        <CustomInput label="Story Title" value={title} onChangeText={setTitle} placeholder="e.g. The Big Bear" />
        
        <Text style={styles.label}>Reading Level (1-5)</Text>
        <View style={styles.levelRow}>
            {[1,2,3,4,5].map(L => (
                <TouchableOpacity 
                    key={L} 
                    style={[styles.levelBtn, level == L && styles.activeLevel]} 
                    onPress={() => setLevel(L.toString())}>
                    <Text style={[styles.levelText, level == L && {color: '#fff'}]}>{L}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <CustomInput label="Story Content" value={content} onChangeText={setContent} multiline placeholder="Type the story here..." />

        <CustomButton title="Publish Story" onPress={handleSave} loading={loading} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#0277BD' },
  form: { paddingBottom: 40 },
  label: { color: '#666', marginBottom: 10, fontWeight: 'bold', marginLeft: 10 },
  levelRow: { flexDirection: 'row', gap: 15, marginBottom: 20, justifyContent: 'center' },
  levelBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  activeLevel: { backgroundColor: '#0288D1' },
  levelText: { fontWeight: 'bold', color: '#333' }
});