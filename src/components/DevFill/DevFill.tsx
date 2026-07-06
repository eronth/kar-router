import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faVials } from '@fortawesome/free-solid-svg-icons'
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

function randomMs(): number {
  return Math.round(MIN_MS + Math.random() * (MAX_MS - MIN_MS))
}

function randomTimes(): TimesData {
  const times: TimesData = {}
  for (const course of COURSES) {
    const record: CourseTimes = {}
    const combos = 3 + Math.floor(Math.random() * 6)
    for (let i = 0; i < combos; i++) {
      record[comboKey(pick(STARS), pick(RIDERS))] = randomMs()
    }
    times[course] = record
  }
  return times
}

function fullTimes(): TimesData {
  const times: TimesData = {}
  for (const course of COURSES) {
    const record: CourseTimes = {}
    for (const star of STARS) {
      for (const rider of RIDERS) {
        record[comboKey(star, rider)] = randomMs()
      }
    }
    times[course] = record
  }
  return times
}

/** Dev-only helper; render gated behind import.meta.env.DEV. */
export default function DevFill({ onFill }: Props) {
  return (
    <>
      <button
        type="button"
        className="dev-fill-button"
        title="Dev only: add random 2–6 minute times to every course"
        onClick={() => onFill(randomTimes())}
      >
        <FontAwesomeIcon icon={faFlask} /> Fill some test data
      </button>
      <button
        type="button"
        className="dev-fill-button"
        title="Dev only: fill every course/star/rider combo with a random 2–6 minute time"
        onClick={() => onFill(fullTimes())}
      >
        <FontAwesomeIcon icon={faVials} /> Fill all test data
      </button>
    </>
  )
}
