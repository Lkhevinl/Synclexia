// ─── Test Case CASE-107 ──────────────────────────────────────────────────────
// Test Case ID: CASE-107
// Test Case Description: Admin exports reports
// Expected Result: Report is exported successfully in selected format

// Mock reports data for export
const EXPORTABLE_REPORTS = {
  reports: [
    {
      reportId: 'REPORT001',
      type: 'User Activity',
      description: 'Daily active users and session duration',
      generatedAt: '2024-04-13T08:00:00Z',
      period: 'daily',
      data: [
        { date: '2024-04-12', activeUsers: 850, sessions: 1200, avgDuration: 18.5 },
        { date: '2024-04-11', activeUsers: 920, sessions: 1350, avgDuration: 19.2 },
        { date: '2024-04-10', activeUsers: 880, sessions: 1280, avgDuration: 17.8 }
      ]
    },
    {
      reportId: 'REPORT002',
      type: 'Learning Progress',
      description: 'Learner completion rates and accuracy scores',
      generatedAt: '2024-04-12T18:00:00Z',
      period: 'weekly',
      data: [
        { learnerId: 'LEARNER001', completed: 45, accuracy: 85.5, timeSpent: 320 },
        { learnerId: 'LEARNER002', completed: 38, accuracy: 78.3, timeSpent: 280 },
        { learnerId: 'LEARNER003', completed: 52, accuracy: 92.1, timeSpent: 410 }
      ]
    }
  ]
};

const VALID_EXPORT_FORMATS = ['PDF', 'CSV', 'EXCEL', 'JSON'];

