import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import GoBackBtn from '../components/GoBackBtn';
import { Ionicons } from '@expo/vector-icons';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    // Get top 10 users by XP
    const { data } = await supabase
      .from('profiles')
      .select('full_name, xp, id')
      .order('xp', { ascending: false })
      .limit(10);
    
    if (data) setLeaders(data);
    setLoading(false);
  };

  const renderRank = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <View style={styles.container}>
      <GoBackBtn />
      <View style={styles.header}>
          <Text style={styles.title}>Top Learners 🏆</Text>
          <Text style={styles.subTitle}>Who has the most XP?</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color="#FBC02D" /> : (
        <FlatList
          data={leaders}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 20}}
          renderItem={({ item, index }) => (
            <View style={[styles.card, index < 3 && styles.top3]}>
                <Text style={styles.rank}>{renderRank(index)}</Text>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.full_name?.charAt(0) || "U"}</Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.full_name || "Unknown Student"}</Text>
                    <View style={styles.xpBadge}>
                        <Text style={styles.xpText}>{item.xp} XP</Text>
                    </View>
                </View>
                {index === 0 && <Ionicons name="trophy" size={24} color="#FFD700" />}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7', padding: 20, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FBC02D' },
  subTitle: { color: '#888' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2 },
  top3: { borderWidth: 2, borderColor: '#FBC02D', backgroundColor: '#FFF9C4' },
  rank: { fontSize: 20, fontWeight: 'bold', width: 40, textAlign: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontWeight: 'bold', color: '#555' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  xpBadge: { backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 8, borderRadius: 5, marginTop: 2 },
  xpText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' }
});