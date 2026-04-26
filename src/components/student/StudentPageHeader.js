import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../icons/Icon';
import { useNavigation } from '@react-navigation/native';
import { useCandyTokens } from './candyTokens';

export default function StudentPageHeader({ title, onBack, right, style }) {
  const navigation = useNavigation();
  const c = useCandyTokens();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  return (
    <View style={[styles.bar, style]}>
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.backBtn, { backgroundColor: c.primaryLight, borderColor: c.primary + '40', shadowColor: c.primary }]}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="chevron-left" size="md" color={c.primary} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>{title}</Text>

      <View style={styles.rightSlot}>
        {right ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  rightSlot: {
    width: 44,
    alignItems: 'center',
  },
});
