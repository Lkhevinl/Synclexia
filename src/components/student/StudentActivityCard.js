import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import Icon from '../icons/Icon';
import c from './candyTokens';

export default function StudentActivityCard({ title, description, tag, iconName, imageSource, onPress, accentColor }) {
  const accent = accentColor || c.primary;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.outer}>
      <View style={[styles.card, { backgroundColor: accent + '14', borderColor: accent + '38' }]}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: accent }]}>
            {imageSource ? (
              <Image source={imageSource} style={styles.iconImage} resizeMode="contain" />
            ) : (
              <Icon name={iconName} size="lg" color="#fff" />
            )}
          </View>

          <View style={styles.body}>
            {tag ? (
              <View style={[styles.tagPill, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
                <Text style={[styles.tagText, { color: accent }]}>{tag}</Text>
              </View>
            ) : null}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc} numberOfLines={2}>{description}</Text>
          </View>

          <View style={[styles.arrow, { backgroundColor: accent + '28' }]}>
            <Icon name="chevron-forward" size="md" color={accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  tagPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: c.text,
  },
  desc: {
    fontSize: 12,
    color: c.textMuted,
    lineHeight: 17,
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
