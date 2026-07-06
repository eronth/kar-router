import { describe, expect, it } from 'vitest'
import type { Course, Rider, Star } from '../types/types'
import {
  collectCourseEntries,
  comboKey,
  findOptimalRoutes,
  findTopRoutes,
  searchRoutes,
  splitComboKey,
  type SolverOptions,
  type TimesData,
} from './optimizer'

// Real names so the Course/Star/Rider string unions typecheck.
const C1: Course = 'Fantasy Meadows'
const C2: Course = 'Celestial Valley'
const C3: Course = 'Sky Sands'
const COURSES3 = [C1, C2, C3]

const WARP: Star = 'Warp Star'
const WINGED: Star = 'Winged Star'
const SHADOW: Star = 'Shadow Star'
const DRAGOON: Star = 'Dragoon' // legendary
const KIRBY: Rider = 'Kirby'
const DEDEDE: Rider = 'King Dedede'
const META: Rider = 'Meta Knight'

const OPEN: SolverOptions = {
  noDupeStars: false,
  noDupeRiders: false,
  allowLegendary: true,
}

function timesOf(
  data: Partial<Record<Course, [Star, Rider, number][]>>,
): TimesData {
  const times: TimesData = {}
  for (const [course, list] of Object.entries(data)) {
    const record: Record<string, number> = {}
    for (const [star, rider, ms] of list!) record[comboKey(star, rider)] = ms
    times[course as Course] = record
  }
  return times
}

describe('comboKey / splitComboKey', () => {
  it('round-trips a star/rider pair', () => {
    expect(splitComboKey(comboKey(WARP, KIRBY))).toEqual({
      star: WARP,
      rider: KIRBY,
    })
  })
})

describe('collectCourseEntries', () => {
  it('sorts each course entries fastest first and reports missing courses', () => {
    const times = timesOf({
      [C1]: [
        [WARP, KIRBY, 3000],
        [WINGED, DEDEDE, 2000],
      ],
    })
    const { perCourse, missing } = collectCourseEntries(
      [C1, C2],
      times,
      OPEN,
    )
    expect(missing).toEqual([C2])
    expect(perCourse).toHaveLength(1)
    expect(perCourse[0].entries.map((e) => e.ms)).toEqual([2000, 3000])
  })

  it('drops legendary stars when not allowed, marking the course missing if empty', () => {
    const times = timesOf({
      [C1]: [
        [DRAGOON, KIRBY, 1000],
        [WARP, KIRBY, 5000],
      ],
      [C2]: [[DRAGOON, DEDEDE, 1000]],
    })
    const noLegendary = { ...OPEN, allowLegendary: false }
    const { perCourse, missing } = collectCourseEntries(
      [C1, C2],
      times,
      noLegendary,
    )
    expect(missing).toEqual([C2])
    expect(perCourse[0].entries).toEqual([
      { star: WARP, rider: KIRBY, ms: 5000 },
    ])
  })
})

