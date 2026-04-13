// ─── Test Case CASE-073 ──────────────────────────────────────────────────────
// Test Case ID: CASE-073
// Test Case Description: Validate opening learner recent sessions
// Expected Result: Able to view learner recent sessions

// Mock recent sessions data
const RECENT_SESSIONS = {
  learnerId: 'LEARNER001',
  learnerName: 'Alex Johnson',
  totalSessions: 10,
  sessions: [
    {
      sessionId: 'SES-001',
      date: '2024-04-12',
      startTime: '14:30',
      endTime: '15:15',
      duration: 45,
      activities: [
        { name: 'Phonics Game', score: 90, stars: 3, completed: true },
        { name: 'Writing Activity', score: 85, stars: 2, completed: true }
      ],
      totalStars: 5,
      accuracy: 87
    },
    {
      sessionId: 'SES-002',
      date: '2024-04-11',
      startTime: '10:00',
      endTime: '10:40',
      duration: 40,
      activities: [
        { name: 'Spelling Game', score: 80, stars: 2, completed: true },
        { name: 'Sound Match', score: 75, stars: 2, completed: true }
      ],
      totalStars: 4,
      accuracy: 77
    },
    {
      sessionId: 'SES-003',
      date: '2024-04-10',
      startTime: '16:00',
      endTime: '16:45',
      duration: 45,
      activities: [
        { name: 'Blend it! Game', score: 95, stars: 3, completed: true },
        { name: 'Count Sounds', score: 88, stars: 3, completed: true }
      ],
      totalStars: 6,
      accuracy: 91
    },
    {
      sessionId: 'SES-004',
      date: '2024-04-09',
      startTime: '09:30',
      endTime: '10:00',
      duration: 30,
      activities: [
        { name: 'Trace Letters', score: 92, stars: 3, completed: true }
      ],
      totalStars: 3,
      accuracy: 92
    },
    {
      sessionId: 'SES-005',
      date: '2024-04-08',
      startTime: '15:00',
      endTime: '15:50',
      duration: 50,
      activities: [
        { name: 'Phonics Game', score: 78, stars: 2, completed: true },
        { name: 'Pick-a-Sound', score: 82, stars: 2, completed: true },
        { name: 'Clap & Snap', score: 70, stars: 1, completed: true }
      ],
      totalStars: 5,
      accuracy: 76
    }
  ]
};

