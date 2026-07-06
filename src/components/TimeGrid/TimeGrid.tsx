import './TimeGrid.css'
import { RIDERS, RIDER_ICONS, STAR_ICONS, STAR_GROUPS } from '../../data/gameData'
import { comboKey, type CourseTimes } from '../../utils/optimizer'
import { formatMs, parseTimeInput } from '../../utils/time'
import type { Course, Rider, Star } from '../../types/types'

interface TimeCellProps {
  value: number | undefined
  isBest: boolean
  disabled: boolean
  label: string
  onCommit: (ms: number | null) => void
}

function TimeCell({ value, isBest, disabled, label, onCommit }: TimeCellProps) {
  return (
    <input
      // Remount on committed value change so defaultValue re-renders formatted.
      key={value ?? 'empty'}
      type="text"
      inputMode="decimal"
      className={isBest ? 'best' : undefined}
      disabled={disabled}
      defaultValue={value !== undefined ? formatMs(value) : ''}
      title={label}
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
      onBlur={(event) => {
        const raw = event.currentTarget.value.trim()
        if (raw === '') {
          if (value !== undefined) onCommit(null)
          return
        }
        const ms = parseTimeInput(raw)
        if (ms === null || ms === value) {
          // Invalid input reverts; unchanged input re-normalizes.
          event.currentTarget.value = value !== undefined ? formatMs(value) : ''
          return
        }
        onCommit(ms)
      }}
    />
  )
}

interface Props {
  course: Course
  record: CourseTimes
  allowLegendary: boolean
  onSetTime: (course: Course, star: Star, rider: Rider, ms: number | null) => void
}

export default function TimeGrid({ course, record, allowLegendary, onSetTime }: Props) {
  const entries = Object.values(record)
  const bestMs = entries.length > 0 ? Math.min(...entries) : null

  return (
    <div className="time-grid">
      <div className="grid-title">
        <h2>{course}</h2>
        <span className="hint">
          Enter times as m:ss.xx or seconds — Enter or click away to save,
          clear to delete
        </span>
      </div>
      <div className="grid-scroll">
        <table>
          <thead>
            <tr>
              <th className="corner" aria-hidden="true" />
              {RIDERS.map((rider) => (
                <th key={rider} className="rider-head" title={rider}>
                  <img src={RIDER_ICONS[rider]} alt={rider} />
                </th>
              ))}
            </tr>
          </thead>
          {STAR_GROUPS.map((group) => {
            const groupOff = group.legendary && !allowLegendary
            return (
              <tbody key={group.label} className={groupOff ? 'off' : undefined}>
                <tr className="group-row">
                  <th colSpan={RIDERS.length + 1}>
                    {group.label}
                    {groupOff && ' (excluded by ruleset)'}
                  </th>
                </tr>
                {group.stars.map((star) => (
                  <tr key={star}>
                    <th className="star-head" title={star}>
                      <div>
                        <img src={STAR_ICONS[star]} alt="" />
                        <span>{star}</span>
                      </div>
                    </th>
                    {RIDERS.map((rider) => {
                      const value = record[comboKey(star, rider)]
                      return (
                        <td key={rider}>
                          <TimeCell
                            value={value}
                            isBest={value !== undefined && value === bestMs}
                            disabled={groupOff}
                            label={`${star} + ${rider}`}
                            onCommit={(ms) => onSetTime(course, star, rider, ms)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            )
          })}
        </table>
      </div>
    </div>
  )
}
