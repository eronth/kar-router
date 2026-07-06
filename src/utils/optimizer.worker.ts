import type { Course } from '../types/types'
import {
  findOptimalRoutes,
  type SolverOptions,
  type SolverResult,
  type TimesData,
} from './optimizer'

/**
 * Runs the exhaustive (no node budget) solver off the main thread. The page
 * stays responsive while it grinds, and cancelling is just terminating the
 * worker — no cooperative checks needed.
 */

export interface ExactSolveRequest {
  times: TimesData
  options: SolverOptions
  /** Course groups to solve, keyed by tab id. */
  groups: Record<string, Course[]>
  k: number
}

export type ExactSolveMessage =
  | { type: 'progress'; nodes: number }
  | { type: 'done'; results: Record<string, SolverResult> }

self.onmessage = (event: MessageEvent<ExactSolveRequest>) => {
  const { times, options, groups, k } = event.data

  let nodesBefore = 0
  const results: Record<string, SolverResult> = {}
  for (const [name, courses] of Object.entries(groups)) {
    const baseline = nodesBefore
    results[name] = findOptimalRoutes(courses, times, options, k, (nodes) => {
      const message: ExactSolveMessage = {
        type: 'progress',
        nodes: baseline + nodes,
      }
      self.postMessage(message)
      nodesBefore = baseline + nodes
    })
  }

  const message: ExactSolveMessage = { type: 'done', results }
  self.postMessage(message)
}
