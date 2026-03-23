import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

export default function MaintenanceLogsScreen({ navigation }) {
  const { profile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [selectedFilter, logs]);

  const fetchLogs = async () => {
    try {
      console.log('Fetching maintenance logs and legacy feedback...');

      // Fetch from new maintenance_logs table
      let { data: maintenanceLogs, error: maintenanceError } = await supabase
        .from('maintenance_logs')
        .select(`
          *,
          performed_by_profile:performed_by (full_name),
          reported_by_profile:reported_by (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // If relationship query fails, try simple query
      if (maintenanceError && maintenanceError.code === 'PGRST200') {
        console.log('Foreign key relationship failed for maintenance_logs, trying simple query...');
        ({ data: maintenanceLogs, error: maintenanceError } = await supabase
          .from('maintenance_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100));
      }

      // Fetch from legacy feedback table
      let { data: legacyFeedback, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          *,
          profiles:user_id (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // If relationship query fails for feedback, try simple query
      if (feedbackError && feedbackError.code === 'PGRST200') {
        console.log('Foreign key relationship failed for feedback, trying simple query...');
        ({ data: legacyFeedback, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100));
      }

      // Transform legacy feedback to maintenance log format
      const transformedFeedback = (legacyFeedback || []).map(feedback => ({
        id: `feedback-${feedback.id}`,
        log_type: 'user_concern',
        title: feedback.rating
          ? `App Rating: ${feedback.rating} star${feedback.rating > 1 ? 's' : ''}`
          : 'User Feedback',
        description: feedback.message || `User rated the app ${feedback.rating} out of 5 stars.`,
        status: feedback.status || 'open',
        priority: feedback.rating && feedback.rating <= 2 ? 'high' :
                 feedback.rating && feedback.rating <= 3 ? 'medium' : 'low',
        category: 'legacy_feedback',
        reproduction_steps: null,
        device_info: { rating: feedback.rating, legacy: true },
        performed_by: null,
        performed_by_profile: null,
        reported_by: feedback.user_id,
        reported_by_profile: feedback.profiles || null,
        reporter_role: feedback.profiles?.role || 'user',
        created_at: feedback.created_at,
        updated_at: feedback.updated_at || feedback.created_at,
        // Mark as legacy for UI distinction
        isLegacy: true,
        legacyReply: feedback.reply
      }));

      // Combine both data sources
      const allLogs = [
        ...(maintenanceLogs || []),
        ...transformedFeedback
      ];

      // Sort combined results by creation date (newest first)
      allLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      console.log(`Loaded ${maintenanceLogs?.length || 0} maintenance logs and ${transformedFeedback.length} legacy feedback entries`);

      if (allLogs.length === 0 && (maintenanceError?.code === '42P01' || feedbackError?.code === '42P01')) {
        console.log('Tables do not exist, showing demo data...');
        setLogs([
          {
            id: 'demo-1',
            log_type: 'system_update',
            title: 'Maintenance Logs System Setup',
            description: 'Please run the database migration to create the maintenance_logs table. This system will track all user feedback and maintenance activities.',
            status: 'open',
            priority: 'high',
            category: 'system',
            created_at: new Date().toISOString(),
            performed_by_profile: { full_name: 'System' },
            performed_by: 'system',
            reported_by: profile?.id || 'demo-user',
            reporter_role: profile?.role || 'admin'
          },
          {
            id: 'demo-2',
            log_type: 'user_concern',
            title: 'Sample User Feedback',
            description: 'This is an example of how user feedback and concerns will appear in the system. Users can report issues, bugs, and provide suggestions.',
            status: 'open',
            priority: 'medium',
            category: 'feedback',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            reported_by_profile: { full_name: profile?.full_name || 'Demo User' },
            reported_by: profile?.id || 'demo-user',
            reporter_role: profile?.role || 'student'
          },
          {
            id: 'demo-3',
            log_type: 'bug_report',
            title: 'Example Bug Report',
            description: 'This demonstrates how bug reports from learners and parents will be tracked and managed.',
            status: 'open',
            priority: 'high',
            category: 'navigation',
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            reported_by_profile: { full_name: 'Demo Parent' },
            reported_by: 'demo-parent',
            reporter_role: 'parent'
          }
        ]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (maintenanceError && feedbackError) {
        console.error('Error fetching both maintenance logs and feedback:', { maintenanceError, feedbackError });
        throw maintenanceError || feedbackError;
      }

      setLogs(allLogs);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching maintenance logs and feedback:', error);
      // Show user-friendly error state with multiple sample logs
      setLogs([
        {
          id: 'error-1',
          log_type: 'system_update',
          title: 'Database Setup Required',
          description: 'The maintenance logs system needs to be initialized. Please run the database migration in the SQL editor to enable full functionality.',
          status: 'open',
          priority: 'high',
          category: 'system',
          created_at: new Date().toISOString(),
          performed_by_profile: { full_name: 'System' },
          performed_by: 'system',
          reported_by: profile?.id || 'demo-user',
          reporter_role: profile?.role || 'admin'
        },
        {
          id: 'error-2',
          log_type: 'user_concern',
          title: 'Legacy Feedback Loading Issue',
          description: 'Unable to load legacy feedback data. Please check database connectivity and try refreshing.',
          status: 'open',
          priority: 'medium',
          category: 'demo',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          reported_by_profile: { full_name: profile?.full_name || 'Current User' },
          reported_by: profile?.id || 'demo-user',
          reporter_role: profile?.role || 'student'
        }
      ]);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    switch (selectedFilter) {
      case 'admin':
        filtered = logs.filter(log =>
          ['system_update', 'bug_fix', 'feature_added', 'database_change'].includes(log.log_type)
        );
        break;
      case 'user_feedback':
        filtered = logs.filter(log =>
          ['user_concern', 'bug_report', 'parent_feedback', 'learner_issue', 'ui_problem', 'content_issue', 'performance_issue', 'legacy_feedback'].includes(log.log_type) ||
          log.category === 'legacy_feedback'
        );
        break;
      case 'my_reports':
        filtered = logs.filter(log => log.reported_by === profile?.id);
        break;
      case 'open':
        filtered = logs.filter(log => log.status === 'open');
        break;
      case 'critical':
        filtered = logs.filter(log => log.priority === 'critical' || log.priority === 'high');
        break;
      default:
        filtered = logs;
    }

    setFilteredLogs(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const getLogTypeConfig = (type) => {
    const configs = {
      // Admin types
      system_update: { icon: 'rocket', color: '#2196F3', label: 'System Update', bgColor: '#E3F2FD' },
      bug_fix: { icon: 'checkmark-done', color: '#4CAF50', label: 'Bug Fix', bgColor: '#E8F5E8' },
      feature_added: { icon: 'star', color: '#FF9800', label: 'Feature Added', bgColor: '#FFF3E0' },
      database_change: { icon: 'server', color: '#9C27B0', label: 'Database Change', bgColor: '#F3E5F5' },

      // User feedback types
      user_concern: { icon: 'chatbubble-ellipses', color: '#00BCD4', label: 'User Concern', bgColor: '#E0F7FA' },
      bug_report: { icon: 'warning', color: '#F44336', label: 'Bug Report', bgColor: '#FFEBEE' },
      parent_feedback: { icon: 'people', color: '#673AB7', label: 'Parent Feedback', bgColor: '#EDE7F6' },
      learner_issue: { icon: 'school', color: '#FF5722', label: 'Learning Issue', bgColor: '#FBE9E7' },
      ui_problem: { icon: 'phone-portrait', color: '#795548', label: 'Interface Problem', bgColor: '#EFEBE9' },
      content_issue: { icon: 'document-text', color: '#607D8B', label: 'Content Issue', bgColor: '#ECEFF1' },
      performance_issue: { icon: 'speedometer', color: '#E91E63', label: 'Performance Issue', bgColor: '#FCE4EC' },

      // Legacy feedback type
      legacy_feedback: { icon: 'archive', color: '#795548', label: 'Legacy Feedback', bgColor: '#EFEBE9' },
    };
    return configs[type] || { icon: 'information-circle', color: '#9E9E9E', label: 'General', bgColor: '#F5F5F5' };
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
      low: { label: 'Low', color: '#4CAF50' },
      medium: { label: 'Medium', color: '#FF9800' },
      high: { label: 'High', color: '#FF5722' },
      critical: { label: 'Critical', color: '#F44336' },
    };
    return configs[priority] || configs.medium;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFilterOptions = () => {
    const baseOptions = [
      { key: 'all', label: 'All', icon: 'list' },
      { key: 'admin', label: 'Admin', icon: 'settings' },
      { key: 'user_feedback', label: 'Feedback', icon: 'chatbubbles' },
      { key: 'open', label: 'Open', icon: 'alert-circle' },
      { key: 'critical', label: 'Critical', icon: 'warning' },
    ];

    // Add "My Reports" option for all users (not just admins)
    if (profile?.id) {
      baseOptions.splice(3, 0, { key: 'my_reports', label: 'My Reports', icon: 'person' });
    }

    return baseOptions;
  };

  const renderFilterButton = (filter) => {
    const isSelected = selectedFilter === filter.key;
    return (
      <TouchableOpacity
        key={filter.key}
        style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
        onPress={() => setSelectedFilter(filter.key)}
      >
        <Ionicons
          name={filter.icon}
          size={14}
          color={isSelected ? '#fff' : '#607D8B'}
          style={styles.filterIcon}
        />
        <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderLogItem = ({ item }) => {
    const typeConfig = getLogTypeConfig(item.log_type);
    const statusConfig = getStatusConfig(item.status);
    const priorityConfig = getPriorityConfig(item.priority);
    const performedBy = item.performed_by_profile?.full_name || (item.reported_by_profile?.full_name || 'System');

    return (
      <TouchableOpacity
        style={styles.logCard}
        onPress={() => {
          // Navigate to detail screen to show full log information
          navigation.navigate('MaintenanceLogDetail', { log: item });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.logHeader}>
          <View style={[styles.logIconBadge, { backgroundColor: typeConfig.bgColor }]}>
            <Ionicons name={typeConfig.icon} size={20} color={typeConfig.color} />
          </View>
          <View style={styles.logHeaderText}>
            <View style={styles.logTitleRow}>
              <Text style={styles.logTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.priority && (
                <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
              )}
            </View>
            <View style={styles.logMeta}>
              <View style={[styles.typeBadge, { backgroundColor: typeConfig.color }]}>
                <Text style={styles.typeBadgeText}>{typeConfig.label}</Text>
              </View>
              {item.isLegacy && (
                <View style={styles.legacyBadge}>
                  <Text style={styles.legacyBadgeText}>LEGACY</Text>
                </View>
              )}
              {(item.admin_comment || item.legacyReply) && (
                <View style={styles.commentBadge}>
                  <Ionicons name="chatbubble" size={10} color="#4CAF50" />
                  <Text style={styles.commentBadgeText}>REPLIED</Text>
                </View>
              )}
              <Text style={styles.logDate}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
        </View>

        {item.description && (
          <Text style={styles.logDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {/* Enhanced footer with status and category */}
        <View style={styles.logFooter}>
          <View style={styles.logFooterLeft}>
            <Ionicons name="person-outline" size={14} color="#90A4AE" />
            <Text style={styles.logPerformer}>{performedBy}</Text>
            {item.category && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.categoryTag}>{item.category}</Text>
              </>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="System Maintenance"
          colors={['#607D8B', '#455A64']}
          rightIcon={profile?.id ? 'add' : null}
          rightAction={() => navigation?.navigate('AddMaintenanceLog')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#607D8B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="System Maintenance"
        colors={['#607D8B', '#455A64']}
        rightIcon={profile?.id ? 'add' : null}
        rightAction={() => navigation?.navigate('AddMaintenanceLog')}
      />

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{logs.length}</Text>
          <Text style={styles.statsLabel}>Total Logs</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>
            {logs.filter(log => log.status === 'open').length}
          </Text>
          <Text style={styles.statsLabel}>Open Issues</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>
            {logs.filter(log =>
              ['user_concern', 'bug_report', 'parent_feedback', 'learner_issue', 'legacy_feedback'].includes(log.log_type) ||
              log.category === 'legacy_feedback'
            ).length}
          </Text>
          <Text style={styles.statsLabel}>User Reports</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={getFilterOptions()}
          renderItem={({ item }) => renderFilterButton(item)}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Logs List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#607D8B']} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="construct-outline"
            title="No Maintenance Logs"
            message={
              selectedFilter === 'all'
                ? 'No maintenance activities recorded yet. Tap the + button to add your first entry.'
                : selectedFilter === 'my_reports'
                ? 'You haven\'t submitted any reports yet. Tap the + button to report an issue or provide feedback.'
                : selectedFilter === 'feedback'
                ? 'No user feedback received yet. Users can report issues and provide suggestions using this system.'
                : selectedFilter === 'open'
                ? 'All issues have been resolved! No open issues at the moment.'
                : selectedFilter === 'critical'
                ? 'No critical or high priority issues found.'
                : selectedFilter === 'admin'
                ? 'No admin maintenance logs found.'
                : `No ${getFilterOptions().find(f => f.key === selectedFilter)?.label.toLowerCase()} logs found.`
            }
            actionText={profile?.id ? 'Report Issue' : null}
            onAction={() => navigation?.navigate('AddMaintenanceLog')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#607D8B',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#90A4AE',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    gap: 6,
  },
  filterBtnActive: {
    backgroundColor: '#607D8B',
  },
  filterIcon: {
    marginRight: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#607D8B',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  logHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  logIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logHeaderText: {
    flex: 1,
  },
  logTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
    flex: 1,
    marginRight: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  legacyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  legacyBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#E8F5E9',
    gap: 3,
  },
  commentBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#4CAF50',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logDate: {
    fontSize: 12,
    color: '#90A4AE',
    fontWeight: '500',
  },
  logDescription: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
    marginBottom: 12,
  },
  logFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  logFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  logPerformer: {
    fontSize: 12,
    color: '#90A4AE',
    fontStyle: 'italic',
  },
  separator: {
    fontSize: 10,
    color: '#E0E0E0',
    marginHorizontal: 2,
  },
  categoryTag: {
    fontSize: 11,
    color: '#607D8B',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
