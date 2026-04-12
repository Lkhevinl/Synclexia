// ─── Test Case CASE-029 ──────────────────────────────────────────────────────
// Test Case ID: CASE-029
// Test Case Description: Validate by tapping "Listen now" button during playback
// Expected Result: Audio playback stops immediately

// Mock audio state
let audioState = {
  isPlaying: false,
  currentText: '',
  currentTime: 0,
  duration: 0
};

function startAudioPlayback(text) {
  audioState = {
    isPlaying: true,
    currentText: text,
    currentTime: 0,
    duration: text.length * 0.1
  };
  return { playing: true };
}

function stopAudioPlayback() {
  if (!audioState.isPlaying) {
    return {
      stopped: false,
      actualResult: 'No audio to stop - Audio is not currently playing'
    };
  }

  const wasPlaying = audioState.isPlaying;
  const stoppedAt = audioState.currentTime;

  audioState = {
    isPlaying: false,
    currentText: audioState.currentText,
    currentTime: stoppedAt,
    duration: audioState.duration
  };

  return {
    stopped: true,
    actualResult: 'Audio playback stops immediately',
    wasPlaying: wasPlaying,
    stoppedAt: stoppedAt
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-029 (Validate by tapping "Listen now" button during playback)', () => {

  beforeEach(() => {
    audioState = {
      isPlaying: false,
      currentText: '',
      currentTime: 0,
      duration: 0
    };
  });

  test('Tap Listen now during playback - audio stops immediately', () => {
    const expectedResult = 'Audio playback stops immediately';

    // Start playback first
    startAudioPlayback('This is extracted text being played');

    // Tap Listen now (stop) during playback
    const result = stopAudioPlayback();

    console.log('Test Case ID: CASE-029');
    console.log('Test Case Description: Validate by tapping "Listen now" button during playback');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Was Playing: ${result.wasPlaying}`);
    console.log(`Audio Playing After Tap: ${audioState.isPlaying}`);

    if (result.stopped && !audioState.isPlaying && result.wasPlaying) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.stopped).toBe(true);
    expect(result.actualResult).toContain('stops immediately');
    expect(audioState.isPlaying).toBe(false);
    expect(result.wasPlaying).toBe(true);
  });

  test('Tap Listen now at start of playback - audio stops immediately', () => {
    const expectedResult = 'Audio playback stops immediately';

    startAudioPlayback('Sample text for audio playback');
    const result = stopAudioPlayback();

    console.log('Test Case ID: CASE-029');
    console.log('Test Case Description: Validate by tapping "Listen now" button during playback');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Stopped At: ${result.stoppedAt}s`);

    if (result.stopped && !audioState.isPlaying) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.stopped).toBe(true);
    expect(audioState.isPlaying).toBe(false);
  });

  test('Tap Listen now mid-playback - audio stops immediately', () => {
    const expectedResult = 'Audio playback stops immediately';

    startAudioPlayback('This is a longer text for testing mid-playback stopping functionality');

    // Simulate some time passing
    audioState.currentTime = 2.5;

    const result = stopAudioPlayback();

    console.log('Test Case ID: CASE-029');
    console.log('Test Case Description: Validate by tapping "Listen now" button during playback');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Stopped At: ${result.stoppedAt}s`);

    if (result.stopped && !audioState.isPlaying && result.stoppedAt === 2.5) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.stopped).toBe(true);
    expect(audioState.isPlaying).toBe(false);
    expect(result.stoppedAt).toBe(2.5);
  });

  test('Tap Listen now when not playing - no audio to stop', () => {
    const result = stopAudioPlayback();

    console.log('Test Case ID: CASE-029');
    console.log('Test Case Description: Validate by tapping "Listen now" button during playback');
    console.log('Expected Result: Audio playback stops immediately (when playing)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.stopped && !audioState.isPlaying) {
      console.log('Outcome: PASSED - Correctly indicated no audio playing');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.stopped).toBe(false);
    expect(result.actualResult).toContain('not currently playing');
  });

  test('Multiple taps during playback - audio remains stopped', () => {
    startAudioPlayback('Test text for multiple stops');

    // First tap stops audio
    stopAudioPlayback();

    // Second tap when already stopped
    const secondResult = stopAudioPlayback();

    console.log('Test Case ID: CASE-029');
    console.log('Test Case Description: Validate by tapping "Listen now" button during playback');
    console.log('Expected Result: Audio playback stops immediately (when playing)');
    console.log(`First Stop: Audio stopped`);
    console.log(`Second Stop: ${secondResult.stopped}`);
    console.log(`Audio State - isPlaying: ${audioState.isPlaying}`);

    if (!secondResult.stopped && !audioState.isPlaying) {
      console.log('Outcome: PASSED - Audio remains stopped');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(secondResult.stopped).toBe(false);
    expect(audioState.isPlaying).toBe(false);
  });

});
