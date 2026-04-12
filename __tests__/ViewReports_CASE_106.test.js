// ─── Test Case CASE-106 ──────────────────────────────────────────────────────
// Test Case ID: CASE-106
// Test Case Description: Admin views available reports and analytics data
// Expected Result: Able to view reports

// Mock reports data
const REPORTS_DATA = {
  totalReports: 6,
  reports: [
    {
      reportId: 'REPORT001',
      type: 'User Activity',
      description: 'Daily active users and session duration',
      generatedAt: '2024-04-13T08:00:00Z',
      period: 'daily',
      dataPoints: 1250,
      status: 'ready'
    },
    {
      reportId: 'REPORT002',
      type: 'Learning Progress',
      description: 'Learner completion rates and accuracy scores',
      generatedAt: '2024-04-12T18:00:00Z',
      period: 'weekly',
      dataPoints: 450,
      status: 'ready'
    },
    {
      reportId: 'REPORT003',
      type: 'Content Performance',
      description: 'Most accessed content and engagement metrics',
      generatedAt: '2024-04-11T12:00:00Z',
      period: 'monthly',
      dataPoints: 89,
      status: 'ready'
    },
    {
      reportId: 'REPORT004',
      type: 'System Usage',
      description: 'Server load, response times, and errors',
      generatedAt: '2024-04-13T06:00:00Z',
      period: 'daily',
      dataPoints: 240,
      status: 'ready'
    },
    {
      reportId: 'REPORT005',
      type: 'Parent Engagement',
      description: 'Parent login frequency and feature usage',
      generatedAt: '2024-04-10T20:00:00Z',
      period: 'weekly',
      dataPoints: 320,
      status: 'generating'
    },
    {
      reportId: 'REPORT006',
      type: 'Feedback Summary',
      description: 'User feedback ratings and categories',
      generatedAt: '2024-04-09T14:00:00Z',
      period: 'monthly',
      dataPoints: 156,
      status: 'ready'
    }
  ],
  analytics: {
    totalUsers: 1250,
    activeUsers: 890,
    totalLearners: 450,
    totalParents: 780,
    totalContent: 156,
    averageSessionDuration: 18.5,
    completionRate: 78.5,
    averageAccuracy: 82.3
  }
};

