import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ttsService from '../../lib/ttsService';
import Icon from '../../components/icons/Icon';
import ScreenWrapper from '../../components/ScreenWrapper';
import StudentCard from '../../components/student/StudentCard';
import StudentButton from '../../components/student/StudentButton';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import c from '../../components/student/candyTokens';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { logSession } from '../../lib/analyticsHelper';
import { showAlert } from '../../lib/uiAlert';

export default function ScanScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const navigation = useNavigation();
  const API_KEY = process.env.EXPO_PUBLIC_OCR_API_KEY?.trim();

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => ttsService.stop());
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
    if (!API_KEY) {
      showAlert('Configuration Error', 'OCR API key is not configured. Please contact support.');
      return;
    }

    if (!base64) {
      showAlert('Scan Failed', 'Could not read image data. Please try again.');
      return;
    }

    setIsScanning(true);
    setScannedText(""); // Clear previous text
    try {
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
          throw new Error(`OCR request failed (${response.status})`);
        }

        const data = await response.json();

        if (data.OCRExitCode === 1) {
          const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
          setScannedText(extractedText.trim());

          if (extractedText.trim()) {
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
          showAlert("OCR Error", data.ErrorMessage?.[0] || "Failed to process image. Please try again.");
        }
    } catch (error) {
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
    <ScreenWrapper role="student" style={{ backgroundColor: colors.surface }}>
      <StudentPageHeader title="Magic Scanner" />

      <StudentCard variant="tinted" style={styles.hintCard}>
        <View style={styles.hintRow}>
          <Icon name="info" size="md" color={c.primary} />
          <Text style={styles.hintText}>
            <Text style={{ fontWeight: 'bold' }}>How to use: </Text>
            Tap "Take Photo" or the gallery icon, then tap "Listen Now" to hear the text read aloud!
          </Text>
        </View>
      </StudentCard>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {/* 1. SCANNER VIEWFINDER CARD */}
        <View style={[styles.cardContainer, { backgroundColor: colors.surfaceCard }]}>
          <View style={styles.previewBox}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
            ) : (
              <View style={styles.placeholderState}>
                <View style={styles.iconCircle}>
                  <Icon name="scan-line" size="lg" color={c.primary} />
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
          <StudentButton variant="primary" onPress={() => onScanPress('camera')} disabled={isScanning} style={styles.btnCamera}>
            <Icon name="camera" size="md" color="#fff" />
            <Text style={styles.btnText}>Take Photo</Text>
          </StudentButton>

          <TouchableOpacity style={styles.btnGallery} onPress={() => onScanPress('gallery')} disabled={isScanning}>
            <Icon name="images" size="lg" color={c.primary} />
          </TouchableOpacity>
        </View>

        {/* 3. RESULT CARD */}
        {!isScanning && (
          <StudentCard style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Icon name="text" size="md" color={c.textMuted} />
              <Text style={styles.resultLabel}>Detected Text</Text>
            </View>
            <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator nestedScrollEnabled>
              <Text style={styles.resultText}>{scannedText || 'Scan an image to extract text here.'}</Text>
            </ScrollView>
            <View style={styles.divider} />
            <StudentButton
              variant="primary"
              disabled={!scannedText.trim()}
              onPress={() => {
                if (!scannedText.trim()) return;
                const speakText = scannedText.length > 900 ? scannedText.slice(0, 900) + '…' : scannedText;
                ttsService.speak(speakText);
              }}
              style={styles.speakBtn}
            >
              <Icon name="volume-2" size="md" color="#fff" />
              <Text style={styles.speakText}>Listen Now</Text>
            </StudentButton>
          </StudentCard>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hintCard: { marginBottom: 14 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  hintText: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 19 },

  body: { flex: 1 },
  bodyContent: { paddingBottom: 100 },

  cardContainer: { backgroundColor: '#fff', borderRadius: 28, borderWidth: 4, borderColor: '#fff', padding: 10, elevation: 8, shadowColor: c.primary, shadowOffset:{width:0,height:4}, shadowOpacity:0.15, shadowRadius:10, marginBottom: 16, justifyContent: 'center' },
  previewBox: { height: 260, backgroundColor: '#F5F7FA', borderRadius: 18, borderStyle: 'dashed', borderWidth: 2, borderColor: '#B0BEC5', overflow: 'hidden', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },

  placeholderState: { alignItems: 'center', padding: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: c.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  placeholderTitle: { fontSize: 18, fontWeight: '800', color: '#455A64' },
  placeholderSub: { fontSize: 12, color: '#90A4AE', textAlign: 'center', marginTop: 5 },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 28, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: '#fff', fontWeight: 'bold', marginTop: 15, fontSize: 16 },

  controls: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center' },
  btnCamera: { flex: 1, alignSelf: 'stretch' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnGallery: { width: 60, height: 52, backgroundColor: c.primaryLight, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 2, borderColor: c.primary },

  resultCard: { marginBottom: 20 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  resultLabel: { fontWeight: '700', color: c.textMuted, fontSize: 12, textTransform: 'uppercase' },
  resultText: { fontSize: 18, color: c.text, lineHeight: 28 },
  resultScroll: { maxHeight: 200 },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  speakBtn: { alignSelf: 'stretch' },
  speakText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});