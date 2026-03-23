import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../../components/GoBackBtn';

export default function AdminFeedbackScreen({ navigation }) {
  useEffect(() => {
    // Show redirect message and navigate to maintenance logs
    const timer = setTimeout(() => {
      Alert.alert(
        "Feedback System Updated",
        "User feedback is now managed through the unified Maintenance Logs system. You'll be redirected there now.",
        [
          {
            text: "Go to Maintenance Logs",
            onPress: () => navigation.replace('MaintenanceLogs')
          }
        ]
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <GoBackBtn />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={64} color="#607D8B" />
        </View>
        <Text style={styles.title}>Feedback System Updated</Text>
        <Text style={styles.message}>
          User feedback and concerns are now managed through the unified Maintenance Logs system.
        </Text>
        <Text style={styles.description}>
          This provides better tracking, categorization, and management of all user feedback, bug reports, and system issues in one place.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MaintenanceLogs')}
        >
          <Ionicons name="list-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>View Maintenance Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('AddMaintenanceLog')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#607D8B" />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Add New Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    backgroundColor: '#607D8B20',
    borderRadius: 40,
    padding: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 16,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#546E7A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: '#90A4AE',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#607D8B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    minWidth: '60%',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#607D8B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#607D8B',
  },
});