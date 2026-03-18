import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { logSession } from '../../lib/analyticsHelper';
import { showAlert } from '../../lib/uiAlert';

export default function ScanScreen() {
  const { profile } = useAuth();
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const navigation = useNavigation();
  const API_KEY = (process.env.EXPO_PUBLIC_OCR_API_KEY || 'K85307563288957').trim();

  console.log('🔑 OCR API Key status:', API_KEY ? 'Available' : 'Missing');

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => Speech.stop());
    return unsubscribe;
  }, [navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please allow photo library access to scan images.');
      return null;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, base64: true, quality: 0.6,
    });
    if (!result.canceled) {
      const asset = result.assets?.[0];
      setImage(asset?.uri || null);
      setScannedText("");
      return { base64: asset?.base64 || null, mimeType: asset?.mimeType || 'image/jpeg' };
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please allow camera access to take a photo.');
      return null;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, base64: true, quality: 0.6,
    });
    if (!result.canceled) {
      const asset = result.assets?.[0];
      setImage(asset?.uri || null);
      setScannedText("");
      return { base64: asset?.base64 || null, mimeType: asset?.mimeType || 'image/jpeg' };
    }
  };

  const handleScan = async ({ base64, mimeType }) => {
    console.log('🔍 Starting OCR process...');
    console.log('🔑 API Key available:', !!API_KEY);

    if (!API_KEY || API_KEY === 'K85307563288957') {
      console.warn('⚠️ Using fallback API key');
    }

    if (!base64) {
      showAlert('Scan Failed', 'Could not read image data. Please try again.');
      return;
    }

    setIsScanning(true);
    setScannedText(""); // Clear previous text
    try {
        console.log('📤 Sending OCR request...');
        let formData = new FormData();
        const safeMime = mimeType || 'image/jpeg';
        formData.append("base64Image", `data:${safeMime};base64,${base64}`);
        formData.append("language", "eng");
        formData.append("OCREngine", "2");
        formData.append("scale", "true");

        const response = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            headers: { apikey: API_KEY },
            body: formData
        });

        if (!response.ok) {
          console.error('❌ OCR request failed:', response.status, response.statusText);
          throw new Error(`OCR request failed (${response.status})`);
        }

        const data = await response.json();
        console.log('📨 OCR response received:', data);

        if (data.OCRExitCode === 1) {
          const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
          setScannedText(extractedText.trim());

          if (extractedText.trim()) {
            console.log('✅ Text extracted successfully');
            logSession({
              studentId: profile?.id,
              activityType: 'text_recognition',
              score: 1,
              total: 1,
              durationSeconds: 0,
              details: { char_count: extractedText.length, word_count: extractedText.trim().split(/\s+/).length },
            });
          } else {
            showAlert("No Text Found", "Could not detect any text in this image. Try using a clearer image with more text.");
          }
        } else {
          console.error('❌ OCR processing failed:', data.ErrorMessage);
          showAlert("OCR Error", data.ErrorMessage?.[0] || "Failed to process image. Please try again.");
        }
    } catch (error) {
        console.error('❌ OCR error:', error);
        showAlert("Scan Failed", `Error: ${error.message}. Please check your internet connection and try again.`);
    } finally {
        setIsScanning(false);
    }
  };

  const onScanPress = async (mode) => {
      let payload = null;
      if (mode === 'camera') payload = await takePhoto();
      else payload = await pickImage();
      
      if (payload) handleScan(payload);
  };

  return (
    <ScreenWrapper style={{ backgroundColor: '#F0F4F8' }}>
      <View style={styles.topBar}>
         <GoBackBtn />
         <Text style={styles.header}>Magic Scanner</Text>
         <View style={{width: 40}} />
      </View>

      <View style={styles.body}>
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

        {/* 3. RESULT CARD */}
        {!isScanning && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="text-outline" size={20} color="#666" />
              <Text style={styles.resultLabel}>Detected Text</Text>
            </View>

            <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.resultText}>{scannedText || 'Scan an image to extract text here.'}</Text>
            </ScrollView>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => {
                if (!scannedText.trim()) return;
                const speakText = scannedText.length > 900 ? scannedText.slice(0, 900) + '…' : scannedText;
                Speech.speak(speakText);
              }}
              style={[styles.speakBtn, !scannedText.trim() && styles.speakBtnDisabled]}
              disabled={!scannedText.trim()}
            >
              <Ionicons name="volume-high" size={24} color="#fff" />
              <Text style={styles.speakText}>Listen Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#37474F' },

  body: { flex: 1 },
  
  cardContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 4, marginBottom: 16, justifyContent: 'center' },
  previewBox: { height: 260, backgroundColor: '#F5F7FA', borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#B0BEC5', overflow: 'hidden', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  
  placeholderState: { alignItems: 'center', padding: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E1F5FE', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  placeholderTitle: { fontSize: 18, fontWeight: 'bold', color: '#455A64' },
  placeholderSub: { fontSize: 12, color: '#90A4AE', textAlign: 'center', marginTop: 5 },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: '#fff', fontWeight: 'bold', marginTop: 15, fontSize: 16 },

  controls: { flexDirection: 'row', gap: 15, marginBottom: 16 },
  btnCamera: { flex: 1, backgroundColor: '#0288D1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 15, elevation: 3 },
  btnGallery: { width: 70, backgroundColor: '#E1F5FE', alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 1, borderColor: '#B3E5FC' },
  btnTextMain: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2, flex: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, opacity: 0.7 },
  resultLabel: { fontWeight: 'bold', color: '#555', marginLeft: 8, fontSize: 12, textTransform: 'uppercase' },
  // Do not set fontFamily here so global Font Style can apply.
  resultText: { fontSize: 18, color: '#333', lineHeight: 28 },
  resultScroll: { flex: 1 },
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  
  speakBtn: { backgroundColor: '#FF7043', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 12, elevation: 3 },
  speakBtnDisabled: { backgroundColor: '#FFAB91' },
  speakText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});