function viewRecentSessions(parentId, learnerId) {
  // Check if parent ID is provided
  if (!parentId || parentId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to view sessions - Parent not authenticated',
      canViewSessions: false,
      errorMessage: 'Please log in as parent'
    };
  }

  // Check if learner ID is provided
  if (!learnerId || learnerId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to view sessions - Learner not specified',
      canViewSessions: false,
      errorMessage: 'Please select a learner'
    };
  }

  // Check if learner matches
  if (learnerId !== RECENT_SESSIONS.learnerId) {
    return {
      success: false,
      actualResult: 'Unable to view sessions - Learner not linked',
      canViewSessions: false,
      errorMessage: 'This learner is not linked to your account'
    };
  }

  // Return sessions data
  return {
    success: true,
    actualResult: 'Able to view learner recent sessions',
    canViewSessions: true,
    learnerId: RECENT_SESSIONS.learnerId,
    learnerName: RECENT_SESSIONS.learnerName,
    totalSessions: RECENT_SESSIONS.totalSessions,
    sessions: RECENT_SESSIONS.sessions,
    averageSessionDuration: Math.round(
      RECENT_SESSIONS.sessions.reduce((sum, s) => sum + s.duration, 0) / RECENT_SESSIONS.sessions.length
    ),
    averageStarsPerSession: Math.round(
      RECENT_SESSIONS.sessions.reduce((sum, s) => sum + s.totalStars, 0) / RECENT_SESSIONS.sessions.length * 10
    ) / 10
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-073 (Validate opening learner recent sessions)', () => {

  test('Open recent sessions - able to view learner recent sessions', () => {
    const expectedResult = 'Able to view learner recent sessions';
    const parentId = 'PARENT001';
    const learnerId = 'LEARNER001';
    
    const result = viewRecentSessions(parentId, learnerId);

    console.log('Test Case ID: CASE-073');
    console.log('Test Case Description: Validate opening learner recent sessions');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Can View Sessions: ${result.canViewSessions}`);
    console.log(`Learner ID: ${result.learnerId}`);
    console.log(`Learner Name: ${result.learnerName}`);
    console.log(`Total Sessions: ${result.totalSessions}`);
    console.log(`Average Duration: ${result.averageSessionDuration} minutes`);
    console.log(`Average Stars Per Session: ${result.averageStarsPerSession}`);
    console.log(`Sessions:`);
    if (result.sessions) {
      result.sessions.forEach((session, index) => {
        console.log(`  Session ${index + 1}: ${session.date} (${session.startTime}-${session.endTime}) - ${session.duration} min, ${session.totalStars} stars, ${session.accuracy}% accuracy`);
        session.activities.forEach(act => {
          console.log(`    - ${act.name}: ${act.score}%, ${act.stars} stars`);
        });
      });
    }

    if (result.success && result.canViewSessions && result.sessions.length === 5) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.canViewSessions).toBe(true);
    expect(result.actualResult).toContain('view learner recent sessions');
    expect(result.learnerId).toBe('LEARNER001');
    expect(result.learnerName).toBe('Alex Johnson');
    expect(result.totalSessions).toBe(10);
    expect(result.sessions).toHaveLength(5);
    expect(result.averageSessionDuration).toBe(42);
    expect(result.averageStarsPerSession).toBe(4.6);
  });

  test('View sessions with valid parent - able to view sessions', () => {
    const expectedResult = 'Able to view learner recent sessions';
    const parentId = 'PARENT123';
    const learnerId = 'LEARNER001';
    
    const result = viewRecentSessions(parentId, learnerId);

    console.log('Test Case ID: CASE-073');
    console.log('Test Case Description: Validate opening learner recent sessions');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Total Sessions: ${result.totalSessions}`);

    if (result.success && result.canViewSessions) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.canViewSessions).toBe(true);
    expect(result.sessions).toBeDefined();
  });

  test('Session data includes all required fields', () => {
    const parentId = 'PARENT001';
    const learnerId = 'LEARNER001';
    
    const result = viewRecentSessions(parentId, learnerId);
    const firstSession = result.sessions[0];

    console.log('Test Case ID: CASE-073');
    console.log('Test Case Description: Validate opening learner recent sessions');
    console.log('Test: Verify session data fields');
    console.log(`Session ID: ${firstSession.sessionId}`);
    console.log(`Date: ${firstSession.date}`);
    console.log(`Start Time: ${firstSession.startTime}`);
    console.log(`End Time: ${firstSession.endTime}`);
    console.log(`Duration: ${firstSession.duration} min`);
    console.log(`Activities: ${firstSession.activities.length}`);
    console.log(`Total Stars: ${firstSession.totalStars}`);
    console.log(`Accuracy: ${firstSession.accuracy}%`);

    if (result.success &&
        firstSession.sessionId &&
        firstSession.date &&
        firstSession.startTime &&
        firstSession.endTime &&
        firstSession.duration &&
        firstSession.activities &&
        firstSession.totalStars !== undefined &&
        firstSession.accuracy !== undefined) {
      console.log('Outcome: PASSED - All required fields present');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(firstSession.sessionId).toBeDefined();
    expect(firstSession.date).toBeDefined();
    expect(firstSession.startTime).toBeDefined();
    expect(firstSession.endTime).toBeDefined();
    expect(firstSession.duration).toBeGreaterThan(0);
    expect(firstSession.activities).toBeDefined();
    expect(firstSession.totalStars).toBeDefined();
    expect(firstSession.accuracy).toBeDefined();
  });

  test('View sessions for unlinked learner - unable to view (negative test)', () => {
    const parentId = 'PARENT001';
    const unlinkedLearnerId = 'LEARNER999';
    
    const result = viewRecentSessions(parentId, unlinkedLearnerId);

    console.log('Test Case ID: CASE-073');
    console.log('Test Case Description: Validate opening learner recent sessions');
    console.log('Expected Result: Able to view learner recent sessions (for linked learner)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Can View: ${result.canViewSessions}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.canViewSessions) {
      console.log('Outcome: PASSED - Correctly rejected unlinked learner');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canViewSessions).toBe(false);
    expect(result.errorMessage).toContain('not linked');
  });

  test('View sessions without parent authentication - unable to view (negative test)', () => {
    const parentId = '';
    const learnerId = 'LEARNER001';
    
    const result = viewRecentSessions(parentId, learnerId);

    console.log('Test Case ID: CASE-073');
    console.log('Test Case Description: Validate opening learner recent sessions');
    console.log('Expected Result: Able to view learner recent sessions (when authenticated)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.canViewSessions) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated parent');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canViewSessions).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('View sessions without learner ID - unable to view (negative test)', () => {
    const parentId = 'PARENT001';
    const learnerId = '';
    
    const result = viewRecentSessions(parentId, learnerId);

    console.log('Test Case ID: CASE-073');
    console.log('Test Case Description: Validate opening learner recent sessions');
    console.log('Expected Result: Able to view learner recent sessions (when learner specified)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.canViewSessions) {
      console.log('Outcome: PASSED - Correctly rejected missing learner ID');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canViewSessions).toBe(false);
    expect(result.errorMessage).toContain('select a learner');
  });

});
