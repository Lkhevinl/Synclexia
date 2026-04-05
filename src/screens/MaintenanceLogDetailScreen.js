import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function MaintenanceLogDetailScreen({ route, navigation }) {
  const { log } = route.params;
  const { profile } = useAuth();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);

  const statusOptions = [
    { value: 'open', label: 'Open', color: '#FF9800', bgColor: '#FFF8E1', icon: 'alert-circle' },
    { value: 'in_progress', label: 'In Progress', color: '#2196F3', bgColor: '#E3F2FD', icon: 'time' },
    { value: 'resolved', label: 'Resolved', color: '#4CAF50', bgColor: '#E8F5E8', icon: 'checkmark-circle' },
    { value: 'closed', label: 'Closed', color: '#90A4AE', bgColor: '#F5F5F5', icon: 'close-circle' },
  ];

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      if (!log.id || log.id.startsWith('demo-') || log.id.startsWith('error-')) {
        Alert.alert('Info', 'Cannot update demo or error entries. This would work with real data.');
        setUpdating(false);
        setShowStatusModal(false);
        return;
      }

      // Check if it's a legacy feedback entry
      if (log.id.startsWith('feedback-')) {
        // Update in the old feedback table
        const { error } = await supabase
          .from('feedback')
          .update({ status: newStatus })
          .eq('id', log.id.replace('feedback-', ''));

        if (error) throw error;
      } else {
        // Update in the maintenance_logs table
        const { error } = await supabase
          .from('maintenance_logs')
          .update({ status: newStatus })
          .eq('id', log.id);

        if (error) throw error;
      }

      Alert.alert('Success', `Status updated to ${statusOptions.find(s => s.value === newStatus)?.label || newStatus}`);

      // Update the local log object for immediate UI feedback
      log.status = newStatus;

      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const submitAdminComment = async () => {
    if (!adminComment.trim()) {
      Alert.alert('Error', 'Please enter a comment before submitting.');
      return;
    }

    setSubmittingComment(true);
    try {
      if (!log.id || log.id.startsWith('demo-') || log.id.startsWith('error-')) {
        Alert.alert('Info', 'Cannot add comments to demo or error entries. This would work with real data.');
        setSubmittingComment(false);
        return;
      }

      // Check if it's a legacy feedback entry
      if (log.id.startsWith('feedback-')) {
        // Update reply in the old feedback table
        const { error } = await supabase
          .from('feedback')
          .update({
            reply: adminComment.trim(),
            has_unread_reply: true,
            status: 'resolved' // Automatically mark as resolved when admin replies
          })
          .eq('id', log.id.replace('feedback-', ''));

        if (error) throw error;

        // Update local log object
        log.legacyReply = adminComment.trim();
        log.status = 'resolved';
      } else {
        // For maintenance_logs, we could add a comments field or create a separate comments table
        // For now, let's add a simple admin_comment field update
        const { error } = await supabase
          .from('maintenance_logs')
          .update({
            admin_comment: adminComment.trim(),
            status: log.status === 'open' ? 'in_progress' : log.status // Move to in_progress if it was open
          })
          .eq('id', log.id);

        if (error) throw error;

        // Update local log object
        log.admin_comment = adminComment.trim();
        if (log.status === 'open') {
          log.status = 'in_progress';
        }
      }

      Alert.alert('Success', 'Comment added successfully!');
      setAdminComment('');
      setShowCommentSection(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

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
                {log.isLegacy && (
                  <View style={styles.legacyBadge}>
                    <Text style={styles.legacyBadgeText}>LEGACY</Text>
                  </View>
                )}
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

        {/* Star Rating - Legacy Feedback */}
        {log.isLegacy && log.device_info?.rating && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Rating</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= log.device_info.rating ? "star" : "star-outline"}
                    size={24}
                    color="#FBC02D"
                    style={styles.star}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {log.device_info.rating} out of 5 stars
              </Text>
            </View>
          </View>
        )}

        {/* Admin Reply - Legacy Feedback */}
        {log.isLegacy && log.legacyReply && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Admin Response</Text>
            <View style={styles.adminReplyContainer}>
              <View style={styles.adminReplyHeader}>
                <Ionicons name="chatbubble-outline" size={20} color="#2196F3" />
                <Text style={styles.adminReplyLabel}>Admin replied:</Text>
              </View>
              <Text style={styles.adminReplyText}>{log.legacyReply}</Text>
            </View>
          </View>
        )}

        {/* Admin Comment - New Maintenance Logs */}
        {!log.isLegacy && log.admin_comment && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Admin Comment</Text>
            <View style={styles.adminReplyContainer}>
              <View style={styles.adminReplyHeader}>
                <Ionicons name="chatbubble-outline" size={20} color="#2196F3" />
                <Text style={styles.adminReplyLabel}>Admin commented:</Text>
              </View>
              <Text style={styles.adminReplyText}>{log.admin_comment}</Text>
            </View>
          </View>
        )}

        {/* Admin Comment Input Section */}
        {profile?.role === 'admin' && !log.legacyReply && !log.admin_comment && (
          <View style={styles.card}>
            <View style={styles.commentHeader}>
              <Text style={styles.cardTitle}>Add Admin Comment</Text>
              <TouchableOpacity
                onPress={() => setShowCommentSection(!showCommentSection)}
                style={styles.toggleButton}
              >
                <Ionicons
                  name={showCommentSection ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#607D8B"
                />
              </TouchableOpacity>
            </View>

            {showCommentSection && (
              <View style={styles.commentInputSection}>
                <TextInput
                  style={styles.commentInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Add your comment or response..."
                  placeholderTextColor="#90A4AE"
                  value={adminComment}
                  onChangeText={setAdminComment}
                  textAlignVertical="top"
                />

                <View style={styles.commentActions}>
                  <TouchableOpacity
                    style={styles.cancelCommentBtn}
                    onPress={() => {
                      setShowCommentSection(false);
                      setAdminComment('');
                    }}
                  >
                    <Text style={styles.cancelCommentText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitCommentBtn, { opacity: submittingComment ? 0.6 : 1 }]}
                    onPress={submitAdminComment}
                    disabled={submittingComment}
                  >
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.submitCommentText}>
                      {submittingComment ? 'Sending...' : 'Send Comment'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
            <Ionicons name="person-outline" size={20} color="#607D8B" />
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
              <Ionicons name="folder-outline" size={20} color="#607D8B" />
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{log.category}</Text>
            </View>
          )}

          {log.device_info && !log.device_info.legacy && (
            <View style={styles.infoRow}>
              <Ionicons name="phone-portrait-outline" size={20} color="#607D8B" />
              <Text style={styles.infoLabel}>Device:</Text>
              <Text style={styles.infoValue}>
                {log.device_info.platform} {log.device_info.platformVersion}
                {log.device_info.screenDimensions &&
                  ` (${log.device_info.screenDimensions.width}x${log.device_info.screenDimensions.height})`
                }
              </Text>
            </View>
          )}

          {log.device_info?.legacy && (
            <View style={styles.infoRow}>
              <Ionicons name="archive-outline" size={20} color="#607D8B" />
              <Text style={styles.infoLabel}>Source:</Text>
              <Text style={styles.infoValue}>Legacy Feedback System</Text>
            </View>
          )}
        </View>

        {/* Admin Actions */}
        {profile?.role === 'admin' && (
          <View style={styles.actionCard}>
            <Text style={styles.cardTitle}>Admin Actions</Text>
            <TouchableOpacity
              style={[styles.actionBtn, styles.updateBtn]}
              onPress={() => setShowStatusModal(true)}
              disabled={updating}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>
                {updating ? 'Updating...' : 'Update Status'}
              </Text>
            </TouchableOpacity>
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

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Status</Text>
              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Current status: <Text style={styles.currentStatus}>{getStatusConfig(log.status).label}</Text>
            </Text>

            <View style={styles.statusOptions}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    { backgroundColor: option.bgColor },
                    log.status === option.value && styles.currentStatusOption
                  ]}
                  onPress={() => updateStatus(option.value)}
                  disabled={updating || log.status === option.value}
                >
                  <View style={styles.statusOptionContent}>
                    <Ionicons name={option.icon} size={24} color={option.color} />
                    <Text style={[styles.statusOptionText, { color: option.color }]}>
                      {option.label}
                    </Text>
                    {log.status === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color={option.color} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  updateBtn: {
    backgroundColor: '#607D8B',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Legacy feedback specific styles
  legacyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FF9800',
  },
  legacyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  star: {
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#546E7A',
  },
  adminReplyContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  adminReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  adminReplyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminReplyText: {
    fontSize: 15,
    color: '#1976D2',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  // Status Update Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#263238',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#546E7A',
    marginBottom: 20,
  },
  currentStatus: {
    fontWeight: '600',
    color: '#333',
  },
  statusOptions: {
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentStatusOption: {
    borderColor: '#607D8B',
    opacity: 0.7,
  },
  statusOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  // Admin Comment Styles
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  commentInputSection: {
    marginTop: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelCommentBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelCommentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  submitCommentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    gap: 8,
  },
  submitCommentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});