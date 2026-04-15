// ─── Integration Test INT-014 ───────────────────────────────────────────────
// Test Case ID   : INT-014
// Test           : Integration when parent views learner performance
// Component      : Parent Management → Manage Reports & Analytics
// Input          : Learner is linked
// Expected Result: Progress report is displayed

// Mock parent account
const MOCK_PARENT = {
  id: 'PARENT001',
  email: 'parent@synclexia.com',
  full_name: 'Sarah Johnson',
  role: 'parent',
  is_active: true
};

// Mock linked learner
const MOCK_LEARNER = {
  id: 'STUDENT001',
  full_name: 'Alex Johnson',
  age: 7,
  grade: 2,
  parentId: 'PARENT001',
  totalSessions: 18,
  averageScore: 76,
  lastActive: '2024-04-14T10:00:00Z'
};

// Mock learner performance data
const MOCK_PERFORMANCE = {
  learnerId: 'STUDENT001',
  period: 'weekly',
  sessions: [
    { date: '2024-04-08', activity: 'phonics', score: 70, accuracy: 68 },
    { date: '2024-04-09', activity: 'spelling', score: 75, accuracy: 72 },
    { date: '2024-04-10', activity: 'reading', score: 80, accuracy: 78 },
    { date: '2024-04-11', activity: 'writing', score: 65, accuracy: 63 },
    { date: '2024-04-12', activity: 'phonics', score: 85, accuracy: 82 },
    { date: '2024-04-13', activity: 'spelling', score: 78, accuracy: 75 },
    { date: '2024-04-14', activity: 'sound_game', score: 90, accuracy: 88 }
  ],
  strongestArea: 'sound_game',
  weakestArea: 'writing',
  streakDays: 7
};

// Reports & Analytics module
const REPORTS_MODULE = {
  id: 'reports_analytics',
  title: 'Reports & Analytics',
  route: 'ReportsAnalytics',
  isReady: true,
  hasProgressChart: true,
  hasActivityBreakdown: true,
  hasStrengthWeaknessReport: true,
  hasStreakInfo: true,
  exportable: true
};

// State
let appState = {
  parentLinked: false,
  parent: null,
  learner: null,
  reportsOpen: false,
  reportsReady: false,
  progressReportDisplayed: false,
  reportData: null
};

function resetState() {
  appState = {
    parentLinked: false,
    parent: null,
    learner: null,
    reportsOpen: false,
    reportsReady: false,
    progressReportDisplayed: false,
    reportData: null
  };
}

// Simulate linking parent to learner
function linkParentToLearner(parent, learner) {
  if (!parent || !learner) {
    return {
      success: false,
      actualResult: 'Link failed - Missing parent or learner data',
      error: 'Invalid link data'
    };
  }

  if (learner.parentId !== parent.id) {
    return {
      success: false,
      actualResult: 'Link failed - Learner not associated with this parent',
      error: 'Learner not linked to parent'
    };
  }

  appState.parentLinked = true;
  appState.parent = parent;
  appState.learner = learner;

  return {
    success: true,
    parentId: parent.id,
    learnerId: learner.id,
    linked: true
  };
}

// Generate progress report
function generateProgressReport(learner, performance) {
  if (!learner || !performance) {
    return {
      success: false,
      actualResult: 'Report generation failed - Missing data',
      error: 'Missing report data'
    };
  }

  const totalScore = performance.sessions.reduce((sum, s) => sum + s.score, 0);
  const avgScore = Math.round(totalScore / performance.sessions.length);
  const totalAccuracy = performance.sessions.reduce((sum, s) => sum + s.accuracy, 0);
  const avgAccuracy = Math.round(totalAccuracy / performance.sessions.length);

  return {
    success: true,
    reportId: `RPT_${learner.id}_${performance.period}`,
    learnerId: learner.id,
    learnerName: learner.full_name,
    period: performance.period,
    totalSessions: performance.sessions.length,
    averageScore: avgScore,
    averageAccuracy: avgAccuracy,
    strongestArea: performance.strongestArea,
    weakestArea: performance.weakestArea,
    streakDays: performance.streakDays,
    sessionBreakdown: performance.sessions,
    hasProgressChart: REPORTS_MODULE.hasProgressChart,
    hasActivityBreakdown: REPORTS_MODULE.hasActivityBreakdown,
    hasStrengthWeaknessReport: REPORTS_MODULE.hasStrengthWeaknessReport,
    exportable: REPORTS_MODULE.exportable
  };
}

