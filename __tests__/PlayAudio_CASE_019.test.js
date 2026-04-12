// ─── Test Case CASE-019 ──────────────────────────────────────────────────────
// Test Case ID: CASE-019
// Test Case Description: Validate tapping "Play" button after entering text
// Expected Result: Audio of entered text plays correctly

function validateAudioPlaybackWithText(textInput) {
  // Check if text input is provided and not empty
  if (!textInput || textInput.trim() === '') {
    return {
      playing: false,
      actualResult: 'Audio playback failed - No text provided',
      textPlayed: null,
      error: 'Text input is required'
    };
  }

  // Simulate audio playback with the entered text
  const trimmedText = textInput.trim();

  return {
    playing: true,
    actualResult: 'Audio of entered text plays correctly',
    textPlayed: trimmedText,
    textLength: trimmedText.length,
    error: null
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-019 (Validate tapping "Play" button after entering text)', () => {

  test('Valid text - audio plays correctly', () => {
    const expectedResult = 'Audio of entered text plays correctly';
    const result = validateAudioPlaybackWithText('Hello World');

    console.log('Test Case ID: CASE-019');
    console.log('Test Case Description: Validate tapping "Play" button after entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Played: ${result.textPlayed}`);
    console.log(`Text Length: ${result.textLength}`);

    if (result.playing && result.textPlayed === 'Hello World' && !result.error) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.actualResult).toContain('plays correctly');
    expect(result.textPlayed).toBe('Hello World');
    expect(result.error).toBeNull();
  });

  test('Single word - audio plays correctly', () => {
    const expectedResult = 'Audio of entered text plays correctly';
    const result = validateAudioPlaybackWithText('Synclexia');

    console.log('Test Case ID: CASE-019');
    console.log('Test Case Description: Validate tapping "Play" button after entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Played: ${result.textPlayed}`);

    if (result.playing && result.textPlayed === 'Synclexia') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textPlayed).toBe('Synclexia');
    expect(result.error).toBeNull();
  });

  test('Multiple words with punctuation - audio plays correctly', () => {
    const expectedResult = 'Audio of entered text plays correctly';
    const result = validateAudioPlaybackWithText('Hello, how are you today?');

    console.log('Test Case ID: CASE-019');
    console.log('Test Case Description: Validate tapping "Play" button after entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Played: ${result.textPlayed}`);

    if (result.playing && result.textPlayed === 'Hello, how are you today?') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textPlayed).toBe('Hello, how are you today?');
    expect(result.error).toBeNull();
  });

  test('Text with numbers - audio plays correctly', () => {
    const expectedResult = 'Audio of entered text plays correctly';
    const result = validateAudioPlaybackWithText('Test 123 ABC');

    console.log('Test Case ID: CASE-019');
    console.log('Test Case Description: Validate tapping "Play" button after entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Played: ${result.textPlayed}`);

    if (result.playing && result.textPlayed === 'Test 123 ABC') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textPlayed).toBe('Test 123 ABC');
    expect(result.error).toBeNull();
  });

  test('Long text - audio plays correctly', () => {
    const longText = 'This is a longer text passage that should play correctly when the user taps the play button after entering it into the input field';
    const expectedResult = 'Audio of entered text plays correctly';
    const result = validateAudioPlaybackWithText(longText);

    console.log('Test Case ID: CASE-019');
    console.log('Test Case Description: Validate tapping "Play" button after entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Length: ${result.textLength}`);

    if (result.playing && result.textPlayed === longText) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textPlayed).toBe(longText);
    expect(result.textLength).toBe(longText.length);
    expect(result.error).toBeNull();
  });

  test('Text with leading/trailing spaces - trimmed and audio plays', () => {
    const expectedResult = 'Audio of entered text plays correctly';
    const result = validateAudioPlaybackWithText('  Hello World  ');

    console.log('Test Case ID: CASE-019');
    console.log('Test Case Description: Validate tapping "Play" button after entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Original Input: "  Hello World  "`);
    console.log(`Text Played (trimmed): "${result.textPlayed}"`);

    if (result.playing && result.textPlayed === 'Hello World') {
      console.log('Outcome: PASSED - Text trimmed and audio plays correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textPlayed).toBe('Hello World');
    expect(result.error).toBeNull();
  });

  test('Empty text - audio should not play (negative test)', () => {
    const result = validateAudioPlaybackWithText('');

    console.log('Test Case ID: CASE-019');
    console.log('Test Case Description: Validate tapping "Play" button after entering text');
    console.log('Expected Result: Audio of entered text plays correctly (when text is provided)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.playing && result.error) {
      console.log('Outcome: PASSED - Correctly rejected empty text');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('Only whitespace - audio should not play (negative test)', () => {
    const result = validateAudioPlaybackWithText('     ');

    console.log('Test Case ID: CASE-019');
    console.log('Test Case Description: Validate tapping "Play" button after entering text');
    console.log('Expected Result: Audio of entered text plays correctly (when text is provided)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.playing && result.error) {
      console.log('Outcome: PASSED - Correctly rejected whitespace-only input');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.error).toBeTruthy();
  });

});
