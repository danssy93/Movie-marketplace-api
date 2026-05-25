/**
 * Utility functions for date operations
 */
export class DateUtils {
  /**
   * Gets current date/time in West Africa Time (WAT)
   * @returns Date object in WAT timezone
   */
  static getWATDateTime(): Date {
    const date = new Date();
    // WAT is UTC+1
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utcTime + 3600000 * 1); // 1 hour ahead of UTC
  }

  /**
   * Adds specified number of days to a date
   * @param date Base date
   * @param days Number of days to add
   * @returns New date with days added
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Adds specified number of months to a date
   * @param date Base date
   * @param months Number of months to add
   * @returns New date with months added
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Gets the last day of the current month
   * @param date Input date
   * @returns Date representing the last day of the month
   */
  static getLastDayOfMonth(date: Date): Date {
    const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return result;
  }
}