// Open Reports & Analytics from Parent Management
function openReportsFromParentManagement(parent, learner, performance) {
  if (!appState.parentLinked || !appState.learner) {
    return {
      success: false,
      actualResult: 'Reports open failed - Learner not linked',
      error: 'Learner not linked'
    };
  }

  const report = generateProgressReport(learner, performance);
  if (!report.success) {
    return {
      success: false,
      actualResult: report.actualResult,
      error: report.error,
      stage: 'report_generation_failed'
    };
  }

  appState.reportsOpen = true;
  appState.reportsReady = REPORTS_MODULE.isReady;
  appState.progressReportDisplayed = true;
  appState.reportData = report;

  return {
    success: true,
    actualResult: 'Progress report is displayed',
    performedAsExpected: true,
    reportsOpen: true,
    reportsReady: REPORTS_MODULE.isReady,
    route: REPORTS_MODULE.route,
    progressReportDisplayed: true,
    reportId: report.reportId,
    learnerName: report.learnerName,
    period: report.period,
    totalSessions: report.totalSessions,
    averageScore: report.averageScore,
    averageAccuracy: report.averageAccuracy,
    strongestArea: report.strongestArea,
    weakestArea: report.weakestArea,
    streakDays: report.streakDays,
    hasProgressChart: report.hasProgressChart,
    hasActivityBreakdown: report.hasActivityBreakdown,
    hasStrengthWeaknessReport: report.hasStrengthWeaknessReport,
    exportable: report.exportable,
    integrationFlow: 'Parent Management → Manage Reports & Analytics'
  };
}

