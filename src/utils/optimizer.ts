import type { Course, Rider, Star } from '../types/types'
import { LEGENDARY_STARS } from '../data/gameData'

/** `${star}|${rider}` */
export type ComboKey = string

export type CourseTimes = Record<ComboKey, number>
export type TimesData = Partial<Record<Course, CourseTimes>>

export function comboKey(star: Star, rider: Rider): ComboKey {
  return `${star}|${rider}`
}

export function splitComboKey(key: ComboKey): { star: Star; rider: Rider } {
  const [star, rider] = key.split('|')
  return { star: star as Star, rider: rider as Rider }
}

export interface RoutePick {
  course: Course
  star: Star
  rider: Rider
  ms: number
}

export interface Route {
  totalMs: number
  picks: RoutePick[]
}

export interface SolverOptions {
  noDupeStars: boolean
  noDupeRiders: boolean
  allowLegendary: boolean
}

export interface SolverResult {
  routes: Route[]
  /** Courses with no usable times entered; routes stay empty until this is empty. */
  missing: Course[]
  /** True if the search hit its node budget and results may be suboptimal. */
  truncated: boolean
}

interface Entry {
  star: Star
  rider: Rider
  ms: number
}

const LEGENDARY_SET: ReadonlySet<string> = new Set(LEGENDARY_STARS)

// Node budget keeps worst-case dense grids responsive;
// realistic sparse data
// never gets close to it.
const NODE_LIMIT = 500_000

/**
 * Finds the k best "all courses" routes: one star/rider combo per course,
 * minimizing total time under the given no-dupe rules. Depth-first
 * branch-and-bound over the (sparse) entered times, most-constrained
 * course first, pruned against the current k-th best total.
 */
export function findTopRoutes(
  courses: Course[],
  times: TimesData,
  options: SolverOptions,
  k = 3,
): SolverResult {
  const perCourse: { course: Course; entries: Entry[] }[] = []
  const missing: Course[] = []

  for (const course of courses) {
    const record = times[course]
    const entries: Entry[] = []
    if (record) {
      for (const [key, ms] of Object.entries(record)) {
        const { star, rider } = splitComboKey(key)
        if (!options.allowLegendary && LEGENDARY_SET.has(star)) continue
        entries.push({ star, rider, ms })
      }
    }
    if (entries.length === 0) {
      missing.push(course)
    } else {
      entries.sort((a, b) => a.ms - b.ms)
      perCourse.push({ course, entries })
    }
  }

  if (missing.length > 0) return { routes: [], missing, truncated: false }

  // Courses with the fewest options first so constraints prune early.
  perCourse.sort((a, b) => a.entries.length - b.entries.length)

  const n = perCourse.length
  // Lower bound on the remaining total from course i onward, ignoring dupes.
  const suffixMin = new Array<number>(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    suffixMin[i] = suffixMin[i + 1] + perCourse[i].entries[0].ms
  }

  const best: Route[] = []
  const usedStars = new Set<Star>()
  const usedRiders = new Set<Rider>()
  const picks: RoutePick[] = []
  let nodes = 0
  let truncated = false

  const worstKept = () =>
    best.length < k ? Infinity : best[best.length - 1].totalMs

  const dfs = (i: number, totalMs: number) => {
    if (truncated || ++nodes > NODE_LIMIT) {
      truncated = true
      return
    }
    if (i === n) {
      best.push({ totalMs, picks: picks.slice() })
      best.sort((a, b) => a.totalMs - b.totalMs)
      if (best.length > k) best.pop()
      return
    }
    const { course, entries } = perCourse[i]
    for (const entry of entries) {
      // Entries are sorted, so once one busts the bound the rest do too.
      if (totalMs + entry.ms + suffixMin[i + 1] >= worstKept()) break
      if (options.noDupeStars && usedStars.has(entry.star)) continue
      if (options.noDupeRiders && usedRiders.has(entry.rider)) continue

      if (options.noDupeStars) usedStars.add(entry.star)
      if (options.noDupeRiders) usedRiders.add(entry.rider)
      picks.push({ course, star: entry.star, rider: entry.rider, ms: entry.ms })

      dfs(i + 1, totalMs + entry.ms)

      picks.pop()
      if (options.noDupeStars) usedStars.delete(entry.star)
      if (options.noDupeRiders) usedRiders.delete(entry.rider)
      if (truncated) return
    }
  }

  dfs(0, 0)

  const courseOrder = new Map(courses.map((course, i) => [course, i]))
  for (const route of best) {
    route.picks.sort(
      (a, b) => courseOrder.get(a.course)! - courseOrder.get(b.course)!,
    )
  }

  console.log('best', best);

  return { routes: best, missing, truncated }
}
