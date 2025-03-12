// Date utility functions
import { differenceInDays } from 'date-fns';

// Wedding date: May 24, 2026
export const WEDDING_DATE = new Date('2026-05-24');

/**
 * Calculate days until Angela's wedding
 * @returns Number of days until the wedding
 */
export const getDaysUntilWedding = (): number => {
  const today = new Date();
  // Set both dates to midnight to avoid time zone issues
  today.setHours(0, 0, 0, 0);
  const weddingDate = new Date(WEDDING_DATE);
  weddingDate.setHours(0, 0, 0, 0);
  
  return Math.max(0, differenceInDays(weddingDate, today));
};

/**
 * Format a date to a readable string (MM/DD/YYYY)
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | null): string => {
  if (!date) return '';
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

/**
 * Checks if two dates are on the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if both dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}; 