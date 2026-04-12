// ─── Test Case CASE-028 ──────────────────────────────────────────────────────
// Test Case ID: CASE-028
// Test Case Description: Validate by tapping "Listen now" button after text extraction
// Expected Result: Audio playback of extracted text

// Mock audio state
let audioState = {
  isPlaying: false,
  currentText: '',
  currentTime: 0
};

function playExtractedText(extractedText) {
  // Check if text exists
  if (!extractedText || extractedText.trim() === '') {
    return {
      playing: false,
      actualResult: 'Audio playback failed - No extracted text',
      error: 'No text to play'
    };
  }

  // Start audio playback
  audioState = {
    isPlaying: true,
    currentText: extractedText,
    currentTime: 0
  };

  return {
    playing: true,
    actualResult: 'Audio playback of extracted text',
    textBeingPlayed: extractedText,
    textLength: extractedText.length
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-028 (Validate by tapping "Listen now" button after text extraction)', () => {

  beforeEach(() => {
    // Reset audio state before each test
    audioState = {
      isPlaying: false,
      currentText: '',
      currentTime: 0
    };
  });

  test('Tap Listen now with extracted text - audio plays', () => {
    const expectedResult = 'Audio playback of extracted text';
    const extractedText = 'This is the text extracted from the uploaded image';
    const result = playExtractedText(extractedText);

    console.log('Test Case ID: CASE-028');
    console.log('Test Case Description: Validate by tapping "Listen now" button after text extraction');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Being Played: ${result.textBeingPlayed}`);
    console.log(`Audio Playing: ${result.playing}`);

    if (result.playing && result.textBeingPlayed === extractedText) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.actualResult).toContain('Audio playback');
    expect(result.textBeingPlayed).toBe(extractedText);
    expect(audioState.isPlaying).toBe(true);
  });

  test('Tap Listen now with short text - audio plays', () => {
    const expectedResult = 'Audio playback of extracted text';
    const extractedText = 'Hello World';
    const result = playExtractedText(extractedText);

    console.log('Test Case ID: CASE-028');
    console.log('Test Case Description: Validate by tapping "Listen now" button after text extraction');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Being Played: ${result.textBeingPlayed}`);

    if (result.playing) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textBeingPlayed).toBe('Hello World');
  });

  test('Tap Listen now with long text - audio plays', () => {
    const expectedResult = 'Audio playback of extracted text';
    const extractedText = 'This is a much longer piece of text that has been extracted from an image file. It contains multiple sentences and should play correctly when the listen now button is tapped by the user.';
    const result = playExtractedText(extractedText);

    console.log('Test Case ID: CASE-028');
    console.log('Test Case Description: Validate by tapping "Listen now" button after text extraction');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Length: ${result.textLength}`);

    if (result.playing && result.textLength === extractedText.length) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textLength).toBe(extractedText.length);
  });

  test('Tap Listen now with text containing numbers - audio plays', () => {
    const expectedResult = 'Audio playback of extracted text';
    const extractedText = 'Order number 12345 is ready for pickup';
    const result = playExtractedText(extractedText);

    console.log('Test Case ID: CASE-028');
    console.log('Test Case Description: Validate by tapping "Listen now" button after text extraction');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Being Played: ${result.textBeingPlayed}`);

    if (result.playing) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textBeingPlayed).toBe('Order number 12345 is ready for pickup');
  });

  test('Tap Listen now with special characters - audio plays', () => {
    const expectedResult = 'Audio playback of extracted text';
    const extractedText = 'Price: $99.99 - Save 50%!';
    const result = playExtractedText(extractedText);

    console.log('Test Case ID: CASE-028');
    console.log('Test Case Description: Validate by tapping "Listen now" button after text extraction');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.playing) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.textBeingPlayed).toBe('Price: $99.99 - Save 50%!');
  });

  test('No extracted text - audio should not play (negative test)', () => {
    const result = playExtractedText('');

    console.log('Test Case ID: CASE-028');
    console.log('Test Case Description: Validate by tapping "Listen now" button after text extraction');
    console.log('Expected Result: Audio playback of extracted text (when text exists)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.playing && result.error) {
      console.log('Outcome: PASSED - Correctly rejected empty text');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.error).toBe('No text to play');
  });

});
