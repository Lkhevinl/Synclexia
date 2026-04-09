// ─── Speech-to-Text Module Tests ────────────────────────────────────────────
// Individual test file for STT functionality
// Test Cases: TC-STT-001 through TC-STT-005

function convertSpeech(audioData, hasPermission = true, hasBackgroundNoise = false) {
  if (!hasPermission) {
    return { 
      success: false, 
      error: 'Recording not started; permission error shown'
    };
  }
  
  if (!audioData || audioData.duration < 0.5) {
    return {
      success: false,
      error: 'No text generated; prompt displayed'
    };
  }
  
  if (hasBackgroundNoise) {
    return {
      success: true,
      text: 'Generated text with possible inaccuracies',
      accuracy: 'low'
    };
  }
  
  return {
    success: true,
    text: audioData.transcript || 'Speech converted successfully',
    accuracy: 'high'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASES
// ═════════════════════════════════════════════════════════════════════════════

describe('Speech-to-Text Module - Individual Test Cases', () => {

  describe('TC-STT-001: Learner taps convert without microphone permission', () => {
    test('Recording not started; permission error shown', () => {
      const result = convertSpeech(null, false);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Recording not started; permission error shown');
    });
  });

  describe('TC-STT-002: Learner speaks with background noise', () => {
    test('Text generated with possible inaccuracies', () => {
      const audioData = { duration: 3.0, transcript: 'hello world' };
      const result = convertSpeech(audioData, true, true);
      expect(result.success).toBe(true);
      expect(result.accuracy).toBe('low');
    });
  });

  describe('TC-STT-003: Learner taps microphone but does not speak', () => {
    test('No text generated; prompt displayed', () => {
      const result = convertSpeech({ duration: 0.1 }, true);
      expect(result.success).toBe(false);
      expect(result.error).toBe('No text generated; prompt displayed');
    });
  });

  describe('TC-STT-004: Learner taps microphone and speaks clearly', () => {
    test('Speech converted to text successfully', () => {
      const audioData = { duration: 2.5, transcript: 'Hello Synclexia' };
      const result = convertSpeech(audioData, true, false);
      expect(result.success).toBe(true);
      expect(result.accuracy).toBe('high');
      expect(result.text).toBe('Hello Synclexia');
    });
  });

  describe('TC-STT-005: Empty audio data with permission', () => {
    test('Should return no text generated', () => {
      const result = convertSpeech(null, true);
      expect(result.success).toBe(false);
    });
  });

});
