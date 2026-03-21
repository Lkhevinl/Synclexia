import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Constants from 'expo-constants';

// Cross-platform alert
const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

// Enhanced log types for all user roles
const getLogTypes = (userRole) => {
  const adminTypes = [
    { value: 'system_update', label: 'System Update', icon: 'rocket', color: '#2196F3' },
    { value: 'bug_fix', label: 'Bug Fix', icon: 'bug', color: '#F44336' },
    { value: 'feature_added', label: 'Feature Added', icon: 'star', color: '#4CAF50' },
    { value: 'database_change', label: 'Database Change', icon: 'server', color: '#FF9800' },
  ];

  const userTypes = [
    { value: 'user_concern', label: 'General Concern', icon: 'chatbubble-ellipses', color: '#9C27B0' },
    { value: 'bug_report', label: 'Bug Report', icon: 'warning', color: '#F44336' },
    { value: 'parent_feedback', label: 'Parent Feedback', icon: 'people', color: '#00BCD4' },
    { value: 'learner_issue', label: 'Learning Issue', icon: 'school', color: '#FF5722' },
    { value: 'ui_problem', label: 'Interface Problem', icon: 'phone-portrait', color: '#795548' },
    { value: 'content_issue', label: 'Content Issue', icon: 'document-text', color: '#607D8B' },
    { value: 'performance_issue', label: 'Performance Issue', icon: 'speedometer', color: '#E91E63' },
  ];

  return userRole === 'admin' ? [...adminTypes, ...userTypes] : userTypes;
};

const PRIORITIES = [
  { value: 'low', label: 'Low Priority', color: '#4CAF50' },
  { value: 'medium', label: 'Medium Priority', color: '#FF9800' },
  { value: 'high', label: 'High Priority', color: '#FF5722' },
  { value: 'critical', label: 'Critical', color: '#F44336' },
];

const CATEGORIES = [
  'phonics', 'spelling', 'writing', 'reading', 'navigation', 'login',
  'profile', 'settings', 'analytics', 'dashboard', 'performance', 'other'
];

