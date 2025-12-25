import { describe, it, expect } from 'vitest';
import { isValidCountryCode, sanitizeString } from '../security';

describe('isValidCountryCode', () => {
  it('should return true for valid alpha-2 codes', () => {
    expect(isValidCountryCode('US')).toBe(true);
    expect(isValidCountryCode('fr')).toBe(true);
  });

  it('should return true for valid alpha-3 codes', () => {
    expect(isValidCountryCode('USA')).toBe(true);
    expect(isValidCountryCode('fra')).toBe(true);
  });

  it('should return false for codes too short', () => {
    expect(isValidCountryCode('A')).toBe(false);
  });

  it('should return false for codes too long', () => {
    expect(isValidCountryCode('USA1')).toBe(false);
  });

  it('should return false for non-alphanumeric chars', () => {
    expect(isValidCountryCode('US!')).toBe(false);
  });

  it('should return false for null or undefined', () => {
    expect(isValidCountryCode(null)).toBe(false);
    expect(isValidCountryCode(undefined)).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('should escape HTML tags', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('should escape quotes', () => {
    expect(sanitizeString('"hello"')).toBe('&quot;hello&quot;');
    expect(sanitizeString("'hello'")).toBe('&#39;hello&#39;');
  });

  it('should escape ampersands', () => {
    expect(sanitizeString('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(123)).toBe('');
  });
});
