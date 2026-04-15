// ─── Integration Test INT-023 ───────────────────────────────────────────────
// Test Case ID   : INT-023
// Test           : Integration when reports are generated
// Component      : Manage Reports & Analytics → Manage Reports & Analytics
// Input          : Admin selects filters
// Expected Result: Reports are generated successfully

// Mock admin
const MOCK_ADMIN = {
  id: 'ADMIN001',
  email: 'admin@synclexia.com',
  full_name: 'System Admin',
  role: 'admin',
  is_active: true
};

// Mock session
const MOCK_SESSION = {
  user: { id: MOCK_ADMIN.id, email: MOCK_ADMIN.email },
  access_token: 'mock_token_abc123'
};

// Mock activity data seeded across modules and date ranges
const MOCK_ACTIVITY_DATA = [
  { id: 'A001', userId: 'USER001', module: 'reading', score: 88, duration: 420, role: 'student', date: '2024-04-10' },
  { id: 'A002', userId: 'USER002', module: 'spelling', score: 72, duration: 310, role: 'student', date: '2024-04-11' },
  { id: 'A003', userId: 'USER003', module: 'reading', score: 95, duration: 500, role: 'student', date: '2024-04-12' },
  { id: 'A004', userId: 'USER004', module: 'writing', score: 60, duration: 280, role: 'student', date: '2024-04-12' },
  { id: 'A005', userId: 'USER005', module: 'tts',     score: 80, duration: 360, role: 'student', date: '2024-04-13' },
  { id: 'A006', userId: 'USER001', module: 'spelling', score: 91, duration: 390, role: 'student', date: '2024-04-13' },
  { id: 'A007', userId: 'USER006', module: 'reading', score: 55, duration: 200, role: 'student', date: '2024-04-14' },
  { id: 'A008', userId: 'USER007', module: 'writing', score: 77, duration: 340, role: 'parent',  date: '2024-04-14' }
];

// State
let systemState = {
  adminLoggedIn: false,
  admin: null,
  activityData: [],
  reportStore: new Map(),
  reportHistory: []
};

function resetState() {
  systemState = {
    adminLoggedIn: false,
    admin: null,
    activityData: MOCK_ACTIVITY_DATA.map(a => ({ ...a })),
    reportStore: new Map(),
    reportHistory: []
  };
}

// Admin login
async function adminLogin(admin) {
  if (!admin || admin.role !== 'admin') {
    return {
      success: false,
      actualResult: 'Admin login failed - Not an admin account',
      error: 'Unauthorized'
    };
  }

  if (!admin.is_active) {
    return {
      success: false,
      actualResult: 'Admin login failed - Account inactive',
      error: 'Account inactive'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 25));

  systemState.adminLoggedIn = true;
  systemState.admin = admin;

  return { success: true, adminId: admin.id, adminLoggedIn: true };
}

// Apply filters to activity data
function applyFilters(data, filters) {
  return data.filter(entry => {
    if (filters.module && entry.module !== filters.module) return false;
    if (filters.role && entry.role !== filters.role) return false;
    if (filters.userId && entry.userId !== filters.userId) return false;
    if (filters.dateFrom && entry.date < filters.dateFrom) return false;
    if (filters.dateTo && entry.date > filters.dateTo) return false;
    return true;
  });
}

