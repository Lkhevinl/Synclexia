import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../icons/Icon';
import { useCandyTokens } from './candyTokens';

export default function StudentIconBadge({ icon, label, variant = 'tag' }) {
  const c = useCandyTokens();
  const variantMap = {
    score:       { backgroundColor: c.score,       textColor: '#422006', iconColor: '#422006' },
    level:       { backgroundColor: c.level,       textColor: '#fff',    iconColor: '#fff'    },
    achievement: { backgroundColor: c.achievement, textColor: '#fff',    iconColor: '#fff'    },
    tag:         { backgroundColor: c.primary,     textColor: '#fff',    iconColor: '#fff'    },
  };
  const v = variantMap[variant] || variantMap.tag;
  return (
    <View style={[styles.pill, { backgroundColor: v.backgroundColor }]}>
      <Icon name={icon} size="sm" color={v.iconColor} />
      <Text style={[styles.label, { color: v.textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#fff',
    alignSelf: 'flex-start',
    gap: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
