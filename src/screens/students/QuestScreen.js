import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import StudentCard from '../../components/student/StudentCard';
import StudentButton from '../../components/student/StudentButton';
import StudentIconBadge from '../../components/student/StudentIconBadge';
import StudentProgressBar from '../../components/student/StudentProgressBar';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import c from '../../components/student/candyTokens';

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
      <StudentPageHeader title="Quest Board" />

      <StudentCard variant="tinted" style={styles.hintCard}>
        <View style={styles.hintRow}>
          <Ionicons name="information-circle" size={22} color={c.primary} />
          <Text style={styles.hintText}>
            <Text style={{ fontWeight: 'bold' }}>How to use: </Text>
            Complete activities to fill progress bars. When full, tap <Text style={{ fontWeight: 'bold' }}>Claim</Text> to earn XP!
          </Text>
        </View>
      </StudentCard>

      <FlatList
        data={quests}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadQuests} tintColor={c.primary} />}
        renderItem={({ item }) => {
          const isComplete = item.current >= item.target_count;
          const progressPercent = Math.min(100, (item.current / item.target_count) * 100);

          return (
            <StudentCard
              variant={item.claimed ? 'muted' : 'default'}
              style={styles.questCard}
            >
              <View style={styles.questRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.questTitle, item.claimed && styles.questTitleClaimed]}>
                    {item.title}
                  </Text>
                  <StudentIconBadge icon="flash" label={`${item.xp_reward} XP`} variant="score" />
                  <View style={styles.barWrap}>
                    <StudentProgressBar progress={progressPercent} height={12} showLabel={false} />
                    <Text style={styles.progressText}>{item.current} / {item.target_count}</Text>
                  </View>
                </View>

                <View style={styles.actionCol}>
                  {item.claimed ? (
                    <Ionicons name="checkmark-circle" size={38} color="#ccc" />
                  ) : isComplete ? (
                    <StudentButton variant="success" onPress={() => handleClaim(item)}>
                      <Text style={styles.claimText}>Claim</Text>
                    </StudentButton>
                  ) : (
                    <View style={styles.lockedWrap}>
                      <Ionicons name="lock-closed-outline" size={24} color="#ccc" />
                      <Text style={styles.lockedText}>Locked</Text>
                    </View>
                  )}
                </View>
              </View>
            </StudentCard>
          );
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hintCard: { marginBottom: 14 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  hintText: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 19 },

  list: { paddingBottom: 100 },

  questCard: { marginBottom: 14 },
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  questTitle: { fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 6 },
  questTitleClaimed: { textDecorationLine: 'line-through', color: '#aaa' },

  barWrap: { marginTop: 10 },
  progressText: { fontSize: 10, color: c.textMuted, marginTop: 4, textAlign: 'right' },

  actionCol: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  claimText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  lockedWrap: { alignItems: 'center' },
  lockedText: { fontSize: 10, color: '#ccc', marginTop: 2 },
});