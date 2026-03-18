import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert helper.
 * - Native: uses React Native Alert with optional buttons.
 * - Web: falls back to window.alert (single-button semantics).
 */
export function showAlert(title, message, buttons) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(`${title}\n\n${message}`);

    // Web alerts can't show multiple choices; mimic the first button.
    const first = Array.isArray(buttons) ? buttons[0] : null;
    if (first?.onPress) {
      try { first.onPress(); } catch (_) {}
    }
    return;
  }

  if (Array.isArray(buttons) && buttons.length > 0) {
    Alert.alert(title, message, buttons);
  } else {
    Alert.alert(title, message);
  }
}
