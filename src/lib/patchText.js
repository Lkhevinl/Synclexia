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
import { Text } from 'react-native';
import a11yStyleRef from './a11yStyleRef';

function injectA11yStyle(type, props) {
  if (type !== Text) return props;
  const a11y = a11yStyleRef.current;
  if (!a11y || Object.keys(a11y).length === 0) return props;
  const merged = props?.style !== undefined ? [props.style, a11y] : a11y;
  return props ? { ...props, style: merged } : { style: merged };
}

// Patch react/jsx-runtime — this is what Expo's automatic JSX transform uses.
// The module exports object is a plain mutable CJS object, so property
// assignment works fine (unlike RN.Text which has a read-only getter).
try {
  const jsxRuntime = require('react/jsx-runtime');
  if (jsxRuntime && !jsxRuntime._synclexiaPatched) {
    const origJsx  = jsxRuntime.jsx;
    const origJsxs = jsxRuntime.jsxs;

    jsxRuntime.jsx = function synclexiaJsx(type, props, key) {
      return origJsx(type, injectA11yStyle(type, props), key);
    };

    jsxRuntime.jsxs = function synclexiaJsxs(type, props, key) {
      return origJsxs(type, injectA11yStyle(type, props), key);
    };

    jsxRuntime._synclexiaPatched = true;
  }
} catch (_) {}


