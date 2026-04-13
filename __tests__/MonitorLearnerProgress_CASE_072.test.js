// ─── Test Case CASE-072 ──────────────────────────────────────────────────────
// Test Case ID: CASE-072
// Test Case Description: Validate viewing learner progress
// Expected Result: Able to view learner progress

// Mock learner progress data
const LEARNER_PROGRESS = {
  learnerId: 'LEARNER001',
  learnerName: 'Alex Johnson',
  linkedParent: 'John Smith',
  overallAccuracy: 85,
  totalStars: 245,
  totalActivities: 50,
  completedActivities: 42,
  gamesPlayed: {
    phonics: 15,
    writing: 10,
    spelling: 8,
    sound: 9
  },
  recentActivity: [
    { date: '2024-04-12', game: 'Phonics Game', score: 90, stars: 3 },
    { date: '2024-04-11', game: 'Spelling Game', score: 80, stars: 2 },
    { date: '2024-04-10', game: 'Writing Activity', score: 95, stars: 3 },
    { date: '2024-04-09', game: 'Sound Game', score: 75, stars: 2 }
  ],
  weeklyProgress: [
    { week: 'Week 1', accuracy: 78, stars: 45 },
    { week: 'Week 2', accuracy: 82, stars: 52 },
    { week: 'Week 3', accuracy: 85, stars: 60 },
    { week: 'Week 4', accuracy: 88, stars: 68 }
  ],
  skillsBreakdown: {
    phonics: { score: 88, level: 'Advanced' },
    spelling: { score: 82, level: 'Intermediate' },
    writing: { score: 90, level: 'Advanced' },
    soundRecognition: { score: 79, level: 'Intermediate' }
  }
};

