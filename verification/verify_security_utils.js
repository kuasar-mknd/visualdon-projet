import { sanitizeLog, sanitizeString } from '../src/utils/security.js';

console.log("Testing sanitizeLog...");
const longString = 'a'.repeat(200);
const controlString = "Hello\nWorld\t!";

// Test truncation
const sanitizedLong = sanitizeLog(longString, 100);
if (sanitizedLong.length > 103) { // 100 + '...'
    throw new Error(`sanitizeLog failed truncation: length is ${sanitizedLong.length}`);
}
if (!sanitizedLong.endsWith('...')) {
    throw new Error("sanitizeLog failed to append ellipsis");
}

// Test control char removal
const sanitizedControl = sanitizeLog(controlString);
if (sanitizedControl.includes('\n') || sanitizedControl.includes('\t')) {
    throw new Error(`sanitizeLog failed to remove control characters: "${sanitizedControl}"`);
}

// Test null/undefined
if (sanitizeLog(null) !== '') throw new Error("sanitizeLog(null) should be empty string");
if (sanitizeLog(undefined) !== '') throw new Error("sanitizeLog(undefined) should be empty string");

console.log("Testing sanitizeString...");
const longHtml = '<script>'.repeat(50);
// Test truncation
// sanitizeString(str, maxLength) applies limit to INPUT
const truncatedLongHtml = sanitizeString(longHtml, 20);
if (truncatedLongHtml.length > 100) {
    throw new Error(`sanitizeString failed truncation for long HTML: length is ${truncatedLongHtml.length}`);
}

const truncatedInput = sanitizeString('abc', 2);
if (truncatedInput !== 'ab') {
    throw new Error(`sanitizeString failed truncation: expected 'ab', got '${truncatedInput}'`);
}

// Test HTML escaping
const unsafe = '<>';
if (sanitizeString(unsafe) !== '&lt;&gt;') {
    throw new Error("sanitizeString failed escaping");
}

console.log("All security util tests passed!");
