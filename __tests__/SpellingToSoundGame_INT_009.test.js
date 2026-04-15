// ─── Integration Test INT-009 ───────────────────────────────────────────────
// Test Case ID   : INT-009
// Test           : Integration when read-aloud support is used
// Component      : Reading Activity → Text-to-Speech (TTS)
// Input          : Story is opened
// Expected Result: Story is read aloud

// Mock story
const MOCK_STORY = {
  id: 'STORY001',
  title: 'The Cat and the Mat',
  content: 'The cat sat on the mat. Sam has a cat. The cat is fat.',
  level: 1,
  wordCount: 13,
  estimatedReadTime: 15
};

// TTS engine definition
const TTS_ENGINE = {
  isReady: true,
  supportsSpeech: true,
  supportsWordHighlight: true,
  supportsRateControl: true,
  supportsPitchControl: true,
  defaultRate: 0.85,
  defaultPitch: 1.1
};

// State
let appState = {
  storyOpen: false,
  story: null,
  ttsActive: false,
  ttsReady: false,
  isSpeaking: false,
  currentWordIndex: null,
  speakingRate: null,
  speakingPitch: null,
  sessionLogged: false
};

function resetState() {
  appState = {
    storyOpen: false,
    story: null,
    ttsActive: false,
    ttsReady: false,
    isSpeaking: false,
    currentWordIndex: null,
    speakingRate: null,
    speakingPitch: null,
    sessionLogged: false
  };
}

// Simulate opening a story in the Reading Activity
function openStory(story) {
  if (!story || !story.id) {
    return {
      success: false,
      actualResult: 'Story open failed - Invalid story data',
      error: 'Invalid story'
    };
  }

  appState.storyOpen = true;
  appState.story = story;
  appState.ttsReady = TTS_ENGINE.isReady;

  return {
    success: true,
    storyId: story.id,
    storyTitle: story.title,
    wordCount: story.wordCount,
    storyOpen: true,
    ttsReady: TTS_ENGINE.isReady
  };
}

// Simulate triggering TTS read-aloud
function triggerReadAloud(story) {
  if (!appState.storyOpen || !appState.story) {
    return {
      success: false,
      actualResult: 'Read-aloud failed - No story open',
      error: 'Story not open'
    };
  }

  if (!TTS_ENGINE.isReady) {
    return {
      success: false,
      actualResult: 'Read-aloud failed - TTS not ready',
      error: 'TTS not ready'
    };
  }

  if (!story.content || story.content.trim().length === 0) {
    return {
      success: false,
      actualResult: 'Read-aloud failed - Story has no content',
      error: 'Empty story content'
    };
  }

  appState.ttsActive = true;
  appState.isSpeaking = true;
  appState.currentWordIndex = 0;
  appState.speakingRate = TTS_ENGINE.defaultRate;
  appState.speakingPitch = TTS_ENGINE.defaultPitch;

  const words = story.content.split(' ').filter(w => w.trim().length > 0);

  return {
    success: true,
    actualResult: 'Story is read aloud',
    performedAsExpected: true,
    storyId: story.id,
    storyTitle: story.title,
    ttsActive: true,
    isSpeaking: true,
    wordCount: words.length,
    speakingRate: TTS_ENGINE.defaultRate,
    speakingPitch: TTS_ENGINE.defaultPitch,
    supportsWordHighlight: TTS_ENGINE.supportsWordHighlight,
    supportsRateControl: TTS_ENGINE.supportsRateControl,
    integrationFlow: 'Reading Activity → Text-to-Speech (TTS)'
  };
}

// Stop TTS
function stopReadAloud() {
  appState.isSpeaking = false;
  appState.ttsActive = false;
  appState.currentWordIndex = null;
  appState.sessionLogged = true;

  return {
    success: true,
    stopped: true,
    sessionLogged: true
  };
}

