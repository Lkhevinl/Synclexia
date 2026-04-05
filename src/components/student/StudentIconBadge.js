import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import c from './candyTokens';

const variantMap = {
  score:       { backgroundColor: c.score,       textColor: '#422006', iconColor: '#422006' },
  level:       { backgroundColor: c.level,        textColor: '#fff',    iconColor: '#fff'    },
  achievement: { backgroundColor: c.achievement,  textColor: '#fff',    iconColor: '#fff'    },
  tag:         { backgroundColor: c.primary,       textColor: '#fff',    iconColor: '#fff'    },
};

export default function StudentIconBadge({ icon, label, variant = 'tag' }) {
  const v = variantMap[variant] || variantMap.tag;
  return (
    <View style={[styles.pill, { backgroundColor: v.backgroundColor }]}>
      <Ionicons name={icon} size={18} color={v.iconColor} />
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
    fontSize: 12,
    fontWeight: '700',
  },
});
