/**
 * Patches react/jsx-runtime (used by Expo's automatic JSX transform) so that
 * every <Text> rendered anywhere in the app always has the current
 * accessibility styles (font family, letter spacing, dyslexia weight) appended
 * as the LAST entry in its style array.
 *
 * WHY react/jsx-runtime and NOT React.createElement:
 *   Expo SDK 47+ (and this project on SDK 54) uses the automatic JSX transform
 *   via babel-preset-expo. JSX compiles to:
 *     _jsx(Text, { style: ..., children: ... })
 *   where _jsx comes from 'react/jsx-runtime' — NOT from React.createElement.
 *   Patching React.createElement has zero effect on JSX-compiled code.
 *
 * WHY a11y styles go LAST:
 *   React Native resolves style arrays last-wins, so appending a11yStyleRef.current
 *   after the component's own style ensures it always takes priority.
 *
 * WHY patchType is safe:
 *   We only intercept when type === Text (the exact RN Text reference). Every
 *   other element type passes through untouched.
 *
 * IMPORTANT: This file MUST be the very first import in index.js.
 */
import { Text, TextInput, StyleSheet } from 'react-native';
import a11yStyleRef from './a11yStyleRef';

function shouldPatchType(type) {
  return type === Text || type === TextInput;
}

function computeDyslexiaScalePatch(type, props) {
  const meta = a11yStyleRef.meta || {};
  if (!meta.dyslexiaFont) return null;
  const scale = type === TextInput ? (meta.inputScale || 1.08) : (meta.textScale || 1.12);
  if (!scale || scale === 1) return null;

  const flattened = StyleSheet.flatten(props?.style) || {};
  const baseFontSize = typeof flattened.fontSize === 'number' ? flattened.fontSize : 14;
  const baseLineHeight = typeof flattened.lineHeight === 'number'
    ? flattened.lineHeight
    : Math.round(baseFontSize * 1.4);

  return {
    fontSize: Math.round(baseFontSize * scale),
    lineHeight: Math.round(baseLineHeight * scale),
  };
}

function injectA11yStyle(type, props) {
  if (!shouldPatchType(type)) return props;

  const flattened = StyleSheet.flatten(props?.style) || {};

  // Vector icons (e.g., Ionicons) render via <Text> with a special icon font.
  // Never override their font family/weight/spacing or they will disappear.
  const fontFamily = flattened?.fontFamily;
  const isVectorIconFont =
    type === Text &&
    typeof fontFamily === 'string' &&
    /^(Ionicons|MaterialIcons|MaterialCommunityIcons|FontAwesome|FontAwesome5|FontAwesome6|Fontisto|Entypo|Feather|AntDesign|EvilIcons|Foundation|Octicons|SimpleLineIcons|Zocial)/.test(
      fontFamily,
    );
  if (isVectorIconFont) return props;

  const a11y = a11yStyleRef.current;
  const hasA11y = !!a11y && Object.keys(a11y).length > 0;
  const scalePatch = computeDyslexiaScalePatch(type, props);
  const hasScale = !!scalePatch;

  if (!hasA11y && !hasScale) return props;

  let injected = hasA11y && hasScale ? { ...a11y, ...scalePatch }
    : hasScale ? scalePatch
    : a11y;

  // Respect explicit per-component styles: don't override if the component
  // already defined these keys.
  if (flattened.fontFamily && injected.fontFamily) {
    const { fontFamily: _ff, ...rest } = injected;
    injected = rest;
  }
  if (flattened.fontWeight && injected.fontWeight) {
    const { fontWeight: _fw, ...rest } = injected;
    injected = rest;
  }
  if (flattened.letterSpacing !== undefined && injected.letterSpacing !== undefined) {
    const { letterSpacing: _ls, ...rest } = injected;
    injected = rest;
  }

  const merged = props?.style !== undefined ? [props.style, injected] : injected;
  return props ? { ...props, style: merged } : { style: merged };
}

function patchJsxModule(m) {
  try {
    if (!m || m._synclexiaPatched) return;

    if (typeof m.jsx === 'function') {
      const origJsx = m.jsx;
      m.jsx = function synclexiaJsx(type, props, key) {
        return origJsx(type, injectA11yStyle(type, props), key);
      };
    }
    if (typeof m.jsxs === 'function') {
      const origJsxs = m.jsxs;
      m.jsxs = function synclexiaJsxs(type, props, key) {
        return origJsxs(type, injectA11yStyle(type, props), key);
      };
    }
    // Dev runtime uses jsxDEV
    if (typeof m.jsxDEV === 'function') {
      const origJsxDEV = m.jsxDEV;
      m.jsxDEV = function synclexiaJsxDEV(type, props, key, isStaticChildren, source, self) {
        return origJsxDEV(type, injectA11yStyle(type, props), key, isStaticChildren, source, self);
      };
    }

    m._synclexiaPatched = true;
  } catch (_) {}
}

// Patch react/jsx-runtime — this is what Expo's automatic JSX transform uses.
// The module exports object is a plain mutable CJS object, so property
// assignment works fine (unlike RN.Text which has a read-only getter).
// IMPORTANT: Metro/Web requires static module specifiers for require().
// Dynamic require(moduleName) breaks bundling.
try {
  patchJsxModule(require('react/jsx-runtime'));
} catch (_) {}
try {
  patchJsxModule(require('react/jsx-dev-runtime'));
} catch (_) {}


