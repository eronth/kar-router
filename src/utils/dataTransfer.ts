import { COURSES, STARS, RIDERS } from '../data/gameData'
import {
  splitComboKey,
  type CourseTimes,
  type TimesData,
} from './optimizer'
import type { Settings } from '../components/SettingsBar/SettingsBar'
import type { Course } from '../types/types'

export interface ImportSummary {
  times: TimesData
  settings: Settings | null
  entryCount: number
  courseCount: number
  skippedCount: number
}

// Keys every export has carried. `showCityTrialStars` came later, so exports
// written before it are still valid — they just fall back to its default.
const SETTINGS_KEYS = [
  'noDupeRiders',
  'noDupeStars',
  'allowLegendary',
] as const

export function downloadExport(times: TimesData, settings: Settings) {
  const payload = {
    app: 'kar-router',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    times,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `kar-router-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * Validate an exported file, keeping only entries whose course, star, rider
 * and time survive scrutiny. Throws with a user-facing message when the file
 * is not usable at all.
 */
export function parseImport(text: string): ImportSummary {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('That file does not look like a KAR Router export.')
  }
  const root = raw as Record<string, unknown>
  const rawTimes = root.times
  if (typeof rawTimes !== 'object' || rawTimes === null) {
    throw new Error(
      'No "times" data found in that file — is it a KAR Router export?',
    )
  }

  const courseSet = new Set<string>(COURSES)
  const starSet = new Set<string>(STARS)
  const riderSet = new Set<string>(RIDERS)

  const times: TimesData = {}
  let entryCount = 0
  let skippedCount = 0
  for (const [course, record] of Object.entries(rawTimes)) {
    if (!courseSet.has(course) || typeof record !== 'object' || record === null) {
      skippedCount++
      continue
    }
    const clean: CourseTimes = {}
    for (const [key, ms] of Object.entries(record)) {
      const { star, rider } = splitComboKey(key)
      if (
        !starSet.has(star) ||
        !riderSet.has(rider) ||
        typeof ms !== 'number' ||
        !Number.isFinite(ms) ||
        ms <= 0
      ) {
        skippedCount++
        continue
      }
      clean[key] = ms
      entryCount++
    }
    if (Object.keys(clean).length > 0) {
      times[course as Course] = clean
    }
  }
  // An empty export from this app is fine; an unrelated JSON file is not.
  if (entryCount === 0 && root.app !== 'kar-router') {
    throw new Error('No valid time entries found in that file.')
  }

  let settings: Settings | null = null
  const rawSettings = root.settings
  if (typeof rawSettings === 'object' && rawSettings !== null) {
    const candidate = rawSettings as Record<string, unknown>
    if (SETTINGS_KEYS.every((key) => typeof candidate[key] === 'boolean')) {
      settings = {
        noDupeRiders: candidate.noDupeRiders as boolean,
        noDupeStars: candidate.noDupeStars as boolean,
        allowLegendary: candidate.allowLegendary as boolean,
        showCityTrialStars: candidate.showCityTrialStars === true,
      }
    }
  }

  return {
    times,
    settings,
    entryCount,
    courseCount: Object.keys(times).length,
    skippedCount,
  }
}
