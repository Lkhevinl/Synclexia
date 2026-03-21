import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';

export default function MaintenanceLogDetailScreen({ route, navigation }) {
  const { log } = route.params;
  const { profile } = useAuth();

  const getLogTypeConfig = (type) => {
    const configs = {
      // Admin types
      system_update: { icon: 'rocket', color: '#2196F3', label: 'System Update' },
      bug_fix: { icon: 'checkmark-done', color: '#4CAF50', label: 'Bug Fix' },
      feature_added: { icon: 'star', color: '#FF9800', label: 'Feature Added' },
      database_change: { icon: 'server', color: '#9C27B0', label: 'Database Change' },

      // User feedback types
      user_concern: { icon: 'chatbubble-ellipses', color: '#00BCD4', label: 'User Concern' },
      bug_report: { icon: 'warning', color: '#F44336', label: 'Bug Report' },
      parent_feedback: { icon: 'people', color: '#673AB7', label: 'Parent Feedback' },
      learner_issue: { icon: 'school', color: '#FF5722', label: 'Learning Issue' },
      ui_problem: { icon: 'phone-portrait', color: '#795548', label: 'Interface Problem' },
      content_issue: { icon: 'document-text', color: '#607D8B', label: 'Content Issue' },
      performance_issue: { icon: 'speedometer', color: '#E91E63', label: 'Performance Issue' },
    };
    return configs[type] || { icon: 'information-circle', color: '#9E9E9E', label: 'General' };
  };

  const getStatusConfig = (status) => {
    const configs = {
      open: { label: 'Open', color: '#FF9800', bgColor: '#FFF8E1' },
      in_progress: { label: 'In Progress', color: '#2196F3', bgColor: '#E3F2FD' },
      resolved: { label: 'Resolved', color: '#4CAF50', bgColor: '#E8F5E8' },
      closed: { label: 'Closed', color: '#90A4AE', bgColor: '#F5F5F5' },
    };
    return configs[status] || configs.open;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { label: 'Low Priority', color: '#4CAF50', bgColor: '#E8F5E8' },
      medium: { label: 'Medium Priority', color: '#FF9800', bgColor: '#FFF8E1' },
      high: { label: 'High Priority', color: '#FF5722', bgColor: '#FFEBEE' },
      critical: { label: 'Critical', color: '#F44336', bgColor: '#FFEBEE' },
    };
    return configs[priority] || configs.medium;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const typeConfig = getLogTypeConfig(log.log_type);
  const statusConfig = getStatusConfig(log.status);
  const priorityConfig = getPriorityConfig(log.priority);

  const reporterName = log.performed_by_profile?.full_name ||
                       log.reported_by_profile?.full_name ||
                       'Unknown User';

  return (
    <View style={styles.container}>
      <AppHeader
        title="Log Details"
        colors={[typeConfig.color, '#455A64']}
        leftIcon="arrow-back"
        leftAction={() => navigation.goBack()}
        rightIcon={
          // Only show edit if it's user's own report and it's open, or if user is admin
          (log.reported_by === profile?.id && log.status === 'open') || profile?.role === 'admin'
            ? 'create-outline' : null
        }
        rightAction={() => {
          // Navigate to edit screen (for future implementation)
          console.log('Edit log functionality - to be implemented');
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={[styles.iconBadge, { backgroundColor: typeConfig.color + '20' }]}>
              <Ionicons name={typeConfig.icon} size={32} color={typeConfig.color} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={3}>
                {log.title}
              </Text>
              <View style={styles.typeRow}>
                <View style={[styles.typeBadge, { backgroundColor: typeConfig.color }]}>
                  <Text style={styles.typeBadgeText}>{typeConfig.label}</Text>
                </View>
                {log.priority && (
                  <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bgColor }]}>
                    <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                      {priorityConfig.label}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            <Text style={styles.dateText}>
              Reported {formatDate(log.created_at)}
            </Text>
          </View>
        </View>

        {/* Description */}
        {log.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.description}>{log.description}</Text>
          </View>
        )}

        {/* Reproduction Steps */}
        {log.reproduction_steps && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How to Reproduce</Text>
            <Text style={styles.description}>{log.reproduction_steps}</Text>
          </View>
        )}

        {/* Category and Reporter Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#607D8B" />
            <Text style={styles.infoLabel}>Reported by:</Text>
            <Text style={styles.infoValue}>{reporterName}</Text>
            {log.reporter_role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{log.reporter_role}</Text>
              </View>
            )}
          </View>

          {log.category && (
            <View style={styles.infoRow}>
              <Ionicons name="folder-outline" size={16} color="#607D8B" />
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{log.category}</Text>
            </View>
          )}

          {log.device_info && (
            <View style={styles.infoRow}>
              <Ionicons name="phone-portrait-outline" size={16} color="#607D8B" />
              <Text style={styles.infoLabel}>Device:</Text>
              <Text style={styles.infoValue}>
                {log.device_info.platform} {log.device_info.platformVersion}
                {log.device_info.screenDimensions &&
                  ` (${log.device_info.screenDimensions.width}x${log.device_info.screenDimensions.height})`
                }
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {profile?.role === 'admin' && (
          <View style={styles.actionCard}>
            <Text style={styles.cardTitle}>Admin Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionBtn, styles.updateBtn]}>
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Update Status</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.assignBtn]}>
                <Ionicons name="person-add-outline" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Assign To</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* User can provide additional details for their own reports */}
        {log.reported_by === profile?.id && log.status === 'open' && (
          <View style={styles.actionCard}>
            <Text style={styles.cardTitle}>Update Your Report</Text>
            <TouchableOpacity style={[styles.actionBtn, styles.updateBtn]}>
              <Ionicons name="add-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Add More Details</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 8,
    lineHeight: 26,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 13,
    color: '#90A4AE',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#455A64',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#546E7A',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#90A4AE',
    fontWeight: '500',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#546E7A',
    flex: 1,
  },
  roleBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#607D8B',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  updateBtn: {
    backgroundColor: '#607D8B',
  },
  assignBtn: {
    backgroundColor: '#FF9800',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});