import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask } from '@fortawesome/free-solid-svg-icons'
import { COURSES, STARS, RIDERS } from '../../data/gameData'
import {
  comboKey,
  type CourseTimes,
  type TimesData,
} from '../../utils/optimizer'
import './DevFill.css'

interface Props {
  onFill: (times: TimesData) => void
}

const MIN_MS = 2 * 60_000
const MAX_MS = 6 * 60_000

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

function randomTimes(): TimesData {
  const times: TimesData = {}
  for (const course of COURSES) {
    const record: CourseTimes = {}
    const combos = 3 + Math.floor(Math.random() * 6)
    for (let i = 0; i < combos; i++) {
      record[comboKey(pick(STARS), pick(RIDERS))] = Math.round(
        MIN_MS + Math.random() * (MAX_MS - MIN_MS),
      )
    }
    times[course] = record
  }
  return times
}

/** Dev-only helper; render gated behind import.meta.env.DEV. */
export default function DevFill({ onFill }: Props) {
  return (
    <button
      type="button"
      className="dev-fill-button"
      title="Dev only: add random 2–6 minute times to every course"
      onClick={() => onFill(randomTimes())}
    >
      <FontAwesomeIcon icon={faFlask} /> Fill test data
    </button>
  )
}
