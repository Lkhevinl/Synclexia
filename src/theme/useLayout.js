// src/theme/useLayout.js
import { useWindowDimensions } from 'react-native';
import tokens from './tokens';

/**
 * Returns layout-aware values based on current screen width.
 * isTablet     — true when width >= tokens.breakpoints.tablet (600)
 * contentWidth — usable content width (capped at 720 on tablet)
 * columns      — 1 on mobile, 2 on tablet (for admin/teacher grids)
 */
export default function useLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= tokens.breakpoints.tablet;
  const contentWidth = isTablet ? Math.min(width, 720) : width;
  const columns = isTablet ? 2 : 1;
  return { isTablet, contentWidth, columns };
}
