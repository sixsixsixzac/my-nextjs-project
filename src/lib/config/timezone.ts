/**
 * Timezone Configuration
 * 
 * This module ensures the application timezone is set to Asia/Bangkok
 * It should be imported early in the application lifecycle
 */

const BANGKOK_TIMEZONE = 'Asia/Bangkok';

/**
 * Initialize timezone configuration
 * Call this early in the application startup
 */
export function initializeTimezone(): void {
  // Set timezone if not already set
  if (!process.env.TZ) {
    process.env.TZ = BANGKOK_TIMEZONE;
  }

  // Verify timezone is set correctly
  if (process.env.TZ !== BANGKOK_TIMEZONE) {
    console.warn(
      `Warning: TZ environment variable is set to "${process.env.TZ}" but expected "${BANGKOK_TIMEZONE}". ` +
      `Some date operations may not use Bangkok timezone correctly.`
    );
  }
}

// Auto-initialize on module load
initializeTimezone();

export { BANGKOK_TIMEZONE };

