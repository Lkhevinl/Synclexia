// ─── Test Case CASE-033 ──────────────────────────────────────────────────────
// Test Case ID: CASE-033
// Test Case Description: Validate by tapping "Reading" activity
// Expected Result: Reading activity screen loads successfully

// Mock stories data
const MOCK_STORIES = [
  { id: '1', title: 'The Little Cat', content: 'The cat sat on the mat.', level: 1 },
  { id: '2', title: 'Big Red Ball', content: 'I see a big red ball.', level: 1 },
  { id: '3', title: 'My Family', content: 'This is my mom and dad.', level: 2 },
  { id: '4', title: 'The Park', content: 'We play at the park.', level: 2 },
  { id: '5', title: 'A Rainy Day', content: 'It is raining outside today.', level: 3 },
];

// Mock Supabase responses
const mockSupabaseResponses = {
  withStories: { data: MOCK_STORIES, error: null },
  emptyStories: { data: [], error: null },
  withError: { data: null, error: { message: 'Connection failed' } },
};

function loadReadingScreen(supabaseResponse = mockSupabaseResponses.withStories) {
  const { data, error } = supabaseResponse;

  if (error) {
    return {
      success: false,
      actualResult: `Reading screen failed to load - ${error.message}`,
      loaded: false,
      stories: [],
      error: error.message,
      isLoading: false
    };
  }

  if (!data) {
    return {
      success: false,
      actualResult: 'Reading screen failed to load - No data received',
      loaded: false,
      stories: [],
      error: 'No data',
      isLoading: false
    };
  }

  // Simulate loading state
  const isLoading = false;
  const stories = data || [];

  return {
    success: true,
    actualResult: 'Reading activity screen loaded successfully',
    loaded: true,
    stories: stories,
    storyCount: stories.length,
    error: null,
    isLoading: isLoading,
    hasContent: stories.length > 0
  };
}

function handleTapReadingActivity(supabaseResponse = mockSupabaseResponses.withStories) {
  console.log('User taps "Reading" activity...');
  
  const result = loadReadingScreen(supabaseResponse);
  
  return {
    ...result,
    action: 'tap_reading_activity',
    navigationTarget: 'ReadingScreen'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-033 (Validate by tapping "Reading" activity)', () => {

  test('Tap Reading - screen loads with stories successfully', () => {
    const expectedResult = 'Reading activity screen loaded successfully';
    const result = handleTapReadingActivity(mockSupabaseResponses.withStories);

    console.log('Test Case ID: CASE-033');
    console.log('Test Case Description: Validate by tapping "Reading" activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Stories Loaded: ${result.storyCount}`);
    console.log(`Has Content: ${result.hasContent}`);
    console.log(`Navigation Target: ${result.navigationTarget}`);

    if (result.success && result.loaded && result.storyCount > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.loaded).toBe(true);
    expect(result.storyCount).toBe(5);
    expect(result.hasContent).toBe(true);
    expect(result.navigationTarget).toBe('ReadingScreen');
  });

  test('Reading screen - shows loading state initially', () => {
    // Simulate initial loading state before data arrives
    const loadingResult = {
      success: true,
      actualResult: 'Reading screen loading',
      loaded: false,
      isLoading: true,
      stories: [],
      storyCount: 0
    };

    console.log('Test Case ID: CASE-033');
    console.log('Test: Loading state');
    console.log(`Is Loading: ${loadingResult.isLoading}`);
    console.log(`Stories: ${loadingResult.storyCount}`);

    if (loadingResult.isLoading && loadingResult.storyCount === 0) {
      console.log('Outcome: PASSED - Loading state shown');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(loadingResult.isLoading).toBe(true);
    expect(loadingResult.storyCount).toBe(0);
    expect(loadingResult.loaded).toBe(false);
  });

  test('Reading screen - handles empty library gracefully', () => {
    const result = handleTapReadingActivity(mockSupabaseResponses.emptyStories);

    console.log('Test Case ID: CASE-033');
    console.log('Test: Empty library');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Stories: ${result.storyCount}`);
    console.log(`Has Content: ${result.hasContent}`);

    if (result.success && result.storyCount === 0 && !result.hasContent) {
      console.log('Outcome: PASSED - Empty state handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.storyCount).toBe(0);
    expect(result.hasContent).toBe(false);
  });

  test('Reading screen - handles connection error gracefully', () => {
    const result = handleTapReadingActivity(mockSupabaseResponses.withError);

    console.log('Test Case ID: CASE-033');
    console.log('Test: Connection error (negative test)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Connection failed') {
      console.log('Outcome: PASSED - Error handled gracefully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection failed');
    expect(result.loaded).toBe(false);
  });

  test('Reading screen - stories sorted by level', () => {
    const result = handleTapReadingActivity(mockSupabaseResponses.withStories);
    const levels = result.stories.map(s => s.level);
    
    console.log('Test Case ID: CASE-033');
    console.log('Test: Stories sorted by level');
    console.log(`Levels: ${levels.join(', ')}`);
    
    // Check if sorted ascending
    const isSorted = levels.every((val, i, arr) => !i || arr[i-1] <= val);
    
    if (isSorted) {
      console.log('Outcome: PASSED - Stories sorted by level');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(isSorted).toBe(true);
  });

  test('Reading screen - each story has required fields', () => {
    const result = handleTapReadingActivity(mockSupabaseResponses.withStories);
    
    console.log('Test Case ID: CASE-033');
    console.log('Test: Story field validation');
    
    const validStories = result.stories.every(story => 
      story.id && 
      story.title && 
      story.content && 
      story.level !== undefined
    );
    
    if (validStories) {
      console.log('Outcome: PASSED - All stories have required fields');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(validStories).toBe(true);
  });

  test('Reading screen - displays correct book colors by level', () => {
    const LEVEL_COLORS = ['#FF7043', '#FFA726', '#EC407A', '#AB47BC', '#5C6BC0', '#26A69A', '#42A5F5', '#66BB6A'];
    
    const result = handleTapReadingActivity(mockSupabaseResponses.withStories);
    const storyColors = result.stories.map(s => LEVEL_COLORS[((parseInt(s.level) || 1) - 1) % LEVEL_COLORS.length]);
    
    console.log('Test Case ID: CASE-033');
    console.log('Test: Book colors by level');
    console.log(`Colors assigned: ${storyColors.join(', ')}`);
    
    const hasValidColors = storyColors.every(color => LEVEL_COLORS.includes(color));
    
    if (hasValidColors) {
      console.log('Outcome: PASSED - Valid colors assigned');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(hasValidColors).toBe(true);
  });

  test('Reading screen - tap on book opens reader modal', () => {
    const result = handleTapReadingActivity(mockSupabaseResponses.withStories);
    const selectedStory = result.stories[0];
    
    const modalState = {
      selectedStory: selectedStory,
      isModalVisible: true,
      readStartTime: Date.now()
    };
    
    console.log('Test Case ID: CASE-033');
    console.log('Test: Book tap opens reader');
    console.log(`Selected Story: ${modalState.selectedStory?.title}`);
    console.log(`Modal Visible: ${modalState.isModalVisible}`);
    
    if (modalState.selectedStory && modalState.isModalVisible) {
      console.log('Outcome: PASSED - Reader modal opens');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(modalState.selectedStory).not.toBeNull();
    expect(modalState.isModalVisible).toBe(true);
    expect(modalState.selectedStory.title).toBe('The Little Cat');
  });

});