// Full integration: open story → trigger TTS
async function processReadAloud(story) {
  const openResult = openStory(story);
  if (!openResult.success) {
    return {
      success: false,
      actualResult: openResult.actualResult,
      error: openResult.error,
      stage: 'story_open_failed'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 30));

  const ttsResult = triggerReadAloud(story);
  if (!ttsResult.success) {
    return {
      success: false,
      actualResult: ttsResult.actualResult,
      error: ttsResult.error,
      stage: 'tts_failed'
    };
  }

  return {
    ...ttsResult,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-009 (Reading Activity → Text-to-Speech)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Story is opened - Story is read aloud', async () => {
    const result = await processReadAloud(MOCK_STORY);

    console.log('Test Case ID: INT-009');
    console.log('Test: Integration when read-aloud support is used');
    console.log('Component: Reading Activity → Text-to-Speech (TTS)');
    console.log(`Input: Story is opened`);
    console.log(`Expected Result: Story is read aloud`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Story: "${result.storyTitle}"`);
    console.log(`TTS Active: ${result.ttsActive}`);
    console.log(`Is Speaking: ${result.isSpeaking}`);
    console.log(`Word Count: ${result.wordCount}`);
    console.log(`Speaking Rate: ${result.speakingRate}`);
    console.log(`Speaking Pitch: ${result.speakingPitch}`);
    console.log(`Supports Word Highlight: ${result.supportsWordHighlight}`);
    console.log(`Supports Rate Control: ${result.supportsRateControl}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.isSpeaking && result.ttsActive) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.ttsActive).toBe(true);
    expect(result.isSpeaking).toBe(true);
    expect(result.storyId).toBe('STORY001');
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.speakingRate).toBe(0.85);
    expect(result.speakingPitch).toBe(1.1);
    expect(result.supportsWordHighlight).toBe(true);
    expect(result.stage).toBe('completed');
  });

  test('Story opened - state reflects open and TTS ready', () => {
    const openResult = openStory(MOCK_STORY);

    console.log('Test Case ID: INT-009');
    console.log('Test: Story open state');
    console.log(`storyOpen: ${appState.storyOpen}`);
    console.log(`ttsReady: ${appState.ttsReady}`);
    console.log(`Story ID: ${openResult.storyId}`);
    console.log(`Story Title: ${openResult.storyTitle}`);

    if (appState.storyOpen && appState.ttsReady) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.storyOpen).toBe(true);
    expect(appState.ttsReady).toBe(true);
    expect(openResult.storyId).toBe('STORY001');
    expect(openResult.wordCount).toBe(13);
  });

  test('TTS triggered - app state reflects speaking', async () => {
    await processReadAloud(MOCK_STORY);

    console.log('Test Case ID: INT-009');
    console.log('Test: App state during read-aloud');
    console.log(`isSpeaking: ${appState.isSpeaking}`);
    console.log(`ttsActive: ${appState.ttsActive}`);
    console.log(`speakingRate: ${appState.speakingRate}`);
    console.log(`currentWordIndex: ${appState.currentWordIndex}`);

    if (appState.isSpeaking && appState.ttsActive) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.isSpeaking).toBe(true);
    expect(appState.ttsActive).toBe(true);
    expect(appState.speakingRate).toBe(0.85);
    expect(appState.currentWordIndex).toBe(0);
  });

  test('TTS stopped - session is logged', async () => {
    await processReadAloud(MOCK_STORY);
    const stopResult = stopReadAloud();

    console.log('Test Case ID: INT-009');
    console.log('Test: TTS stopped and session logged');
    console.log(`Stopped: ${stopResult.stopped}`);
    console.log(`Session Logged: ${stopResult.sessionLogged}`);
    console.log(`isSpeaking: ${appState.isSpeaking}`);

    if (stopResult.stopped && stopResult.sessionLogged && !appState.isSpeaking) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(stopResult.stopped).toBe(true);
    expect(stopResult.sessionLogged).toBe(true);
    expect(appState.isSpeaking).toBe(false);
    expect(appState.ttsActive).toBe(false);
  });

  test('No story open - TTS read-aloud fails', () => {
    const result = triggerReadAloud(MOCK_STORY);

    console.log('Test Case ID: INT-009');
    console.log('Test: No story open (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Story not open') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Story not open');
  });

  test('Empty story content - read-aloud fails gracefully', async () => {
    const emptyStory = { ...MOCK_STORY, content: '' };
    const result = await processReadAloud(emptyStory);

    console.log('Test Case ID: INT-009');
    console.log('Test: Empty story content (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.error === 'Empty story content') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Empty story content');
    expect(result.stage).toBe('tts_failed');
  });

  test('Invalid story - open fails gracefully', async () => {
    const result = await processReadAloud(null);

    console.log('Test Case ID: INT-009');
    console.log('Test: Invalid story (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'story_open_failed') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('story_open_failed');
    expect(result.error).toBe('Invalid story');
  });

});
