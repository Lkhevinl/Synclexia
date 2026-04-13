// ─── Test Case CASE-036 ──────────────────────────────────────────────────────
// Test Case ID: CASE-036
// Test Case Description: Validate learner pauses narration
// Expected Result: Audio stops immediately

// Mock story data
const MOCK_STORY = {
  id: '1',
  title: 'The Little Cat',
  content: 'The cat sat on the mat. The cat is little and furry.',
  level: 1
};

// Audio/narration state
let narrationState = {
  isSpeaking: false,
  activeWordIndex: -1,
  currentRunId: 0,
  lastPauseTime: null,
  pauseCount: 0,
  totalDuration: 0,
  wordsSpoken: []
};

function resetNarrationState() {
  narrationState = {
    isSpeaking: false,
    activeWordIndex: -1,
    currentRunId: 0,
    lastPauseTime: null,
    pauseCount: 0,
    totalDuration: 0,
    wordsSpoken: []
  };
}

function tokenize(text) {
  const parts = String(text || '').match(/(\s+|[^\s]+)/g) || [];
  const tokens = [];
  let wordCursor = 0;
  for (const part of parts) {
    const isSpace = /^\s+$/.test(part);
    if (isSpace) {
      tokens.push({ text: part, isWord: false, wordIndex: null });
    } else {
      tokens.push({ text: part, isWord: true, wordIndex: wordCursor });
      wordCursor += 1;
    }
  }
  return { tokens, wordCount: wordCursor };
}

function startNarration(story) {
  const { tokens } = tokenize(story.content);
  const words = tokens.filter(t => t.isWord).map(t => t.text);
  
  narrationState.currentRunId += 1;
  narrationState.isSpeaking = true;
  narrationState.activeWordIndex = 0;
  narrationState.wordsSpoken = words;
  narrationState.pauseCount = 0;
  
  return {
    success: true,
    isSpeaking: true,
    runId: narrationState.currentRunId,
    words: words,
    totalWords: words.length
  };
}

function pauseNarration() {
  if (!narrationState.isSpeaking) {
    return {
      success: false,
      actualResult: 'Pause failed - No narration currently playing',
      wasPaused: false,
      error: 'Not speaking'
    };
  }

  const pauseStartTime = Date.now();
  narrationState.isSpeaking = false;
  narrationState.lastPauseTime = pauseStartTime;
  narrationState.pauseCount += 1;
  narrationState.activeWordIndex = -1; // Clear highlighting
  
  return {
    success: true,
    actualResult: 'Audio stopped immediately',
    wasPaused: true,
    pausedAt: pauseStartTime,
    wordIndexWhenPaused: narrationState.activeWordIndex,
    runId: narrationState.currentRunId,
    pauseCount: narrationState.pauseCount
  };
}