export default function AddMaintenanceLogScreen({ navigation }) {
  const { profile } = useAuth();
  const [logType, setLogType] = useState('user_concern');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [saving, setSaving] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    // Collect device information for bug reports using built-in APIs
    const collectDeviceInfo = async () => {
      const { width, height } = Dimensions.get('window');
      const info = {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        appVersion: Constants.expoConfig?.version || Constants.manifest?.version || '1.0.0',
        screenDimensions: {
          width: Math.round(width),
          height: Math.round(height),
        },
        userAgent: Platform.select({
          web: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          default: `${Platform.OS} ${Platform.Version}`,
        }),
      };
      setDeviceInfo(info);
    };
    collectDeviceInfo();

    // Set default log type based on user role
    if (profile?.role === 'admin') {
      setLogType('system_update');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!title.trim()) {
      showAlert('Validation Error', 'Title is required.');
      return;
    }

    if (!description.trim()) {
      showAlert('Validation Error', 'Description is required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        log_type: logType,
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category || null,
        reproduction_steps: reproductionSteps.trim() || null,
        device_info: deviceInfo,
        performed_by: profile?.role === 'admin' ? profile?.id : null,
        reported_by: profile?.id,
        reporter_role: profile?.role,
        status: 'open',
      };

      const { error } = await supabase.from('maintenance_logs').insert([payload]);

      if (error) {
        console.error('Maintenance log error:', error);

        // Handle specific database errors
        if (error.code === '42P01') {
          showAlert(
            'Database Setup Required',
            'The maintenance logs table needs to be created. Please run the database migration first.'
          );
        } else if (error.code === '23505') {
          showAlert('Error', 'A similar report already exists.');
        } else {
          showAlert('Error', `Failed to submit: ${error.message}`);
        }
      } else {
        const successMessage = profile?.role === 'admin'
          ? 'Maintenance log added successfully!'
          : 'Your feedback has been submitted successfully! Our team will review it.';
        showAlert('Success ✓', successMessage, () => {
          navigation.goBack();
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.');
    }

    setSaving(false);
  };

  const logTypes = getLogTypes(profile?.role);

  const renderLogTypeOption = (type) => {
    const isSelected = logType === type.value;
    return (
      <TouchableOpacity
        key={type.value}
        style={[
          styles.typeOption,
          isSelected && { backgroundColor: type.color + '15', borderColor: type.color },
        ]}
        onPress={() => setLogType(type.value)}
      >
        <View style={[styles.typeIconWrapper, { backgroundColor: type.color + '20' }]}>
          <Ionicons name={type.icon} size={24} color={type.color} />
        </View>
        <Text style={[styles.typeLabel, isSelected && { color: type.color, fontWeight: '600' }]}>
          {type.label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={type.color} style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  const renderPriorityOption = (priorityOption) => {
    const isSelected = priority === priorityOption.value;
    return (
      <TouchableOpacity
        key={priorityOption.value}
        style={[
          styles.priorityOption,
          isSelected && { backgroundColor: priorityOption.color + '15', borderColor: priorityOption.color },
        ]}
        onPress={() => setPriority(priorityOption.value)}
      >
        <Text style={[styles.priorityLabel, isSelected && { color: priorityOption.color, fontWeight: '600' }]}>
          {priorityOption.label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={priorityOption.color} />
        )}
      </TouchableOpacity>
    );
  };

  const showReproductionSteps = ['bug_report', 'ui_problem', 'performance_issue', 'app_error'].includes(logType);
  const showPriority = profile?.role !== 'admin' || ['bug_report', 'user_concern', 'learner_issue'].includes(logType);

  return (
    <View style={styles.container}>
      <AppHeader
        title={profile?.role === 'admin' ? 'Add Maintenance Log' : 'Report Issue/Feedback'}
        colors={['#607D8B', '#455A64']}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <Ionicons name="information-circle" size={20} color="#607D8B" />
            <Text style={styles.headerText}>
              {profile?.role === 'admin'
                ? 'Add system maintenance logs and track user issues'
                : 'Report bugs, concerns, or provide feedback to help us improve the app'}
            </Text>
          </View>

          {/* Log Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {profile?.role === 'admin' ? 'LOG TYPE' : 'ISSUE TYPE'} *
            </Text>
            <View style={styles.typeGrid}>
              {logTypes.map(renderLogTypeOption)}
            </View>
          </View>

          {/* Priority Selection */}
          {showPriority && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PRIORITY</Text>
              <View style={styles.priorityGrid}>
                {PRIORITIES.map(renderPriorityOption)}
              </View>
            </View>
          )}

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CATEGORY (OPTIONAL)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && { backgroundColor: '#607D8B', borderColor: '#607D8B' }
                    ]}
                    onPress={() => setCategory(category === cat ? '' : cat)}
                  >
                    <Text style={[
                      styles.categoryText,
                      category === cat && { color: '#fff' }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TITLE *</Text>
            <CustomInput
              placeholder={profile?.role === 'admin'
                ? 'Brief title describing the activity'
                : 'Briefly describe the issue or feedback'
              }
              value={title}
              onChangeText={setTitle}
              icon="document-text-outline"
              maxLength={200}
            />
            <Text style={styles.hint}>Maximum 200 characters</Text>
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DESCRIPTION *</Text>
            <CustomInput
              placeholder={profile?.role === 'admin'
                ? 'Detailed description of changes made...'
                : 'Please provide detailed information about the issue, what you expected to happen, and what actually happened...'
              }
              value={description}
              onChangeText={setDescription}
              icon="list-outline"
              multiline
              numberOfLines={6}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
            <Text style={styles.hint}>
              {profile?.role === 'admin'
                ? 'Provide additional context about what was changed'
                : 'The more details you provide, the better we can help you'
              }
            </Text>
          </View>

          {/* Reproduction Steps (for bugs) */}
          {showReproductionSteps && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>HOW TO REPRODUCE (OPTIONAL)</Text>
              <CustomInput
                placeholder="1. Click on... &#10;2. Navigate to... &#10;3. Then I see..."
                value={reproductionSteps}
                onChangeText={setReproductionSteps}
                icon="list"
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />
              <Text style={styles.hint}>Step-by-step instructions to reproduce the issue</Text>
            </View>
          )}

          {/* Device Info Preview */}
          {Object.keys(deviceInfo).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DEVICE INFORMATION</Text>
              <View style={styles.deviceInfoCard}>
                <Text style={styles.deviceInfoText}>
                  Platform: {deviceInfo.platform} {deviceInfo.platformVersion}
                </Text>
                <Text style={styles.deviceInfoText}>
                  Screen: {deviceInfo.screenDimensions?.width}x{deviceInfo.screenDimensions?.height}
                </Text>
                <Text style={styles.deviceInfoText}>
                  App Version: {deviceInfo.appVersion}
                </Text>
                {deviceInfo.userAgent && Platform.OS === 'web' && (
                  <Text style={styles.deviceInfoText} numberOfLines={2}>
                    Browser: {deviceInfo.userAgent.substring(0, 50)}...
                  </Text>
                )}
              </View>
              <Text style={styles.hint}>This information helps us debug issues</Text>
            </View>
          )}

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title={saving ? 'Submitting...' : (profile?.role === 'admin' ? 'Save Maintenance Log' : 'Submit Feedback')}
              onPress={handleSave}
              backgroundColor="#607D8B"
              icon={saving ? null : 'send-outline'}
              disabled={saving}
            />
          </View>

          {saving && (
            <View style={styles.savingOverlay}>
              <ActivityIndicator size="large" color="#607D8B" />
              <Text style={styles.savingText}>
                {profile?.role === 'admin' ? 'Saving log entry...' : 'Submitting your feedback...'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 13,
    color: '#455A64',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#607D8B',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  typeGrid: {
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  typeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#263238',
  },
  checkIcon: {
    marginLeft: 8,
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#263238',
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    backgroundColor: '#F5F5F5',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#546E7A',
    textTransform: 'capitalize',
  },
  deviceInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#607D8B',
  },
  deviceInfoText: {
    fontSize: 12,
    color: '#546E7A',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  hint: {
    fontSize: 12,
    color: '#90A4AE',
    marginTop: 6,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 8,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  savingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#607D8B',
    fontWeight: '500',
  },
});
