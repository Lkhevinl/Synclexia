import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function ParentLinkChildScreen({ navigation }) {
  const { profile } = useAuth();

  const [code, setCode] = useState('');
  const [found, setFound] = useState(null);   // student profile if code matched
  const [looking, setLooking] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');

  const lookupCode = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Code must be exactly 6 characters.');
      return;
    }
    setError('');
    setFound(null);
    setLooking(true);

    const { data: rows, error: dbErr } = await supabase
      .rpc('find_student_by_code', { lookup_code: trimmed });

    setLooking(false);

    if (dbErr) {
      console.warn('Parent link lookup error:', dbErr.message, dbErr.code);
      setError('Something went wrong while searching. Please try again.');
      return;
    }
    const data = rows?.[0] ?? null;
    if (!data) {
      setError('No student found with that code. Ask your child to check their code in the app.');
      return;
    }
    setFound(data);
  };

  const confirmLink = async () => {
    if (!found) return;
    setLinking(true);

    const { data: result, error: linkErr } = await supabase
      .rpc('link_child', { p_parent_id: profile?.id, p_student_id: found.id });

    setLinking(false);

    if (linkErr) {
      console.warn('Parent link RPC error:', linkErr.message, linkErr.code);
      Alert.alert('Error', linkErr.message || 'Could not link child. Please try again.');
      return;
    }
    if (result?.error === 'already_linked') {
      Alert.alert('Already Linked', `${found.full_name} is already linked to your account.`, [
        { text: 'Go to Dashboard', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    if (result?.error) {
      Alert.alert('Error', result.error);
      return;
    }
    if (result?.success) {
      Alert.alert(
        '🎉 Child Linked!',
        `${found.full_name} has been linked to your account. You can now monitor their progress.`,
        [{ text: 'Go to Dashboard', onPress: () => navigation.goBack() },
         { text: 'Link Another', onPress: () => { setCode(''); setFound(null); } }]
      );
    }
  };

  const level = found?.level ?? Math.floor((found?.xp || 0) / 100) + 1;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#7B1FA2', '#4A148C']} style={s.header}>
        <GoBackBtn />
        <Text style={s.headerTitle}>Link a Child</Text>
        <Text style={s.headerSub}>Enter the 6-character code from your child's app</Text>
      </LinearGradient>

      <View style={s.body}>

        {/* How it works */}
        <View style={s.infoCard}>
          <Ionicons name="information-circle" size={20} color="#7B1FA2" />
          <Text style={s.infoText}>
            Ask your child to open Synclexia and share their <Text style={s.infoBold}>Link Code</Text> shown on their dashboard.
          </Text>
        </View>

        {/* Code Input */}
        <Text style={s.label}>Child's Link Code</Text>
        <View style={[s.codeBox, error ? s.codeBoxError : null]}>
          <TextInput
            style={s.codeInput}
            value={code}
            onChangeText={(t) => { setCode(t.toUpperCase()); setError(''); setFound(null); }}
            placeholder="e.g. AB12CD"
            placeholderTextColor="#ccc"
            autoCapitalize="characters"
            maxLength={6}
            autoFocus
          />
          {code.length > 0 && (
            <TouchableOpacity onPress={() => { setCode(''); setFound(null); setError(''); }}>
              <Ionicons name="close-circle" size={22} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={s.errorText}>{error}</Text> : null}

        {/* Lookup Button */}
        <TouchableOpacity
          style={[s.lookupBtn, (looking || code.trim().length !== 6) && s.lookupBtnDisabled]}
          onPress={lookupCode}
          disabled={looking || code.trim().length !== 6}
        >
          {looking
            ? <ActivityIndicator color="#fff" />
            : <><Ionicons name="search" size={18} color="#fff" /><Text style={s.lookupBtnText}>Find Child</Text></>
          }
        </TouchableOpacity>

        {/* Found Student Card */}
        {found && (
          <View style={s.foundCard}>
            <View style={s.foundRow}>
              <View style={[s.avatar, { backgroundColor: avatarColor(found.full_name) }]}>
                <Text style={s.avatarText}>{found.full_name?.[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.foundName}>{found.full_name}</Text>
                <Text style={s.foundEmail}>{found.email || 'Student account'}</Text>
                <View style={s.levelRow}>
                  <Ionicons name="star" size={12} color="#FF9800" />
                  <Text style={s.levelText}>Level {level}</Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            </View>

            <TouchableOpacity
              style={[s.confirmBtn, linking && s.confirmBtnDisabled]}
              onPress={confirmLink}
              disabled={linking}
            >
              {linking
                ? <ActivityIndicator color="#fff" />
                : <><Ionicons name="link" size={18} color="#fff" /><Text style={s.confirmBtnText}>Link {found.full_name.split(' ')[0]}</Text></>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F5F0FF' },
  header:           { paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle:      { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 12 },
  headerSub:        { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  body:             { flex: 1, padding: 20 },

  infoCard:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EDE7F6', borderRadius: 14, padding: 14, marginBottom: 24 },
  infoText:         { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
  infoBold:         { fontWeight: 'bold', color: '#7B1FA2' },

  label:            { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  codeBox:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#E0D0F5', paddingHorizontal: 16, paddingVertical: 4, marginBottom: 6 },
  codeBoxError:     { borderColor: '#F44336' },
  codeInput:        { flex: 1, fontSize: 28, fontWeight: 'bold', color: '#7B1FA2', letterSpacing: 8, paddingVertical: 14, textAlign: 'center' },
  errorText:        { fontSize: 12, color: '#F44336', marginBottom: 12, marginLeft: 4 },

  lookupBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#7B1FA2', borderRadius: 16, paddingVertical: 16, marginTop: 8, elevation: 3 },
  lookupBtnDisabled:{ backgroundColor: '#CE93D8', elevation: 0 },
  lookupBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  foundCard:        { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginTop: 24, elevation: 4, borderWidth: 2, borderColor: '#4CAF50' },
  foundRow:         { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar:           { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText:       { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  foundName:        { fontSize: 17, fontWeight: 'bold', color: '#333' },
  foundEmail:       { fontSize: 12, color: '#999', marginTop: 2 },
  levelRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  levelText:        { fontSize: 12, color: '#FF9800', fontWeight: 'bold' },

  confirmBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 14, elevation: 2 },
  confirmBtnDisabled:{ backgroundColor: '#A5D6A7' },
  confirmBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
