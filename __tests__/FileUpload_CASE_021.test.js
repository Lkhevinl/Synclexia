// ─── Test Case CASE-021 ──────────────────────────────────────────────────────
// Test Case ID: CASE-021
// Test Case Description: Validate upload of non-.txt file type
// Expected Result: Cannot attach file

function validateFileUpload(file) {
  // Check if file is provided
  if (!file) {
    return {
      canAttach: false,
      actualResult: 'Cannot attach file - No file selected'
    };
  }

  // Check file extension
  const allowedExtensions = ['.txt'];
  const fileName = file.name || '';
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return {
      canAttach: false,
      actualResult: 'Cannot attach file - Only .txt files are allowed',
      fileType: fileExtension
    };
  }

  // Valid .txt file
  return {
    canAttach: true,
    actualResult: 'File attached successfully',
    fileType: fileExtension
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-021 (Validate upload of non-.txt file type)', () => {

  test('Upload PDF file - cannot attach', () => {
    const expectedResult = 'Cannot attach file';
    const mockFile = { name: 'document.pdf', type: 'application/pdf', size: 1024 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-021');
    console.log('Test Case Description: Validate upload of non-.txt file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Type: ${result.fileType}`);

    if (!result.canAttach && result.actualResult.includes('Cannot attach')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(false);
    expect(result.actualResult).toContain('Cannot attach');
  });

  test('Upload DOCX file - cannot attach', () => {
    const expectedResult = 'Cannot attach file';
    const mockFile = { name: 'report.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 2048 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-021');
    console.log('Test Case Description: Validate upload of non-.txt file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Type: ${result.fileType}`);

    if (!result.canAttach && result.actualResult.includes('Cannot attach')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(false);
    expect(result.actualResult).toContain('Cannot attach');
  });

  test('Upload JPG image - cannot attach', () => {
    const expectedResult = 'Cannot attach file';
    const mockFile = { name: 'image.jpg', type: 'image/jpeg', size: 5120 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-021');
    console.log('Test Case Description: Validate upload of non-.txt file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Type: ${result.fileType}`);

    if (!result.canAttach && result.actualResult.includes('Cannot attach')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(false);
    expect(result.actualResult).toContain('Cannot attach');
  });

  test('Upload PNG image - cannot attach', () => {
    const expectedResult = 'Cannot attach file';
    const mockFile = { name: 'screenshot.png', type: 'image/png', size: 3072 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-021');
    console.log('Test Case Description: Validate upload of non-.txt file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.canAttach) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(false);
    expect(result.actualResult).toContain('Cannot attach');
  });

  test('Upload XLSX file - cannot attach', () => {
    const expectedResult = 'Cannot attach file';
    const mockFile = { name: 'spreadsheet.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 1536 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-021');
    console.log('Test Case Description: Validate upload of non-.txt file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.canAttach) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(false);
    expect(result.actualResult).toContain('Cannot attach');
  });

  test('Upload valid TXT file - should attach successfully (negative test)', () => {
    const mockFile = { name: 'document.txt', type: 'text/plain', size: 256 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-021');
    console.log('Test Case Description: Validate upload of non-.txt file type');
    console.log('Expected Result: Cannot attach file (for non-.txt files)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Type: ${result.fileType}`);

    if (result.canAttach && result.fileType === '.txt') {
      console.log('Outcome: PASSED - Valid .txt file attached successfully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(true);
    expect(result.fileType).toBe('.txt');
    expect(result.actualResult).toContain('attached successfully');
  });

  test('No file selected - cannot attach', () => {
    const expectedResult = 'Cannot attach file';
    const result = validateFileUpload(null);

    console.log('Test Case ID: CASE-021');
    console.log('Test Case Description: Validate upload of non-.txt file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.canAttach) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(false);
    expect(result.actualResult).toContain('Cannot attach');
  });

});
