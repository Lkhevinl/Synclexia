import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import Icon from '../icons/Icon';
import { useCandyTokens } from './candyTokens';

export default function StudentActivityCard({ 
  title, 
  description, 
  tag, 
  iconName, 
  iconSource, 
  imageSource, 
  illustrationSource,
  onPress, 
  accentColor,
  variant = 'default'
}) {
  const c = useCandyTokens();
  const accent = accentColor || c.primary;
  
  if (variant === 'featured') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={featuredStyles.outer}>
        <View style={[featuredStyles.card, { backgroundColor: c.primaryLight }]}>
          <View style={featuredStyles.topRow}>
            <View style={[featuredStyles.iconCircle, { backgroundColor: accent }]}>
              {iconSource ? (
                <Image source={iconSource} style={featuredStyles.iconImage} resizeMode="contain" />
              ) : (
                <Icon name={iconName || 'star'} size="md" color="#fff" />
              )}
            </View>
            <View style={[featuredStyles.arrowCircle, { backgroundColor: accent + '20' }]}>
              <Icon name="arrow-up-right" size="md" color={accent} />
            </View>
          </View>
          <View style={featuredStyles.contentRow}>
            <View style={featuredStyles.textContainer}>
              {tag ? (
                <View style={[featuredStyles.tagPill, { backgroundColor: accent + '15' }]}>
                  <Text style={[featuredStyles.tagText, { color: accent }]}>{tag}</Text>
                </View>
              ) : null}
              <Text style={[featuredStyles.title, { color: c.text }]}>{title}</Text>
              <Text style={[featuredStyles.desc, { color: c.textMuted }]}>{description}</Text>
            </View>
            {illustrationSource && (
              <Image source={illustrationSource} style={featuredStyles.illustration} resizeMode="contain" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={defaultStyles.outer}>
      <View style={[defaultStyles.card, { backgroundColor: accent + '14', borderColor: accent + '38' }]}>
        <View style={defaultStyles.row}>
          <View style={[defaultStyles.iconBox, { backgroundColor: accent }]}>
            {imageSource ? (
              <Image source={imageSource} style={defaultStyles.iconImage} resizeMode="contain" />
            ) : (
              <Icon name={iconName} size="lg" color="#fff" />
            )}
          </View>

          <View style={defaultStyles.body}>
            {tag ? (
              <View style={[defaultStyles.tagPill, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
                <Text style={[defaultStyles.tagText, { color: accent }]}>{tag}</Text>
              </View>
            ) : null}
            <Text style={[defaultStyles.title, { color: c.text }]}>{title}</Text>
            <Text style={[defaultStyles.desc, { color: c.textMuted }]} numberOfLines={2}>{description}</Text>
          </View>

          <View style={[defaultStyles.arrow, { backgroundColor: accent + '28' }]}>
            <Icon name="chevron-forward" size="md" color={accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const featuredStyles = StyleSheet.create({
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
    padding: 16,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 28,
    height: 28,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
  },
  illustration: {
    width: 120,
    height: 100,
  },
});

const defaultStyles = StyleSheet.create({
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
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
