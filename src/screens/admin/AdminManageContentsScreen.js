import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from '../../components/icons/Icon';
import { supabase } from '../../lib/supabase';
import { TABLES } from '../../lib/constants';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';

export default function AdminManageContentsScreen({ navigation }) {
  const { colors } = useTheme();
  const [contentStats, setContentStats] = useState({
    stories: 0,
    phonics: 0,
    spelling: 0,
    phonicsActivities: 0,
    phonological: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContentStats();
  }, []);

  const fetchContentStats = async () => {
    try {
      const [stories, phonics, spelling, phonicsAct, phonological] = await Promise.all([
        supabase.from(TABLES.STORIES).select('id', { count: 'exact', head: true }),
        supabase.from(TABLES.PHONICS_ITEMS).select('id', { count: 'exact', head: true }),
        supabase.from(TABLES.SPELLING_WORDS).select('id', { count: 'exact', head: true }),
        supabase.from(TABLES.PHONICS_ACTIVITY_CONTENT).select('id', { count: 'exact', head: true }),
        supabase.from(TABLES.PHONOLOGICAL_ITEMS).select('id', { count: 'exact', head: true }),
      ]);

      setContentStats({
        stories: stories.count || 0,
        phonics: phonics.count || 0,
        spelling: spelling.count || 0,
        phonicsActivities: phonicsAct.count || 0,
        phonological: phonological.count || 0,
      });
    } catch (error) {
      // Set default values on error so UI still renders
      setContentStats({
        stories: 0,
        phonics: 0,
        spelling: 0,
        phonicsActivities: 0,
        phonological: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchContentStats();
  };

  const contentItems = [
    {
      id: 'stories',
      title: 'Reading Activity',
      subtitle: `${contentStats.stories} stories`,
      icon: 'pencil',
      bgColor: '#E1BEE7',
      route: 'AdminAddStory',
    },
    {
      id: 'phonics',
      title: 'Phonics Audio',
      subtitle: `${contentStats.phonics} items`,
      icon: 'mic',
      bgColor: '#B3E5FC',
      route: 'AdminPhonics',
    },
    {
      id: 'spelling',
      title: 'Spelling Words',
      subtitle: `${contentStats.spelling} words`,
      icon: 'type',
      bgColor: '#BBDEFB',
      route: 'AdminSpelling',
    },
    {
      id: 'phonicsActivities',
      title: 'Phonics Activity',
      subtitle: `${contentStats.phonicsActivities} activities`,
      icon: 'gamepad-2',
      bgColor: '#FFE0B2',
      route: 'AdminPhonicsActivity',
    },
    {
      id: 'phonological',
      title: 'Sound Game',
      subtitle: `${contentStats.phonological} items`,
      icon: 'headphones',
      bgColor: '#E1BEE7',
      route: 'AdminPhonological',
    },
  ];

  if (loading) {
    return (
      <ScreenWrapper role="admin" padded={false} edges={['left', 'right', 'bottom']} style={{ backgroundColor: colors.surface }}>
        <AppHeader title="Manage Contents" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#607D8B" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper role="admin" padded={false} edges={['left', 'right', 'bottom']} style={{ backgroundColor: colors.surface }}>
      <AppHeader title="Manage Contents" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#607D8B']} />
        }
      >
        {/* Stats Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Icon name="pie-chart" size="md" color="#607D8B" />
            <Text style={styles.summaryTitle}>Content Overview</Text>
          </View>
          <Text style={styles.summaryText}>
            Total Items: {Object.values(contentStats).reduce((sum, val) => sum + val, 0)}
          </Text>
        </View>

        {/* Content Type Cards */}
        <View style={styles.cardsContainer}>
          {contentItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.contentCard}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.contentIconWrapper, { backgroundColor: item.bgColor }]}>
                <Icon name={item.icon} size="md" color="#455A64" />
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size="md" color="#B0BEC5" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Icon name="info" size="md" color="#607D8B" />
          <Text style={styles.helpText}>
            Tap any content type to add, edit, or manage items
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#455A64',
    marginLeft: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#78909C',
  },
  cardsContainer: {
    gap: 12,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  contentIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentEmoji: {
    fontSize: 28,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 13,
    color: '#90A4AE',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    color: '#455A64',
    lineHeight: 18,
  },
});