function exportReport(adminId, reportId, format, options = {}) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Report not exported - Admin not authenticated',
      reportExported: false,
      errorMessage: 'Please log in as admin to export reports'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Report not exported - Insufficient privileges',
      reportExported: false,
      errorMessage: 'You do not have permission to export reports'
    };
  }

  // Check if report exists
  const report = EXPORTABLE_REPORTS.reports.find(r => r.reportId === reportId);
  if (!report) {
    return {
      success: false,
      actualResult: 'Report not exported - Report not found',
      reportExported: false,
      errorMessage: 'Report not found'
    };
  }

  // Check if format is provided
  if (!format || format.trim() === '') {
    return {
      success: false,
      actualResult: 'Report not exported - No format specified',
      reportExported: false,
      errorMessage: 'Please select an export format'
    };
  }

  // Validate export format
  const normalizedFormat = format.toUpperCase();
  if (!VALID_EXPORT_FORMATS.includes(normalizedFormat)) {
    return {
      success: false,
      actualResult: 'Report not exported - Invalid format',
      reportExported: false,
      errorMessage: 'Invalid export format',
      validFormats: VALID_EXPORT_FORMATS
    };
  }

  // Generate export metadata
  const timestamp = new Date().toISOString();
  const fileName = `${report.type.replace(/\s+/g, '_')}_${report.period}_${reportId}_${timestamp.split('T')[0]}.${normalizedFormat.toLowerCase()}`;
  
  // Calculate file size (mock)
  const fileSize = normalizedFormat === 'PDF' ? 245000 : 
                   normalizedFormat === 'EXCEL' ? 18000 : 
                   normalizedFormat === 'CSV' ? 12000 : 8500;

  return {
    success: true,
    actualResult: 'Report is exported successfully in selected format',
    reportExported: true,
    adminId: adminId,
    reportId: reportId,
    reportType: report.type,
    format: normalizedFormat,
    fileName: fileName,
    fileSize: fileSize,
    fileSizeFormatted: `${(fileSize / 1024).toFixed(1)} KB`,
    exportedAt: timestamp,
    dataRows: report.data ? report.data.length : 0,
    includesHeaders: options.includeHeaders !== false,
    downloadUrl: `/api/reports/download/${reportId}/${normalizedFormat.toLowerCase()}`,
    message: `Report "${report.type}" exported successfully as ${normalizedFormat}`
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-107 (Admin exports reports)', () => {

  test('Export report as PDF - report is exported successfully in selected format', () => {
    const expectedResult = 'Report is exported successfully in selected format';
    const adminId = 'ADMIN001';
    const reportId = 'REPORT001';
    const format = 'PDF';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log('Test Case Description: Admin exports reports');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Report Exported: ${result.reportExported}`);
    console.log(`Admin ID: ${result.adminId}`);
    console.log(`Report ID: ${result.reportId}`);
    console.log(`Report Type: ${result.reportType}`);
    console.log(`Format: ${result.format}`);
    console.log(`File Name: ${result.fileName}`);
    console.log(`File Size: ${result.fileSizeFormatted}`);
    console.log(`Data Rows: ${result.dataRows}`);
    console.log(`Exported At: ${result.exportedAt}`);
    console.log(`Download URL: ${result.downloadUrl}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.reportExported) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.reportExported).toBe(true);
    expect(result.actualResult).toContain('exported successfully');
    expect(result.reportId).toBe('REPORT001');
    expect(result.format).toBe('PDF');
    expect(result.fileName).toContain('.pdf');
    expect(result.fileName).toContain('REPORT001');
    expect(result.fileSize).toBeGreaterThan(0);
    expect(result.dataRows).toBe(3);
    expect(result.downloadUrl).toContain('/api/reports/download/');
  });

  test('Export report as CSV - report is exported successfully in selected format', () => {
    const adminId = 'ADMIN001';
    const reportId = 'REPORT002';
    const format = 'CSV';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log(`Format: ${result.format}`);
    console.log(`File Name: ${result.fileName}`);
    console.log(`File Size: ${result.fileSizeFormatted}`);

    if (result.success && result.reportExported) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.reportExported).toBe(true);
    expect(result.format).toBe('CSV');
    expect(result.fileName).toContain('.csv');
    expect(result.reportType).toBe('Learning Progress');
    expect(result.dataRows).toBe(3);
  });

  test('Export report as EXCEL - report is exported successfully in selected format', () => {
    const adminId = 'ADMIN001';
    const reportId = 'REPORT001';
    const format = 'EXCEL';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log(`Format: ${result.format}`);
    console.log(`File Name: ${result.fileName}`);

    if (result.success && result.reportExported) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.reportExported).toBe(true);
    expect(result.format).toBe('EXCEL');
    expect(result.fileName).toContain('.excel');
  });

  test('Export report as JSON - report is exported successfully in selected format', () => {
    const adminId = 'ADMIN001';
    const reportId = 'REPORT002';
    const format = 'JSON';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log(`Format: ${result.format}`);
    console.log(`File Name: ${result.fileName}`);
    console.log(`File Size: ${result.fileSizeFormatted}`);

    if (result.success && result.reportExported) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.reportExported).toBe(true);
    expect(result.format).toBe('JSON');
    expect(result.fileName).toContain('.json');
    expect(result.fileSize).toBeLessThan(10000); // JSON is smallest
  });

  test('Export with includeHeaders option - report includes headers', () => {
    const adminId = 'ADMIN001';
    const reportId = 'REPORT001';
    const format = 'CSV';
    const options = { includeHeaders: true };

    const result = exportReport(adminId, reportId, format, options);

    console.log('Test Case ID: CASE-107');
    console.log(`Include Headers: ${result.includesHeaders}`);

    if (result.success && result.includesHeaders) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.includesHeaders).toBe(true);
  });

  test('Export without headers option - report excludes headers', () => {
    const adminId = 'ADMIN001';
    const reportId = 'REPORT001';
    const format = 'CSV';
    const options = { includeHeaders: false };

    const result = exportReport(adminId, reportId, format, options);

    console.log('Test Case ID: CASE-107');
    console.log(`Include Headers: ${result.includesHeaders}`);

    if (result.success && !result.includesHeaders) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.includesHeaders).toBe(false);
  });

  test('Export non-existent report - report not exported (negative test)', () => {
    const adminId = 'ADMIN001';
    const reportId = 'REPORT999';
    const format = 'PDF';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log(`Report ID: ${reportId} (does not exist)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.reportExported) {
      console.log('Outcome: PASSED - Correctly rejected non-existent report');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.reportExported).toBe(false);
    expect(result.errorMessage).toContain('not found');
  });

  test('Export with invalid format - report not exported (negative test)', () => {
    const adminId = 'ADMIN001';
    const reportId = 'REPORT001';
    const format = 'XML';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log(`Format: "${format}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Valid Formats: ${result.validFormats ? result.validFormats.join(', ') : 'none'}`);

    if (!result.success && !result.reportExported) {
      console.log('Outcome: PASSED - Correctly rejected invalid format');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.reportExported).toBe(false);
    expect(result.errorMessage).toContain('Invalid export format');
    expect(result.validFormats).toContain('PDF');
    expect(result.validFormats).toContain('CSV');
    expect(result.validFormats).toContain('EXCEL');
    expect(result.validFormats).toContain('JSON');
  });

  test('Export without format - report not exported (negative test)', () => {
    const adminId = 'ADMIN001';
    const reportId = 'REPORT001';
    const format = '';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log(`Format: "" (empty)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.reportExported) {
      console.log('Outcome: PASSED - Correctly rejected empty format');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.reportExported).toBe(false);
    expect(result.errorMessage).toContain('select an export format');
  });

  test('Without admin authentication - report not exported (negative test)', () => {
    const adminId = '';
    const reportId = 'REPORT001';
    const format = 'PDF';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.reportExported) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.reportExported).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('With non-admin account - report not exported (negative test)', () => {
    const adminId = 'USER001';
    const reportId = 'REPORT001';
    const format = 'PDF';

    const result = exportReport(adminId, reportId, format);

    console.log('Test Case ID: CASE-107');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.reportExported) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.reportExported).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

});
