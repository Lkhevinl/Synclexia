import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './icons/Icon';

/**
 * BarChart Component
 * Displays horizontal bar chart for data visualization
 */
export const BarChart = ({ data, maxValue, color = '#0288D1', height = 24 }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const max = maxValue || Math.max(...data.map(item => item.value));

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barItem}>
          <Text style={styles.barLabel} numberOfLines={1}>
            {item.label}
          </Text>
          <View style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  width: max > 0 ? `${(item.value / max) * 100}%` : '0%',
                  height: height,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

/**
 * TrendIndicator Component
 * Shows trend direction and percentage change
 */
export const TrendIndicator = ({ trend, label }) => {
  const isUp = trend > 0;
  const isFlat = trend === 0;
  const color = isUp ? '#4CAF50' : isFlat ? '#90A4AE' : '#F44336';

  return (
    <View style={styles.trendContainer}>
      <Icon
        name={isUp ? 'trending-up' : isFlat ? 'minus' : 'trending-down'}
        size="sm"
        color={color}
      />
      <Text style={[styles.trendText, { color }]}>
        {!isFlat && (isUp ? '+' : '')}{Math.abs(trend).toFixed(1)}%
      </Text>
      {label && <Text style={styles.trendLabel}>{label}</Text>}
    </View>
  );
};

/**
 * StatCard Component
 * Displays a metric card with icon, title, value, and optional subtitle
 */
export const StatCard = ({ title, value, subtitle, color = '#0288D1', icon }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size="md" color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

/**
 * ProgressBar Component
 * Shows a horizontal progress bar with percentage
 */
export const ProgressBar = ({ progress, color = '#4CAF50', height = 8 }) => {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBarBg, { height }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: color, height },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color }]}>{percentage.toFixed(0)}%</Text>
    </View>
  );
};

/**
 * MetricRow Component
 * Displays a row with label, value, and optional icon
 */
export const MetricRow = ({ icon, label, value, color = '#263238' }) => (
  <View style={styles.metricRow}>
    {icon && (
      <View style={styles.metricIcon}>
        <Icon name={icon} size="sm" color={color} />
      </View>
    )}
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

/**
 * SectionHeader Component
 * Displays a section header with icon and title
 */
export const SectionHeader = ({ icon, title, color = '#607D8B' }) => (
  <View style={styles.sectionHeader}>
    <Icon name={icon} size="md" color={color} />
    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  // BarChart styles
  chartContainer: {
    marginVertical: 8,
  },
  emptyChart: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#B0BEC5',
    fontStyle: 'italic',
  },
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  barLabel: {
    fontSize: 13,
    color: '#546E7A',
    fontWeight: '500',
    width: 100,
  },
  barWrapper: {
    flex: 1,
    backgroundColor: '#ECEFF1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 6,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#263238',
    width: 45,
    textAlign: 'right',
  },

  // TrendIndicator styles
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '700',
  },
  trendLabel: {
    fontSize: 12,
    color: '#78909C',
    marginLeft: 4,
  },

  // StatCard styles
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statTitle: {
    fontSize: 13,
    color: '#78909C',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 2,
  },

  // ProgressBar styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    backgroundColor: '#ECEFF1',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 10,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    width: 45,
    textAlign: 'right',
  },

  // MetricRow styles
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  metricIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    flex: 1,
    fontSize: 14,
    color: '#546E7A',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
  },

  // SectionHeader styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#ECEFF1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});
