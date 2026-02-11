import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import GoBackBtn from '../components/GoBackBtn';
import ScreenWrapper from '../components/ScreenWrapper';

export default function QuestScreen() {
  const { profile, fetchProfile } = useAuth();
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
    
    await supabase.rpc('add_coins', { amount: quest.coin_reward });

    if (!error) {
      if (quest.progressId) {
        await supabase.from('user_quests').update({ is_claimed: true }).eq('id', quest.progressId);
      } else {
        await supabase.from('user_quests').insert([{ user_id: profile.id, quest_id: quest.id, progress: quest.target_count, is_claimed: true }]);
      }
      
      Alert.alert("QUEST COMPLETE!", `You earned ${quest.xp_reward} XP and ${quest.coin_reward} Coins!`);
      fetchProfile(profile.id);
      loadQuests();
    }
  };

  return (
    <ScreenWrapper style={{ backgroundColor: '#FFF3E0' }}>
      <GoBackBtn />
      <View style={styles.header}>
        <Text style={styles.title}>Quest Board 📜</Text>
        <View style={styles.coinBadge}>
           <Text style={styles.coinText}>💰 {profile?.coins || 0}</Text>
        </View>
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
              style={[styles.card, item.claimed && styles.cardClaimed]} 
              disabled={true} 
            >
              <View style={{flex: 1}}>
                 <Text style={[styles.questTitle, item.claimed && {textDecorationLine: 'line-through'}]}>{item.title}</Text>
                 
                 <View style={styles.rewards}>
                    <Text style={styles.rewardTag}>⚡ {item.xp_reward} XP</Text>
                    <Text style={styles.rewardTag}>💰 {item.coin_reward}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#E65100' },
  coinBadge: { backgroundColor: '#FFD700', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, borderWidth: 2, borderColor: '#FFA000' },
  coinText: { fontWeight: 'bold', color: '#333' },
  
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#FFE0B2' },
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