// ─── Integration Test INT-022 ───────────────────────────────────────────────
// Test Case ID   : INT-022
// Test           : Integration when system logs are recorded
// Component      : Manage Feedback & System Maintenance → Manage Reports & Analytics
// Input          : Admin records issue
// Expected Result: Logs are included in reports

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

// Mock issue log payload
const MOCK_ISSUE_LOG = {
  id: 'ISSUE_001',
  title: 'TTS audio not playing on Android',
  description: 'Users on Android 12 report TTS audio fails silently with no error shown.',
  category: 'bug',
  severity: 'high',
  module: 'tts',
  reportedBy: 'USER042',
  occurredAt: '2024-04-14T08:30:00Z'
};

// State
let systemState = {
  adminLoggedIn: false,
  admin: null,
  issueLogStore: new Map(),
  reportStore: new Map(),
  reportHistory: []
};

function resetState() {
  systemState = {
    adminLoggedIn: false,
    admin: null,
    issueLogStore: new Map(),
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

// Admin records issue into maintenance log
function recordIssue(adminId, issueData) {
  if (!systemState.adminLoggedIn || systemState.admin?.id !== adminId) {
    return {
      success: false,
      actualResult: 'Issue record failed - Admin not authenticated',
      error: 'Admin not authenticated'
    };
  }

  if (!issueData || !issueData.id || !issueData.title || !issueData.category) {
    return {
      success: false,
      actualResult: 'Issue record failed - Missing required fields',
      error: 'Invalid issue data'
    };
  }

  if (systemState.issueLogStore.has(issueData.id)) {
    return {
      success: false,
      actualResult: 'Issue record failed - Duplicate issue ID',
      error: 'Duplicate issue ID'
    };
  }

  const issueRecord = {
    ...issueData,
    recordedBy: adminId,
    status: 'open',
    recordedAt: new Date().toISOString()
  };

  systemState.issueLogStore.set(issueData.id, issueRecord);

  return {
    success: true,
    actualResult: 'Issue recorded successfully',
    issueId: issueData.id,
    title: issueData.title,
    category: issueData.category,
    severity: issueData.severity,
    module: issueData.module,
    recordedAt: issueRecord.recordedAt
  };
}

// Generate report including issue logs
function generateMaintenanceReport(filters = {}) {
  if (!systemState.adminLoggedIn) {
    return {
      success: false,
      actualResult: 'Report generation failed - Admin not authenticated',
      error: 'Admin not authenticated'
    };
  }

  if (systemState.issueLogStore.size === 0) {
    return {
      success: false,
      actualResult: 'Report generation failed - No issue logs found',
      error: 'No issue logs to report'
    };
  }

  let issues = Array.from(systemState.issueLogStore.values());

  if (filters.category) issues = issues.filter(i => i.category === filters.category);
  if (filters.severity) issues = issues.filter(i => i.severity === filters.severity);
  if (filters.module) issues = issues.filter(i => i.module === filters.module);
  if (filters.status) issues = issues.filter(i => i.status === filters.status);

  if (issues.length === 0) {
    return {
      success: false,
      actualResult: 'Report generation failed - No matching logs after filter',
      error: 'No matching issue logs'
    };
  }

  const byCategory = {};
  const bySeverity = {};
  const byModule = {};

  issues.forEach(issue => {
    byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
    bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
    byModule[issue.module] = (byModule[issue.module] || 0) + 1;
  });

  const openCount = issues.filter(i => i.status === 'open').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  const report = {
    reportId: `RPT_MAINT_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    generatedBy: systemState.admin.id,
    filters: filters,
    totalLogs: issues.length,
    openIssues: openCount,
    resolvedIssues: resolvedCount,
    resolutionRate: issues.length > 0
      ? +((resolvedCount / issues.length) * 100).toFixed(1)
      : 0,
    byCategory: byCategory,
    bySeverity: bySeverity,
    byModule: byModule,
    highSeverityCount: bySeverity['high'] || 0,
    logs: issues.map(i => ({
      id: i.id,
      title: i.title,
      category: i.category,
      severity: i.severity,
      module: i.module,
      status: i.status,
      recordedAt: i.recordedAt
    }))
  };

  systemState.reportStore.set(report.reportId, report);
  systemState.reportHistory.push({
    reportId: report.reportId,
    generatedAt: report.generatedAt
  });

  return {
    success: true,
    actualResult: 'Logs are included in reports',
    performedAsExpected: true,
    reportId: report.reportId,
    totalLogs: report.totalLogs,
    openIssues: report.openIssues,
    resolvedIssues: report.resolvedIssues,
    highSeverityCount: report.highSeverityCount,
    byCategory: report.byCategory,
    bySeverity: report.bySeverity,
    byModule: report.byModule,
    logsIncluded: report.logs.length > 0,
    generatedAt: report.generatedAt,
    integrationFlow: 'Manage Feedback & System Maintenance → Manage Reports & Analytics'
  };
}

// Get report by ID
function getReport(reportId) {
  const report = systemState.reportStore.get(reportId);
  if (!report) return { success: false, error: 'Report not found' };
  return { success: true, report: report };
}

// Full integration: admin login → record issue → generate report
async function processMaintenanceToReport(admin, issueData, filters = {}) {
  const loginResult = await adminLogin(admin);
  if (!loginResult.success) {
    return {
      success: false,
      actualResult: loginResult.actualResult,
      error: loginResult.error,
      stage: 'login_failed'
    };
  }

  const recordResult = recordIssue(admin.id, issueData);
  if (!recordResult.success) {
    return {
      success: false,
      actualResult: recordResult.actualResult,
      error: recordResult.error,
      stage: 'record_failed'
    };
  }

  const reportResult = generateMaintenanceReport(filters);
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
    issueId: recordResult.issueId,
    issueTitle: recordResult.title,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-022 (Manage Feedback & System Maintenance → Manage Reports & Analytics)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Admin records issue - Logs are included in reports', async () => {
    const result = await processMaintenanceToReport(MOCK_ADMIN, MOCK_ISSUE_LOG);

    console.log('Test Case ID: INT-022');
    console.log('Test: Integration when system logs are recorded');
    console.log('Component: Manage Feedback & System Maintenance → Manage Reports & Analytics');
    console.log(`Input: Admin records issue`);
    console.log(`Expected Result: Logs are included in reports`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Issue ID: ${result.issueId}`);
    console.log(`Issue Title: ${result.issueTitle}`);
    console.log(`Report ID: ${result.reportId}`);
    console.log(`Total Logs: ${result.totalLogs}`);
    console.log(`Open Issues: ${result.openIssues}`);
    console.log(`High Severity: ${result.highSeverityCount}`);
    console.log(`Logs Included: ${result.logsIncluded}`);
    console.log(`Generated At: ${result.generatedAt}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.logsIncluded && result.totalLogs === 1) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.issueId).toBe('ISSUE_001');
    expect(result.issueTitle).toBe('TTS audio not playing on Android');
    expect(result.reportId).toBeDefined();
    expect(result.totalLogs).toBe(1);
    expect(result.openIssues).toBe(1);
    expect(result.highSeverityCount).toBe(1);
    expect(result.logsIncluded).toBe(true);
    expect(result.generatedAt).toBeDefined();
    expect(result.stage).toBe('completed');
  });

  test('Report contains correct log details', async () => {
    const { reportId } = await processMaintenanceToReport(MOCK_ADMIN, MOCK_ISSUE_LOG);
    const { report } = getReport(reportId);
    const log = report.logs[0];

    console.log('Test Case ID: INT-022');
    console.log('Test: Report log details');
    console.log(`Log ID: ${log?.id}`);
    console.log(`Title: ${log?.title}`);
    console.log(`Category: ${log?.category}`);
    console.log(`Severity: ${log?.severity}`);
    console.log(`Module: ${log?.module}`);
    console.log(`Status: ${log?.status}`);

    if (log?.id === 'ISSUE_001' && log?.severity === 'high') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(log.id).toBe('ISSUE_001');
    expect(log.title).toBe('TTS audio not playing on Android');
    expect(log.category).toBe('bug');
    expect(log.severity).toBe('high');
    expect(log.module).toBe('tts');
    expect(log.status).toBe('open');
    expect(log.recordedAt).toBeDefined();
  });

  test('Report breakdown by category, severity, and module', async () => {
    await adminLogin(MOCK_ADMIN);

    recordIssue(MOCK_ADMIN.id, { ...MOCK_ISSUE_LOG, id: 'I001', category: 'bug', severity: 'high', module: 'tts' });
    recordIssue(MOCK_ADMIN.id, { ...MOCK_ISSUE_LOG, id: 'I002', category: 'performance', severity: 'medium', module: 'ocr' });
    recordIssue(MOCK_ADMIN.id, { ...MOCK_ISSUE_LOG, id: 'I003', category: 'bug', severity: 'low', module: 'tts' });

    const result = generateMaintenanceReport();

    console.log('Test Case ID: INT-022');
    console.log('Test: Breakdown by category, severity, module');
    console.log(`Total Logs: ${result.totalLogs}`);
    console.log(`By Category: ${JSON.stringify(result.byCategory)}`);
    console.log(`By Severity: ${JSON.stringify(result.bySeverity)}`);
    console.log(`By Module: ${JSON.stringify(result.byModule)}`);

    if (result.byCategory?.bug === 2 && result.byModule?.tts === 2) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.totalLogs).toBe(3);
    expect(result.byCategory.bug).toBe(2);
    expect(result.byCategory.performance).toBe(1);
    expect(result.bySeverity.high).toBe(1);
    expect(result.bySeverity.medium).toBe(1);
    expect(result.bySeverity.low).toBe(1);
    expect(result.byModule.tts).toBe(2);
    expect(result.byModule.ocr).toBe(1);
  });

  test('Filtered report - bug category only', async () => {
    await adminLogin(MOCK_ADMIN);

    recordIssue(MOCK_ADMIN.id, { ...MOCK_ISSUE_LOG, id: 'I001', category: 'bug' });
    recordIssue(MOCK_ADMIN.id, { ...MOCK_ISSUE_LOG, id: 'I002', category: 'performance' });

    const result = generateMaintenanceReport({ category: 'bug' });

    console.log('Test Case ID: INT-022');
    console.log('Test: Filtered report by category=bug');
    console.log(`Total Logs: ${result.totalLogs}`);
    console.log(`Category Filter: bug`);

    if (result.totalLogs === 1 && result.byCategory?.bug === 1) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.totalLogs).toBe(1);
    expect(result.byCategory.bug).toBe(1);
  });

  test('Report stored and retrievable by ID', async () => {
    const { reportId } = await processMaintenanceToReport(MOCK_ADMIN, MOCK_ISSUE_LOG);
    const retrieved = getReport(reportId);

    console.log('Test Case ID: INT-022');
    console.log('Test: Report retrieval');
    console.log(`Report ID: ${reportId}`);
    console.log(`Retrieved: ${retrieved.success}`);
    console.log(`Matches ID: ${retrieved.report?.reportId === reportId}`);

    if (retrieved.success && retrieved.report.reportId === reportId) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(retrieved.success).toBe(true);
    expect(retrieved.report.reportId).toBe(reportId);
    expect(retrieved.report.generatedBy).toBe('ADMIN001');
  });

  test('Non-admin - record issue denied', async () => {
    const nonAdmin = { id: 'USER001', role: 'student', is_active: true };
    const result = await processMaintenanceToReport(nonAdmin, MOCK_ISSUE_LOG);

    console.log('Test Case ID: INT-022');
    console.log('Test: Non-admin record (negative test)');
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

  test('Invalid issue data - record fails gracefully', async () => {
    await adminLogin(MOCK_ADMIN);
    const result = recordIssue(MOCK_ADMIN.id, { title: 'Missing id and category' });

    console.log('Test Case ID: INT-022');
    console.log('Test: Invalid issue data (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Invalid issue data') {
      console.log('Outcome: Performed as Expected - Validation worked');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid issue data');
  });

  test('No issue logs - report fails gracefully', async () => {
    await adminLogin(MOCK_ADMIN);
    const result = generateMaintenanceReport();

    console.log('Test Case ID: INT-022');
    console.log('Test: No issue logs (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'No issue logs to report') {
      console.log('Outcome: Performed as Expected - Empty handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('No issue logs to report');
  });

});
