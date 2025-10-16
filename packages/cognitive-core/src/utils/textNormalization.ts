// 📝 TEXT NORMALIZATION UTILITIES FOR COGNITIVE CORE
// Shared utilities for robust text processing
// Bernard Orozco 2025

/**
 * Normalizes text by removing diacritics and handling encoding corruption
 *
 * CRITICAL for pattern matching in medical contexts where:
 * - Input may come from various sources with different encodings
 * - Accent marks may be corrupted (é → � → missing)
 * - Medical terms must match regardless of encoding issues
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[���\uFFFD]/g, '') // Remove replacement characters (encoding errors)
    .trim()
}

/**
 * Checks if text contains all of the given patterns using normalized comparison
 */
export function containsAllPatterns(text: string, patterns: string[]): boolean {
  const normalized = normalizeText(text)
  return patterns.every(pattern => {
    const regex = new RegExp(pattern, 'i')
    return regex.test(normalized)
  })
}

/**
 * Checks if text contains any of the given patterns using normalized comparison
 */
export function containsAnyPattern(text: string, patterns: string[]): boolean {
  const normalized = normalizeText(text)
  return patterns.some(pattern => {
    const regex = new RegExp(pattern, 'i')
    return regex.test(normalized)
  })
}
