/**
 * Helper utilities for Recurring Tasks
 */

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY' | '2_YEARLY';

export const FREQUENCIES: Frequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', '2_YEARLY'];

/**
 * Resolves dynamic placeholders in task names
 * @param pattern e.g. "GSTR 3B for {{MONTH}} {{YEAR}}"
 * @param date The performance date (not the due date)
 */
export function resolveTaskName(pattern: string, date: Date): string {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString();
  const shortYear = year.slice(-2);
  
  return pattern
    .replace(/{{MONTH}}/g, month)
    .replace(/{{YEAR}}/g, year)
    .replace(/{{YY}}/g, shortYear)
    .replace(/{{MM}}/g, (date.getMonth() + 1).toString().padStart(2, '0'));
}

/**
 * Generates a period key for duplicate prevention
 */
export function getPeriodKey(frequency: Frequency, date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  switch (frequency) {
    case 'DAILY':
      return `${year}-${month}-${date.getDate()}`;
    case 'WEEKLY':
      // Get ISO week number or just a week-ending date
      return `${year}-W${Math.ceil(date.getDate() / 7)}`;
    case 'MONTHLY':
      return `${year}-${month.toString().padStart(2, '0')}`;
    case 'QUARTERLY':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    case 'HALF_YEARLY':
      const half = date.getMonth() < 6 ? 1 : 2;
      return `${year}-H${half}`;
    case 'YEARLY':
      return `${year}`;
    case '2_YEARLY':
      return `2Y-${year}`;
    default:
      return `${year}-${month}`;
  }
}

/**
 * Calculates if a task should be visible in the staging area
 */
export function isWithinLeadTime(frequency: Frequency, dueDate: Date): boolean {
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  switch (frequency) {
    case 'YEARLY':
    case 'HALF_YEARLY':
    case '2_YEARLY':
    case 'QUARTERLY':
      return diffDays <= 45;
    case 'MONTHLY':
      return diffDays <= 15;
    case 'WEEKLY':
      return diffDays <= 3;
    case 'DAILY':
      return diffDays <= 1;
    default:
      return diffDays <= 15;
  }
}
