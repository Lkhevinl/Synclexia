import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder, Modal, StatusBar, Alert, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { checkQuestProgress } from '../../lib/questHelper';
import { logSession } from '../../lib/analyticsHelper';
import GoBackBtn from '../../components/GoBackBtn';

const DEFAULT_LETTERS = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const COLORS = ['#000000', '#F44336', '#2196F3', '#4CAF50', '#FFEB3B'];

export default function WritingScreen() {
  const { profile } = useAuth();

  // STATE
  const [items, setItems] = useState(DEFAULT_LETTERS.map(l => ({ id: l, label: l })));
  const [selectedItem, setSelectedItem] = useState(null);
  
  // DRAWING STATE
  const [paths, setPaths] = useState([]); 
  const [currentPath, setCurrentPath] = useState([]); 
  const [strokeColor, setStrokeColor] = useState(COLORS[0]); 
  
  const [successVisible, setSuccessVisible] = useState(false);
  const [demoPath, setDemoPath] = useState(new Animated.Value(0)); // For Demo Animation

  // --- REFS (The Fix for "Disappearing" & "Wrong Color") ---
  // These keep track of live data without waiting for re-renders
  const colorRef = useRef(strokeColor);
  
  // Update the ref whenever the state changes
  useEffect(() => {
    colorRef.current = strokeColor;
  }, [strokeColor]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from('writing_practice').select('*').order('label');
      if (data && data.length > 0) setItems(data);
    };
    fetchItems();
  }, []);

  // --- DRAWING ENGINE ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        setCurrentPath([]); // Start fresh stroke
      },
      
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const point = `${locationX.toFixed(0)},${locationY.toFixed(0)}`;
        setCurrentPath((prev) => [...prev, point]);
      },
      
      onPanResponderRelease: () => {
        // We use a callback here to ensure we get the latest 'currentPath'
        setCurrentPath((latestCurrentPath) => {
             if (latestCurrentPath.length > 0) {
                 const d = `M ${latestCurrentPath.join(' L ')}`;
                 // Add to history using the LIVE color from the Ref
                 setPaths((prevPaths) => [
                     ...prevPaths, 
                     { d, color: colorRef.current } // <--- FIX: Uses live color
                 ]);
             }
             return []; // Clear current path
        });
      },
    })
  ).current;

  // --- ACTIONS ---
  const handleCheck = () => {
    if (paths.length === 0) {
      Alert.alert("Canvas Empty", "Trace the letter first!");
      return;
    }
    Speech.speak(`Excellent! You wrote ${selectedItem.label}!`, { rate: 0.9 });
    setSuccessVisible(true);
    if (profile?.id) {
      checkQuestProgress(profile.id, 'Writing');
      logSession({ studentId: profile.id, activityType: 'writing', score: 1, total: 1, details: { letter: selectedItem.label } });
    }
  };

  const nextItem = () => {
    setSuccessVisible(false);
    setPaths([]); 
    setCurrentPath([]);
    
    const idx = items.findIndex(i => i.id === selectedItem.id);
    setSelectedItem(idx < items.length - 1 ? items[idx + 1] : items[0]);
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  // --- DEMO ANIMATION ---
  const playDemo = () => {
      setDemoPath(new Animated.Value(0)); // Reset
      Animated.timing(demoPath, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true, // Use native driver for performance
          easing: Easing.inOut(Easing.ease)
      }).start();
  };

  // --- RENDER 1: GRID ---
  if (!selectedItem) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#673AB7', '#512DA8']} style={styles.header}>
            <GoBackBtn />
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Writing Lab ✍️</Text>
                <Text style={styles.headerSub}>Choose a letter:</Text>
            </View>
        </LinearGradient>
        <View style={styles.gridContainer}>
           {items.map((item) => (
               <TouchableOpacity key={item.id} style={styles.gridCard} onPress={() => setSelectedItem(item)}>
                   <Text style={styles.gridText}>{item.label}</Text>
               </TouchableOpacity>
           ))}
        </View>
      </View>
    );
  }

  // --- RENDER 2: CANVAS ---
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#673AB7', '#512DA8']} style={styles.header}>
         <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.backBtn}>
             <Ionicons name="grid-outline" size={24} color="#fff" />
             <Text style={styles.backText}>Grid</Text>
         </TouchableOpacity>
         
         <Text style={styles.headerTitle}>{selectedItem.label}</Text>

         {/* DEMO BUTTON */}
         <TouchableOpacity onPress={playDemo} style={styles.demoBtn}>
             <Ionicons name="play-circle" size={28} color="#fff" />
         </TouchableOpacity>
      </LinearGradient>

      {/* DRAWING AREA */}
      <View style={styles.canvasContainer}>
         
         {/* Layer 1: Ghost Guide */}
         <View style={styles.layer}>
            <Text style={[styles.ghostText, { fontSize: selectedItem.label.length > 1 ? 100 : 280 }]}>
                {selectedItem.label}
            </Text>
         </View>

         {/* Layer 2: The Demo Animation (Overlay) */}
         {/* This is a simple visual trick: A moving hand or highlight could go here */}

         {/* Layer 3: The Ink (SVG) */}
         <View style={[styles.layer, { pointerEvents: 'none' }]}> 
            <Svg height="100%" width="100%">
                {paths.map((p, i) => (
                  <Path 
                    key={`path-${i}`} // Unique Key
                    d={p.d} 
                    stroke={p.color} 
                    strokeWidth={25} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    fill="none" 
                  />
                ))}
                {currentPath.length > 0 && (
                  <Path 
                    d={`M ${currentPath.join(' L ')}`} 
                    stroke={strokeColor} 
                    strokeWidth={25} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    fill="none" 
                  />
                )}
            </Svg>
         </View>

         {/* Layer 4: Touch Handler */}
         <View style={styles.layer} {...panResponder.panHandlers} />

      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
          <View style={styles.colorRow}>
              {COLORS.map(c => (
                  <TouchableOpacity 
                    key={c} 
                    style={[styles.colorDot, { backgroundColor: c }, strokeColor === c && styles.activeColor]} 
                    onPress={() => setStrokeColor(c)}
                  />
              ))}
          </View>

          <View style={styles.btnRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearCanvas}>
                  <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkBtn} onPress={handleCheck}>
                  <Text style={styles.checkText}>DONE</Text>
              </TouchableOpacity>
          </View>
      </View>

      {/* Success Modal */}
      <Modal visible={successVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={styles.successCard}>
                  <Text style={styles.emoji}>🌟</Text>
                  <Text style={styles.successTitle}>Awesome!</Text>
                  <Text style={styles.successSub}>You wrote {selectedItem.label} perfectly!</Text>
                  <TouchableOpacity style={styles.nextBtn} onPress={nextItem}>
                      <Text style={styles.nextText}>Next 👉</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F3E5F5' }, // Light Purple Theme
  
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },

  backBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 12 },
  backText: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
  demoBtn: { padding: 5 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 20, gap: 15 },
  gridCard: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  gridText: { fontSize: 32, fontWeight: 'bold', color: '#555' },

  canvasContainer: { 
      flex: 1, 
      backgroundColor: '#fff', 
      margin: 20, 
      borderRadius: 20, 
      elevation: 5, 
      overflow: 'hidden',
      position: 'relative'
  },
  
  layer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  ghostText: { fontWeight: 'bold', color: '#E1BEE7', textAlign: 'center' }, // Light purple ghost

  controls: { padding: 20, paddingBottom: 40 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  colorDot: { width: 45, height: 45, borderRadius: 25, borderWidth: 2, borderColor: '#fff', elevation: 2 },
  activeColor: { borderWidth: 3, borderColor: '#333', transform: [{scale: 1.15}] },

  btnRow: { flexDirection: 'row', gap: 15 },
  clearBtn: { flex: 1, padding: 15, backgroundColor: '#fff', borderRadius: 15, borderWidth: 2, borderColor: '#673AB7', alignItems: 'center' },
  clearText: { color: '#673AB7', fontWeight: 'bold' },
  checkBtn: { flex: 2, padding: 15, backgroundColor: '#673AB7', borderRadius: 15, alignItems: 'center', elevation: 5 },
  checkText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  successCard: { width: '80%', backgroundColor: '#fff', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 10 },
  emoji: { fontSize: 60, marginBottom: 10 },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#673AB7' },
  successSub: { fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 10 },
  nextBtn: { backgroundColor: '#FF4081', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, marginTop: 10 },
  nextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});