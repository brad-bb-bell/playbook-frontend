// Regular-season week windows per NFL season, from https://www.nfl.com/schedules.
// Each entry is [start, end] as 'MM-DD'; months of January and February belong
// to the following calendar year. Add a new season's entry each year.
export const NFL_WEEKS = {
  2026: [
    ['09-09', '09-14'],
    ['09-17', '09-21'],
    ['09-24', '09-28'],
    ['10-01', '10-05'],
    ['10-08', '10-12'],
    ['10-15', '10-19'],
    ['10-22', '10-26'],
    ['10-29', '11-02'],
    ['11-05', '11-09'],
    ['11-12', '11-16'],
    ['11-19', '11-23'],
    ['11-25', '11-30'],
    ['12-03', '12-07'],
    ['12-10', '12-14'],
    ['12-17', '12-21'],
    ['12-24', '12-30'],
    ['12-31', '01-06'],
    ['01-06', '01-13'],
  ],
}

// Playoff rounds follow week 18 one per week: wild card (19), divisional (20),
// conference championships (21), Super Bowl (22)
const PLAYOFF_WEEKS = 4
const DAY_MS = 24 * 60 * 60 * 1000

const toDate = (monthDay, season) => {
  const [month, day] = monthDay.split('-').map(Number)
  const year = month <= 2 ? season + 1 : season
  // End of the day, so the last day of a window still counts
  return new Date(year, month - 1, day, 23, 59, 59, 999)
}

/**
 * The NFL week to default a new bet to for the given season. Days between
 * windows (the Tuesday/Wednesday after a week wraps up) count toward the
 * upcoming week, since that's when its bets get placed. Returns null when
 * the season has no schedule on file or the season is over.
 */
export function currentNflWeek(season, today = new Date()) {
  const seasonYear = Number(season)
  const windows = NFL_WEEKS[seasonYear]
  if (!windows) return null

  const regularSeasonEnd = toDate(windows[windows.length - 1][1], seasonYear)
  const weekIndex = windows.findIndex(([, end]) => today <= toDate(end, seasonYear))
  if (weekIndex !== -1) return weekIndex + 1

  const daysPastRegularSeason = (today - regularSeasonEnd) / DAY_MS
  const playoffRound = Math.ceil(daysPastRegularSeason / 7)
  if (playoffRound <= PLAYOFF_WEEKS) return windows.length + playoffRound

  return null
}
