import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import {
  BarChart,
  StatCard,
  ProgressBar,
  MetricRow,
  SectionHeader,
} from '../../components/AnalyticsChart';
import {
  getComprehensiveAnalytics,
  exportAnalyticsCSV,
  exportAnalyticsJSON,
  formatActivityType,
} from '../../lib/analyticsHelper';

export default function AdminReportsScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState('overview'); // overview, progress, performance, engagement, trends
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await getComprehensiveAnalytics(dateRange);
    setAnalytics(data);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const handleExportCSV = async () => {
    if (!analytics) return;
    const csvData = exportAnalyticsCSV(analytics);
    if (Platform.OS === 'web') {
      // Download as file on web
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      await Share.share({
        message: csvData,
        title: 'Analytics Report (CSV)',
      });
    }
  };

  const handleExportJSON = async () => {
    if (!analytics) return;
    const jsonData = exportAnalyticsJSON(analytics);
    await Share.share({
      message: jsonData,
      title: 'Analytics Report (JSON)',
    });
  };

  const renderTabButton = (value, label, icon) => {
    const isActive = tab === value;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.tabBtn, isActive && styles.tabBtnActive]}
        onPress={() => setTab(value)}
      >
        <Ionicons name={icon} size={20} color={isActive ? '#fff' : '#607D8B'} />
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderDateRangeButton = (days, label) => {
    const isActive = dateRange === days;
    return (
      <TouchableOpacity
        key={days}
        style={[styles.dateBtn, isActive && styles.dateBtnActive]}
        onPress={() => setDateRange(days)}
      >
        <Text style={[styles.dateText, isActive && styles.dateTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderOverviewTab = () => (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.tabContent}
    >
      <StatCard
        title="Total Sessions"
        value={analytics.overview.totalSessions}
        subtitle={`${analytics.overview.activeStudents} active students`}
        icon="flash"
        color="#4CAF50"
      />
      <StatCard
        title="Average Accuracy"
        value={`${analytics.overview.avgAccuracy.toFixed(1)}%`}
        subtitle="Across all activities"
        icon="star"
        color="#2196F3"
      />
      <StatCard
        title="Completion Rate"
        value={`${analytics.overview.completionRate.toFixed(1)}%`}
        subtitle={`${analytics.overview.completedActivities} completed`}
        icon="checkmark-circle"
        color="#FF9800"
      />
    </ScrollView>
  );

  const renderProgressTab = () => {
    const renderStudentItem = ({ item }) => (
      <View style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentInitial}>
              {item.full_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.full_name || 'Unknown'}</Text>
            <Text style={styles.studentEmail}>{item.email || 'No email'}</Text>
          </View>
          {item.streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color="#FF5722" />
              <Text style={styles.streakText}>{item.streak}d</Text>
            </View>
          )}
        </View>

        <View style={styles.studentMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Sessions</Text>
            <Text style={styles.metricValue}>{item.totalSessions}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Accuracy</Text>
            <Text style={styles.metricValue}>{item.avgAccuracy.toFixed(1)}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total XP</Text>
            <Text style={styles.metricValue}>{item.totalXP}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <ProgressBar
            progress={item.avgAccuracy}
            color={item.avgAccuracy >= 80 ? '#4CAF50' : item.avgAccuracy >= 50 ? '#FF9800' : '#F44336'}
          />
        </View>

        <Text style={styles.lastActive}>
          Last active: {new Date(item.lastActive).toLocaleDateString()}
        </Text>
      </View>
    );

    return (
      <FlatList
        data={analytics?.students || []}
        keyExtractor={(item) => item.id}
        renderItem={renderStudentItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.tabContent}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No Student Data"
            message="No student activity found for the selected period."
          />
        }
      />
    );
  };

  const renderPerformanceTab = () => (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.tabContent}
    >
      <SectionHeader icon="bar-chart" title="Activity Breakdown" color="#607D8B" />

      {analytics.activityPerformance.length > 0 ? (
        <>
          <BarChart
            data={analytics.activityPerformance.map((a) => ({
              label: formatActivityType(a.activityType),
              value: a.totalSessions,
            }))}
            maxValue={Math.max(...analytics.activityPerformance.map((a) => a.totalSessions))}
            color="#0288D1"
          />

          <View style={styles.performanceList}>
            {analytics.activityPerformance.map((activity, index) => (
              <View key={index} style={styles.performanceCard}>
                <Text style={styles.performanceTitle}>
                  {formatActivityType(activity.activityType)}
                </Text>
                <MetricRow
                  icon="flash"
                  label="Sessions"
                  value={activity.totalSessions}
                  color="#0288D1"
                />
                <MetricRow
                  icon="star"
                  label="Avg Accuracy"
                  value={`${activity.avgAccuracy.toFixed(1)}%`}
                  color={activity.avgAccuracy >= 80 ? '#4CAF50' : '#FF9800'}
                />
                <MetricRow
                  icon="trophy"
                  label="Total XP"
                  value={activity.totalXP}
                  color="#FF9800"
                />
                <MetricRow
                  icon="checkmark-circle"
                  label="Completion"
                  value={`${activity.completionRate.toFixed(1)}%`}
                  color="#4CAF50"
                />
              </View>
            ))}
          </View>
        </>
      ) : (
        <EmptyState
          icon="bar-chart-outline"
          title="No Performance Data"
          message="No activity performance data available."
        />
      )}
    </ScrollView>
  );

  const renderEngagementTab = () => (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.tabContent}
    >
      <SectionHeader icon="time" title="Peak Activity Hours" color="#607D8B" />
      {analytics.engagement.peakHours.length > 0 ? (
        <BarChart
          data={analytics.engagement.peakHours.map((h) => ({
            label: `${h.hour}:00`,
            value: h.count,
          }))}
          maxValue={Math.max(...analytics.engagement.peakHours.map((h) => h.count))}
          color="#FF9800"
        />
      ) : (
        <Text style={styles.noData}>No peak hour data available</Text>
      )}

      <SectionHeader icon="stats-chart" title="Engagement Metrics" color="#607D8B" />
      <View style={styles.engagementMetrics}>
        <StatCard
          title="Avg Session Duration"
          value={`${Math.floor(analytics.engagement.avgSessionDuration / 60)}m`}
          subtitle={`${analytics.engagement.avgSessionDuration % 60}s`}
          icon="time"
          color="#607D8B"
        />
        <StatCard
          title="Session Frequency"
          value={analytics.engagement.sessionFrequency.toFixed(1)}
          subtitle="Sessions per student"
          icon="repeat"
          color="#9C27B0"
        />
        <StatCard
          title="Active Students"
          value={analytics.engagement.totalActiveStudents}
          subtitle={`In last ${dateRange} days`}
          icon="people"
          color="#00BCD4"
        />
      </View>
    </ScrollView>
  );

  const renderTrendsTab = () => (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.tabContent}
    >
      <SectionHeader icon="trending-up" title={`Daily Activity (Last ${dateRange} days)`} color="#607D8B" />

      {analytics.trends.daily.length > 0 ? (
        <>
          <BarChart
            data={analytics.trends.daily.slice(-14).map((d) => ({
              label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: d.sessions,
            }))}
            maxValue={Math.max(...analytics.trends.daily.map((d) => d.sessions))}
            color="#9C27B0"
          />

          <SectionHeader icon="pulse" title="Daily Metrics" color="#607D8B" />
          <FlatList
            data={analytics.trends.daily.slice(0, 10)}
            keyExtractor={(item) => item.date}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.trendCard}>
                <Text style={styles.trendDate}>
                  {new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <MetricRow icon="flash" label="Sessions" value={item.sessions} color="#9C27B0" />
                <MetricRow
                  icon="star"
                  label="Avg Accuracy"
                  value={`${item.avgAccuracy.toFixed(1)}%`}
                  color="#2196F3"
                />
                <MetricRow icon="trophy" label="Total XP" value={item.totalXP} color="#FF9800" />
              </View>
            )}
          />
        </>
      ) : (
        <EmptyState
          icon="trending-up-outline"
          title="No Trend Data"
          message="Not enough data to show trends."
        />
      )}
    </ScrollView>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#607D8B" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      );
    }

    if (!analytics) {
      return (
        <EmptyState icon="analytics-outline" title="No Data" message="Unable to load analytics." />
      );
    }

    switch (tab) {
      case 'overview':
        return renderOverviewTab();
      case 'progress':
        return renderProgressTab();
      case 'performance':
        return renderPerformanceTab();
      case 'engagement':
        return renderEngagementTab();
      case 'trends':
        return renderTrendsTab();
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper role="admin" padded={false} edges={['left', 'right', 'bottom']} style={{ backgroundColor: colors.surface }}>
      <AppHeader
        title="Reports & Analytics"
        right={
          <TouchableOpacity onPress={handleExportCSV} style={styles.exportBtn}>
            <Ionicons name="download-outline" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Date Range Selector */}
      <View style={styles.dateRangeContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRangeScroll}>
          {renderDateRangeButton(7, '7 Days')}
          {renderDateRangeButton(14, '14 Days')}
          {renderDateRangeButton(30, '30 Days')}
          {renderDateRangeButton(60, '60 Days')}
          {renderDateRangeButton(90, '90 Days')}
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {renderTabButton('overview', 'Overview', 'analytics')}
          {renderTabButton('progress', 'Progress', 'trending-up')}
          {renderTabButton('performance', 'Performance', 'bar-chart')}
          {renderTabButton('engagement', 'Engagement', 'people')}
          {renderTabButton('trends', 'Trends', 'pulse')}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderContent()}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  exportBtn: {
    padding: 4,
  },
  dateRangeContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateRangeScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  dateBtnActive: {
    backgroundColor: '#607D8B',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  dateTextActive: {
    color: '#fff',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  tabBtnActive: {
    backgroundColor: '#607D8B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#607D8B',
  },
  tabTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#90A4AE',
  },
  tabContent: {
    padding: 16,
    paddingBottom: 40,
  },
  noData: {
    textAlign: 'center',
    padding: 32,
    fontSize: 14,
    color: '#B0BEC5',
    fontStyle: 'italic',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0288D1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 13,
    color: '#90A4AE',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5722',
  },
  studentMetrics: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#90A4AE',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 8,
    fontWeight: '500',
  },
  lastActive: {
    fontSize: 12,
    color: '#B0BEC5',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  performanceList: {
    marginTop: 16,
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 12,
  },
  engagementMetrics: {
    marginTop: 8,
  },
  trendCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  trendDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#607D8B',
    marginBottom: 12,
  },
});