describe('findTopRoutes', () => {
  it('returns no routes while any course is missing times', () => {
    const times = timesOf({ [C1]: [[WARP, KIRBY, 1000]] })
    const result = findTopRoutes(COURSES3, times, OPEN)
    expect(result.routes).toEqual([])
    expect(result.missing).toEqual([C2, C3])
    expect(result.truncated).toBe(false)
  })

  it('picks the fastest combo per course when no dupe rules apply', () => {
    const times = timesOf({
      [C1]: [
        [WARP, KIRBY, 1000],
        [WINGED, DEDEDE, 1500],
      ],
      [C2]: [
        [WARP, KIRBY, 2000],
        [SHADOW, META, 2500],
      ],
    })
    const result = findTopRoutes([C1, C2], times, OPEN)
    expect(result.truncated).toBe(false)
    expect(result.routes[0].totalMs).toBe(3000)
    expect(result.routes[0].picks.map((p) => p.star)).toEqual([WARP, WARP])
  })

  it('respects noDupeStars, forcing a slower combo where needed', () => {
    const times = timesOf({
      [C1]: [
        [WARP, KIRBY, 1000],
        [WINGED, KIRBY, 1100],
      ],
      [C2]: [
        [WARP, KIRBY, 2000],
        [SHADOW, KIRBY, 2500],
      ],
    })
    const result = findTopRoutes([C1, C2], times, {
      ...OPEN,
      noDupeStars: true,
    })
    // Warp on both is banned; best is Winged(1100) + Warp(2000).
    expect(result.routes[0].totalMs).toBe(3100)
    const stars = result.routes[0].picks.map((p) => p.star)
    expect(new Set(stars).size).toBe(stars.length)
  })

  it('respects noDupeRiders', () => {
    const times = timesOf({
      [C1]: [
        [WARP, KIRBY, 1000],
        [WARP, DEDEDE, 1200],
      ],
      [C2]: [
        [WINGED, KIRBY, 2000],
        [WINGED, META, 2100],
      ],
    })
    const result = findTopRoutes([C1, C2], times, {
      ...OPEN,
      noDupeRiders: true,
    })
    expect(result.routes[0].totalMs).toBe(3100) // Kirby C1 + Meta C2
    const riders = result.routes[0].picks.map((p) => p.rider)
    expect(new Set(riders).size).toBe(riders.length)
  })

  it('returns zero routes when the dupe rules make every route invalid', () => {
    const times = timesOf({
      [C1]: [[WARP, KIRBY, 1000]],
      [C2]: [[WARP, DEDEDE, 2000]],
    })
    const result = findTopRoutes([C1, C2], times, {
      ...OPEN,
      noDupeStars: true,
    })
    expect(result.routes).toEqual([])
    expect(result.missing).toEqual([])
  })

  it('returns up to k routes sorted by total time', () => {
    const times = timesOf({
      [C1]: [
        [WARP, KIRBY, 1000],
        [WINGED, KIRBY, 1100],
        [SHADOW, KIRBY, 1200],
      ],
      [C2]: [
        [WARP, KIRBY, 2000],
        [WINGED, KIRBY, 2050],
      ],
    })
    const result = findTopRoutes([C1, C2], times, OPEN, 3)
    expect(result.routes.map((r) => r.totalMs)).toEqual([3000, 3050, 3100])
  })

  it('keeps picks in the caller course order regardless of search order', () => {
    // C3 has the most entries, so the search reorders it internally.
    const times = timesOf({
      [C1]: [
        [WARP, KIRBY, 1000],
        [WINGED, KIRBY, 1100],
      ],
      [C2]: [[WARP, KIRBY, 2000]],
      [C3]: [
        [WARP, KIRBY, 500],
        [WINGED, KIRBY, 600],
        [SHADOW, KIRBY, 700],
      ],
    })
    const result = findTopRoutes(COURSES3, times, OPEN)
    expect(result.routes[0].picks.map((p) => p.course)).toEqual(COURSES3)
  })

  it('flags truncation when the node budget is exhausted', () => {
    const times = timesOf({
      [C1]: [
        [WARP, KIRBY, 1000],
        [WINGED, KIRBY, 1100],
      ],
      [C2]: [
        [WARP, KIRBY, 2000],
        [WINGED, KIRBY, 2100],
      ],
    })
    const result = findTopRoutes([C1, C2], times, OPEN, 3, 2)
    expect(result.truncated).toBe(true)
  })

  it('findOptimalRoutes never truncates', () => {
    const times = timesOf({
      [C1]: [
        [WARP, KIRBY, 1000],
        [WINGED, KIRBY, 1100],
      ],
      [C2]: [
        [WARP, KIRBY, 2000],
        [WINGED, KIRBY, 2100],
      ],
    })
    const result = findOptimalRoutes([C1, C2], times, OPEN)
    expect(result.truncated).toBe(false)
    expect(result.routes[0].totalMs).toBe(3000)
  })

  it('reports search progress through onProgress', () => {
    // PROGRESS_INTERVAL is 1M nodes, far more than this tiny search visits,
    // so no calls are expected — just make sure the hook wiring is accepted.
    const times = timesOf({ [C1]: [[WARP, KIRBY, 1000]] })
    const calls: number[] = []
    findOptimalRoutes([C1], times, OPEN, 3, (n) => calls.push(n))
    expect(calls).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Brute-force cross-check: enumerate EVERY combination with no pruning and
// confirm the branch-and-bound search returns identical top-k totals under
// every option combination, across many randomized instances.
// ---------------------------------------------------------------------------

const ALL_STARS: Star[] = [WARP, WINGED, SHADOW, 'Wagon Star', 'Slick Star']
const ALL_RIDERS: Rider[] = [KIRBY, DEDEDE, META, 'Waddle Dee', 'Rick']
const BF_COURSES: Course[] = [C1, C2, C3, 'Frozen Hillside']

interface BfEntry {
  star: Star
  rider: Rider
  ms: number
}

function bruteForceTopK(
  perCourse: BfEntry[][],
  options: Pick<SolverOptions, 'noDupeStars' | 'noDupeRiders'>,
  k: number,
): number[] {
  const totals: number[] = []
  const walk = (
    i: number,
    total: number,
    stars: Star[],
    riders: Rider[],
  ) => {
    if (i === perCourse.length) {
      totals.push(total)
      return
    }
    for (const entry of perCourse[i]) {
      if (options.noDupeStars && stars.includes(entry.star)) continue
      if (options.noDupeRiders && riders.includes(entry.rider)) continue
      walk(
        i + 1,
        total + entry.ms,
        [...stars, entry.star],
        [...riders, entry.rider],
      )
    }
  }
  walk(0, 0, [], [])
  totals.sort((a, b) => a - b)
  return totals.slice(0, k)
}

/** Small deterministic PRNG (mulberry32) so failures are reproducible. */
function rng(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('searchRoutes matches brute force on randomized instances', () => {
  const optionCombos: Pick<SolverOptions, 'noDupeStars' | 'noDupeRiders'>[] = [
    { noDupeStars: false, noDupeRiders: false },
    { noDupeStars: true, noDupeRiders: false },
    { noDupeStars: false, noDupeRiders: true },
    { noDupeStars: true, noDupeRiders: true },
  ]

  for (const options of optionCombos) {
    it(`noDupeStars=${options.noDupeStars} noDupeRiders=${options.noDupeRiders}`, () => {
      const random = rng(
        (options.noDupeStars ? 1 : 0) + (options.noDupeRiders ? 2 : 0) + 42,
      )

      for (let trial = 0; trial < 50; trial++) {
        // 2-4 courses, each with 1-6 random distinct combos.
        const courseCount = 2 + Math.floor(random() * 3)
        const perCourse: { course: Course; entries: BfEntry[] }[] = []
        const bfPerCourse: BfEntry[][] = []

        for (let c = 0; c < courseCount; c++) {
          const combos = new Map<string, BfEntry>()
          const count = 1 + Math.floor(random() * 6)
          for (let e = 0; e < count; e++) {
            const star = ALL_STARS[Math.floor(random() * ALL_STARS.length)]
            const rider = ALL_RIDERS[Math.floor(random() * ALL_RIDERS.length)]
            combos.set(comboKey(star, rider), {
              star,
              rider,
              ms: 1000 + Math.floor(random() * 9000),
            })
          }
          const entries = [...combos.values()].sort((a, b) => a.ms - b.ms)
          perCourse.push({ course: BF_COURSES[c], entries })
          bfPerCourse.push(entries)
        }

        const expected = bruteForceTopK(bfPerCourse, options, 3)
        const { routes, truncated } = searchRoutes(
          perCourse,
          options,
          3,
          Infinity,
        )

        expect(truncated).toBe(false)
        expect(routes.map((r) => r.totalMs)).toEqual(expected)

        // Every returned route must itself satisfy the dupe rules.
        for (const route of routes) {
          const stars = route.picks.map((p) => p.star)
          const riders = route.picks.map((p) => p.rider)
          if (options.noDupeStars) {
            expect(new Set(stars).size).toBe(stars.length)
          }
          if (options.noDupeRiders) {
            expect(new Set(riders).size).toBe(riders.length)
          }
          expect(route.totalMs).toBe(
            route.picks.reduce((sum, p) => sum + p.ms, 0),
          )
        }
      }
    })
  }
})
