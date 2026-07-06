import './CourseList.css'
import { OLD_COURSES, NEW_COURSES } from '../../data/gameData'
import { formatMs } from '../../utils/time'
import type { TimesData } from '../../utils/optimizer'
import type { Course } from '../../types/types'

interface Props {
  times: TimesData
  selected: Course
  onSelect: (course: Course) => void
}

function CourseChip({
  course,
  times,
  selected,
  onSelect,
}: Props & { course: Course }) {
  const record = times[course]
  const entries = record ? Object.values(record) : []
  const best = entries.length > 0 ? Math.min(...entries) : null

  return (
    <button
      type="button"
      className={`course-chip${selected === course ? ' selected' : ''}${entries.length === 0 ? ' empty' : ''}`}
      onClick={() => onSelect(course)}
    >
      <span className="name">{course}</span>
      <span className="meta">
        {best !== null
          ? `${formatMs(best)} · ${entries.length} ${entries.length === 1 ? 'time' : 'times'}`
          : 'no times yet'}
      </span>
    </button>
  )
}

const GROUPS = [
  { label: 'Classic Courses', courses: OLD_COURSES },
  { label: 'New Courses', courses: NEW_COURSES },
]

export default function CourseList(props: Props) {
  return (
    <div className="course-list">
      {GROUPS.map((group) => (
        <div className="course-group" key={group.label}>
          <h3>{group.label}</h3>
          <div className="chips">
            {group.courses.map((course) => (
              <CourseChip key={course} course={course} {...props} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
