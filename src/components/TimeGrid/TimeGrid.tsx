import { useRef, useState } from 'react'
import './TimeGrid.css'
import { RIDERS, RIDER_ICONS, STAR_ICONS, STAR_GROUPS } from '../../data/gameData'
import { comboKey, type CourseTimes } from '../../utils/optimizer'
import { formatMs, parseTimeInput } from '../../utils/time'
import type { Course, Rider, Star } from '../../types/types'
import TimeGridTitleRegion from './TimeGridTitleRegion/TimeGridTitleRegion'

interface TimeCellProps {
  value: number | undefined
  isBest: boolean
  disabled: boolean
  label: string
  onCommit: (ms: number | null) => void
  onFocus: () => void
  inputRef: (el: HTMLInputElement | null) => void
}

function TimeCell({
  value,
  isBest,
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
      className={isBest ? 'best' : undefined}
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
}

export default function TimeGrid({ course, record, allowLegendary, onSetTime }: Props) {
  const entries = Object.values(record)
  const bestMs = entries.length > 0 ? Math.min(...entries) : null
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

      <TimeGridTitleRegion course={course} />

      <div className="grid-scroll">
        <table>
          <thead>
            <tr>
              <th className="riders-row-label">Riders</th>
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
                            isBest={value !== undefined && value === bestMs}
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
