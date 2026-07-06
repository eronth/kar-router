import { useCallback, useEffect, useRef, useState } from 'react'
import type { Course } from '../types/types'
import type { SolverOptions, SolverResult, TimesData } from '../utils/optimizer'
import type {
  ExactSolveMessage,
  ExactSolveRequest,
} from '../utils/optimizer.worker'

export type ExactResults = Record<string, SolverResult>

/**
 * Manages a one-shot exhaustive solve in a Web Worker: start it, watch its
 * node-count progress, cancel it (worker termination — takes effect
 * immediately, no matter how deep the search is), and hold the results.
 * Results are invalidated whenever the inputs they were computed from change.
 */
export function useExactRoutes(
  times: TimesData,
  options: SolverOptions,
  groups: Record<string, Course[]>,
) {
  const [results, setResults] = useState<ExactResults | null>(null)
  const [solving, setSolving] = useState(false)
  const [nodesSearched, setNodesSearched] = useState(0)
  const workerRef = useRef<Worker | null>(null)

  const stopWorker = () => {
    workerRef.current?.terminate()
    workerRef.current = null
  }

  // Edits or setting changes make previous exact results stale. The page is
  // locked while solving, so inputs can't change mid-solve.
  useEffect(() => {
    setResults(null)
  }, [times, options])

  useEffect(() => stopWorker, [])

  const start = useCallback(() => {
    stopWorker()
    setSolving(true)
    setNodesSearched(0)

    const worker = new Worker(
      new URL('../utils/optimizer.worker.ts', import.meta.url),
      { type: 'module' },
    )
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<ExactSolveMessage>) => {
      if (event.data.type === 'progress') {
        setNodesSearched(event.data.nodes)
      } else {
        setResults(event.data.results)
        setSolving(false)
        stopWorker()
      }
    }

    const request: ExactSolveRequest = { times, options, groups, k: 3 }
    worker.postMessage(request)
  }, [times, options, groups])

  const cancel = useCallback(() => {
    stopWorker()
    setSolving(false)
  }, [])

  return { results, solving, nodesSearched, start, cancel }
}
