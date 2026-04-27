/**
 * Helper utilities for Recurring Tasks
 */

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY' | '2_YEARLY';

export const FREQUENCIES: Frequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', '2_YEARLY'];

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Resolves dynamic placeholders in task names
 */
export function resolveTaskName(pattern: string, date: Date): string {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString();
  const shortYear = year.slice(-2);
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  
  return pattern
    .replace(/{{MONTH}}/g, month)
    .replace(/{{YEAR}}/g, year)
    .replace(/{{YY}}/g, shortYear)
    .replace(/{{MM}}/g, (date.getMonth() + 1).toString().padStart(2, '0'))
    .replace(/{{QUARTER}}/g, `Q${quarter}`);
}

/**
 * Generates a period key for duplicate prevention
 */
export function getPeriodKey(frequency: Frequency, date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  switch (frequency) {
    case 'DAILY':
      return `${year}-${month.toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    case 'WEEKLY':
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      return `${year}-W${weekNum.toString().padStart(2, '0')}`;
    case 'MONTHLY':
      return `${year}-${month.toString().padStart(2, '0')}`;
    case 'QUARTERLY':
      const q = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${q}`;
    case 'HALF_YEARLY':
      const h = date.getMonth() < 6 ? 1 : 2;
      return `${year}-H${h}`;
    case 'YEARLY':
      return `${year}`;
    default:
      return `${year}-${month}`;
  }
}

/**
 * Generates all occurrences for a template between two dates
 */
export function getOccurrencesBetween(
  template: any, 
  searchStart: Date, 
  searchEnd: Date
): { date: Date; periodKey: string }[] {
  const occurrences: { date: Date; periodKey: string }[] = [];
  
  const templateStart = template.startDate ? new Date(template.startDate) : new Date(2000, 0, 1);
  const templateEnd = template.endDate ? new Date(template.endDate) : new Date(2100, 0, 1);
  const excluded = Array.isArray(template.excludedDates) ? template.excludedDates : [];
  
  let current = new Date(templateStart);
  
  // Align current to search window
  while (current < searchStart) {
      if (template.frequency === 'WEEKLY') current.setDate(current.getDate() + 7);
      else if (template.frequency === 'MONTHLY') current.setMonth(current.getMonth() + 1);
      else if (template.frequency === 'QUARTERLY') current.setMonth(current.getMonth() + 3);
      else if (template.frequency === 'YEARLY') current.setFullYear(current.getFullYear() + 1);
      else break;
      if (current > searchEnd) break;
  }

  // Generate iterations
  while (current <= searchEnd && current <= templateEnd) {
    const pk = getPeriodKey(template.frequency, current);
    
    if (current >= searchStart && !template.isStopped && !excluded.includes(pk)) {
      if (!template.stopDate || current <= new Date(template.stopDate)) {
        
        let occurrenceDate = new Date(current);
        // Handle specific Weekday for Weekly tasks
        if (template.frequency === 'WEEKLY' && template.weeklyDay) {
            const targetDayIndex = WEEKDAYS.indexOf(template.weeklyDay); // 0=Mon, 6=Sun
            // getDay() returns 0=Sun, 1=Mon...
            const currentDayIndex = occurrenceDate.getDay(); 
            const adjustedCurrent = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
            const diff = targetDayIndex - adjustedCurrent;
            occurrenceDate.setDate(occurrenceDate.getDate() + diff);
        }

        occurrences.push({ date: occurrenceDate, periodKey: pk });
      }
    }
    
    // Advance
    if (template.frequency === 'DAILY') current.setDate(current.getDate() + 1);
    else if (template.frequency === 'WEEKLY') current.setDate(current.getDate() + 7);
    else if (template.frequency === 'MONTHLY') current.setMonth(current.getMonth() + 1);
    else if (template.frequency === 'QUARTERLY') current.setMonth(current.getMonth() + 3);
    else if (template.frequency === 'YEARLY') current.setFullYear(current.getFullYear() + 1);
    else break;

    if (occurrences.length > 500) break; 
  }
  
  return occurrences;
}

export function isWithinLeadTime(frequency: Frequency, dueDate: Date): boolean {
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  switch (frequency) {
    case 'YEARLY':
    case 'QUARTERLY':
      return diffDays <= 45;
    case 'MONTHLY':
      return diffDays <= 15;
    case 'WEEKLY':
      return diffDays <= 7;
    case 'DAILY':
      return diffDays <= 1;
    default:
      return diffDays <= 15;
  }
}
