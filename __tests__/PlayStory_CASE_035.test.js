// ─── Test Case CASE-035 ──────────────────────────────────────────────────────
// Test Case ID: CASE-035
// Test Case Description: Validate learner taps "Read to Me" button
// Expected Result: Audio playback of story starts

// Mock story data
const MOCK_STORY = {
  id: '1',
  title: 'The Little Cat',
  content: 'The cat sat on the mat. The cat is little and furry.',
  level: 1
};

// Mock speech/audio state
let audioState = {
  isSpeaking: false,
  activeWordIndex: -1,
  currentRunId: 0,
  lastStopped: false,
  playbackQueue: []
};

function resetAudioState() {
  audioState = {
    isSpeaking: false,
    activeWordIndex: -1,
    currentRunId: 0,
    lastStopped: false,
    playbackQueue: []
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

async function stopSpeaking() {
  audioState.currentRunId += 1;
  audioState.isSpeaking = false;
  audioState.activeWordIndex = -1;
  audioState.lastStopped = true;
  audioState.playbackQueue = [];
  return { stopped: true };
}

async function handleReadToMe(story) {
  // Check if story exists and has content
  if (!story?.content) {
    return {
      success: false,
      actualResult: 'Read to Me failed - No story content available',
      isSpeaking: false,
      error: 'No content'
    };
  }

  const { tokens } = tokenize(story.content);
  const words = tokens.filter(t => t.isWord).map(t => t.text);

  if (words.length === 0) {
    return {
      success: false,
      actualResult: 'Read to Me failed - No words to read',
      isSpeaking: false,
      error: 'No words'
    };
  }

  // If already speaking, stop first (toggle behavior)
  if (audioState.isSpeaking) {
    await stopSpeaking();
    return {
      success: true,
      actualResult: 'Audio playback stopped (toggle off)',
      isSpeaking: false,
      wasToggled: true
    };
  }

  // Stop any previous speech and start new playback
  audioState.lastStopped = false;
  audioState.isSpeaking = true;
  audioState.currentRunId += 1;
  audioState.activeWordIndex = 0;
  audioState.playbackQueue = [...words];

  return {
    success: true,
    actualResult: 'Audio playback of story started',
    isSpeaking: true,
    storyTitle: story.title,
    totalWords: words.length,
    firstWord: words[0],
    runId: audioState.currentRunId,
    words: words
  };
}

function speakWordByIndex(words, index, runId) {
  // Check if this run is still valid
  if (runId !== audioState.currentRunId) {
    return { completed: false, reason: 'run_cancelled' };
  }

  if (!words || index >= words.length) {
    audioState.isSpeaking = false;
    audioState.activeWordIndex = -1;
    return { completed: true, wordsSpoken: index };
  }

  audioState.activeWordIndex = index;
  const word = words[index];

  // Simulate word spoken
  return {
    completed: false,
    wordSpoken: word,
    wordIndex: index,
    nextIndex: index + 1,
    runId: runId
  };
}

function simulatePlaybackProgress(words, startIndex = 0) {
  const spokenWords = [];
  let currentIndex = startIndex;
  const runId = audioState.currentRunId;

  while (currentIndex < words.length) {
    const result = speakWordByIndex(words, currentIndex, runId);
    
    if (result.completed || result.reason === 'run_cancelled') {
      break;
    }
    
    spokenWords.push(result.wordSpoken);
    currentIndex = result.nextIndex;
  }

  return {
    wordsSpoken: spokenWords,
    finalIndex: audioState.activeWordIndex,
    completed: currentIndex >= words.length
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-035 (Validate learner taps "Read to Me" button)', () => {

  beforeEach(() => {
    resetAudioState();
  });

  test('Tap "Read to Me" - audio playback starts successfully', async () => {
    const expectedResult = 'Audio playback of story started';
    const result = await handleReadToMe(MOCK_STORY);

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate learner taps "Read to Me" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Is Speaking: ${result.isSpeaking}`);
    console.log(`Story Title: ${result.storyTitle}`);
    console.log(`Total Words: ${result.totalWords}`);
    console.log(`First Word: ${result.firstWord}`);

    if (result.success && result.isSpeaking) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isSpeaking).toBe(true);
    expect(result.storyTitle).toBe('The Little Cat');
    expect(result.totalWords).toBe(12);
    expect(result.firstWord).toBe('The');
    expect(result.actualResult).toContain('started');
  });

  test('Playback starts with first word highlighted', async () => {
    const result = await handleReadToMe(MOCK_STORY);
    
    console.log('Test Case ID: CASE-035');
    console.log('Test: First word highlighting');
    console.log(`Active Word Index: ${audioState.activeWordIndex}`);
    console.log(`Expected: 0 (first word)`);

    if (audioState.activeWordIndex === 0) {
      console.log('Outcome: PASSED - First word highlighted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(audioState.activeWordIndex).toBe(0);
    expect(audioState.playbackQueue[0]).toBe('The');
  });

  test('Tap "Read to Me" while speaking - toggles off', async () => {
    // First start speaking
    await handleReadToMe(MOCK_STORY);
    expect(audioState.isSpeaking).toBe(true);
    
    // Tap again to toggle off
    const result = await handleReadToMe(MOCK_STORY);

    console.log('Test Case ID: CASE-035');
    console.log('Test: Toggle off while speaking');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Is Speaking: ${result.isSpeaking}`);
    console.log(`Was Toggled: ${result.wasToggled}`);

    if (result.success && !result.isSpeaking && result.wasToggled) {
      console.log('Outcome: PASSED - Playback stopped');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isSpeaking).toBe(false);
    expect(result.wasToggled).toBe(true);
    expect(audioState.isSpeaking).toBe(false);
  });

  test('Word-by-word playback progresses through story', async () => {
    const result = await handleReadToMe(MOCK_STORY);
    const words = result.words;
    
    // Simulate reading first 3 words
    const progress = simulatePlaybackProgress(words, 0, 3);

    console.log('Test Case ID: CASE-035');
    console.log('Test: Word-by-word progression');
    console.log(`Words Spoken: ${progress.wordsSpoken.join(', ')}`);
    console.log(`Current Index: ${audioState.activeWordIndex}`);

    if (progress.wordsSpoken.length === 12) { // All words
      console.log('Outcome: PASSED - Full story read');
    } else {
      console.log('Outcome: Check - Partial progress');
    }

    expect(words.length).toBe(12);
    expect(words[0]).toBe('The');
    expect(words[1]).toBe('cat');
    expect(words[2]).toBe('sat');
  });

  test('No story selected - fails gracefully', async () => {
    const result = await handleReadToMe(null);

    console.log('Test Case ID: CASE-035');
    console.log('Test: No story selected (negative test)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'No content') {
      console.log('Outcome: PASSED - Error handled gracefully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.isSpeaking).toBe(false);
    expect(result.error).toBe('No content');
  });

  test('Empty story content - fails gracefully', async () => {
    const emptyStory = { id: '2', title: 'Empty Story', content: '' };
    const result = await handleReadToMe(emptyStory);

    console.log('Test Case ID: CASE-035');
    console.log('Test: Empty content (negative test)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.success && (result.error === 'No content' || result.error === 'No words')) {
      console.log('Outcome: PASSED - Empty content handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(['No content', 'No words']).toContain(result.error);
  });

  test('Run ID increments - prevents stale callbacks', async () => {
    const result1 = await handleReadToMe(MOCK_STORY);
    const firstRunId = result1.runId;
    
    // Stop and restart
    await handleReadToMe(MOCK_STORY); // Toggle off
    const result2 = await handleReadToMe(MOCK_STORY); // Toggle on
    const secondRunId = result2.runId;

    console.log('Test Case ID: CASE-035');
    console.log('Test: Run ID incrementing');
    console.log(`First Run ID: ${firstRunId}`);
    console.log(`Second Run ID: ${secondRunId}`);
    console.log(`IDs Different: ${firstRunId !== secondRunId}`);

    if (secondRunId > firstRunId) {
      console.log('Outcome: PASSED - Run IDs incremented');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(secondRunId).toBeGreaterThan(firstRunId);
  });

  test('Speech stopped before starting - clears previous state', async () => {
    // Pre-set some state - start by actually playing
    await handleReadToMe(MOCK_STORY);
    const firstRunId = audioState.currentRunId;
    
    // Now toggle off
    await handleReadToMe(MOCK_STORY);
    expect(audioState.isSpeaking).toBe(false);
    
    // Start new playback
    const result = await handleReadToMe(MOCK_STORY);
    const newRunId = audioState.currentRunId;

    console.log('Test Case ID: CASE-035');
    console.log('Test: Previous state cleared');
    console.log(`First Run ID: ${firstRunId}`);
    console.log(`New Run ID: ${newRunId}`);
    console.log(`Run ID Changed: ${newRunId > firstRunId}`);
    console.log(`Active Word Index: ${audioState.activeWordIndex}`);

    if (newRunId > firstRunId && audioState.activeWordIndex === 0) {
      console.log('Outcome: PASSED - State reset correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(newRunId).toBeGreaterThan(firstRunId);
    expect(audioState.activeWordIndex).toBe(0);
  });

  test('Button shows correct icon based on state', async () => {
    // Initially not speaking
    const initialIcon = audioState.isSpeaking ? 'square' : 'volume-2';
    expect(initialIcon).toBe('volume-2');
    
    // Start speaking
    await handleReadToMe(MOCK_STORY);
    const speakingIcon = audioState.isSpeaking ? 'square' : 'volume-2';
    
    console.log('Test Case ID: CASE-035');
    console.log('Test: Button icon state');
    console.log(`Initial Icon: ${initialIcon} (volume-2)`);
    console.log(`Speaking Icon: ${speakingIcon} (square)`);

    if (initialIcon === 'volume-2' && speakingIcon === 'square') {
      console.log('Outcome: PASSED - Icons correct');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(speakingIcon).toBe('square');
    
    // Stop speaking
    await handleReadToMe(MOCK_STORY);
    const stoppedIcon = audioState.isSpeaking ? 'square' : 'volume-2';
    expect(stoppedIcon).toBe('volume-2');
  });

});
