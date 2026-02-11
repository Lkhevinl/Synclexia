import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import EmptyState from '../../components/EmptyState';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    // Get Top 10 users by XP
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, xp, coins')
      .order('xp', { ascending: false })
      .limit(10);
    
    if (data) setLeaders(data);
    setLoading(false);
  };

  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  return (
    <ScreenWrapper style={{ backgroundColor: '#FFF9C4' }}>
      <GoBackBtn />
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Hall of Fame</Text>
        <Text style={styles.subtitle}>Top Students this Week</Text>
      </View>

      <FlatList
        data={leaders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<EmptyState message="No leaders yet. Be the first!" />}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index < 3 && styles.top3Card]}>
            <View style={styles.rankCol}>
              <Text style={styles.rankText}>{getMedal(index) || `#${index + 1}`}</Text>
            </View>
            
            <View style={styles.infoCol}>
              <Text style={styles.name}>{item.full_name || "Unknown"}</Text>
              <Text style={styles.xpText}>{item.xp} XP</Text>
            </View>

            <View style={styles.coinCol}>
                <Text>💰 {item.coins || 0}</Text>
            </View>
          </View>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F57F17' },
  subtitle: { color: '#666' },
  
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2 },
  top3Card: { borderWidth: 2, borderColor: '#FFD700', backgroundColor: '#FFFDE7' },
  
  rankCol: { width: 50, alignItems: 'center' },
  rankText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  infoCol: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  xpText: { fontSize: 12, color: '#1976D2', fontWeight: 'bold' },
  
  coinCol: { backgroundColor: '#f0f0f0', padding: 5, borderRadius: 5 }
});