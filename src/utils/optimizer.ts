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
  /**
   * True if the search hit its node budget before exploring everything, so
   * routes may be suboptimal. False means the search completed and the
   * routes are provably the best possible.
   */
  truncated: boolean
}

export interface Entry {
  star: Star
  rider: Rider
  ms: number
}

export interface CourseEntries {
  course: Course
  entries: Entry[]
}

const LEGENDARY_SET: ReadonlySet<string> = new Set(LEGENDARY_STARS)

// Node budget for the automatic quick check. Keeps worst-case dense grids
// responsive; realistic sparse data never gets close to it.
export const QUICK_NODE_LIMIT = 5_000_000

/**
 * Step 1 — gather the usable (star, rider, time) options for each course,
 * sorted fastest first, dropping legendary stars when they're not allowed.
 * Courses that end up with no options are reported in `missing`.
 */
export function collectCourseEntries(
  courses: Course[],
  times: TimesData,
  options: SolverOptions,
): { perCourse: CourseEntries[]; missing: Course[] } {
  const perCourse: CourseEntries[] = []
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

  return { perCourse, missing }
}

/** Courses with the fewest options first so constraints prune early. */
function orderMostConstrainedFirst(perCourse: CourseEntries[]): CourseEntries[] {
  return [...perCourse].sort((a, b) => a.entries.length - b.entries.length)
}

/**
 * suffixMin[i] = the cheapest conceivable total for courses i..end, taking
 * each course's fastest entry and ignoring dupe rules. An admissible lower
 * bound: if a partial route plus suffixMin already loses to the k-th best
 * kept so far, nothing below it can win.
 */
function buildSuffixMins(ordered: CourseEntries[]): number[] {
  const suffixMin = new Array<number>(ordered.length + 1).fill(0)
  for (let i = ordered.length - 1; i >= 0; i--) {
    suffixMin[i] = suffixMin[i + 1] + ordered[i].entries[0].ms
  }
  return suffixMin
}

/** Keeps the k lowest-total routes seen so far, sorted best first. */
class TopRoutes {
  readonly routes: Route[] = []
  private readonly k: number

  constructor(k: number) {
    this.k = k
  }

  /** Totals at or above this can't make the list, so the search prunes them. */
  get cutoff(): number {
    return this.routes.length < this.k
      ? Infinity
      : this.routes[this.routes.length - 1].totalMs
  }

  add(route: Route): void {
    this.routes.push(route)
    this.routes.sort((a, b) => a.totalMs - b.totalMs)
    if (this.routes.length > this.k) this.routes.pop()
  }
}

/**
 * Step 2 — depth-first branch-and-bound over the per-course options.
 *
 * Walks courses most-constrained first, trying each course's entries fastest
 * first. A branch is cut when its total plus the suffixMin lower bound can't
 * beat the current k-th best, or when it reuses a star/rider a no-dupe rule
 * forbids. With `nodeLimit: Infinity` this explores the entire (pruned)
 * space, so the returned routes are exactly the k best.
 *
 * `onProgress`, if given, is called every `PROGRESS_INTERVAL` nodes with the
 * running node count — used by the worker to report liveness.
 */
export function searchRoutes(
  perCourse: CourseEntries[],
  options: Pick<SolverOptions, 'noDupeStars' | 'noDupeRiders'>,
  k: number,
  nodeLimit: number,
  onProgress?: (nodes: number) => void,
): { routes: Route[]; truncated: boolean } {
  const ordered = orderMostConstrainedFirst(perCourse)
  const suffixMin = buildSuffixMins(ordered)
  const n = ordered.length

  const best = new TopRoutes(k)
  const usedStars = new Set<Star>()
  const usedRiders = new Set<Rider>()
  const picks: RoutePick[] = []
  let nodes = 0
  let truncated = false

  const dfs = (i: number, totalMs: number) => {
    if (truncated || ++nodes > nodeLimit) {
      truncated = true
      return
    }
    if (onProgress && nodes % PROGRESS_INTERVAL === 0) onProgress(nodes)

    if (i === n) {
      best.add({ totalMs, picks: picks.slice() })
      return
    }

    const { course, entries } = ordered[i]
    for (const entry of entries) {
      // Entries are sorted, so once one busts the bound the rest do too.
      if (totalMs + entry.ms + suffixMin[i + 1] >= best.cutoff) break
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
  return { routes: best.routes, truncated }
}

const PROGRESS_INTERVAL = 1_000_000

/** Step 3 — put each route's picks back in display (course list) order. */
function sortPicksIntoCourseOrder(routes: Route[], courses: Course[]): void {
  const courseOrder = new Map(courses.map((course, i) => [course, i]))
  for (const route of routes) {
    route.picks.sort(
      (a, b) => courseOrder.get(a.course)! - courseOrder.get(b.course)!,
    )
  }
}

/**
 * Finds the k best "all courses" routes: one star/rider combo per course,
 * minimizing total time under the given no-dupe rules.
 *
 * With the default node limit this is the fast automatic check: usually
 * exact, but flagged `truncated` when the search space is too big to finish
 * within budget. Pass `nodeLimit: Infinity` (or use `findOptimalRoutes`) for
 * a guaranteed-optimal exhaustive search.
 */
export function findTopRoutes(
  courses: Course[],
  times: TimesData,
  options: SolverOptions,
  k = 3,
  nodeLimit = QUICK_NODE_LIMIT,
  onProgress?: (nodes: number) => void,
): SolverResult {
  console.log('start findTopRoutes', performance.now())
  const { perCourse, missing } = collectCourseEntries(courses, times, options)
  if (missing.length > 0) return { routes: [], missing, truncated: false }

  const { routes, truncated } = searchRoutes(
    perCourse,
    options,
    k,
    nodeLimit,
    onProgress,
  )
  sortPicksIntoCourseOrder(routes, courses)

  console.log('end findTopRoutes', performance.now())
  return { routes, missing, truncated }
}

/**
 * Exhaustive version of `findTopRoutes`: no node budget, so the result is
 * always provably optimal. Can take a very long time on dense grids — run
 * it off the main thread (see optimizer.worker.ts).
 */
export function findOptimalRoutes(
  courses: Course[],
  times: TimesData,
  options: SolverOptions,
  k = 3,
  onProgress?: (nodes: number) => void,
): SolverResult {
  console.log('start findOptimalRoutes', performance.now());
  const ret = findTopRoutes(courses, times, options, k, Infinity, onProgress);
  console.log('end findOptimalRoutes', performance.now());
  return ret;
}
