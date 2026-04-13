// ─── Test Case CASE-036 ──────────────────────────────────────────────────────
// Test Case ID: CASE-036
// Test Case Description: Validate by tapping "Reading" activity
// Expected Result: Reading activity screen loads successfully

// Mock reading activity data
const readingActivities = [
  { id: 1, title: 'Sight Words', description: 'Learn common sight words', difficulty: 'Beginner' },
  { id: 2, title: 'Story Time', description: 'Read along with stories', difficulty: 'Intermediate' },
  { id: 3, title: 'Comprehension', description: 'Test your understanding', difficulty: 'Advanced' },
  { id: 4, title: 'Vocabulary', description: 'Build your word bank', difficulty: 'Beginner' }
];

function loadReadingActivity(activityName) {
  // Check if activity name is provided
  if (!activityName || activityName.trim() === '') {
    return {
      success: false,
      actualResult: 'Reading activity screen failed to load - Activity not specified',
      screenLoaded: false,
      activities: null,
      activityCount: 0
    };
  }

  // Check if it's the reading activity
  if (activityName.toLowerCase() !== 'reading') {
    return {
      success: false,
      actualResult: 'Reading activity screen failed to load - Invalid activity',
      screenLoaded: false,
      activities: null,
      activityCount: 0
    };
  }

  // Load reading activities
  return {
    success: true,
    actualResult: 'Reading activity screen loads successfully',
    screenLoaded: true,
    activities: readingActivities,
    activityCount: readingActivities.length,
    firstActivity: readingActivities[0]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-036 (Validate by tapping "Reading" activity)', () => {

  test('Tap Reading activity - screen loads successfully', () => {
    const expectedResult = 'Reading activity screen loads successfully';
    const result = loadReadingActivity('Reading');

    console.log('Test Case ID: CASE-036');
    console.log('Test Case Description: Validate by tapping "Reading" activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);
    console.log(`Activity Count: ${result.activityCount}`);
    console.log(`First Activity: ${result.firstActivity ? result.firstActivity.title : 'N/A'}`);

    if (result.success && result.screenLoaded && result.activityCount > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.actualResult).toContain('loads successfully');
    expect(result.activityCount).toBe(4);
    expect(result.firstActivity.title).toBe('Sight Words');
  });

  test('Tap reading (lowercase) - screen loads successfully', () => {
    const expectedResult = 'Reading activity screen loads successfully';
    const result = loadReadingActivity('reading');

    console.log('Test Case ID: CASE-036');
    console.log('Test Case Description: Validate by tapping "Reading" activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.activityCount).toBe(4);
  });

  test('Tap READING (uppercase) - screen loads successfully', () => {
    const expectedResult = 'Reading activity screen loads successfully';
    const result = loadReadingActivity('READING');

    console.log('Test Case ID: CASE-036');
    console.log('Test Case Description: Validate by tapping "Reading" activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
  });

  test('Tap different activity - reading screen should not load (negative test)', () => {
    const result = loadReadingActivity('Math');

    console.log('Test Case ID: CASE-036');
    console.log('Test Case Description: Validate by tapping "Reading" activity');
    console.log('Expected Result: Reading activity screen loads successfully (for Reading activity)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-Reading activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

  test('Empty activity name - reading screen should not load (negative test)', () => {
    const result = loadReadingActivity('');

    console.log('Test Case ID: CASE-036');
    console.log('Test Case Description: Validate by tapping "Reading" activity');
    console.log('Expected Result: Reading activity screen loads successfully (for Reading activity)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected empty activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('not specified');
  });

  test('Null activity name - reading screen should not load (negative test)', () => {
    const result = loadReadingActivity(null);

    console.log('Test Case ID: CASE-036');
    console.log('Test Case Description: Validate by tapping "Reading" activity');
    console.log('Expected Result: Reading activity screen loads successfully (for Reading activity)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected null activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
  });

});
