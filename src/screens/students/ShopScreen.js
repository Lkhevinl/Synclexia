import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function ShopScreen() {
  const { profile, fetchProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    // 1. Get All Items
    const { data: shopData } = await supabase.from('shop_items').select('*').order('cost');
    if (shopData) setItems(shopData);

    // 2. Get What User Owns
    const { data: invData } = await supabase.from('user_inventory').select('item_id').eq('user_id', profile.id);
    if (invData) setInventory(invData.map(i => i.item_id));
    
    setLoading(false);
  };

  const handleBuy = async (item) => {
    if ((profile.coins || 0) < item.cost) {
        Alert.alert("Not enough money!", "Keep learning to earn more coins.");
        return;
    }

    Alert.alert("Confirm Purchase", `Buy ${item.name} for ${item.cost} coins?`, [
        { text: "Cancel" },
        { text: "BUY IT!", onPress: async () => {
            // 1. Pay Coins
            const { error: payError } = await supabase.rpc('add_coins', { amount: -item.cost });
            if (payError) return Alert.alert("Error", "Transaction failed.");

            // 2. Add to Inventory
            await supabase.from('user_inventory').insert([{ user_id: profile.id, item_id: item.id }]);
            
            Alert.alert("Success!", "Item added to your collection!");
            fetchProfile(profile.id); // Refresh Header Coins
            fetchShop(); // Refresh Buttons (Show "Owned")
        }}
    ]);
  };

  const renderItem = ({ item }) => {
    const isOwned = inventory.includes(item.id);
    
    return (
      <View style={[styles.card, isOwned && styles.cardOwned]}>
         {/* Item Icon / Emoji */}
         <View style={[styles.iconBox, isOwned && styles.iconBoxOwned]}>
             <Text style={styles.icon}>{item.image_code}</Text>
         </View>

         {/* Info */}
         <View style={styles.infoBox}>
             <Text style={styles.itemName}>{item.name}</Text>
             <Text style={styles.itemDesc}>{item.description}</Text>
         </View>

         {/* Buy Button */}
         {isOwned ? (
             <View style={styles.ownedBadge}>
                 <Ionicons name="checkmark-circle" size={16} color="#fff" />
                 <Text style={styles.ownedText}>OWNED</Text>
             </View>
         ) : (
             <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuy(item)}>
                 <Text style={styles.costText}>{item.cost}</Text>
                 <Ionicons name="star" size={12} color="#FFD700" style={{marginLeft: 2}} />
             </TouchableOpacity>
         )}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. STICKY WALLET HEADER */}
      <LinearGradient colors={['#009688', '#00796B']} style={styles.header}>
          <GoBackBtn />
          <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Item Shop 🛍️</Text>
              <View style={styles.walletPill}>
                  <Text style={styles.walletText}>{profile?.coins || 0}</Text>
                  <View style={styles.coinCircle}>
                      <Text>💰</Text>
                  </View>
              </View>
          </View>
      </LinearGradient>

      {/* 2. SHOP GRID */}
      <View style={styles.content}>
          <FlatList
            data={items}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
            renderItem={renderItem}
            ListHeaderComponent={
                <Text style={styles.sectionTitle}>Featured Items</Text>
            }
          />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#E0F2F1' },
  
  // Header
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginLeft: 40 },
  
  // Wallet Pill
  walletPill: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, paddingLeft: 15, paddingRight: 5, paddingVertical: 5, alignItems: 'center' },
  walletText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 },
  coinCircle: { backgroundColor: '#fff', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#00695C', marginBottom: 15, marginLeft: 5 },

  // Card Styles
  card: { 
      width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 10, marginBottom: 15, alignItems: 'center',
      shadowColor: "#000", shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cardOwned: { opacity: 0.6, backgroundColor: '#F5F5F5' },

  iconBox: { width: 80, height: 80, backgroundColor: '#E0F2F1', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconBoxOwned: { backgroundColor: '#ECEFF1' },
  icon: { fontSize: 40 },

  infoBox: { marginBottom: 10, alignItems: 'center', height: 40 },
  itemName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  itemDesc: { fontSize: 10, color: '#999', textAlign: 'center' },

  // Buttons
  buyBtn: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  costText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  ownedBadge: { backgroundColor: '#B0BEC5', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  ownedText: { color: '#fff', fontWeight: 'bold', fontSize: 10, marginLeft: 5 }
});