import { SeasonalStructure, SeasonDefinition } from '../types';

export const DEFAULT_SEASONAL_STRUCTURE: SeasonalStructure = {
  seasons: [
    { name: 'Season 1', startMonth: 0, endMonth: 2 }, // Jan - Mar
    { name: 'Season 2', startMonth: 3, endMonth: 5 }, // Apr - Jun
    { name: 'Season 3', startMonth: 6, endMonth: 8 }, // Jul - Sep
    { name: 'Season 4', startMonth: 9, endMonth: 11 }, // Oct - Dec
  ],
};

/**
 * Returns the season definition for a given month index (0-11).
 */
export function getSeasonForMonth(month: number, structure: SeasonalStructure): SeasonDefinition | null {
  for (const season of structure.seasons) {
    if (month >= season.startMonth && month <= season.endMonth) {
      return season;
    }
    // Handle wrap-around seasons if ever needed (e.g. Dec-Feb)
    if (season.startMonth > season.endMonth) {
      if (month >= season.startMonth || month <= season.endMonth) {
        return season;
      }
    }
  }
  return null;
}

/**
 * Returns the season index for a given month index (0-11).
 */
export function getSeasonIndexForMonth(month: number, structure: SeasonalStructure): number {
  return structure.seasons.findIndex((s) => {
    if (s.startMonth <= s.endMonth) {
      return month >= s.startMonth && month <= s.endMonth;
    } else {
      return month >= s.startMonth || month <= s.endMonth;
    }
  });
}

/**
 * Returns the months within a specific season.
 */
export function getMonthsInSeason(season: SeasonDefinition): number[] {
  const months: number[] = [];
  let current = season.startMonth;
  while (current !== (season.endMonth + 1) % 12) {
    months.push(current);
    current = (current + 1) % 12;
  }
  return months;
}

/**
 * Validates a seasonal structure to ensure no gaps or overlaps.
 */
export function validateSeasonalStructure(structure: SeasonalStructure): boolean {
  const coveredMonths = new Set<number>();
  for (const season of structure.seasons) {
    const months = getMonthsInSeason(season);
    for (const m of months) {
      if (coveredMonths.has(m)) return false; // Overlap
      coveredMonths.add(m);
    }
  }
  return coveredMonths.size === 12; // Must cover all 12 months
}
