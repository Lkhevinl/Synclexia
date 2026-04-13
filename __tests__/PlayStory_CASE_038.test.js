// ─── Test Case CASE-038 ──────────────────────────────────────────────────────
// Test Case ID: CASE-038
// Test Case Description: Validate learner taps "Read to Me" button
// Expected Result: Audio playback of story starts

// Mock audio player state
let storyAudioState = {
  isPlaying: false,
  currentStory: null,
  narrationFile: null,
  currentTime: 0,
  duration: 0
};

function playStoryNarration(story) {
  // Check if story is provided
  if (!story || !story.id) {
    return {
      playing: false,
      actualResult: 'Audio playback failed - No story selected',
      error: 'Please select a story first'
    };
  }

  // Check if story has narration
  if (!story.hasNarration || !story.narrationFile) {
    return {
      playing: false,
      actualResult: 'Audio playback failed - Story has no narration',
      error: 'This story does not have audio narration available'
    };
  }

  // Start audio playback
  storyAudioState = {
    isPlaying: true,
    currentStory: story.title,
    narrationFile: story.narrationFile,
    currentTime: 0,
    duration: story.wordCount * 0.5 // Approximate duration based on word count
  };

  return {
    playing: true,
    actualResult: 'Audio playback of story starts',
    storyTitle: story.title,
    narrationFile: story.narrationFile,
    duration: storyAudioState.duration
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-038 (Validate learner taps "Read to Me" button)', () => {

  beforeEach(() => {
    // Reset audio state before each test
    storyAudioState = {
      isPlaying: false,
      currentStory: null,
      narrationFile: null,
      currentTime: 0,
      duration: 0
    };
  });

  test('Tap Read to Me - audio playback of story starts', () => {
    const expectedResult = 'Audio playback of story starts';
    const mockStory = {
      id: 1,
      title: 'The Little Red Hen',
      hasNarration: true,
      narrationFile: 'little_red_hen_narration.mp3',
      wordCount: 450
    };
    const result = playStoryNarration(mockStory);

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate learner taps "Read to Me" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Story Title: ${result.storyTitle}`);
    console.log(`Audio Playing: ${result.playing}`);
    console.log(`Narration File: ${result.narrationFile}`);
    console.log(`Duration: ${result.duration}s`);

    if (result.playing && storyAudioState.isPlaying) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.actualResult).toContain('Audio playback');
    expect(result.actualResult).toContain('starts');
    expect(result.storyTitle).toBe('The Little Red Hen');
    expect(storyAudioState.isPlaying).toBe(true);
    expect(storyAudioState.currentStory).toBe('The Little Red Hen');
  });

  test('Tap Read to Me for story 2 - audio playback starts', () => {
    const expectedResult = 'Audio playback of story starts';
    const mockStory = {
      id: 2,
      title: 'The Three Bears',
      hasNarration: true,
      narrationFile: 'three_bears_narration.mp3',
      wordCount: 380
    };
    const result = playStoryNarration(mockStory);

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate learner taps "Read to Me" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Story Title: ${result.storyTitle}`);

    if (result.playing && storyAudioState.isPlaying) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.storyTitle).toBe('The Three Bears');
    expect(storyAudioState.narrationFile).toBe('three_bears_narration.mp3');
  });

  test('Tap Read to Me for story 3 - audio playback starts', () => {
    const expectedResult = 'Audio playback of story starts';
    const mockStory = {
      id: 3,
      title: 'The Tortoise and the Hare',
      hasNarration: true,
      narrationFile: 'tortoise_hare_narration.mp3',
      wordCount: 520
    };
    const result = playStoryNarration(mockStory);

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate learner taps "Read to Me" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.playing) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.storyTitle).toBe('The Tortoise and the Hare');
  });

  test('Tap Read to Me without story - audio should not start (negative test)', () => {
    const result = playStoryNarration(null);

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate learner taps "Read to Me" button');
    console.log('Expected Result: Audio playback of story starts (when story selected)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.playing && !storyAudioState.isPlaying) {
      console.log('Outcome: PASSED - Correctly rejected no story selection');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(storyAudioState.isPlaying).toBe(false);
    expect(result.error).toBe('Please select a story first');
  });

  test('Tap Read to Me for story without narration - audio should not start (negative test)', () => {
    const mockStory = {
      id: 5,
      title: 'Story Without Audio',
      hasNarration: false,
      narrationFile: null,
      wordCount: 300
    };
    const result = playStoryNarration(mockStory);

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate learner taps "Read to Me" button');
    console.log('Expected Result: Audio playback of story starts (when narration available)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.playing && !storyAudioState.isPlaying) {
      console.log('Outcome: PASSED - Correctly rejected story without narration');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(storyAudioState.isPlaying).toBe(false);
    expect(result.error).toContain('does not have audio narration');
  });

});
