import { useState } from 'react'
import type { SolverResult } from '../../utils/optimizer'
import RouteCard, { PICK_STYLES, type PickStyle } from '../RouteCard/RouteCard'
import './RouteResults.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWarning } from '@fortawesome/free-solid-svg-icons'

const TABS = [
  { id: 'all', label: 'All Courses' },
  { id: 'old', label: 'Classic Courses' },
  { id: 'new', label: 'New Courses' },
] as const

type TabId = (typeof TABS)[number]['id']

interface Props {
  all: SolverResult
  oldCourses: SolverResult
  newCourses: SolverResult
  /** Kicks off the exhaustive guaranteed-optimal solve. */
  onFindOptimal: () => void
}

export default function RouteResults({
  all,
  oldCourses,
  newCourses,
  onFindOptimal,
}: Props) {
  const [tab, setTab] = useState<TabId>('all')
  const [pickStyle, setPickStyle] = useState<PickStyle>('time-icons')
  const result = tab === 'all' ? all : tab === 'old' ? oldCourses : newCourses

  return (
    <section className="route-results">
      <div className="results-head">
        <h2>Best Routes</h2>
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'active' : undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pick-style-toggle">
        <span>Pill style</span>
        <div className="tabs">
          {PICK_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.title}
              className={pickStyle === s.id ? 'active' : undefined}
              onClick={() => setPickStyle(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {result.missing.length > 0 ? (
        <p className="status">
          Enter at least one time for every course to unlock route
          calculation. Missing {result.missing.length}:{' '}
          <span className="missing">{result.missing.join(', ')}</span>
        </p>
      ) : result.routes.length === 0 ? (
        <p className="status">
          No valid route exists with the current no-dupe rules — enter times
          for more star/rider combos to open up options.
        </p>
      ) : (
        <>
          {result.truncated && (
            <div className="status truncated-notice">
              <p>
                <span className="warning"><FontAwesomeIcon icon={faWarning} /> Warning: </span>
                Search space was huge, so these are the best routes found
                within the quick-check budget — they may not be perfectly
                optimal.
              </p>
              <button
                type="button"
                className="find-optimal"
                onClick={onFindOptimal}
              >
                Find perfectly optimal routes (slow)
              </button>
            </div>
          )}
          <div className="route-cards">
            {result.routes.map((route, index) => (
              <RouteCard
                key={index}
                route={route}
                rank={index + 1}
                pickStyle={pickStyle}
                prevRoute={index > 0 ? result.routes[index - 1] : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
