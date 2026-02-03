import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Icons

export default function DashboardScreen({ navigation }) {
  return (
    <View style={styles.dashboardContainer}>
      
      {/* HEADER ROW: Title + Settings Icon */}
      <View style={styles.headerRow}>
        <View>
             <Text style={styles.welcome}>Hi, Learner!</Text>
             <Text style={styles.subWelcome}>Ready to learn?</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-sharp" size={28} color="#006064" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollGrid}>
        <Text style={styles.sectionTitle}>Learning Modules</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Phonics')}>
            <Text style={styles.icon}>🔊</Text>
            <Text style={styles.cardText}>Phonics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Reading')}>
            <Text style={styles.icon}>📖</Text>
            <Text style={styles.cardText}>Reading</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Writing')}>
             <Text style={styles.icon}>✍️</Text>
            <Text style={styles.cardText}>Writing</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, {backgroundColor: '#E3F2FD'}]} onPress={() => alert("Scan Feature requires Mobile App.")}>
            <Text style={styles.icon}>📷</Text>
            <Text style={styles.cardText}>Scan-to-Text</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#FFFFFF' },
  
  // Header Styles
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 28, fontWeight: 'bold', color: '#006064' },
  subWelcome: { fontSize: 16, color: '#888' },
  settingsBtn: { backgroundColor: '#E0F7FA', padding: 10, borderRadius: 12 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 15, color: '#555' },
  scrollGrid: { paddingBottom: 50 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  card: { backgroundColor: '#fff', width: '47%', height: 140, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  icon: { fontSize: 40, marginBottom: 10 },
  cardText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});