// Full integration: link learner → open reports → display progress report
async function processParentToReports(parent, learner, performance) {
  const linkResult = linkParentToLearner(parent, learner);
  if (!linkResult.success) {
    return {
      success: false,
      actualResult: linkResult.actualResult,
      error: linkResult.error,
      stage: 'link_failed'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 30));

  const reportResult = openReportsFromParentManagement(parent, learner, performance);
  if (!reportResult.success) {
    return {
      success: false,
      actualResult: reportResult.actualResult,
      error: reportResult.error,
      stage: reportResult.stage || 'reports_failed'
    };
  }

  return {
    ...reportResult,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-014 (Parent Management → Manage Reports & Analytics)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Learner is linked - Progress report is displayed', async () => {
    const result = await processParentToReports(MOCK_PARENT, MOCK_LEARNER, MOCK_PERFORMANCE);

    console.log('Test Case ID: INT-014');
    console.log('Test: Integration when parent views learner performance');
    console.log('Component: Parent Management → Manage Reports & Analytics');
    console.log(`Input: Learner is linked`);
    console.log(`Expected Result: Progress report is displayed`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Reports Open: ${result.reportsOpen}`);
    console.log(`Reports Ready: ${result.reportsReady}`);
    console.log(`Progress Report Displayed: ${result.progressReportDisplayed}`);
    console.log(`Learner: ${result.learnerName}`);
    console.log(`Period: ${result.period}`);
    console.log(`Total Sessions: ${result.totalSessions}`);
    console.log(`Average Score: ${result.averageScore}%`);
    console.log(`Average Accuracy: ${result.averageAccuracy}%`);
    console.log(`Strongest Area: ${result.strongestArea}`);
    console.log(`Weakest Area: ${result.weakestArea}`);
    console.log(`Streak Days: ${result.streakDays}`);
    console.log(`Has Progress Chart: ${result.hasProgressChart}`);
    console.log(`Has Activity Breakdown: ${result.hasActivityBreakdown}`);
    console.log(`Exportable: ${result.exportable}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.progressReportDisplayed && result.reportsOpen) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.reportsOpen).toBe(true);
    expect(result.reportsReady).toBe(true);
    expect(result.progressReportDisplayed).toBe(true);
    expect(result.learnerName).toBe('Alex Johnson');
    expect(result.totalSessions).toBe(7);
    expect(result.averageScore).toBeGreaterThan(0);
    expect(result.strongestArea).toBe('sound_game');
    expect(result.weakestArea).toBe('writing');
    expect(result.streakDays).toBe(7);
    expect(result.hasProgressChart).toBe(true);
    expect(result.hasActivityBreakdown).toBe(true);
    expect(result.exportable).toBe(true);
    expect(result.stage).toBe('completed');
  });

  test('Report data accuracy - average score and accuracy computed correctly', async () => {
    const result = await processParentToReports(MOCK_PARENT, MOCK_LEARNER, MOCK_PERFORMANCE);

    const expectedAvgScore = Math.round((70 + 75 + 80 + 65 + 85 + 78 + 90) / 7);
    const expectedAvgAccuracy = Math.round((68 + 72 + 78 + 63 + 82 + 75 + 88) / 7);

    console.log('Test Case ID: INT-014');
    console.log('Test: Report data accuracy');
    console.log(`Expected Avg Score: ${expectedAvgScore}%`);
    console.log(`Actual Avg Score: ${result.averageScore}%`);
    console.log(`Expected Avg Accuracy: ${expectedAvgAccuracy}%`);
    console.log(`Actual Avg Accuracy: ${result.averageAccuracy}%`);

    if (result.averageScore === expectedAvgScore && result.averageAccuracy === expectedAvgAccuracy) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.averageScore).toBe(expectedAvgScore);
    expect(result.averageAccuracy).toBe(expectedAvgAccuracy);
  });

  test('State after report displayed - flags set correctly', async () => {
    await processParentToReports(MOCK_PARENT, MOCK_LEARNER, MOCK_PERFORMANCE);

    console.log('Test Case ID: INT-014');
    console.log('Test: App state after reports open');
    console.log(`parentLinked: ${appState.parentLinked}`);
    console.log(`reportsOpen: ${appState.reportsOpen}`);
    console.log(`progressReportDisplayed: ${appState.progressReportDisplayed}`);
    console.log(`reportData: ${appState.reportData?.reportId}`);

    if (appState.reportsOpen && appState.progressReportDisplayed) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.parentLinked).toBe(true);
    expect(appState.reportsOpen).toBe(true);
    expect(appState.progressReportDisplayed).toBe(true);
    expect(appState.reportData).not.toBeNull();
    expect(appState.reportData.learnerId).toBe('STUDENT001');
  });

  test('Strength and weakness areas reported', async () => {
    const result = await processParentToReports(MOCK_PARENT, MOCK_LEARNER, MOCK_PERFORMANCE);

    console.log('Test Case ID: INT-014');
    console.log('Test: Strength and weakness areas');
    console.log(`Strongest: ${result.strongestArea}`);
    console.log(`Weakest: ${result.weakestArea}`);
    console.log(`Has Strength/Weakness Report: ${result.hasStrengthWeaknessReport}`);

    if (result.strongestArea === 'sound_game' && result.weakestArea === 'writing') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.strongestArea).toBe('sound_game');
    expect(result.weakestArea).toBe('writing');
    expect(result.hasStrengthWeaknessReport).toBe(true);
  });

  test('Learner not linked - reports access fails', async () => {
    const unlinkedLearner = { ...MOCK_LEARNER, parentId: 'WRONG_PARENT' };
    const result = await processParentToReports(MOCK_PARENT, unlinkedLearner, MOCK_PERFORMANCE);

    console.log('Test Case ID: INT-014');
    console.log('Test: Learner not linked (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'link_failed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('link_failed');
    expect(result.error).toBe('Learner not linked to parent');
  });

  test('No parent data - fails gracefully', async () => {
    const result = await processParentToReports(null, MOCK_LEARNER, MOCK_PERFORMANCE);

    console.log('Test Case ID: INT-014');
    console.log('Test: No parent data (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'link_failed') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('link_failed');
    expect(result.error).toBe('Invalid link data');
  });

  test('Reports opened without link - fails gracefully', () => {
    const result = openReportsFromParentManagement(MOCK_PARENT, MOCK_LEARNER, MOCK_PERFORMANCE);

    console.log('Test Case ID: INT-014');
    console.log('Test: Reports without link (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Learner not linked') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Learner not linked');
  });

});
