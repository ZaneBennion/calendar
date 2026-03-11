/**
 * Formats a date to ISO string (YYYY-MM-DD).
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Returns the start of the week (Sunday) for a given date.
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Returns the week number (1-53) for a given date.
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Returns the number of weeks in a year.
 */
export function getWeeksInYear(year: number): number {
  const d = new Date(year, 11, 31);
  return getWeekNumber(d);
}

/**
 * Returns all weeks that have at least one day in the given month.
 */
export function getWeeksInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const weeks: Date[] = [];
  let current = getStartOfWeek(firstDay);
  
  while (current <= lastDay) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Returns the days in a given week (Sunday to Saturday).
 */
export function getDaysInWeek(startOfWeek: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

/**
 * Formats a week range (e.g., "Mar 1 - 7" or "Mar 29 - Apr 4").
 */
export function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  const startMonth = start.toLocaleDateString('default', { month: 'short' });
  const endMonth = end.toLocaleDateString('default', { month: 'short' });
  
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
  } else {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
  }
}

