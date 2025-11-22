/**
 * Date utility functions with Bangkok timezone support
 * All dates are handled in Asia/Bangkok timezone (UTC+7)
 */

const BANGKOK_TIMEZONE = 'Asia/Bangkok';

/**
 * Get current date/time in Bangkok timezone
 */
export function getBangkokDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: BANGKOK_TIMEZONE }));
}

/**
 * Convert a date to Bangkok timezone
 */
export function toBangkokTime(date: Date | string | number): Date {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: BANGKOK_TIMEZONE }));
}

/**
 * Format a date to Bangkok timezone string
 */
export function formatBangkokDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    timeZone: BANGKOK_TIMEZONE,
    ...options,
  });
}

/**
 * Format a date to Bangkok date string (date only)
 */
export function formatBangkokDateOnly(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    timeZone: BANGKOK_TIMEZONE,
    ...options,
  });
}

/**
 * Format a date to Bangkok time string (time only)
 */
export function formatBangkokTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    timeZone: BANGKOK_TIMEZONE,
    ...options,
  });
}

/**
 * Get a date object that represents the current time in Bangkok
 * This is useful for database operations
 * Note: Date objects in JavaScript are always in UTC internally,
 * but this ensures the timezone context is correct
 */
export function getBangkokNow(): Date {
  // Return current date - JavaScript Date objects are always UTC internally
  // The timezone is handled by the environment (TZ env var) and database
  return new Date(new Date().toLocaleString('en-US', { timeZone: BANGKOK_TIMEZONE }));
}

/**
 * Add days to a date in Bangkok timezone
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to a date in Bangkok timezone
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Check if a date is in the past (Bangkok timezone)
 */
export function isPast(date: Date | string | number): boolean {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d < getBangkokNow();
}

/**
 * Check if a date is in the future (Bangkok timezone)
 */
export function isFuture(date: Date | string | number): boolean {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d > getBangkokNow();
}

