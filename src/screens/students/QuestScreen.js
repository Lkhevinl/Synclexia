import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';

export default function QuestScreen() {
  const { profile, fetchProfile } = useAuth();
  const { colors } = useTheme();
  const [quests, setQuests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadQuests();
    }, [])
  );

  const loadQuests = async () => {
    setRefreshing(true);
    const { data: allQuests } = await supabase.from('quests').select('*').order('id');
    
    const { data: userProgress } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', profile.id);

    if (allQuests) {
        const merged = allQuests.map(q => {
        const progress = userProgress?.find(up => up.quest_id === q.id);
        return {
            ...q,
            current: progress?.progress || 0,
            claimed: progress?.is_claimed || false,
            progressId: progress?.id
        };
        });
        setQuests(merged);
    }
    setRefreshing(false);
  };

  const handleClaim = async (quest) => {
    if (quest.current < quest.target_count) return;

    const { error } = await supabase.rpc('add_xp', { amount: quest.xp_reward });

    if (!error) {
      if (quest.progressId) {
        await supabase.from('user_quests').update({ is_claimed: true }).eq('id', quest.progressId);
      } else {
        await supabase.from('user_quests').insert([{ user_id: profile.id, quest_id: quest.id, progress: quest.target_count, is_claimed: true }]);
      }
      
      Alert.alert("QUEST COMPLETE!", `You earned ${quest.xp_reward} XP!`);
      fetchProfile(profile.id);
      loadQuests();
    }
  };

  return (
    <ScreenWrapper role="student" style={{ backgroundColor: colors.surface }}>
      <GoBackBtn title="Quest Board" />

      <View style={styles.instructionHint}>
        <Ionicons name="information-circle" size={22} color="#E8927C" />
        <Text style={styles.instructionHintText}>
          <Text style={{ fontWeight: 'bold' }}>How to use: </Text>
          Complete activities (Reading, Phonics, Spelling, etc.) to fill up quest progress bars. When a quest is full, tap "CLAIM" to earn your XP reward!
        </Text>
      </View>

      <FlatList
        data={quests}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadQuests} />}
        renderItem={({ item }) => {
          const isComplete = item.current >= item.target_count;
          const progressPercent = (item.current / item.target_count) * 100;

          return (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: colors.surfaceCard }, item.claimed && styles.cardClaimed]}
              disabled={true} 
            >
              <View style={{flex: 1}}>
                 <Text style={[styles.questTitle, { color: colors.onSurface }, item.claimed && {textDecorationLine: 'line-through'}]}>{item.title}</Text>
                 
                 <View style={styles.rewards}>
                    <Text style={styles.rewardTag}>⚡ {item.xp_reward} XP</Text>
                 </View>

                 <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${progressPercent}%`, backgroundColor: isComplete ? '#4CAF50' : '#FF9800' }]} />
                 </View>
                 <Text style={styles.progressText}>{item.current} / {item.target_count}</Text>
              </View>

              {item.claimed ? (
                  <Ionicons name="checkmark-circle" size={40} color="#aaa" />
              ) : isComplete ? (
                  <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(item)}>
                      <Text style={styles.claimText}>CLAIM</Text>
                  </TouchableOpacity>
              ) : (
                  <View style={{alignItems:'center'}}>
                      <Ionicons name="lock-closed-outline" size={24} color="#ccc" />
                      <Text style={{fontSize:10, color:'#ccc', marginTop: 2}}>Locked</Text>
                  </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: 'bold', color: '#E8927C' },
  instructionHint: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF0E8', borderRadius: 14, padding: 12, marginBottom: 14, gap: 10, borderWidth: 1, borderColor: '#E8927C30' },
  instructionHintText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },

  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#E8927C' },
  cardClaimed: { opacity: 0.6, backgroundColor: '#eee', borderColor: '#ccc' },
  
  questTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  rewards: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  rewardTag: { fontSize: 12, fontWeight: 'bold', color: '#555', backgroundColor: '#f0f0f0', paddingHorizontal: 6, borderRadius: 5 },
  
  barBg: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%' },
  progressText: { fontSize: 10, color: '#888', marginTop: 3, textAlign: 'right' },
  
  claimBtn: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, elevation: 5 },
  claimText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});