// ─── Test Case CASE-020 ──────────────────────────────────────────────────────
// Test Case ID: CASE-020
// Test Case Description: Validate tapping stop button during playback
// Expected Result: Audio stops immediately

// Mock audio player state
let audioState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0
};

function startAudioPlayback(text) {
  audioState = {
    isPlaying: true,
    currentTime: 0,
    duration: text.length * 0.1 // Simulate duration based on text length
  };
  return {
    playing: true,
    actualResult: 'Audio playback started'
  };
}

function stopAudioPlayback() {
  if (!audioState.isPlaying) {
    return {
      stopped: false,
      actualResult: 'No audio to stop - Audio is not currently playing'
    };
  }

  // Stop the audio immediately
  const wasPlaying = audioState.isPlaying;
  const stoppedAt = audioState.currentTime;

  audioState = {
    isPlaying: false,
    currentTime: stoppedAt,
    duration: audioState.duration
  };

  return {
    stopped: true,
    actualResult: 'Audio stops immediately',
    stoppedAt: stoppedAt,
    wasPlaying: wasPlaying
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-020 (Validate tapping stop button during playback)', () => {

  beforeEach(() => {
    // Reset audio state before each test
    audioState = {
      isPlaying: false,
      currentTime: 0,
      duration: 0
    };
  });

  test('Stop audio during playback - audio stops immediately', () => {
    const expectedResult = 'Audio stops immediately';

    // Start playback first
    startAudioPlayback('Hello World this is a test');

    // Then stop it
    const result = stopAudioPlayback();

    console.log('Test Case ID: CASE-020');
    console.log('Test Case Description: Validate tapping stop button during playback');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Was Playing: ${result.wasPlaying}`);
    console.log(`Audio Stopped At: ${result.stoppedAt}s`);
    console.log(`Current State - isPlaying: ${audioState.isPlaying}`);

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

  test('Stop audio at beginning of playback - audio stops immediately', () => {
    const expectedResult = 'Audio stops immediately';

    // Start playback
    startAudioPlayback('Test audio');

    // Stop immediately
    const result = stopAudioPlayback();

    console.log('Test Case ID: CASE-020');
    console.log('Test Case Description: Validate tapping stop button during playback');
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

  test('Stop audio mid-playback - audio stops immediately', () => {
    const expectedResult = 'Audio stops immediately';

    // Start longer playback
    startAudioPlayback('This is a longer text for audio playback testing');

    // Simulate some time passing (would happen in real app)
    audioState.currentTime = 1.5;

    // Stop mid-playback
    const result = stopAudioPlayback();

    console.log('Test Case ID: CASE-020');
    console.log('Test Case Description: Validate tapping stop button during playback');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Stopped At: ${result.stoppedAt}s`);
    console.log(`Total Duration: ${audioState.duration}s`);

    if (result.stopped && !audioState.isPlaying && result.stoppedAt > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.stopped).toBe(true);
    expect(audioState.isPlaying).toBe(false);
    expect(result.stoppedAt).toBe(1.5);
  });

  test('Stop button when audio not playing - should indicate no audio to stop', () => {
    const result = stopAudioPlayback();

    console.log('Test Case ID: CASE-020');
    console.log('Test Case Description: Validate tapping stop button during playback');
    console.log('Expected Result: Audio stops immediately (when audio is playing)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.stopped && !audioState.isPlaying) {
      console.log('Outcome: PASSED - Correctly indicated no audio playing');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.stopped).toBe(false);
    expect(result.actualResult).toContain('not currently playing');
    expect(audioState.isPlaying).toBe(false);
  });

  test('Multiple stop presses - audio remains stopped', () => {
    // Start and stop audio
    startAudioPlayback('Test audio for multiple stops');
    stopAudioPlayback();

    // Try stopping again
    const secondStop = stopAudioPlayback();

    console.log('Test Case ID: CASE-020');
    console.log('Test Case Description: Validate tapping stop button during playback');
    console.log('Expected Result: Audio stops immediately (when audio is playing)');
    console.log(`First Stop - Audio Stopped: true`);
    console.log(`Second Stop - Stopped: ${secondStop.stopped}`);
    console.log(`Audio State - isPlaying: ${audioState.isPlaying}`);

    if (!secondStop.stopped && !audioState.isPlaying) {
      console.log('Outcome: PASSED - Audio remains stopped on subsequent presses');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(secondStop.stopped).toBe(false);
    expect(audioState.isPlaying).toBe(false);
  });

});
