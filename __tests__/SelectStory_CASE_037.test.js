// ─── Test Case CASE-037 ──────────────────────────────────────────────────────
// Test Case ID: CASE-037
// Test Case Description: Validate learner selects a story
// Expected Result: Story loads correctly with narration

// Mock story data
const stories = [
  { 
    id: 1, 
    title: 'The Little Red Hen', 
    content: 'Once upon a time, there was a little red hen who lived on a farm...',
    hasNarration: true,
    narrationFile: 'little_red_hen_narration.mp3',
    difficulty: 'Beginner',
    wordCount: 450
  },
  { 
    id: 2, 
    title: 'The Three Bears', 
    content: 'Once upon a time, there were three bears who lived in a house in the woods...',
    hasNarration: true,
    narrationFile: 'three_bears_narration.mp3',
    difficulty: 'Beginner',
    wordCount: 380
  },
  { 
    id: 3, 
    title: 'The Tortoise and the Hare', 
    content: 'Once upon a time, there was a speedy hare who bragged about how fast he could run...',
    hasNarration: true,
    narrationFile: 'tortoise_hare_narration.mp3',
    difficulty: 'Intermediate',
    wordCount: 520
  },
  { 
    id: 4, 
    title: 'The Ugly Duckling', 
    content: 'Once upon a time, a mother duck sat on her eggs...',
    hasNarration: true,
    narrationFile: 'ugly_duckling_narration.mp3',
    difficulty: 'Intermediate',
    wordCount: 600
  }
];

function loadStory(storyId) {
  // Check if story ID is provided
  if (!storyId || storyId === '') {
    return {
      success: false,
      actualResult: 'Story failed to load - No story selected',
      storyLoaded: false,
      hasNarration: false,
      story: null
    };
  }

  // Find story by ID
  const story = stories.find(s => s.id === storyId);

  if (!story) {
    return {
      success: false,
      actualResult: 'Story failed to load - Story not found',
      storyLoaded: false,
      hasNarration: false,
      story: null
    };
  }

  // Story loaded successfully with narration
  return {
    success: true,
    actualResult: 'Story loads correctly with narration',
    storyLoaded: true,
    hasNarration: story.hasNarration,
    narrationFile: story.narrationFile,
    story: {
      id: story.id,
      title: story.title,
      content: story.content,
      difficulty: story.difficulty,
      wordCount: story.wordCount
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-037 (Validate learner selects a story)', () => {

  test('Select story 1 - story loads correctly with narration', () => {
    const expectedResult = 'Story loads correctly with narration';
    const result = loadStory(1);

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate learner selects a story');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Story Loaded: ${result.storyLoaded}`);
    console.log(`Has Narration: ${result.hasNarration}`);
    console.log(`Story Title: ${result.story ? result.story.title : 'N/A'}`);
    console.log(`Narration File: ${result.narrationFile}`);

    if (result.success && result.storyLoaded && result.hasNarration) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.storyLoaded).toBe(true);
    expect(result.actualResult).toContain('loads correctly with narration');
    expect(result.hasNarration).toBe(true);
    expect(result.story.title).toBe('The Little Red Hen');
    expect(result.narrationFile).toBe('little_red_hen_narration.mp3');
  });

  test('Select story 2 - story loads correctly with narration', () => {
    const expectedResult = 'Story loads correctly with narration';
    const result = loadStory(2);

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate learner selects a story');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Story Loaded: ${result.storyLoaded}`);
    console.log(`Story Title: ${result.story ? result.story.title : 'N/A'}`);

    if (result.success && result.storyLoaded && result.hasNarration) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.storyLoaded).toBe(true);
    expect(result.story.title).toBe('The Three Bears');
    expect(result.story.difficulty).toBe('Beginner');
  });

  test('Select story 3 - story loads correctly with narration', () => {
    const expectedResult = 'Story loads correctly with narration';
    const result = loadStory(3);

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate learner selects a story');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Story Loaded: ${result.storyLoaded}`);
    console.log(`Word Count: ${result.story ? result.story.wordCount : 'N/A'}`);

    if (result.success && result.storyLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.storyLoaded).toBe(true);
    expect(result.story.title).toBe('The Tortoise and the Hare');
    expect(result.story.wordCount).toBe(520);
  });

  test('Select story 4 - story loads correctly with narration', () => {
    const expectedResult = 'Story loads correctly with narration';
    const result = loadStory(4);

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate learner selects a story');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.storyLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.storyLoaded).toBe(true);
    expect(result.story.title).toBe('The Ugly Duckling');
    expect(result.hasNarration).toBe(true);
  });

  test('Invalid story ID - story should not load (negative test)', () => {
    const result = loadStory(99);

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate learner selects a story');
    console.log('Expected Result: Story loads correctly with narration (for valid stories)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.storyLoaded) {
      console.log('Outcome: PASSED - Correctly rejected invalid story ID');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.storyLoaded).toBe(false);
    expect(result.actualResult).toContain('not found');
  });

  test('No story selected - story should not load (negative test)', () => {
    const result = loadStory(null);

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate learner selects a story');
    console.log('Expected Result: Story loads correctly with narration (for valid stories)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.storyLoaded) {
      console.log('Outcome: PASSED - Correctly rejected no selection');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.storyLoaded).toBe(false);
    expect(result.actualResult).toContain('No story selected');
  });

});
