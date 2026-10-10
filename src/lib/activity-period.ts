// Activity restart date; record dates and real deadlines remain unchanged.
export const ACTIVITY_START_DATE = '2026-10-10'

export function activityDateIncluded(date: string, includePrevious = false) {
  return includePrevious || !date || date.slice(0, 10) >= ACTIVITY_START_DATE
}
