import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../components/GoBackBtn'; // Import Back Button

export default function ReadingScreen() {
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [fontSize, setFontSize] = useState(22); // Start with a slightly larger font
  const passage = "The quick brown fox jumps over the lazy dog. Reading can be fun when the letters stop moving. You can adjust the size of this text using the buttons above.";

  return (
    <View style={styles.container}>
      <GoBackBtn />

      <Text style={styles.header}>Reading Practice</Text>

      {/* TOOLBAR UI - Cleaner & better spacing */}
      <View style={styles.toolbar}>
        <View style={styles.toolGroup}>
            <Text style={styles.label}>Dyslexia Mode</Text>
            <Switch
              value={isDyslexicFont}
              onValueChange={setIsDyslexicFont}
              trackColor={{ false: "#E0E0E0", true: "#81b0ff" }}
              thumbColor={isDyslexicFont ? "#2196F3" : "#f4f3f4"}
            />
        </View>

        <View style={styles.separator} /> {/* Vertical Divider */}

        <View style={styles.toolGroup}>
            <TouchableOpacity onPress={() => setFontSize(Math.max(16, fontSize - 2))} style={styles.iconBtn}>
                <Ionicons name="remove-circle-outline" size={32} color="#006064"/>
            </TouchableOpacity>
            <Text style={styles.sizeText}>Aa</Text>
            <TouchableOpacity onPress={() => setFontSize(Math.min(44, fontSize + 2))} style={styles.iconBtn}>
                <Ionicons name="add-circle-outline" size={32} color="#006064"/>
            </TouchableOpacity>
        </View>
      </View>

      {/* READING CARD - More padding & rounded */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.paper, isDyslexicFont && styles.yellowPaper]}>
            <Text style={{
                fontSize: fontSize,
                lineHeight: fontSize * 1.5,
                letterSpacing: isDyslexicFont ? 2.5 : 0.5, // Better spacing
                color: '#222',
                fontFamily: isDyslexicFont ? 'monospace' : 'System',
                fontWeight: '500'
            }}>
            {passage}
            </Text>
        </View>
      </ScrollView>

      {/* FLOAT BUTTON FOR SPEECH */}
      <TouchableOpacity style={styles.fab} onPress={() => Speech.speak(passage)}>
        <Ionicons name="volume-high" size={30} color="white" />
        <Text style={styles.fabText}>Read to Me</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#F5F5F5' },
  header: { fontSize: 32, fontWeight: 'bold', color: '#006064', marginBottom: 25 },

  // Toolbar Look
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 25, // Softer corners
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  toolGroup: { flexDirection: 'row', alignItems: 'center' },
  label: { marginRight: 12, fontWeight: '600', color: '#555', fontSize: 16 },
  separator: { height: '70%', width: 1, backgroundColor: '#EEEEEE' },
  iconBtn: { marginHorizontal: 8 },
  sizeText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginHorizontal: 10 },

  // Paper Look
  scrollContent: { paddingBottom: 110 }, // Makes room for the FAB
  paper: {
    backgroundColor: '#fff',
    padding: 35, // Lots of breathing room
    borderRadius: 30,
    minHeight: 300,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  yellowPaper: { backgroundColor: '#FFF9C4' },

  // Floating Action Button (FAB)
  fab: {
    position: 'absolute',
    bottom: 35,
    right: 25,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }
});