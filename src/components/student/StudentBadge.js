import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import c from './candyTokens';

const variantMap = {
  score:       { backgroundColor: c.score,       textColor: '#422006' },
  level:       { backgroundColor: c.level,        textColor: '#fff'    },
  achievement: { backgroundColor: c.achievement,  textColor: '#fff'    },
  tag:         { backgroundColor: c.primary,       textColor: '#fff'    },
};

export default function StudentBadge({ children, variant = 'tag' }) {
  const v = variantMap[variant] || variantMap.tag;
  return (
    <View style={[styles.pill, { backgroundColor: v.backgroundColor }]}>
      <Text style={[styles.label, { color: v.textColor }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#fff',
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
