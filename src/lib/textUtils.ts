// 📝 TEXT UTILITIES - Robust text processing for medical AI
// Zero dependencies, maximum reliability
// Bernard Orozco 2025

/**
 * Normalizes text by removing diacritics and handling encoding corruption
 *
 * This is CRITICAL for pattern matching in medical contexts where:
 * - User input may come from various sources with different encodings
 * - Accent marks may be corrupted (é → � → missing)
 * - Medical terms must match regardless of encoding issues
 *
 * @example
 * normalizeText("cuadro séptico") → "cuadro septico"
 * normalizeText("mujer 45 años") → "mujer 45 anos"
 * normalizeText("hipertensión") → "hipertension"
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
 * Sanitizes user input by removing potentially problematic characters
 * while preserving medical information
 *
 * @example
 * sanitizeInput("<script>alert('xss')</script>dolor pecho") → "dolor pecho"
 */
export function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\sáéíóúñÁÉÍÓÚÑ.,;:()\-°/%]/g, '') // Keep only safe chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Extracts numeric age from various text formats
 * Handles months, weeks, days, and years
 *
 * CRITICAL for pediatric safety - must convert to decimal years
 *
 * @example
 * extractAge("2 meses") → 0.167
 * extractAge("5 años") → 5
 * extractAge("15 días") → 0.041
 */
export function extractAge(text: string): number | null {
  const normalized = normalizeText(text)

  // Years
  const yearsMatch = normalized.match(/(\d+)\s*(?:ano|year)/i)
  if (yearsMatch) return parseInt(yearsMatch[1])

  // Months
  const monthsMatch = normalized.match(/(\d+)\s*(?:mes|month)/i)
  if (monthsMatch) return Math.round((parseInt(monthsMatch[1]) / 12) * 1000) / 1000

  // Weeks
  const weeksMatch = normalized.match(/(\d+)\s*(?:semana|week)/i)
  if (weeksMatch) return Math.round((parseInt(weeksMatch[1]) / 52) * 1000) / 1000

  // Days
  const daysMatch = normalized.match(/(\d+)\s*(?:dia|day)/i)
  if (daysMatch) return Math.round((parseInt(daysMatch[1]) / 365) * 1000) / 1000

  return null
}

/**
 * Creates a flexible regex pattern that handles encoding issues
 *
 * @example
 * createFlexiblePattern("séptico") → /s[eé]?ptic[oa]?/i
 */
export function createFlexiblePattern(term: string): RegExp {
  const normalized = normalizeText(term)
  // Make vowels optional to handle corruption
  const flexible = normalized
    .replace(/e/g, '[eé]?')
    .replace(/a/g, '[aá]?')
    .replace(/i/g, '[ií]?')
    .replace(/o/g, '[oó]?')
    .replace(/u/g, '[uú]?')
    .replace(/n/g, '[nñ]?')

  return new RegExp(flexible, 'i')
}

/**
 * Checks if text contains any of the given patterns
 * Handles encoding issues automatically
 */
export function containsAnyPattern(text: string, patterns: string[]): boolean {
  const normalized = normalizeText(text)
  return patterns.some(pattern => {
    const regex = new RegExp(pattern, 'i')
    return regex.test(normalized)
  })
}

/**
 * Checks if text contains all of the given patterns
 * Handles encoding issues automatically
 */
export function containsAllPatterns(text: string, patterns: string[]): boolean {
  const normalized = normalizeText(text)
  return patterns.every(pattern => {
    const regex = new RegExp(pattern, 'i')
    return regex.test(normalized)
  })
}

/**
 * Extracts medical entities from text
 * Returns structured data for further processing
 */
export interface MedicalEntity {
  type: 'symptom' | 'duration' | 'vital_sign' | 'age' | 'gender'
  value: string
  normalized: string
  position: number
}

export function extractMedicalEntities(text: string): MedicalEntity[] {
  const entities: MedicalEntity[] = []
  const normalized = normalizeText(text)

  // Common symptoms patterns
  const symptomPatterns = [
    'dolor',
    'fiebre',
    'tos',
    'vomito',
    'diarrea',
    'mareo',
    'nausea',
    'fatiga',
    'debilidad',
    'sudoracion',
    'palidez',
  ]

  symptomPatterns.forEach(symptom => {
    const regex = new RegExp(`\\b${symptom}\\w*\\b`, 'gi')
    let match
    while ((match = regex.exec(text)) !== null) {
      entities.push({
        type: 'symptom',
        value: match[0],
        normalized: normalizeText(match[0]),
        position: match.index,
      })
    }
  })

  return entities
}

/**
 * Validates medical input for basic sanity checks
 */
export interface InputValidation {
  isValid: boolean
  issues: string[]
  suggestions: string[]
}

export function validateMedicalInput(text: string): InputValidation {
  const issues: string[] = []
  const suggestions: string[] = []

  if (!text || text.trim().length === 0) {
    issues.push('Input is empty')
    return { isValid: false, issues, suggestions }
  }

  if (text.length < 5) {
    issues.push('Input too short')
    suggestions.push('Please provide more details about symptoms')
  }

  if (text.length > 5000) {
    issues.push('Input too long')
    suggestions.push('Please summarize the main symptoms')
  }

  // Check for common typos or encoding issues
  if (text.includes('�')) {
    suggestions.push('Detected encoding issues - text has been normalized')
  }

  return {
    isValid: issues.length === 0 || issues.every(i => i === 'Input too short'),
    issues,
    suggestions,
  }
}
