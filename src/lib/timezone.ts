/**
 * DST-safe timezone conversion and overlap calculation utilities.
 * All calculations use Luxon for reliable DST handling.
 */

import { DateTime } from 'luxon'

/**
 * Represents a point in time as UTC minutes since epoch.
 */
export type UtcMinutes = number

/**
 * Represents a time window as [start, end] in UTC minutes.
 */
export interface UtcInterval {
  start: UtcMinutes
  end: UtcMinutes
}

/**
 * Represents a local time window as [start, end] in minutes since midnight.
 */
export interface LocalTimeWindow {
  start: number // 0-1439 (HH:mm in minutes)
  end: number // 0-1439 (HH:mm in minutes)
}

/**
 * Parse HH:mm time string to minutes since midnight.
 * @param timeStr Time in "HH:mm" format (e.g., "09:30")
 * @returns Minutes since midnight (0-1439)
 */
export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Format minutes since midnight to HH:mm.
 * @param minutes Minutes since midnight (0-1439)
 * @returns Time in "HH:mm" format
 */
export function minutesToTimeString(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Get the UTC offset in minutes for a timezone at a specific moment.
 * Accounts for DST transitions.
 * @param tzName IANA timezone name (e.g., "America/New_York")
 * @param moment DateTime to check offset at
 * @returns Offset in minutes (positive for east, negative for west)
 */
export function getUtcOffsetMinutes(tzName: string, moment: DateTime): number {
  // Convert to the target timezone to get its offset at that moment
  const zoned = moment.setZone(tzName)
  return zoned.offset // Luxon's offset is in minutes
}

/**
 * Convert a local time in a timezone to a UTC DateTime.
 * @param tzName IANA timezone name
 * @param localDateTime DateTime representing local time (zone info ignored)
 * @returns DateTime in UTC
 */
export function convertLocalToUtc(
  tzName: string,
  localDateTime: DateTime,
): DateTime {
  // Reinterpret the DateTime as being in the target timezone (keeping the local time),
  // then convert to UTC
  const zoned = localDateTime.setZone(tzName, { keepLocalTime: true })
  return zoned.toUTC()
}

/**
 * Convert a UTC DateTime to local time in a timezone.
 * @param tzName IANA timezone name
 * @param utcDateTime DateTime in UTC
 * @returns DateTime in the target timezone
 */
export function convertUtcToLocal(
  tzName: string,
  utcDateTime: DateTime,
): DateTime {
  return utcDateTime.setZone(tzName)
}

/**
 * Convert a local business-hours window to UTC interval(s) for a specific date.
 * Handles midnight-crossing windows (e.g., 22:00–06:00).
 * Returns an array because a midnight-crossing local window may span two UTC intervals
 * if the date boundary falls within the window in that timezone.
 * @param tzName IANA timezone name
 * @param startTimeStr Start time in "HH:mm" format
 * @param endTimeStr End time in "HH:mm" format
 * @param referenceDate Date to use for the business window (in the given timezone's local date)
 * @returns Array of UTC intervals (usually 1, sometimes 2 for midnight-crossing)
 */
export function getBusinessHoursUtcInterval(
  tzName: string,
  startTimeStr: string,
  endTimeStr: string,
  referenceDate: DateTime = DateTime.now(),
): UtcInterval[] {
  const startMin = parseTimeToMinutes(startTimeStr)
  const endMin = parseTimeToMinutes(endTimeStr)

  // Normalize reference date to start of day in the target timezone
  const refLocal = referenceDate.setZone(tzName).startOf('day')

  // Create local times for the business window
  const windowStart = refLocal.plus({ minutes: startMin })
  const windowEnd = refLocal.plus({ minutes: endMin })

  if (startMin === endMin) {
    // Open 24/7 window
    const utcStart = convertLocalToUtc(tzName, refLocal)
    const utcEnd = convertLocalToUtc(tzName, refLocal.plus({ days: 1 }))
    return [
      { start: utcStart.toMillis() / 60000, end: utcEnd.toMillis() / 60000 },
    ]
  }

  if (startMin < endMin) {
    // Normal case: window does not cross midnight in local time
    const utcStart = convertLocalToUtc(tzName, windowStart)
    const utcEnd = convertLocalToUtc(tzName, windowEnd)
    return [
      { start: utcStart.toMillis() / 60000, end: utcEnd.toMillis() / 60000 },
    ]
  }

  // Midnight-crossing case: 22:00–06:00
  // Split into two windows: 22:00–24:00 today and 00:00–06:00 tomorrow
  const utcStart = convertLocalToUtc(tzName, windowStart)
  const midnightLocal = refLocal.plus({ days: 1 })
  const utcMidnight = convertLocalToUtc(tzName, midnightLocal)
  const utcEnd = convertLocalToUtc(tzName, windowEnd.plus({ days: 1 }))

  return [
    { start: utcStart.toMillis() / 60000, end: utcMidnight.toMillis() / 60000 },
    { start: utcMidnight.toMillis() / 60000, end: utcEnd.toMillis() / 60000 },
  ]
}

/**
 * Check if two UTC intervals overlap.
 * @param a First interval
 * @param b Second interval
 * @returns true if intervals overlap (touching at boundaries does not count)
 */
export function intervalsOverlap(a: UtcInterval, b: UtcInterval): boolean {
  return a.start < b.end && a.end > b.start
}

/**
 * Compute the overlap between two UTC intervals.
 * @param a First interval
 * @param b Second interval
 * @returns Overlap interval, or null if no overlap
 */
export function computeOverlapInterval(
  a: UtcInterval,
  b: UtcInterval,
): UtcInterval | null {
  const start = Math.max(a.start, b.start)
  const end = Math.min(a.end, b.end)
  if (start < end) {
    return { start, end }
  }
  return null
}

/**
 * Compute total overlap duration in minutes between two UTC intervals.
 * @param a First interval
 * @param b Second interval
 * @returns Overlap duration in minutes (0 if no overlap)
 */
export function computeOverlapDuration(a: UtcInterval, b: UtcInterval): number {
  const overlap = computeOverlapInterval(a, b)
  return overlap ? overlap.end - overlap.start : 0
}

/**
 * Compute overlap between a local business-hours window (in one timezone)
 * and another local business-hours window (in another timezone) for a specific date.
 * @param tzA First timezone
 * @param startA Start time in "HH:mm" for first timezone
 * @param endA End time in "HH:mm" for first timezone
 * @param tzB Second timezone
 * @param startB Start time in "HH:mm" for second timezone
 * @param endB End time in "HH:mm" for second timezone
 * @param referenceDate Reference date (defaults to today)
 * @returns Overlap duration in minutes
 */
export function computePairwiseOverlapDuration(
  tzA: string,
  startA: string,
  endA: string,
  tzB: string,
  startB: string,
  endB: string,
  referenceDate: DateTime = DateTime.now(),
): number {
  const intervalsA = getBusinessHoursUtcInterval(
    tzA,
    startA,
    endA,
    referenceDate,
  )
  const intervalsB = getBusinessHoursUtcInterval(
    tzB,
    startB,
    endB,
    referenceDate,
  )

  let totalOverlap = 0
  for (const ia of intervalsA) {
    for (const ib of intervalsB) {
      totalOverlap += computeOverlapDuration(ia, ib)
    }
  }
  return totalOverlap
}

/**
 * Compute all-zone overlap window(s) across multiple timezone business-hours windows.
 * Returns intervals where all zones' business hours overlap.
 * @param zones Array of { tz, start, end } representing each zone's business hours
 * @param referenceDate Reference date (defaults to today)
 * @returns Array of UTC intervals where all zones overlap
 */
export function computeAllZoneOverlap(
  zones: Array<{ tz: string; start: string; end: string }>,
  referenceDate: DateTime = DateTime.now(),
): UtcInterval[] {
  if (zones.length === 0) return []
  if (zones.length === 1) {
    return getBusinessHoursUtcInterval(
      zones[0].tz,
      zones[0].start,
      zones[0].end,
      referenceDate,
    )
  }

  // Start with the first zone's intervals
  let overlap = getBusinessHoursUtcInterval(
    zones[0].tz,
    zones[0].start,
    zones[0].end,
    referenceDate,
  )

  // Intersect with each remaining zone
  for (let i = 1; i < zones.length; i++) {
    const next = getBusinessHoursUtcInterval(
      zones[i].tz,
      zones[i].start,
      zones[i].end,
      referenceDate,
    )
    const newOverlap: UtcInterval[] = []
    for (const io of overlap) {
      for (const inext of next) {
        const result = computeOverlapInterval(io, inext)
        if (result) {
          newOverlap.push(result)
        }
      }
    }
    overlap = newOverlap
    if (overlap.length === 0) break
  }

  return overlap
}

/**
 * Compute coverage gaps in a 24-hour UTC day.
 * Returns intervals where no zone from the provided list has business hours.
 * @param zones Array of { tz, start, end } representing each zone's business hours
 * @param referenceDate Reference date (defaults to today)
 * @returns Array of UTC intervals representing gaps in coverage
 */
export function computeCoverageGaps(
  zones: Array<{ tz: string; start: string; end: string }>,
  referenceDate: DateTime = DateTime.now(),
): UtcInterval[] {
  if (zones.length === 0) {
    // No zones means entire 24-hour day is a gap
    const start = referenceDate.setZone('UTC').startOf('day')
    const end = start.plus({ days: 1 })
    return [{ start: start.toMillis() / 60000, end: end.toMillis() / 60000 }]
  }

  // Collect all intervals from all zones
  const allIntervals: UtcInterval[] = []
  for (const zone of zones) {
    const intervals = getBusinessHoursUtcInterval(
      zone.tz,
      zone.start,
      zone.end,
      referenceDate,
    )
    allIntervals.push(...intervals)
  }

  // Merge overlapping intervals
  if (allIntervals.length === 0) {
    const start = referenceDate.setZone('UTC').startOf('day')
    const end = start.plus({ days: 1 })
    return [{ start: start.toMillis() / 60000, end: end.toMillis() / 60000 }]
  }

  const sorted = allIntervals.sort((a, b) => a.start - b.start)
  const merged: UtcInterval[] = []
  let current = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start <= current.end) {
      // Overlapping or adjacent; merge
      current.end = Math.max(current.end, sorted[i].end)
    } else {
      // Gap found
      merged.push(current)
      current = sorted[i]
    }
  }
  merged.push(current)

  // Now compute gaps
  const gaps: UtcInterval[] = []
  const dayStart = referenceDate.setZone('UTC').startOf('day')
  const dayEnd = dayStart.plus({ days: 1 })
  const dayStartMin = dayStart.toMillis() / 60000
  const dayEndMin = dayEnd.toMillis() / 60000

  if (merged[0].start > dayStartMin) {
    gaps.push({ start: dayStartMin, end: merged[0].start })
  }

  for (let i = 0; i < merged.length - 1; i++) {
    gaps.push({ start: merged[i].end, end: merged[i + 1].start })
  }

  if (merged[merged.length - 1].end < dayEndMin) {
    gaps.push({ start: merged[merged.length - 1].end, end: dayEndMin })
  }

  return gaps
}
