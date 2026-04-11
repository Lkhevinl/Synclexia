// src/theme/tokens.js
const tokens = {
  spacing: {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
  },

  radius: {
    sm:   8,
    md:   12,
    lg:   20,
    xl:   28,
    full: 9999,
  },

  // Base font sizes — screens multiply by theme.fontSize scale factor via AppText
  fontSize: {
    xs:      11,
    sm:      13,
    md:      15,
    lg:      18,
    xl:      22,
    xxl:     28,
    display: 34,
  },

  breakpoints: {
    tablet:   600,
    tabletLg: 900,
  },

  shadows: {
    low: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.10,
      shadowRadius: 2,
    },
    mid: {
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 6,
    },
    high: {
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
    },
  },

  // Per-role accent colors — used for subtle role-identity tinting only
  roleAccents: {
    student: '#C06080',
    teacher: '#3b5998',
    admin:   '#192f6a',
    parent:  '#388E3C',
  },
};

export default tokens;
