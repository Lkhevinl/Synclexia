import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { logSession } from '../../lib/analyticsHelper';

export default function ScanScreen() {
  const { profile } = useAuth();
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const navigation = useNavigation();
  const API_KEY = process.env.EXPO_PUBLIC_OCR_API_KEY || '';

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => Speech.stop());
    return unsubscribe;
  }, [navigation]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true, base64: true, quality: 0.6,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri); setScannedText(""); return result.assets[0].base64;
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, base64: true, quality: 0.6,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri); setScannedText(""); return result.assets[0].base64;
    }
  };

  const handleScan = async (base64Image) => {
    if (!base64Image) return;
    setIsScanning(true);
    setScannedText(""); // Clear previous text
    try {
        let formData = new FormData();
        formData.append("base64Image", "data:image/jpeg;base64," + base64Image);
        formData.append("language", "eng");
        formData.append("OCREngine", "2"); 
        formData.append("scale", "true"); 
        
        const response = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            headers: { apikey: API_KEY, "Content-Type": "multipart/form-data" },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.ParsedResults && data.ParsedResults.length > 0) {
            const detectedText = data.ParsedResults[0].ParsedText;
            setScannedText(detectedText);
            Speech.speak(detectedText);
            // Log scan session
            if (profile?.id) {
              logSession({
                studentId: profile.id,
                activityType: 'scan',
                score: 1,
                total: 1,
                details: { textLength: detectedText.length, wordCount: detectedText.split(/\s+/).length },
              });
            }
        } else { 
            setScannedText("I couldn't find any text. Try to crop closer or use better lighting."); 
        }
    } catch (error) { 
        Alert.alert("Connection Error", "Please check your internet."); 
    } finally { 
        setIsScanning(false); 
    }
  };

  const onScanPress = async (mode) => {
      let base64 = null;
      if (mode === 'camera') base64 = await takePhoto();
      else base64 = await pickImage();
      
      if (base64) handleScan(base64);
  };

  return (
    <ScreenWrapper style={{ backgroundColor: '#F0F4F8' }}>
      <View style={styles.topBar}>
         <GoBackBtn />
         <Text style={styles.header}>Magic Scanner ✨</Text>
         <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 40}} showsVerticalScrollIndicator={false}>
          
          {/* 1. SCANNER VIEWFINDER CARD */}
          <View style={styles.cardContainer}>
             <View style={styles.previewBox}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
                ) : (
                    <View style={styles.placeholderState}>
                        <View style={styles.iconCircle}>
                           <Ionicons name="scan" size={50} color="#0288D1" />
                        </View>
                        <Text style={styles.placeholderTitle}>Ready to Scan</Text>
                        <Text style={styles.placeholderSub}>Take a photo of a book or worksheet</Text>
                    </View>
                )}
             </View>

             {/* LOADING OVERLAY */}
             {isScanning && (
                 <View style={styles.loadingOverlay}>
                     <ActivityIndicator size="large" color="#fff" />
                     <Text style={styles.loadingText}>Reading text...</Text>
                 </View>
             )}
          </View>

          {/* 2. ACTION BUTTONS */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.btnCamera} onPress={() => onScanPress('camera')} disabled={isScanning}>
                <Ionicons name="camera" size={26} color="#fff" />
                <Text style={styles.btnTextMain}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnGallery} onPress={() => onScanPress('gallery')} disabled={isScanning}>
                <Ionicons name="images" size={26} color="#0277BD" />
            </TouchableOpacity>
          </View>

          {/* 3. RESULT CARD (Only shows if text found) */}
          {scannedText !== "" && !isScanning && (
            <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                    <Ionicons name="text-outline" size={20} color="#666" />
                    <Text style={styles.resultLabel}>Detected Text</Text>
                </View>

                <Text style={styles.resultText}>{scannedText}</Text>
                
                <View style={styles.divider} />

                <TouchableOpacity onPress={() => Speech.speak(scannedText)} style={styles.speakBtn}>
                    <Ionicons name="volume-high" size={24} color="#fff" />
                    <Text style={styles.speakText}>Listen Now</Text>
                </TouchableOpacity>
            </View>
          )}

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#37474F' },
  
  cardContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 4, marginBottom: 20, minHeight: 320, justifyContent: 'center' },
  previewBox: { height: 300, backgroundColor: '#F5F7FA', borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#B0BEC5', overflow: 'hidden', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  
  placeholderState: { alignItems: 'center', padding: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E1F5FE', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  placeholderTitle: { fontSize: 18, fontWeight: 'bold', color: '#455A64' },
  placeholderSub: { fontSize: 12, color: '#90A4AE', textAlign: 'center', marginTop: 5 },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: '#fff', fontWeight: 'bold', marginTop: 15, fontSize: 16 },

  controls: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  btnCamera: { flex: 1, backgroundColor: '#0288D1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 15, elevation: 3 },
  btnGallery: { width: 70, backgroundColor: '#E1F5FE', alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 1, borderColor: '#B3E5FC' },
  btnTextMain: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2, marginBottom: 30 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, opacity: 0.7 },
  resultLabel: { fontWeight: 'bold', color: '#555', marginLeft: 8, fontSize: 12, textTransform: 'uppercase' },
  resultText: { fontSize: 18, color: '#333', lineHeight: 28, fontFamily: 'System' }, // Use 'System' or your font
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  
  speakBtn: { backgroundColor: '#FF7043', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 12, elevation: 3 },
  speakText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});