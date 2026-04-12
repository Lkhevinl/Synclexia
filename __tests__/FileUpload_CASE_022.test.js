// ─── Test Case CASE-022 ──────────────────────────────────────────────────────
// Test Case ID: CASE-022
// Test Case Description: Validate upload of .txt file and speak tap
// Expected Result: Can attach file

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

  // Valid .txt file - check file size (max 5MB for example)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      canAttach: false,
      actualResult: 'Cannot attach file - File size exceeds 5MB limit',
      fileType: fileExtension
    };
  }

  // Valid .txt file can be attached
  return {
    canAttach: true,
    actualResult: 'Can attach file',
    fileType: fileExtension,
    fileName: fileName,
    fileSize: file.size
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-022 (Validate upload of .txt file and speak tap)', () => {

  test('Upload valid .txt file - can attach', () => {
    const expectedResult = 'Can attach file';
    const mockFile = { name: 'document.txt', type: 'text/plain', size: 256 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-022');
    console.log('Test Case Description: Validate upload of .txt file and speak tap');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Name: ${result.fileName}`);
    console.log(`File Type: ${result.fileType}`);
    console.log(`File Size: ${result.fileSize} bytes`);

    if (result.canAttach && result.fileType === '.txt') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(true);
    expect(result.actualResult).toContain('Can attach');
    expect(result.fileType).toBe('.txt');
    expect(result.fileName).toBe('document.txt');
  });

  test('Upload .txt file with different name - can attach', () => {
    const expectedResult = 'Can attach file';
    const mockFile = { name: 'my_text_file.txt', type: 'text/plain', size: 1024 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-022');
    console.log('Test Case Description: Validate upload of .txt file and speak tap');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Name: ${result.fileName}`);

    if (result.canAttach && result.fileName === 'my_text_file.txt') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(true);
    expect(result.fileName).toBe('my_text_file.txt');
  });

  test('Upload .txt file with uppercase extension - can attach', () => {
    const expectedResult = 'Can attach file';
    const mockFile = { name: 'UPPERCASE.TXT', type: 'text/plain', size: 512 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-022');
    console.log('Test Case Description: Validate upload of .txt file and speak tap');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Name: ${result.fileName}`);
    console.log(`File Type: ${result.fileType}`);

    if (result.canAttach && result.fileType === '.txt') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(true);
    expect(result.fileType).toBe('.txt');
  });

  test('Upload large .txt file (under 5MB) - can attach', () => {
    const expectedResult = 'Can attach file';
    const mockFile = { name: 'large_document.txt', type: 'text/plain', size: 4 * 1024 * 1024 }; // 4MB
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-022');
    console.log('Test Case Description: Validate upload of .txt file and speak tap');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Size: ${result.fileSize} bytes (${result.fileSize / (1024 * 1024)} MB)`);

    if (result.canAttach) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(true);
    expect(result.fileSize).toBe(4 * 1024 * 1024);
  });

  test('Upload empty .txt file - can attach', () => {
    const expectedResult = 'Can attach file';
    const mockFile = { name: 'empty.txt', type: 'text/plain', size: 0 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-022');
    console.log('Test Case Description: Validate upload of .txt file and speak tap');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Size: ${result.fileSize} bytes`);

    if (result.canAttach) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(true);
    expect(result.fileSize).toBe(0);
  });

  test('Upload PDF file - cannot attach (negative test)', () => {
    const mockFile = { name: 'document.pdf', type: 'application/pdf', size: 1024 };
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-022');
    console.log('Test Case Description: Validate upload of .txt file and speak tap');
    console.log('Expected Result: Can attach file (for .txt files only)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Type: ${result.fileType}`);

    if (!result.canAttach) {
      console.log('Outcome: PASSED - Correctly rejected non-.txt file');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(false);
    expect(result.actualResult).toContain('Cannot attach');
  });

  test('Upload .txt file over 5MB - cannot attach (negative test)', () => {
    const mockFile = { name: 'huge_file.txt', type: 'text/plain', size: 6 * 1024 * 1024 }; // 6MB
    const result = validateFileUpload(mockFile);

    console.log('Test Case ID: CASE-022');
    console.log('Test Case Description: Validate upload of .txt file and speak tap');
    console.log('Expected Result: Can attach file (for valid .txt files)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Size: ${result.fileSize / (1024 * 1024)} MB`);

    if (!result.canAttach) {
      console.log('Outcome: PASSED - Correctly rejected oversized file');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canAttach).toBe(false);
    expect(result.actualResult).toContain('exceeds');
  });

});
