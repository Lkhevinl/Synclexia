import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { STORAGE_KEYS } from '../lib/constants';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import CustomButton from '../components/CustomButton';
import tokens from '../theme/tokens';

const ONBOARDING_KEY = STORAGE_KEYS.ONBOARDING_COMPLETE;

const onboardingData = [
  {
    id: '1',
    title: 'Dyslexia-Friendly Learning',
    description: 'Learn to read and write with tools made especially for kids with dyslexia—big letters, helpful sounds, and simple steps!',
    image: require('../../assets/13-removebg-preview.png'),
  },
  {
    id: '2',
    title: 'Make It Your Own!',
    description: 'Change colors, fonts, and sounds to match how you learn best. Your app, your way!',
    image: require('../../assets/10-removebg-preview.png'),
  },
  {
    id: '3',
    title: 'Learn Through Play',
    description: 'Play fun games that help you read, spell, and learn new words. Learning feels like playtime!',
    image: require('../../assets/12-removebg-preview.png'),
  },
  {
    id: '4',
    title: 'Track Your Progress with Parents',
    description: 'Your parents can see your achievements and cheer you on! Share your learning journey together.',
    image: require('../../assets/11-removebg-preview.png'),
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { colors } = useTheme();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const completeOnboarding = async () => {
    try { await AsyncStorage.setItem(ONBOARDING_KEY, 'true'); } catch (_) {}
  };

  const handleLogin = async () => {
    await completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleCreateAccount = async () => {
    await completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'SignUp' }] });
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.illustrationArea, { height: SCREEN_HEIGHT * 0.4 }]}>
        <Image source={item.image} style={styles.illustration} resizeMode="contain" />
      </View>
      <View style={styles.contentArea}>
        <AppText variant="display" style={[styles.title, { color: colors.onSurface }]}>{item.title}</AppText>
        <AppText variant="body" style={[styles.description, { color: colors.onSurfaceMuted }]}>{item.description}</AppText>
      </View>
    </View>
  );

  return (
    <ScreenWrapper padded={false}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
        style={styles.flatList}
      />

      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index
                  ? [styles.dotActive, { backgroundColor: colors.primary }]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <CustomButton title="Login" onPress={handleLogin} size="lg" style={styles.actionBtn} />
        <CustomButton title="Create an Account" onPress={handleCreateAccount} type="secondary" size="lg" style={styles.actionBtn} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flatList:   { flex: 1 },
  slide:      { paddingHorizontal: tokens.spacing.xl, paddingTop: 60 },

  illustrationArea: { justifyContent: 'center', alignItems: 'center' },
  illustration:     { width: '100%', height: '100%' },

  contentArea:  { alignItems: 'center', paddingTop: tokens.spacing.lg, paddingHorizontal: tokens.spacing.sm },
  title:        { textAlign: 'center', marginBottom: tokens.spacing.md },
  description:  { textAlign: 'center', lineHeight: 24 },

  bottomSection: { paddingHorizontal: tokens.spacing.xl, paddingBottom: tokens.spacing.xxl },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: tokens.spacing.lg },
  dot:           { height: 10, borderRadius: 5, marginHorizontal: 5 },
  dotActive:     { width: 25 },
  dotInactive:   { backgroundColor: '#D9D9D9', width: 10 },
  actionBtn:     { marginBottom: tokens.spacing.sm },
});