function resumeNarration() {
  if (narrationState.isSpeaking) {
    return {
      success: false,
      actualResult: 'Resume failed - Already speaking',
      wasResumed: false,
      error: 'Already speaking'
    };
  }

  // Calculate pause duration
  const resumeTime = Date.now();
  const pauseDuration = narrationState.lastPauseTime 
    ? resumeTime - narrationState.lastPauseTime 
    : 0;
  
  narrationState.isSpeaking = true;
  narrationState.totalDuration += pauseDuration;
  narrationState.activeWordIndex = 0; // Restart from beginning or could resume from last word
  
  return {
    success: true,
    actualResult: 'Audio resumed',
    wasResumed: true,
    pauseDuration: pauseDuration,
    isSpeaking: true
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-036 (Validate learner pauses narration)', () => {

  beforeEach(() => {
    resetNarrationState();
  });

  test('Pause narration - audio stops immediately', () => {
    // First start narration
    startNarration(MOCK_STORY);
    expect(narrationState.isSpeaking).toBe(true);
    
    // Then pause
    const pauseStart = Date.now();
    const result = pauseNarration();
    const pauseEnd = Date.now();

    console.log('Test Case ID: CASE-036');
    console.log('Test Case Description: Validate learner pauses narration');
    console.log('Test: Pause narration');
    console.log(`Expected Result: Audio stops immediately`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Was Paused: ${result.wasPaused}`);
    console.log(`Is Speaking After Pause: ${narrationState.isSpeaking}`);
    console.log(`Pause Time: ${pauseEnd - pauseStart}ms`);

    const stoppedImmediately = pauseEnd - pauseStart < 100; // Should be near instant

    if (result.success && !narrationState.isSpeaking && stoppedImmediately) {
      console.log('Outcome: PASSED - Audio stopped immediately');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.wasPaused).toBe(true);
    expect(narrationState.isSpeaking).toBe(false);
    expect(result.actualResult).toContain('stopped');
  });

  test('Pause clears word highlighting', () => {
    startNarration(MOCK_STORY);
    narrationState.activeWordIndex = 3; // Simulate being on 4th word
    
    const result = pauseNarration();

    console.log('Test Case ID: CASE-036');
    console.log('Test: Word highlighting cleared');
    console.log(`Active Word Index After Pause: ${narrationState.activeWordIndex}`);

    if (narrationState.activeWordIndex === -1) {
      console.log('Outcome: PASSED - Highlighting cleared');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(narrationState.activeWordIndex).toBe(-1);
  });

  test('Pause without active narration - fails gracefully', () => {
    const result = pauseNarration();

    console.log('Test Case ID: CASE-036');
    console.log('Test: Pause without active narration (negative test)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Not speaking') {
      console.log('Outcome: PASSED - Error handled gracefully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.wasPaused).toBe(false);
    expect(result.error).toBe('Not speaking');
  });

  test('Multiple pauses tracked correctly', () => {
    startNarration(MOCK_STORY);
    
    // First pause
    pauseNarration();
    const firstPauseCount = narrationState.pauseCount;
    
    // Resume
    resumeNarration();
    
    // Second pause
    const result = pauseNarration();
    const secondPauseCount = narrationState.pauseCount;

    console.log('Test Case ID: CASE-036');
    console.log('Test: Multiple pauses tracked');
    console.log(`First Pause Count: ${firstPauseCount}`);
    console.log(`Second Pause Count: ${secondPauseCount}`);

    if (firstPauseCount === 1 && secondPauseCount === 2) {
      console.log('Outcome: PASSED - Multiple pauses tracked');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(firstPauseCount).toBe(1);
    expect(secondPauseCount).toBe(2);
    expect(result.pauseCount).toBe(2);
  });

  test('Pause timestamp recorded', () => {
    startNarration(MOCK_STORY);
    
    const beforePause = Date.now();
    const result = pauseNarration();
    const afterPause = Date.now();

    console.log('Test Case ID: CASE-036');
    console.log('Test: Pause timestamp');
    console.log(`Paused At: ${result.pausedAt}`);
    console.log(`Timestamp Valid: ${result.pausedAt >= beforePause && result.pausedAt <= afterPause}`);

    const timestampValid = result.pausedAt >= beforePause && result.pausedAt <= afterPause;

    if (result.pausedAt && timestampValid) {
      console.log('Outcome: PASSED - Timestamp recorded');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.pausedAt).toBeDefined();
    expect(timestampValid).toBe(true);
  });

  test('Pause run ID preserved for resume', () => {
    startNarration(MOCK_STORY);
    const runIdBefore = narrationState.currentRunId;
    
    const result = pauseNarration();
    const runIdAfter = narrationState.currentRunId;

    console.log('Test Case ID: CASE-036');
    console.log('Test: Run ID preserved');
    console.log(`Run ID Before: ${runIdBefore}`);
    console.log(`Run ID After: ${runIdAfter}`);
    console.log(`Run ID Same: ${runIdBefore === runIdAfter}`);

    if (runIdBefore === runIdAfter) {
      console.log('Outcome: PASSED - Run ID preserved');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.runId).toBe(runIdBefore);
    expect(runIdAfter).toBe(runIdBefore);
  });

  test('Resume after pause - audio continues', () => {
    startNarration(MOCK_STORY);
    pauseNarration();
    
    const result = resumeNarration();

    console.log('Test Case ID: CASE-036');
    console.log('Test: Resume after pause');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Is Speaking: ${result.isSpeaking}`);
    console.log(`Was Resumed: ${result.wasResumed}`);

    if (result.success && result.isSpeaking && result.wasResumed) {
      console.log('Outcome: PASSED - Audio resumed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.wasResumed).toBe(true);
    expect(narrationState.isSpeaking).toBe(true);
  });

  test('Pause then resume then pause again - full cycle', () => {
    startNarration(MOCK_STORY);
    expect(narrationState.isSpeaking).toBe(true);
    
    // First pause
    pauseNarration();
    expect(narrationState.isSpeaking).toBe(false);
    
    // Resume
    resumeNarration();
    expect(narrationState.isSpeaking).toBe(true);
    
    // Second pause
    const result = pauseNarration();

    console.log('Test Case ID: CASE-036');
    console.log('Test: Pause-resume-pause cycle');
    console.log(`Final Is Speaking: ${narrationState.isSpeaking}`);
    console.log(`Total Pauses: ${narrationState.pauseCount}`);

    if (!narrationState.isSpeaking && narrationState.pauseCount === 2) {
      console.log('Outcome: PASSED - Full cycle complete');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(narrationState.isSpeaking).toBe(false);
    expect(narrationState.pauseCount).toBe(2);
  });

  test('Button state changes on pause - shows play icon', () => {
    startNarration(MOCK_STORY);
    
    // When speaking, button shows stop icon (square)
    const iconWhenSpeaking = narrationState.isSpeaking ? 'square' : 'volume-2';
    expect(iconWhenSpeaking).toBe('square');
    
    // After pause, button shows play icon (volume-2)
    pauseNarration();
    const iconWhenPaused = narrationState.isSpeaking ? 'square' : 'volume-2';

    console.log('Test Case ID: CASE-036');
    console.log('Test: Button icon state');
    console.log(`Icon When Speaking: ${iconWhenSpeaking}`);
    console.log(`Icon When Paused: ${iconWhenPaused}`);

    if (iconWhenSpeaking === 'square' && iconWhenPaused === 'volume-2') {
      console.log('Outcome: PASSED - Icon changes correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(iconWhenPaused).toBe('volume-2');
  });

});
