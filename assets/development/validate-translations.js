// Validate translations.js syntax
try {
  const content = require('./translations.js');
  console.log('✓ translations.js syntax is valid');
  console.log('Available languages:', Object.keys(content));
  console.log('Number of EN entries:', Object.keys(content.en).length);
  console.log('Number of TR entries:', Object.keys(content.tr).length);
} catch (error) {
  console.error('✗ Error validating translations.js');
  console.error(error.message);
  console.error('Line:', error.lineNumber);
  console.error('Column:', error.columnNumber);
}
