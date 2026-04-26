import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../icons/Icon';
import { useCandyTokens } from './candyTokens';

export default function StudentSectionTitle({ title, subtitle, iconName }) {
  const c = useCandyTokens();
  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {iconName ? (
          <View style={[styles.iconBadge, { backgroundColor: c.primaryLight }]}>
            <Icon name={iconName} size="md" color={c.primary} />
          </View>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text>
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
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    marginLeft: 2,
  },
});