function viewReports(adminId, filters = {}) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to view reports - Admin not authenticated',
      reportsViewable: false,
      errorMessage: 'Please log in as admin to view reports'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Unable to view reports - Insufficient privileges',
      reportsViewable: false,
      errorMessage: 'You do not have permission to view reports'
    };
  }

  let filteredReports = [...REPORTS_DATA.reports];

  // Apply filters if provided
  if (filters.type) {
    filteredReports = filteredReports.filter(r => r.type === filters.type);
  }
  if (filters.period) {
    filteredReports = filteredReports.filter(r => r.period === filters.period);
  }
  if (filters.status) {
    filteredReports = filteredReports.filter(r => r.status === filters.status);
  }

  // Calculate statistics
  const typeCounts = {};
  const periodCounts = {};
  const statusCounts = {};
  
  REPORTS_DATA.reports.forEach(r => {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    periodCounts[r.period] = (periodCounts[r.period] || 0) + 1;
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  return {
    success: true,
    actualResult: 'Able to view reports',
    reportsViewable: true,
    adminId: adminId,
    totalReports: REPORTS_DATA.totalReports,
    displayedReports: filteredReports.length,
    reports: filteredReports,
    analytics: REPORTS_DATA.analytics,
    filters: filters,
    statistics: {
      typeCounts: typeCounts,
      periodCounts: periodCounts,
      statusCounts: statusCounts,
      readyReports: statusCounts['ready'] || 0,
      generatingReports: statusCounts['generating'] || 0,
      dailyReports: periodCounts['daily'] || 0,
      weeklyReports: periodCounts['weekly'] || 0,
      monthlyReports: periodCounts['monthly'] || 0
    },
    availableTypes: ['User Activity', 'Learning Progress', 'Content Performance', 'System Usage', 'Parent Engagement', 'Feedback Summary'],
    availablePeriods: ['daily', 'weekly', 'monthly', 'yearly'],
    availableStatuses: ['ready', 'generating', 'archived']
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-106 (Admin views available reports and analytics data)', () => {

  test('Admin views all reports - able to view reports', () => {
    const expectedResult = 'Able to view reports';
    const adminId = 'ADMIN001';

    const result = viewReports(adminId);

    console.log('Test Case ID: CASE-106');
    console.log('Test Case Description: Admin views available reports and analytics data');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Reports Viewable: ${result.reportsViewable}`);
    console.log(`Admin ID: ${result.adminId}`);
    console.log(`Total Reports: ${result.totalReports}`);
    console.log(`Displayed Reports: ${result.displayedReports}`);

    console.log('Analytics Overview:');
    console.log(`  Total Users: ${result.analytics.totalUsers}`);
    console.log(`  Active Users: ${result.analytics.activeUsers}`);
    console.log(`  Total Learners: ${result.analytics.totalLearners}`);
    console.log(`  Total Content: ${result.analytics.totalContent}`);
    console.log(`  Average Session: ${result.analytics.averageSessionDuration} minutes`);
    console.log(`  Completion Rate: ${result.analytics.completionRate}%`);
    console.log(`  Average Accuracy: ${result.analytics.averageAccuracy}%`);

    console.log('Available Reports:');
    result.reports.slice(0, 3).forEach((r, index) => {
      console.log(`  ${index + 1}. [${r.period}] ${r.type} - ${r.status}`);
    });

    if (result.success && result.reportsViewable && result.reports.length > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.reportsViewable).toBe(true);
    expect(result.actualResult).toContain('Able to view');
    expect(result.adminId).toBe('ADMIN001');
    expect(result.totalReports).toBe(6);
    expect(result.reports).toHaveLength(6);
    expect(result.analytics).toBeDefined();
    expect(result.analytics.totalUsers).toBe(1250);
  });

  test('Filter reports by type User Activity - able to view filtered reports', () => {
    const adminId = 'ADMIN001';
    const filters = { type: 'User Activity' };

    const result = viewReports(adminId, filters);

    console.log('Test Case ID: CASE-106');
    console.log(`Filter: type = "User Activity"`);
    console.log(`Displayed Reports: ${result.displayedReports}`);

    result.reports.forEach((r, index) => {
      console.log(`  ${index + 1}. ${r.type} - ${r.description}`);
    });

    if (result.success && result.reports.every(r => r.type === 'User Activity')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedReports).toBe(1);
    expect(result.reports[0].type).toBe('User Activity');
    expect(result.reports.every(r => r.type === 'User Activity')).toBe(true);
  });

  test('Filter reports by period daily - able to view filtered reports', () => {
    const adminId = 'ADMIN001';
    const filters = { period: 'daily' };

    const result = viewReports(adminId, filters);

    console.log('Test Case ID: CASE-106');
    console.log(`Filter: period = "daily"`);
    console.log(`Displayed Reports: ${result.displayedReports}`);

    result.reports.forEach((r, index) => {
      console.log(`  ${index + 1}. [${r.period}] ${r.type} (${r.status})`);
    });

    if (result.success && result.reports.every(r => r.period === 'daily')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedReports).toBe(2);
    expect(result.reports.every(r => r.period === 'daily')).toBe(true);
  });

  test('Filter reports by status ready - able to view available reports', () => {
    const adminId = 'ADMIN001';
    const filters = { status: 'ready' };

    const result = viewReports(adminId, filters);

    console.log('Test Case ID: CASE-106');
    console.log(`Filter: status = "ready"`);
    console.log(`Displayed Reports: ${result.displayedReports}`);

    result.reports.forEach((r, index) => {
      console.log(`  ${index + 1}. ${r.type} - ${r.status}`);
    });

    if (result.success && result.reports.every(r => r.status === 'ready')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedReports).toBe(5);
    expect(result.reports.every(r => r.status === 'ready')).toBe(true);
  });

  test('Reports contain all required fields', () => {
    const adminId = 'ADMIN001';

    const result = viewReports(adminId);
    const firstReport = result.reports[0];

    console.log('Test Case ID: CASE-106');
    console.log('Verifying report fields:');
    console.log(`  Report ID: ${firstReport.reportId}`);
    console.log(`  Type: ${firstReport.type}`);
    console.log(`  Description: ${firstReport.description}`);
    console.log(`  Generated At: ${firstReport.generatedAt}`);
    console.log(`  Period: ${firstReport.period}`);
    console.log(`  Status: ${firstReport.status}`);

    if (firstReport.reportId && firstReport.type && firstReport.description &&
        firstReport.generatedAt && firstReport.period && firstReport.status) {
      console.log('Outcome: PASSED - All required fields present');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(firstReport.reportId).toBeDefined();
    expect(firstReport.type).toBeDefined();
    expect(firstReport.description).toBeDefined();
    expect(firstReport.generatedAt).toBeDefined();
    expect(firstReport.period).toBeDefined();
    expect(firstReport.dataPoints).toBeGreaterThanOrEqual(0);
    expect(firstReport.status).toBeDefined();
  });

  test('Report statistics calculated correctly', () => {
    const adminId = 'ADMIN001';

    const result = viewReports(adminId);
    const stats = result.statistics;

    console.log('Test Case ID: CASE-106');
    console.log('Report Statistics:');
    console.log(`  Type Counts:`, stats.typeCounts);
    console.log(`  Period Counts:`, stats.periodCounts);
    console.log(`  Status Counts:`, stats.statusCounts);
    console.log(`  Ready Reports: ${stats.readyReports}`);
    console.log(`  Daily Reports: ${stats.dailyReports}`);

    const totalFromTypes = Object.values(stats.typeCounts).reduce((a, b) => a + b, 0);

    if (stats.readyReports >= 5 && totalFromTypes === 6) {
      console.log('Outcome: PASSED - Statistics correct');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(stats.typeCounts['User Activity']).toBe(1);
    expect(stats.periodCounts['daily']).toBe(2);
    expect(stats.statusCounts['ready']).toBe(5);
    expect(stats.readyReports).toBe(5);
    expect(stats.generatingReports).toBe(1);
    expect(totalFromTypes).toBe(6);
  });

  test('Analytics data contains key metrics', () => {
    const adminId = 'ADMIN001';

    const result = viewReports(adminId);
    const analytics = result.analytics;

    console.log('Test Case ID: CASE-106');
    console.log('Analytics Data:');
    console.log(`  Total Users: ${analytics.totalUsers}`);
    console.log(`  Active Users: ${analytics.activeUsers}`);
    console.log(`  Total Learners: ${analytics.totalLearners}`);
    console.log(`  Average Session Duration: ${analytics.averageSessionDuration} minutes`);
    console.log(`  Completion Rate: ${analytics.completionRate}%`);
    console.log(`  Average Accuracy: ${analytics.averageAccuracy}%`);

    if (analytics.totalUsers > 0 && analytics.averageAccuracy > 0) {
      console.log('Outcome: PASSED - Analytics data present');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(analytics.totalUsers).toBe(1250);
    expect(analytics.activeUsers).toBe(890);
    expect(analytics.totalLearners).toBe(450);
    expect(analytics.totalParents).toBe(780);
    expect(analytics.totalContent).toBe(156);
    expect(analytics.averageSessionDuration).toBe(18.5);
    expect(analytics.completionRate).toBe(78.5);
    expect(analytics.averageAccuracy).toBe(82.3);
  });

  test('Available filters returned', () => {
    const adminId = 'ADMIN001';

    const result = viewReports(adminId);

    console.log('Test Case ID: CASE-106');
    console.log(`Available Types: ${result.availableTypes.join(', ')}`);
    console.log(`Available Periods: ${result.availablePeriods.join(', ')}`);
    console.log(`Available Statuses: ${result.availableStatuses.join(', ')}`);

    if (result.availableTypes.length >= 6 && result.availablePeriods.length >= 4) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.availableTypes).toContain('User Activity');
    expect(result.availableTypes).toContain('Learning Progress');
    expect(result.availableTypes).toContain('Content Performance');
    expect(result.availableTypes).toContain('System Usage');
    expect(result.availableTypes).toContain('Parent Engagement');
    expect(result.availableTypes).toContain('Feedback Summary');
    expect(result.availablePeriods).toContain('daily');
    expect(result.availablePeriods).toContain('weekly');
    expect(result.availablePeriods).toContain('monthly');
    expect(result.availableStatuses).toContain('ready');
    expect(result.availableStatuses).toContain('generating');
  });

  test('Without admin authentication - unable to view reports (negative test)', () => {
    const adminId = '';

    const result = viewReports(adminId);

    console.log('Test Case ID: CASE-106');
    console.log('Expected Result: Able to view reports (for authorized admins)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.reportsViewable) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.reportsViewable).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('With non-admin account - unable to view reports (negative test)', () => {
    const adminId = 'USER001';

    const result = viewReports(adminId);

    console.log('Test Case ID: CASE-106');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.reportsViewable) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.reportsViewable).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

  test('With learner account - unable to view reports (negative test)', () => {
    const adminId = 'LEARNER001';

    const result = viewReports(adminId);

    console.log('Test Case ID: CASE-106');
    console.log(`User ID: ${adminId} (learner account)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.reportsViewable) {
      console.log('Outcome: PASSED - Correctly rejected learner account');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.reportsViewable).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

});
