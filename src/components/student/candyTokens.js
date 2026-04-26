import { useTheme } from '../../context/ThemeContext';

const darkenHex = (hex, factor = 0.18) => {
  const h = (hex || '#888888').replace('#', '');
  if (h.length < 6) return hex;
  const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * (1 - factor)));
  const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * (1 - factor)));
  const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * (1 - factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const useCandyTokens = () => {
  const { colors } = useTheme();
  return {
    primary:         colors.primary,
    primaryDark:     darkenHex(colors.primary, 0.18),
    primaryLight:    colors.primaryLight,
    score:           '#facc15',
    scoreDark:       '#ca8a04',
    level:           '#22d3ee',
    levelDark:       '#0891b2',
    achievement:     '#c084fc',
    achievementDark: '#7c3aed',
    success:         '#4CAF50',
    successDark:     '#388E3C',
    surface:         colors.surfaceCard,
    bg:              colors.surface,
    text:            colors.onSurface,
    textMuted:       colors.onSurfaceMuted,
  };
};

const candyTokens = {
  primary:          '#E8927C',
  primaryDark:      '#D4745E',
  primaryLight:     '#FFF0E8',
  score:            '#facc15',
  scoreDark:        '#ca8a04',
  level:            '#22d3ee',
  levelDark:        '#0891b2',
  achievement:      '#c084fc',
  achievementDark:  '#7c3aed',
  success:          '#4CAF50',
  successDark:      '#388E3C',
  surface:          '#ffffff',
  bg:               '#FAF5F1',
  text:             '#222222',
  textMuted:        '#777777',
};

export default candyTokens;
