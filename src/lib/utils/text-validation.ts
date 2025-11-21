/**
 * Utility functions for text validation including smart profanity filtering
 */

// List of profanity/inappropriate words (Thai and English)
// This is a basic list - you may want to expand this list or use a more comprehensive library
const PROFANITY_WORDS = [
  // Thai profanity (examples - you should expand this list)
  'ไอ้', 'มึง', 'กู', 'ควาย', 'โง่', 'บ้า', 'ส้นตีน', 'เหี้ย', 'เย็ด', 'มรึง','ควย','ขวย','หี','หำ','เย้ด',
  // English profanity (common words)
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 'piss', 'hell',
  'dick', 'cock', 'pussy', 'whore', 'slut', 'fag', 'nigger', 'retard',
].map(word => word.toLowerCase())

/**
 * Character substitution map for leetspeak detection
 * Maps common character substitutions used to obfuscate words
 */
const CHAR_SUBSTITUTIONS: Record<string, string[]> = {
  'a': ['@', '4', 'а', 'à', 'á', 'â', 'ã', 'ä', 'å'],
  'e': ['3', '€', 'е', 'è', 'é', 'ê', 'ë'],
  'i': ['1', '!', '|', 'і', 'ì', 'í', 'î', 'ï'],
  'o': ['0', 'о', 'ò', 'ó', 'ô', 'õ', 'ö'],
  's': ['$', '5', 'ѕ', 'ś', 'š'],
  't': ['7', 'т', 'ť', 'ţ'],
  'l': ['1', '|', 'ł', 'ļ'],
  'z': ['2', 'ž', 'ż'],
  'g': ['9', 'ğ'],
  'b': ['6', 'ь'],
}

/**
 * Converts leetspeak characters to their normal equivalents
 * @param text - Text with potential leetspeak
 * @returns Text with leetspeak characters converted
 */
function convertLeetspeak(text: string): string {
  let converted = text.toLowerCase()
  
  // Reverse the substitution map for easier lookup
  const reverseMap: Record<string, string> = {}
  for (const [normal, variants] of Object.entries(CHAR_SUBSTITUTIONS)) {
    for (const variant of variants) {
      reverseMap[variant] = normal
    }
  }
  
  // Replace leetspeak characters
  for (const [variant, normal] of Object.entries(reverseMap)) {
    converted = converted.replace(new RegExp(variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), normal)
  }
  
  return converted
}

/**
 * Removes spacing and special characters from text for pattern matching
 * @param text - Text to clean
 * @returns Cleaned text
 */
function removeObfuscation(text: string): string {
  // Remove spaces, dots, dashes, underscores, and other common obfuscation characters
  return text.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[._\-*#@$%^&()\[\]{}|\\\/]/g, '')
    .replace(/(.)\1{2,}/g, '$1') // Remove repeated characters (more than 2)
}

/**
 * Creates a flexible regex pattern that matches a word with potential obfuscation
 * @param word - The word to create a pattern for
 * @returns Regex pattern
 */
function createFlexiblePattern(word: string): RegExp {
  // Convert word to pattern that allows:
  // - Character substitutions (leetspeak)
  // - Optional spaces/special chars between characters
  // - Case variations
  
  const chars = word.split('')
  const patternParts = chars.map(char => {
    const lowerChar = char.toLowerCase()
    const substitutions = CHAR_SUBSTITUTIONS[lowerChar] || []
    const allVariants = [lowerChar, char.toUpperCase(), ...substitutions]
    const uniqueVariants = [...new Set(allVariants)]
    
    // Escape special regex characters
    const escapedVariants = uniqueVariants.map(v => 
      v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    
    // Allow optional spacing/special chars between characters
    return `[${escapedVariants.join('')}][\\s._\\-*#@$%^&()\\[\\]{}|\\\\\\/]*`
  })
  
  return new RegExp(patternParts.join(''), 'i')
}

/**
 * Checks if text contains profanity using smart detection
 * Handles: leetspeak, spacing, special characters, case variations, unicode
 * @param text - The text to check
 * @returns true if profanity is detected, false otherwise
 */
export function containsProfanity(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false
  }

  const originalText = text.trim()
  const normalizedText = originalText.toLowerCase()
  
  // Step 1: Check for exact word matches (case-insensitive)
  for (const word of PROFANITY_WORDS) {
    const exactRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (exactRegex.test(originalText)) {
      return true
    }
  }
  
  // Step 2: Check with leetspeak conversion
  const leetspeakConverted = convertLeetspeak(originalText)
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (regex.test(leetspeakConverted)) {
      return true
    }
  }
  
  // Step 3: Check with obfuscation removed (spaces, special chars)
  const deobfuscated = removeObfuscation(originalText)
  for (const word of PROFANITY_WORDS) {
    if (deobfuscated.includes(word)) {
      return true
    }
  }
  
  // Step 4: Check with flexible pattern matching (handles spacing, substitutions)
  for (const word of PROFANITY_WORDS) {
    const flexiblePattern = createFlexiblePattern(word)
    if (flexiblePattern.test(originalText)) {
      return true
    }
  }
  
  // Step 5: Check for suspicious patterns
  const suspiciousPatterns = [
    /(.)\1{4,}/, // 5+ repeated characters (e.g., "aaaaa")
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{4,}/, // 4+ consecutive special characters
    /[a-z]\d{2,}[a-z]/i, // Letters with numbers in between (potential obfuscation)
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(originalText)) {
      return true
    }
  }

  return false
}

/**
 * Validates display name
 * @param displayName - The display name to validate
 * @returns An object with isValid boolean and error message
 */
export function validateDisplayName(displayName: string): {
  isValid: boolean
  error?: string
} {
  if (!displayName || displayName.trim().length === 0) {
    return {
      isValid: false,
      error: 'กรุณากรอกชื่อแสดงผล'
    }
  }

  const trimmedName = displayName.trim()

  // Check minimum length
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: 'ชื่อแสดงผลต้องมีอย่างน้อย 2 ตัวอักษร'
    }
  }

  // Check maximum length
  if (trimmedName.length > 50) {
    return {
      isValid: false,
      error: 'ชื่อแสดงผลต้องไม่เกิน 50 ตัวอักษร'
    }
  }

  // Check for profanity
  if (containsProfanity(trimmedName)) {
    return {
      isValid: false,
      error: 'กรุณาอย่ากรอกคำหยาบคำต้องห้าม'
    }
  }

  return {
    isValid: true
  }
}
