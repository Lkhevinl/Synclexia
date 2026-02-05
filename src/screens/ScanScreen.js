import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../components/GoBackBtn';
import { useNavigation } from '@react-navigation/native';

export default function ScanScreen() {
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const navigation = useNavigation();
  const API_KEY = 'K85307563288957'; 

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
    setScannedText("Thinking...");
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
        } else { setScannedText("I couldn't read that. Try better lighting."); }
    } catch (error) { Alert.alert("Error", "Check internet connection."); } finally { setIsScanning(false); }
  };

  const onScanPress = async (mode) => {
      let base64 = null;
      if (mode === 'camera') base64 = await takePhoto();
      else base64 = await pickImage();
      if (base64) handleScan(base64);
  };

  return (
    <View style={styles.container}>
      <GoBackBtn />
      <Text style={styles.header}>Smart Scanner 2.0</Text>
      <ScrollView contentContainerStyle={{paddingBottom: 20}}>
          <View style={styles.previewContainer}>
            {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.placeholder}><Ionicons name="scan-outline" size={80} color="#ddd" /><Text style={styles.placeholderText}>Take a clear photo of text</Text></View>}
          </View>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.btnCamera} onPress={() => onScanPress('camera')}><Ionicons name="camera" size={28} color="#fff" /><Text style={styles.btnTextPri}>Scan Text</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnGallery} onPress={() => onScanPress('gallery')}><Ionicons name="image" size={24} color="#006064" /></TouchableOpacity>
          </View>
          {isScanning && <ActivityIndicator size="large" color="#006064" style={{marginTop: 20}} />}
          {!isScanning && scannedText !== "" && (
            <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>I found this:</Text>
                <Text style={styles.resultText}>{scannedText}</Text>
                <TouchableOpacity onPress={() => Speech.speak(scannedText)} style={styles.speakBtn}><Ionicons name="volume-high" size={20} color="#fff" /><Text style={styles.speakText}>Listen Again</Text></TouchableOpacity>
            </View>
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#E3F2FD' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#01579B', marginBottom: 15 },
  previewContainer: { height: 300, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#B3E5FC', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: { color: '#aaa', marginTop: 10 },
  controls: { flexDirection: 'row', gap: 15, marginTop: 20 },
  btnCamera: { flex: 3, flexDirection: 'row', backgroundColor: '#006064', padding: 18, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  btnGallery: { flex: 1, backgroundColor: '#B2EBF2', padding: 18, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  btnTextPri: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },
  resultBox: { marginTop: 20, backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3 },
  resultTitle: { fontWeight: 'bold', color: '#555', marginBottom: 10 },
  resultText: { fontSize: 18, color: '#333', lineHeight: 28 },
  speakBtn: { marginTop: 20, backgroundColor: '#FF7043', flexDirection: 'row', padding: 12, borderRadius: 10, alignSelf: 'flex-start', alignItems: 'center' },
  speakText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 }
});