function viewLearnerProgress(parentId, learnerId) {
  // Check if parent ID is provided
  if (!parentId || parentId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to view progress - Parent not authenticated',
      canViewProgress: false,
      errorMessage: 'Please log in as parent'
    };
  }

  // Check if learner ID is provided
  if (!learnerId || learnerId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to view progress - Learner not specified',
      canViewProgress: false,
      errorMessage: 'Please select a learner'
    };
  }

  // Check if learner is linked to this parent
  if (learnerId !== LEARNER_PROGRESS.learnerId) {
    return {
      success: false,
      actualResult: 'Unable to view progress - Learner not linked',
      canViewProgress: false,
      errorMessage: 'This learner is not linked to your account'
    };
  }

  // Return progress data
  return {
    success: true,
    actualResult: 'Able to view learner progress',
    canViewProgress: true,
    learnerId: LEARNER_PROGRESS.learnerId,
    learnerName: LEARNER_PROGRESS.learnerName,
    overallAccuracy: LEARNER_PROGRESS.overallAccuracy,
    totalStars: LEARNER_PROGRESS.totalStars,
    totalActivities: LEARNER_PROGRESS.totalActivities,
    completedActivities: LEARNER_PROGRESS.completedActivities,
    completionRate: Math.round((LEARNER_PROGRESS.completedActivities / LEARNER_PROGRESS.totalActivities) * 100),
    gamesPlayed: LEARNER_PROGRESS.gamesPlayed,
    recentActivity: LEARNER_PROGRESS.recentActivity,
    weeklyProgress: LEARNER_PROGRESS.weeklyProgress,
    skillsBreakdown: LEARNER_PROGRESS.skillsBreakdown,
    lastActive: LEARNER_PROGRESS.recentActivity[0].date
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-072 (Validate viewing learner progress)', () => {

  test('View learner progress - able to view learner progress', () => {
    const expectedResult = 'Able to view learner progress';
    const parentId = 'PARENT001';
    const learnerId = 'LEARNER001';
    
    const result = viewLearnerProgress(parentId, learnerId);

    console.log('Test Case ID: CASE-072');
    console.log('Test Case Description: Validate viewing learner progress');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Can View Progress: ${result.canViewProgress}`);
    console.log(`Learner ID: ${result.learnerId}`);
    console.log(`Learner Name: ${result.learnerName}`);
    console.log(`Overall Accuracy: ${result.overallAccuracy}%`);
    console.log(`Total Stars: ${result.totalStars}`);
    console.log(`Total Activities: ${result.totalActivities}`);
    console.log(`Completed Activities: ${result.completedActivities}`);
    console.log(`Completion Rate: ${result.completionRate}%`);
    console.log(`Games Played:`, result.gamesPlayed);
    console.log(`Recent Activity:`, result.recentActivity);
    console.log(`Weekly Progress:`, result.weeklyProgress);
    console.log(`Skills Breakdown:`, result.skillsBreakdown);
    console.log(`Last Active: ${result.lastActive}`);

    if (result.success && result.canViewProgress && result.learnerId === 'LEARNER001') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.canViewProgress).toBe(true);
    expect(result.actualResult).toContain('view learner progress');
    expect(result.learnerId).toBe('LEARNER001');
    expect(result.learnerName).toBe('Alex Johnson');
    expect(result.overallAccuracy).toBe(85);
    expect(result.totalStars).toBe(245);
    expect(result.completionRate).toBe(84);
    expect(result.gamesPlayed).toHaveProperty('phonics');
    expect(result.recentActivity).toHaveLength(4);
    expect(result.skillsBreakdown).toHaveProperty('phonics');
    expect(result.skillsBreakdown.phonics.score).toBe(88);
  });

  test('View progress with valid parent - able to view learner progress', () => {
    const expectedResult = 'Able to view learner progress';
    const parentId = 'PARENT123';
    const learnerId = 'LEARNER001';
    
    const result = viewLearnerProgress(parentId, learnerId);

    console.log('Test Case ID: CASE-072');
    console.log('Test Case Description: Validate viewing learner progress');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Learner Name: ${result.learnerName}`);
    console.log(`Accuracy: ${result.overallAccuracy}%`);

    if (result.success && result.canViewProgress) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.canViewProgress).toBe(true);
    expect(result.learnerName).toBe('Alex Johnson');
  });

  test('View progress data includes all required fields', () => {
    const parentId = 'PARENT001';
    const learnerId = 'LEARNER001';
    
    const result = viewLearnerProgress(parentId, learnerId);

    console.log('Test Case ID: CASE-072');
    console.log('Test Case Description: Validate viewing learner progress');
    console.log('Test: Verify all required progress data fields');
    console.log(`Has learnerId: ${!!result.learnerId}`);
    console.log(`Has learnerName: ${!!result.learnerName}`);
    console.log(`Has overallAccuracy: ${!!result.overallAccuracy}`);
    console.log(`Has totalStars: ${!!result.totalStars}`);
    console.log(`Has gamesPlayed: ${!!result.gamesPlayed}`);
    console.log(`Has recentActivity: ${!!result.recentActivity}`);
    console.log(`Has weeklyProgress: ${!!result.weeklyProgress}`);
    console.log(`Has skillsBreakdown: ${!!result.skillsBreakdown}`);

    if (result.success && 
        result.learnerId && 
        result.learnerName && 
        result.overallAccuracy !== undefined &&
        result.totalStars !== undefined &&
        result.gamesPlayed &&
        result.recentActivity &&
        result.weeklyProgress &&
        result.skillsBreakdown) {
      console.log('Outcome: PASSED - All required fields present');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.learnerId).toBeDefined();
    expect(result.learnerName).toBeDefined();
    expect(result.overallAccuracy).toBeDefined();
    expect(result.totalStars).toBeDefined();
    expect(result.gamesPlayed).toBeDefined();
    expect(result.recentActivity).toBeDefined();
    expect(result.weeklyProgress).toBeDefined();
    expect(result.skillsBreakdown).toBeDefined();
  });

  test('View progress for unlinked learner - unable to view (negative test)', () => {
    const parentId = 'PARENT001';
    const unlinkedLearnerId = 'LEARNER999';
    
    const result = viewLearnerProgress(parentId, unlinkedLearnerId);

    console.log('Test Case ID: CASE-072');
    console.log('Test Case Description: Validate viewing learner progress');
    console.log('Expected Result: Able to view learner progress (for linked learner)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Can View: ${result.canViewProgress}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.canViewProgress) {
      console.log('Outcome: PASSED - Correctly rejected unlinked learner');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canViewProgress).toBe(false);
    expect(result.errorMessage).toContain('not linked');
  });

  test('View progress without parent authentication - unable to view (negative test)', () => {
    const parentId = '';
    const learnerId = 'LEARNER001';
    
    const result = viewLearnerProgress(parentId, learnerId);

    console.log('Test Case ID: CASE-072');
    console.log('Test Case Description: Validate viewing learner progress');
    console.log('Expected Result: Able to view learner progress (when authenticated)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.canViewProgress) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated parent');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canViewProgress).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('View progress without learner ID - unable to view (negative test)', () => {
    const parentId = 'PARENT001';
    const learnerId = '';
    
    const result = viewLearnerProgress(parentId, learnerId);

    console.log('Test Case ID: CASE-072');
    console.log('Test Case Description: Validate viewing learner progress');
    console.log('Expected Result: Able to view learner progress (when learner specified)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.canViewProgress) {
      console.log('Outcome: PASSED - Correctly rejected missing learner ID');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canViewProgress).toBe(false);
    expect(result.errorMessage).toContain('select a learner');
  });

});
