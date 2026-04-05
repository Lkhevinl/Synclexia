import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import c from './candyTokens';

export default function StudentSectionTitle({ title, subtitle, iconName }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {iconName ? (
          <View style={styles.iconBadge}>
            <Ionicons name={iconName} size={20} color={c.primary} />
          </View>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: c.text,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: c.textMuted,
    marginTop: 2,
    marginLeft: 2,
  },
});
