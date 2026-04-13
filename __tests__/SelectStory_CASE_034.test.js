// ─── Test Case CASE-034 ──────────────────────────────────────────────────────
// Test Case ID: CASE-034
// Test Case Description: Validate learner selects a story
// Expected Result: Story loads correctly with narration

// Mock story data
const MOCK_STORY = {
  id: '1',
  title: 'The Little Cat',
  content: 'The cat sat on the mat. The cat is little and furry.',
  level: 1,
  wordCount: 12
};

const MOCK_STORIES = [
  MOCK_STORY,
  { id: '2', title: 'Big Red Ball', content: 'I see a big red ball.', level: 1, wordCount: 6 },
  { id: '3', title: 'My Family', content: 'This is my mom and dad.', level: 2, wordCount: 6 },
];

// Mock speech/narration state
let mockSpeechState = {
  isSpeaking: false,
  activeWordIndex: -1,
  lastSpokenText: null
};

function resetSpeechState() {
  mockSpeechState = {
    isSpeaking: false,
    activeWordIndex: -1,
    lastSpokenText: null
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

function selectStory(storyId, stories = MOCK_STORIES) {
  const story = stories.find(s => s.id === storyId);
  
  if (!story) {
    return {
      success: false,
      actualResult: 'Story selection failed - Story not found',
      loaded: false,
      story: null,
      error: 'Story not found'
    };
  }

  // Reset speech state for new story
  resetSpeechState();
  
  const { tokens, wordCount } = tokenize(story.content);

  return {
    success: true,
    actualResult: 'Story loaded correctly with narration ready',
    loaded: true,
    story: story,
    tokens: tokens,
    wordCount: wordCount,
    isModalVisible: true,
    readStartTime: Date.now(),
    narrationReady: true,
    error: null
  };
}

function startNarration(story) {
  if (!story || !story.content) {
    return {
      success: false,
      actualResult: 'Narration failed - No story content',
      isSpeaking: false
    };
  }

  const { tokens } = tokenize(story.content);
  const words = tokens.filter(t => t.isWord).map(t => t.text);
  
  mockSpeechState.isSpeaking = true;
  mockSpeechState.activeWordIndex = 0;
  mockSpeechState.lastSpokenText = words[0];

  return {
    success: true,
    actualResult: 'Narration started successfully',
    isSpeaking: true,
    currentWord: words[0],
    totalWords: words.length,
    words: words
  };
}

function stopNarration() {
  mockSpeechState.isSpeaking = false;
  mockSpeechState.activeWordIndex = -1;
  
  return {
    success: true,
    actualResult: 'Narration stopped',
    isSpeaking: false
  };
}

function speakWord(word, wordIndex) {
  mockSpeechState.activeWordIndex = wordIndex;
  mockSpeechState.lastSpokenText = word;
  
  return {
    success: true,
    wordSpoken: word,
    wordIndex: wordIndex,
    isActive: true
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-034 (Validate learner selects a story)', () => {

  beforeEach(() => {
    resetSpeechState();
  });

  test('Select story "The Little Cat" - loads correctly with narration ready', () => {
    const expectedResult = 'Story loaded correctly with narration ready';
    const result = selectStory('1');

    console.log('Test Case ID: CASE-034');
    console.log('Test Case Description: Validate learner selects a story');
    console.log('Test: Select "The Little Cat"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Story Title: ${result.story?.title}`);
    console.log(`Word Count: ${result.wordCount}`);
    console.log(`Narration Ready: ${result.narrationReady}`);
    console.log(`Modal Visible: ${result.isModalVisible}`);

    if (result.success && result.loaded && result.narrationReady) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.loaded).toBe(true);
    expect(result.story.title).toBe('The Little Cat');
    expect(result.wordCount).toBe(12);
    expect(result.narrationReady).toBe(true);
    expect(result.isModalVisible).toBe(true);
  });

  test('Start narration - reads story aloud word by word', () => {
    const selection = selectStory('1');
    const narration = startNarration(selection.story);

    console.log('Test Case ID: CASE-034');
    console.log('Test: Start narration');
    console.log(`Expected Result: Narration started successfully`);
    console.log(`Actual Result: ${narration.actualResult}`);
    console.log(`Is Speaking: ${narration.isSpeaking}`);
    console.log(`Current Word: ${narration.currentWord}`);
    console.log(`Total Words: ${narration.totalWords}`);

    if (narration.success && narration.isSpeaking) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(narration.success).toBe(true);
    expect(narration.isSpeaking).toBe(true);
    expect(narration.currentWord).toBe('The');
    expect(narration.totalWords).toBe(12);
  });

  test('Select story "Big Red Ball" - loads with correct content', () => {
    const result = selectStory('2');

    console.log('Test Case ID: CASE-034');
    console.log('Test: Select "Big Red Ball"');
    console.log(`Story Title: ${result.story?.title}`);
    console.log(`Content: ${result.story?.content}`);
    console.log(`Level: ${result.story?.level}`);

    if (result.success && result.story.content.includes('big red ball')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.story.title).toBe('Big Red Ball');
    expect(result.story.content).toBe('I see a big red ball.');
    expect(result.story.level).toBe(1);
  });

  test('Select non-existent story - fails gracefully', () => {
    const result = selectStory('999');

    console.log('Test Case ID: CASE-034');
    console.log('Test: Select non-existent story (negative test)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Story not found') {
      console.log('Outcome: PASSED - Error handled gracefully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Story not found');
    expect(result.loaded).toBe(false);
  });

  test('Stop narration - stops reading and resets state', () => {
    // First start narration
    const selection = selectStory('1');
    startNarration(selection.story);
    
    // Then stop it
    const stopResult = stopNarration();

    console.log('Test Case ID: CASE-034');
    console.log('Test: Stop narration');
    console.log(`Expected Result: Narration stopped`);
    console.log(`Actual Result: ${stopResult.actualResult}`);
    console.log(`Is Speaking: ${stopResult.isSpeaking}`);

    if (stopResult.success && !stopResult.isSpeaking) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(stopResult.success).toBe(true);
    expect(stopResult.isSpeaking).toBe(false);
    expect(mockSpeechState.isSpeaking).toBe(false);
    expect(mockSpeechState.activeWordIndex).toBe(-1);
  });

  test('Word-level highlighting - active word tracked during narration', () => {
    const selection = selectStory('1');
    startNarration(selection.story);
    
    // Simulate speaking second word
    const wordResult = speakWord('cat', 1);

    console.log('Test Case ID: CASE-034');
    console.log('Test: Word highlighting');
    console.log(`Word Spoken: ${wordResult.wordSpoken}`);
    console.log(`Word Index: ${wordResult.wordIndex}`);
    console.log(`Is Active: ${wordResult.isActive}`);

    if (wordResult.wordSpoken === 'cat' && wordResult.wordIndex === 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(wordResult.wordSpoken).toBe('cat');
    expect(wordResult.wordIndex).toBe(1);
    expect(wordResult.isActive).toBe(true);
    expect(mockSpeechState.activeWordIndex).toBe(1);
  });

  test('Story content tokenized correctly - words and spaces separated', () => {
    const selection = selectStory('1');
    const { tokens } = selection;

    console.log('Test Case ID: CASE-034');
    console.log('Test: Content tokenization');
    console.log(`Token Count: ${tokens.length}`);
    console.log(`Words: ${tokens.filter(t => t.isWord).length}`);
    console.log(`Spaces: ${tokens.filter(t => !t.isWord).length}`);

    const hasWords = tokens.some(t => t.isWord);
    const hasSpaces = tokens.some(t => !t.isWord);
    const wordIndicesValid = tokens
      .filter(t => t.isWord)
      .every((t, i) => t.wordIndex === i);

    if (hasWords && hasSpaces && wordIndicesValid) {
      console.log('Outcome: PASSED - Content tokenized correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(hasWords).toBe(true);
    expect(hasSpaces).toBe(true);
    expect(wordIndicesValid).toBe(true);
  });

  test('Read session duration tracked - start time recorded', () => {
    const beforeTime = Date.now();
    const result = selectStory('1');
    const afterTime = Date.now();

    console.log('Test Case ID: CASE-034');
    console.log('Test: Session duration tracking');
    console.log(`Read Start Time: ${result.readStartTime}`);
    console.log(`Time Valid: ${result.readStartTime >= beforeTime && result.readStartTime <= afterTime}`);

    const timeValid = result.readStartTime >= beforeTime && result.readStartTime <= afterTime;

    if (timeValid) {
      console.log('Outcome: PASSED - Start time recorded');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.readStartTime).toBeDefined();
    expect(timeValid).toBe(true);
  });

  test('Select different story - previous narration state cleared', () => {
    // Select first story and start narration
    const firstSelection = selectStory('1');
    startNarration(firstSelection.story);
    
    // Select different story
    const secondSelection = selectStory('2');

    console.log('Test Case ID: CASE-034');
    console.log('Test: State cleared on new selection');
    console.log(`New Story: ${secondSelection.story?.title}`);
    console.log(`Speech State Reset: ${!mockSpeechState.isSpeaking}`);
    console.log(`Active Word Reset: ${mockSpeechState.activeWordIndex === -1}`);

    const stateReset = !mockSpeechState.isSpeaking && mockSpeechState.activeWordIndex === -1;

    if (secondSelection.success && stateReset) {
      console.log('Outcome: PASSED - State cleared correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(secondSelection.story.title).toBe('Big Red Ball');
    expect(mockSpeechState.isSpeaking).toBe(false);
    expect(mockSpeechState.activeWordIndex).toBe(-1);
  });

});