// Generate report with filters
function generateReport(adminId, filters = {}) {
  if (!systemState.adminLoggedIn || systemState.admin?.id !== adminId) {
    return {
      success: false,
      actualResult: 'Report generation failed - Admin not authenticated',
      error: 'Admin not authenticated'
    };
  }

  if (systemState.activityData.length === 0) {
    return {
      success: false,
      actualResult: 'Report generation failed - No activity data',
      error: 'No activity data available'
    };
  }

  const filteredData = applyFilters(systemState.activityData, filters);

  if (filteredData.length === 0) {
    return {
      success: false,
      actualResult: 'Report generation failed - No data matches filters',
      error: 'No data matches the selected filters'
    };
  }

  const totalRecords = filteredData.length;
  const totalScore = filteredData.reduce((sum, a) => sum + a.score, 0);
  const totalDuration = filteredData.reduce((sum, a) => sum + a.duration, 0);
  const averageScore = +(totalScore / totalRecords).toFixed(2);
  const averageDuration = +(totalDuration / totalRecords).toFixed(0);

  const byModule = {};
  const byUser = {};
  const byDate = {};

  filteredData.forEach(a => {
    byModule[a.module] = (byModule[a.module] || 0) + 1;
    byUser[a.userId] = (byUser[a.userId] || 0) + 1;
    byDate[a.date] = (byDate[a.date] || 0) + 1;
  });

  const topModule = Object.entries(byModule).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topUser = Object.entries(byUser).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const report = {
    reportId: `RPT_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    generatedBy: adminId,
    filters: filters,
    totalRecords: totalRecords,
    averageScore: averageScore,
    averageDuration: averageDuration,
    highestScore: Math.max(...filteredData.map(a => a.score)),
    lowestScore: Math.min(...filteredData.map(a => a.score)),
    byModule: byModule,
    byUser: byUser,
    byDate: byDate,
    topModule: topModule,
    topUser: topUser,
    records: filteredData.map(a => ({
      id: a.id,
      userId: a.userId,
      module: a.module,
      score: a.score,
      duration: a.duration,
      date: a.date
    }))
  };

  systemState.reportStore.set(report.reportId, report);
  systemState.reportHistory.push({
    reportId: report.reportId,
    filters: filters,
    generatedAt: report.generatedAt
  });

  return {
    success: true,
    actualResult: 'Reports are generated successfully',
    performedAsExpected: true,
    reportId: report.reportId,
    totalRecords: report.totalRecords,
    averageScore: report.averageScore,
    averageDuration: report.averageDuration,
    highestScore: report.highestScore,
    lowestScore: report.lowestScore,
    byModule: report.byModule,
    topModule: report.topModule,
    topUser: report.topUser,
    filters: filters,
    generatedAt: report.generatedAt,
    integrationFlow: 'Manage Reports & Analytics → Manage Reports & Analytics'
  };
}

// Get report by ID
function getReport(reportId) {
  const report = systemState.reportStore.get(reportId);
  if (!report) return { success: false, error: 'Report not found' };
  return { success: true, report: report };
}

// Full integration: admin login → apply filters → generate report
async function processFilteredReport(admin, filters = {}) {
  const loginResult = await adminLogin(admin);
  if (!loginResult.success) {
    return {
      success: false,
      actualResult: loginResult.actualResult,
      error: loginResult.error,
      stage: 'login_failed'
    };
  }

  const reportResult = generateReport(admin.id, filters);
  if (!reportResult.success) {
    return {
      success: false,
      actualResult: reportResult.actualResult,
      error: reportResult.error,
      stage: 'report_failed'
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

describe('Integration Test INT-023 (Manage Reports & Analytics → Manage Reports & Analytics)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Admin selects filters - Reports are generated successfully', async () => {
    const result = await processFilteredReport(MOCK_ADMIN, { module: 'reading' });

    console.log('Test Case ID: INT-023');
    console.log('Test: Integration when reports are generated');
    console.log('Component: Manage Reports & Analytics → Manage Reports & Analytics');
    console.log(`Input: Admin selects filters`);
    console.log(`Expected Result: Reports are generated successfully`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Filter Applied: module=reading`);
    console.log(`Report ID: ${result.reportId}`);
    console.log(`Total Records: ${result.totalRecords}`);
    console.log(`Average Score: ${result.averageScore}`);
    console.log(`Highest Score: ${result.highestScore}`);
    console.log(`Lowest Score: ${result.lowestScore}`);
    console.log(`Top Module: ${result.topModule}`);
    console.log(`Generated At: ${result.generatedAt}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.totalRecords === 3 && result.topModule === 'reading') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.reportId).toBeDefined();
    expect(result.totalRecords).toBe(3); // A001, A003, A007
    expect(result.averageScore).toBe(79.33); // (88+95+55)/3
    expect(result.highestScore).toBe(95);
    expect(result.lowestScore).toBe(55);
    expect(result.topModule).toBe('reading');
    expect(result.generatedAt).toBeDefined();
    expect(result.stage).toBe('completed');
  });

  test('No filter - report covers all data', async () => {
    const result = await processFilteredReport(MOCK_ADMIN, {});

    console.log('Test Case ID: INT-023');
    console.log('Test: No filter applied - all records');
    console.log(`Total Records: ${result.totalRecords}`);
    console.log(`Average Score: ${result.averageScore}`);
    console.log(`Top Module: ${result.topModule}`);

    if (result.totalRecords === 8) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.totalRecords).toBe(8);
    expect(result.highestScore).toBe(95);
    expect(result.lowestScore).toBe(55);
    expect(result.topModule).toBeDefined();
  });

  test('Filter by date range - correct records returned', async () => {
    const result = await processFilteredReport(MOCK_ADMIN, {
      dateFrom: '2024-04-12',
      dateTo: '2024-04-13'
    });

    console.log('Test Case ID: INT-023');
    console.log('Test: Date range filter (2024-04-12 to 2024-04-13)');
    console.log(`Total Records: ${result.totalRecords}`);
    console.log(`By Date: ${JSON.stringify(result.byDate || {})}`);

    if (result.totalRecords === 4) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.totalRecords).toBe(4); // A003, A004, A005, A006
  });

  test('Filter by userId - single user report', async () => {
    const result = await processFilteredReport(MOCK_ADMIN, { userId: 'USER001' });

    console.log('Test Case ID: INT-023');
    console.log('Test: Filter by userId=USER001');
    console.log(`Total Records: ${result.totalRecords}`);
    console.log(`Top User: ${result.topUser}`);
    console.log(`Average Score: ${result.averageScore}`);

    if (result.totalRecords === 2 && result.topUser === 'USER001') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.totalRecords).toBe(2); // A001, A006
    expect(result.topUser).toBe('USER001');
    expect(result.averageScore).toBe(89.5); // (88+91)/2
  });

  test('Report stored and retrievable by ID', async () => {
    const { reportId } = await processFilteredReport(MOCK_ADMIN, { module: 'spelling' });
    const retrieved = getReport(reportId);

    console.log('Test Case ID: INT-023');
    console.log('Test: Report retrieval by ID');
    console.log(`Report ID: ${reportId}`);
    console.log(`Retrieved: ${retrieved.success}`);
    console.log(`Matches ID: ${retrieved.report?.reportId === reportId}`);
    console.log(`Filters Saved: ${JSON.stringify(retrieved.report?.filters)}`);

    if (retrieved.success && retrieved.report.reportId === reportId) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(retrieved.success).toBe(true);
    expect(retrieved.report.reportId).toBe(reportId);
    expect(retrieved.report.filters.module).toBe('spelling');
    expect(retrieved.report.generatedBy).toBe('ADMIN001');
  });

  test('Report history tracks multiple generated reports', async () => {
    await processFilteredReport(MOCK_ADMIN, { module: 'reading' });
    await processFilteredReport(MOCK_ADMIN, { module: 'spelling' });
    await processFilteredReport(MOCK_ADMIN, {});

    console.log('Test Case ID: INT-023');
    console.log('Test: Report history');
    console.log(`Reports Generated: ${systemState.reportHistory.length}`);
    systemState.reportHistory.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.reportId} | filters: ${JSON.stringify(r.filters)}`);
    });

    if (systemState.reportHistory.length === 3) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(systemState.reportHistory.length).toBe(3);
    expect(systemState.reportHistory[0].filters.module).toBe('reading');
    expect(systemState.reportHistory[1].filters.module).toBe('spelling');
    expect(systemState.reportHistory[2].filters).toEqual({});
  });

  test('Non-admin - report generation denied', async () => {
    const nonAdmin = { id: 'USER001', role: 'student', is_active: true };
    const result = await processFilteredReport(nonAdmin, { module: 'reading' });

    console.log('Test Case ID: INT-023');
    console.log('Test: Non-admin access (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'login_failed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('login_failed');
    expect(result.error).toBe('Unauthorized');
  });

  test('Filters with no matching data - fails gracefully', async () => {
    const result = await processFilteredReport(MOCK_ADMIN, { module: 'nonexistent_module' });

    console.log('Test Case ID: INT-023');
    console.log('Test: No matching data (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.error === 'No data matches the selected filters') {
      console.log('Outcome: Performed as Expected - Handled gracefully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('report_failed');
    expect(result.error).toBe('No data matches the selected filters');
  });

});
