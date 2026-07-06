import './SolverOverlay.css'

function formatNodes(nodes: number): string {
  if (nodes >= 1_000_000_000) return `${(nodes / 1_000_000_000).toFixed(1)}B`
  if (nodes >= 1_000_000) return `${(nodes / 1_000_000).toFixed(0)}M`
  return nodes.toLocaleString()
}

/** Full-page blocking overlay shown while the exhaustive solve runs. */
export default function SolverOverlay({
  nodesSearched,
  onCancel,
}: {
  nodesSearched: number
  onCancel: () => void
}) {
  return (
    <div className="solver-overlay" role="dialog" aria-modal="true">
      <div className="solver-panel">
        <div className="solver-spinner" aria-hidden="true" />
        <h2>Searching every route…</h2>
        <p>
          Checking all combinations to guarantee the optimal routes. With lots
          of times entered this can take a while.
        </p>
        <p className="solver-progress">
          {nodesSearched > 0
            ? `${formatNodes(nodesSearched)} combinations checked`
            : 'Starting search…'}
        </p>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
