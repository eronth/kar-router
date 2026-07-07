import { useEffect, useRef, useState } from 'react'
import './TimeGrid.css'
import { RIDERS, RIDER_ICONS, STAR_ICONS, STAR_GROUPS } from '../../data/gameData'
import { comboKey, type CourseTimes } from '../../utils/optimizer'
import { formatMs, parseTimeInput } from '../../utils/time'
import type { Course, Rider, Star } from '../../types/types'
import TimeGridTitleRegion from './TimeGridTitleRegion/TimeGridTitleRegion'

interface TimeCellProps {
  value: number | undefined
  className: string | undefined
  disabled: boolean
  label: string
  onCommit: (ms: number | null) => void
  onFocus: () => void
  inputRef: (el: HTMLInputElement | null) => void
}

function TimeCell({
  value,
  className,
  disabled,
  label,
  onCommit,
  onFocus,
  inputRef,
}: TimeCellProps) {
  return (
    <input
      ref={inputRef}
      // Remount on committed value change so defaultValue re-renders formatted.
      key={value ?? 'empty'}
      type="text"
      inputMode="decimal"
      className={className}
      disabled={disabled}
      defaultValue={value !== undefined ? formatMs(value) : ''}
      title={label}
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
      onFocus={onFocus}
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
  onClearCourse: (course: Course) => void
  onClearAll: () => void
}

interface ViewOptions {
  shadeSlow: boolean
  flagWorst: boolean
}

const VIEW_KEY = 'kar-router:view'
const DEFAULT_VIEW: ViewOptions = { shadeSlow: false, flagWorst: false }

const VIEW_TOGGLES: { key: keyof ViewOptions; label: string; hint: string }[] = [
  {
    key: 'shadeSlow',
    label: 'Shade slow',
    hint: 'Shade times slower than this course’s average',
  },
  {
    key: 'flagWorst',
    label: 'Flag worst',
    hint: 'Highlight your slowest time on this course',
  },
]

export default function TimeGrid({
  course,
  record,
  allowLegendary,
  onSetTime,
  onClearCourse,
  onClearAll,
}: Props) {
  const [view, setView] = useState<ViewOptions>(() => {
    try {
      const raw = localStorage.getItem(VIEW_KEY)
      return raw ? { ...DEFAULT_VIEW, ...JSON.parse(raw) } : DEFAULT_VIEW
    } catch {
      return DEFAULT_VIEW
    }
  })

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, JSON.stringify(view))
  }, [view])

  // Best per star group, plus best/worst/average over the groups the current
  // ruleset allows — excluded legendary times never set the course-wide marks.
  const groupBests = new Map<string, number>()
  const rulesetTimes: number[] = []
  for (const group of STAR_GROUPS) {
    const values: number[] = []
    for (const star of group.stars) {
      for (const rider of RIDERS) {
        const value = record[comboKey(star, rider)]
        if (value !== undefined) values.push(value)
      }
    }
    if (values.length > 0) groupBests.set(group.label, Math.min(...values))
    if (allowLegendary || !group.legendary) rulesetTimes.push(...values)
  }
  const bestMs = rulesetTimes.length > 0 ? Math.min(...rulesetTimes) : null
  const worstMs = rulesetTimes.length > 0 ? Math.max(...rulesetTimes) : null
  const avgMs =
    rulesetTimes.length > 0
      ? rulesetTimes.reduce((sum, ms) => sum + ms, 0) / rulesetTimes.length
      : null

  function cellClass(
    value: number | undefined,
    groupBest: number | undefined,
    groupOff: boolean,
  ): string | undefined {
    if (value === undefined) return undefined
    const classes: string[] = []
    const isGroupBest = value === groupBest
    if (isGroupBest) classes.push('best')
    if (!groupOff) {
      if (value === bestMs) classes.push('best-of-best')
      else if (!isGroupBest) {
        // Group bests keep their "good" look even when they lag the course.
        if (view.flagWorst && value === worstMs) classes.push('worst')
        else if (view.shadeSlow && avgMs !== null && value > avgMs) classes.push('below-avg')
      }
    }
    return classes.length > 0 ? classes.join(' ') : undefined
  }

  const [selStar, setSelStar] = useState<Star | null>(null)
  const [selRider, setSelRider] = useState<Rider | null>(null)
  const inputRefs = useRef(new Map<string, HTMLInputElement>())

  function toggleStar(star: Star) {
    const next = selStar === star ? null : star
    setSelStar(next)
    if (next !== null && selRider !== null) {
      inputRefs.current.get(comboKey(next, selRider))?.focus()
    }
  }

  function toggleRider(rider: Rider) {
    const next = selRider === rider ? null : rider
    setSelRider(next)
    if (next !== null && selStar !== null) {
      inputRefs.current.get(comboKey(selStar, next))?.focus()
    }
  }

  return (
    <div className="time-grid">

      <TimeGridTitleRegion
        course={course}
        onClearCourse={onClearCourse}
        onClearAll={onClearAll}
      >
        {VIEW_TOGGLES.map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            className={`view-toggle${view[toggle.key] ? ' on' : ''}`}
            title={toggle.hint}
            aria-pressed={view[toggle.key]}
            onClick={() =>
              setView((prev) => ({ ...prev, [toggle.key]: !prev[toggle.key] }))
            }
          >
            {toggle.label}
          </button>
        ))}
      </TimeGridTitleRegion>

      <div className="grid-scroll">
        <table>
          <thead>
            <tr>
              <th className="riders-row-label">
                <span className="riders-label">Riders</span>
                <span className="stars-label">Stars</span>
              </th>
              {RIDERS.map((rider) => (
                <th
                  key={rider}
                  className={selRider === rider ? 'rider-head sel' : 'rider-head'}
                  title={rider}
                  onClick={() => toggleRider(rider)}
                >
                  <img src={RIDER_ICONS[rider]} alt={rider} />
                </th>
              ))}
            </tr>
          </thead>
          {STAR_GROUPS.map((group) => {
            const groupOff = group.legendary && !allowLegendary
            const groupBest = groupBests.get(group.label)
            return (
              <tbody key={group.label} className={groupOff ? 'off' : undefined}>
                <tr className="group-row">
                  <th colSpan={RIDERS.length + 1}>
                    <span>
                      {group.label}
                      {groupOff && ' (excluded by ruleset)'}
                    </span>
                  </th>
                </tr>
                {group.stars.map((star) => (
                  <tr key={star}>
                    <th
                      className={selStar === star ? 'star-head sel' : 'star-head'}
                      title={star}
                      onClick={() => toggleStar(star)}
                    >
                      <div>
                        <img src={STAR_ICONS[star]} alt="" />
                        <span>{star}</span>
                      </div>
                    </th>
                    {RIDERS.map((rider) => {
                      const value = record[comboKey(star, rider)]
                      const inSel = selStar === star || selRider === rider
                      return (
                        <td key={rider} className={inSel ? 'sel' : undefined}>
                          <TimeCell
                            value={value}
                            className={cellClass(value, groupBest, groupOff)}
                            disabled={groupOff}
                            label={`${star} + ${rider}`}
                            onCommit={(ms) => onSetTime(course, star, rider, ms)}
                            onFocus={() => {
                              setSelStar(star)
                              setSelRider(rider)
                            }}
                            inputRef={(el) => {
                              const key = comboKey(star, rider)
                              if (el) inputRefs.current.set(key, el)
                              else inputRefs.current.delete(key)
                            }}
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
