// ─── Test Case CASE-032 ──────────────────────────────────────────────────────
// Test Case ID: CASE-032
// Test Case Description: Validate speech input with background noise
// Expected Result: Text generated with possible inaccuracies

function processSpeechWithNoise(audioData, noiseLevel) {
  // Define noise thresholds
  const LOW_NOISE = 0.2;
  const MODERATE_NOISE = 0.5;
  const HIGH_NOISE = 0.8;

  // Check if audio data exists
  if (!audioData || audioData.length === 0) {
    return {
      success: false,
      actualResult: 'No text generated - No audio detected',
      textGenerated: false,
      transcript: null
    };
  }

  // Calculate confidence based on noise level
  let confidence = 1.0 - noiseLevel;
  let accuracy = 'high';
  let warning = null;

  if (noiseLevel >= HIGH_NOISE) {
    confidence = Math.max(0.3, 1.0 - noiseLevel);
    accuracy = 'low';
    warning = 'High background noise detected. Text may contain significant errors.';
  } else if (noiseLevel >= MODERATE_NOISE) {
    confidence = 0.6;
    accuracy = 'moderate';
    warning = 'Moderate background noise detected. Some words may be inaccurate.';
  } else if (noiseLevel >= LOW_NOISE) {
    confidence = 0.8;
    accuracy = 'good';
    warning = 'Low background noise detected. Minor inaccuracies possible.';
  }

  // Generate transcript (simulated)
  const transcript = audioData.transcript || 'Sample transcribed text with possible errors';

  return {
    success: true,
    actualResult: 'Text generated with possible inaccuracies',
    textGenerated: true,
    transcript: transcript,
    confidence: confidence,
    accuracy: accuracy,
    noiseLevel: noiseLevel,
    warning: warning
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-032 (Validate speech input with background noise)', () => {

  test('Low background noise - text generated with minor inaccuracies', () => {
    const expectedResult = 'Text generated with possible inaccuracies';
    const mockAudioData = {
      length: 500,
      data: [1, 2, 3, 4, 5],
      transcript: 'Hello world this is a test'
    };
    const result = processSpeechWithNoise(mockAudioData, 0.25); // 25% noise

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate speech input with background noise');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Noise Level: ${result.noiseLevel * 100}%`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`Accuracy: ${result.accuracy}`);
    console.log(`Warning: ${result.warning}`);

    if (result.success && result.textGenerated && result.noiseLevel > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.textGenerated).toBe(true);
    expect(result.actualResult).toContain('possible inaccuracies');
    expect(result.noiseLevel).toBe(0.25);
    expect(result.confidence).toBeLessThan(1.0);
  });

  test('Moderate background noise - text generated with some inaccuracies', () => {
    const expectedResult = 'Text generated with possible inaccuracies';
    const mockAudioData = {
      length: 500,
      data: [1, 2, 3, 4, 5],
      transcript: 'Hello wrld this is a tst'
    };
    const result = processSpeechWithNoise(mockAudioData, 0.6); // 60% noise

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate speech input with background noise');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Noise Level: ${result.noiseLevel * 100}%`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`Accuracy: ${result.accuracy}`);

    if (result.success && result.textGenerated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.textGenerated).toBe(true);
    expect(result.accuracy).toBe('moderate');
    expect(result.confidence).toBe(0.6);
  });

  test('High background noise - text generated with significant inaccuracies', () => {
    const expectedResult = 'Text generated with possible inaccuracies';
    const mockAudioData = {
      length: 500,
      data: [1, 2, 3, 4, 5],
      transcript: 'H*llo w#rld th!s is @ tst'
    };
    const result = processSpeechWithNoise(mockAudioData, 0.85); // 85% noise

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate speech input with background noise');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Noise Level: ${result.noiseLevel * 100}%`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`Accuracy: ${result.accuracy}`);

    if (result.success && result.textGenerated && result.accuracy === 'low') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.textGenerated).toBe(true);
    expect(result.accuracy).toBe('low');
    expect(result.confidence).toBeLessThan(0.5);
  });

  test('Traffic noise in background - text generated with inaccuracies', () => {
    const expectedResult = 'Text generated with possible inaccuracies';
    const mockAudioData = {
      length: 600,
      data: [1, 2, 3, 4, 5],
      transcript: 'The meeting is at tree PM'
    };
    const result = processSpeechWithNoise(mockAudioData, 0.55); // Traffic noise

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate speech input with background noise');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Transcript: ${result.transcript}`);
    console.log(`Noise Level: ${result.noiseLevel * 100}%`);

    if (result.success && result.textGenerated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.textGenerated).toBe(true);
    expect(result.transcript).toContain('tree'); // "three" misheard as "tree"
  });

  test('People talking in background - text generated with inaccuracies', () => {
    const expectedResult = 'Text generated with possible inaccuracies';
    const mockAudioData = {
      length: 500,
      data: [1, 2, 3, 4, 5],
      transcript: 'I went to the store and bought some milk'
    };
    const result = processSpeechWithNoise(mockAudioData, 0.45); // Conversations

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate speech input with background noise');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Noise Level: ${result.noiseLevel * 100}%`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);

    if (result.success && result.textGenerated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.textGenerated).toBe(true);
    expect(result.noiseLevel).toBe(0.45);
  });

  test('Clear audio without noise - text generated accurately (negative test)', () => {
    const mockAudioData = {
      length: 500,
      data: [1, 2, 3, 4, 5],
      transcript: 'Perfectly clear speech without any noise'
    };
    const result = processSpeechWithNoise(mockAudioData, 0.0); // No noise

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate speech input with background noise');
    console.log('Expected Result: Text generated with possible inaccuracies (when noise present)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Noise Level: ${result.noiseLevel * 100}%`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);

    if (result.success && result.textGenerated && result.confidence === 1.0) {
      console.log('Outcome: PASSED - Clear audio produces accurate text');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.textGenerated).toBe(true);
    expect(result.confidence).toBe(1.0);
    expect(result.accuracy).toBe('high');
  });

  test('No audio data - no text generated (negative test)', () => {
    const result = processSpeechWithNoise(null, 0.5);

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate speech input with background noise');
    console.log('Expected Result: Text generated with possible inaccuracies (when audio exists)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.textGenerated) {
      console.log('Outcome: PASSED - No audio means no text');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.textGenerated).toBe(false);
  });

});
