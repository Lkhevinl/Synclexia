// ─── Test Case CASE-038 ──────────────────────────────────────────────────────
// Test Case ID: CASE-038
// Test Case Description: Validate by tapping "Tutorial" icon button
// Expected Result: Tutorial loads successfully for learner guidance

// Mock tutorial data
const tutorialData = {
  id: 'tutorial',
  title: 'Getting Started Tutorial',
  sections: [
    { id: 1, title: 'Welcome', content: 'Welcome to Synclexia learning app' },
    { id: 2, title: 'How to Use', content: 'Learn how to navigate activities' },
    { id: 3, title: 'Features', content: 'Explore all available features' },
    { id: 4, title: 'Tips', content: 'Tips for effective learning' }
  ],
  totalSteps: 4,
  hasProgressTracking: true,
  isInteractive: true
};

function loadTutorial(buttonName) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Tutorial failed to load - Button not specified',
      tutorialLoaded: false,
      data: null
    };
  }

  // Check if it's the tutorial button/icon
  if (buttonName.toLowerCase() !== 'tutorial') {
    return {
      success: false,
      actualResult: 'Tutorial failed to load - Invalid button',
      tutorialLoaded: false,
      data: null
    };
  }

  // Load tutorial
  return {
    success: true,
    actualResult: 'Tutorial loads successfully for learner guidance',
    tutorialLoaded: true,
    data: tutorialData,
    sectionCount: tutorialData.sections.length,
    totalSteps: tutorialData.totalSteps,
    firstSection: tutorialData.sections[0]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-038 (Validate by tapping "Tutorial" icon button)', () => {

  test('Tap Tutorial button - tutorial loads successfully', () => {
    const expectedResult = 'Tutorial loads successfully for learner guidance';
    const result = loadTutorial('Tutorial');

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate by tapping "Tutorial" icon button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Tutorial Loaded: ${result.tutorialLoaded}`);
    console.log(`Tutorial Title: ${result.data ? result.data.title : 'N/A'}`);
    console.log(`Section Count: ${result.sectionCount}`);
    console.log(`Total Steps: ${result.totalSteps}`);
    console.log(`First Section: ${result.firstSection ? result.firstSection.title : 'N/A'}`);

    if (result.success && result.tutorialLoaded && result.data) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.tutorialLoaded).toBe(true);
    expect(result.actualResult).toContain('loads successfully');
    expect(result.data.title).toBe('Getting Started Tutorial');
    expect(result.sectionCount).toBe(4);
    expect(result.data.hasProgressTracking).toBe(true);
  });

  test('Tap tutorial (lowercase) - tutorial loads successfully', () => {
    const expectedResult = 'Tutorial loads successfully for learner guidance';
    const result = loadTutorial('tutorial');

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate by tapping "Tutorial" icon button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Tutorial Loaded: ${result.tutorialLoaded}`);

    if (result.success && result.tutorialLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.tutorialLoaded).toBe(true);
    expect(result.data.isInteractive).toBe(true);
  });

  test('Tap TUTORIAL (uppercase) - tutorial loads successfully', () => {
    const expectedResult = 'Tutorial loads successfully for learner guidance';
    const result = loadTutorial('TUTORIAL');

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate by tapping "Tutorial" icon button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.tutorialLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.tutorialLoaded).toBe(true);
    expect(result.totalSteps).toBe(4);
  });

  test('Tap different button - tutorial should not load (negative test)', () => {
    const result = loadTutorial('Settings');

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate by tapping "Tutorial" icon button');
    console.log('Expected Result: Tutorial loads successfully for learner guidance (for Tutorial button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.tutorialLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-Tutorial button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.tutorialLoaded).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

  test('Empty button name - tutorial should not load (negative test)', () => {
    const result = loadTutorial('');

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate by tapping "Tutorial" icon button');
    console.log('Expected Result: Tutorial loads successfully for learner guidance (for Tutorial button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.tutorialLoaded) {
      console.log('Outcome: PASSED - Correctly rejected empty button name');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.tutorialLoaded).toBe(false);
    expect(result.actualResult).toContain('not specified');
  });

  test('Null button name - tutorial should not load (negative test)', () => {
    const result = loadTutorial(null);

    console.log('Test Case ID: CASE-038');
    console.log('Test Case Description: Validate by tapping "Tutorial" icon button');
    console.log('Expected Result: Tutorial loads successfully for learner guidance (for Tutorial button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.tutorialLoaded) {
      console.log('Outcome: PASSED - Correctly rejected null button name');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.tutorialLoaded).toBe(false);
  });

});
