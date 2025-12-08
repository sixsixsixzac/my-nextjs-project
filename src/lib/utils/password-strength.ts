/**
 * Password strength calculator
 * Returns strength level and score
 */

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrengthResult {
  strength: PasswordStrength
  score: number // 0-100
  feedback: string[]
}

/**
 * Calculate password strength
 * @param password - The password to evaluate
 * @returns Password strength result
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password || password.length === 0) {
    return {
      strength: 'weak',
      score: 0,
      feedback: [],
    }
  }

  let score = 0
  const feedback: string[] = []

  // Length checks
  if (password.length >= 8) {
    score += 20
  } else {
    feedback.push('รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร')
  }

  if (password.length >= 12) {
    score += 10
  }

  if (password.length >= 16) {
    score += 10
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 10
  } else {
    feedback.push('เพิ่มตัวอักษรพิมพ์เล็ก')
  }

  if (/[A-Z]/.test(password)) {
    score += 10
  } else {
    feedback.push('เพิ่มตัวอักษรพิมพ์ใหญ่')
  }

  if (/\d/.test(password)) {
    score += 10
  } else {
    feedback.push('เพิ่มตัวเลข')
  }

  if (/[^a-zA-Z\d]/.test(password)) {
    score += 15
  } else {
    feedback.push('เพิ่มอักขระพิเศษ (!@#$% ฯลฯ)')
  }

  // Pattern checks (penalties)
  if (/(.)\1{2,}/.test(password)) {
    score -= 10 // Repeated characters
  }

  if (/123|abc|ABC|qwe|QWE/i.test(password)) {
    score -= 10 // Common sequences
  }

  // Common passwords check
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score -= 20
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score))

  // Determine strength level
  let strength: PasswordStrength
  if (score < 30) {
    strength = 'weak'
  } else if (score < 50) {
    strength = 'fair'
  } else if (score < 70) {
    strength = 'good'
  } else {
    strength = 'strong'
  }

  return {
    strength,
    score,
    feedback: feedback.length > 0 ? feedback : [],
  }
}

/**
 * Get color for password strength
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'bg-destructive'
    case 'fair':
      return 'bg-orange-500'
    case 'good':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-muted'
  }
}

/**
 * Get text color for password strength
 */
export function getPasswordStrengthTextColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'text-destructive'
    case 'fair':
      return 'text-orange-500'
    case 'good':
      return 'text-yellow-600'
    case 'strong':
      return 'text-green-600'
    default:
      return 'text-muted-foreground'
  }
}

/**
 * Get label for password strength
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'อ่อนแอ'
    case 'fair':
      return 'ปานกลาง'
    case 'good':
      return 'ดี'
    case 'strong':
      return 'แข็งแรง'
    default:
      return ''
  }
}

