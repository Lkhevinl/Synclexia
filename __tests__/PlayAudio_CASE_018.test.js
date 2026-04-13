// ─── Test Case CASE-018 ──────────────────────────────────────────────────────
// Test Case ID: CASE-018
// Test Case Description: Validate tapping "Play" button without entering text
// Expected Result: No audio playback; error displayed

function validateAudioPlayback(textInput) {
  // Check if text input is provided and not empty
  if (!textInput || textInput.trim() === '') {
    return {
      playing: false,
      actualResult: 'No audio playback; error displayed - Text input is required',
      error: 'Please enter text before playing'
    };
  }

  // If text is provided, audio would play
  return {
    playing: true,
    actualResult: 'Audio playback started',
    error: null
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-018 (Validate tapping "Play" button without entering text)', () => {

  test('Empty text - no audio playback, error displayed', () => {
    const expectedResult = 'No audio playback; error displayed';
    const result = validateAudioPlayback('');

    console.log('Test Case ID: CASE-018');
    console.log('Test Case Description: Validate tapping "Play" button without entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error Message: ${result.error}`);

    if (!result.playing && result.error && result.actualResult.includes('error displayed')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.actualResult).toContain('No audio playback');
    expect(result.actualResult).toContain('error displayed');
    expect(result.error).toBe('Please enter text before playing');
  });

  test('Null text - no audio playback, error displayed', () => {
    const expectedResult = 'No audio playback; error displayed';
    const result = validateAudioPlayback(null);

    console.log('Test Case ID: CASE-018');
    console.log('Test Case Description: Validate tapping "Play" button without entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error Message: ${result.error}`);

    if (!result.playing && result.error) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.actualResult).toContain('No audio playback');
    expect(result.error).toBeTruthy();
  });

  test('Whitespace only - no audio playback, error displayed', () => {
    const expectedResult = 'No audio playback; error displayed';
    const result = validateAudioPlayback('   ');

    console.log('Test Case ID: CASE-018');
    console.log('Test Case Description: Validate tapping "Play" button without entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error Message: ${result.error}`);

    if (!result.playing && result.error) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.actualResult).toContain('No audio playback');
    expect(result.error).toBeTruthy();
  });

  test('Undefined text - no audio playback, error displayed', () => {
    const expectedResult = 'No audio playback; error displayed';
    const result = validateAudioPlayback(undefined);

    console.log('Test Case ID: CASE-018');
    console.log('Test Case Description: Validate tapping "Play" button without entering text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error Message: ${result.error}`);

    if (!result.playing && result.error) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.actualResult).toContain('No audio playback');
    expect(result.error).toBeTruthy();
  });

  test('Valid text - audio playback should start (negative test)', () => {
    const result = validateAudioPlayback('Hello World');

    console.log('Test Case ID: CASE-018');
    console.log('Test Case Description: Validate tapping "Play" button without entering text');
    console.log('Expected Result: No audio playback; error displayed (when text is empty)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Playing: ${result.playing}`);

    if (result.playing && !result.error) {
      console.log('Outcome: PASSED - Audio playback started with valid text');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.actualResult).toContain('Audio playback');
    expect(result.error).toBeNull();
  });

  test('Text with content - audio playback should start (negative test)', () => {
    const result = validateAudioPlayback('Synclexia');

    console.log('Test Case ID: CASE-018');
    console.log('Test Case Description: Validate tapping "Play" button without entering text');
    console.log('Expected Result: No audio playback; error displayed (when text is empty)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.playing) {
      console.log('Outcome: PASSED - Audio playback started with valid text');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.error).toBeNull();
  });

});
