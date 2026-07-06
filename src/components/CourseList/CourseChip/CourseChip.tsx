import { 
  RIDERS,
  OLD_STARS, NEW_STARS, LEGENDARY_STARS
 } from '../../../data/gameData';
import type { Course, Star } from "../../../types/types";
import { splitComboKey } from "../../../utils/optimizer";
import { formatMs } from "../../../utils/time";
import type { CourseListProps } from '../CourseList';
import './CourseChip.css';

type Props = CourseListProps & {
  course: Course;
};

export default function CourseChip({
  course,
  times,
  selected,
  allowLegendary,
  onSelect,
}: Props) {
  const record = times[course] ?? {};
  const entries = Object.values(record);
  const best = entries.length > 0 ? Math.min(...entries) : null;

  const maxStarCount = OLD_STARS.length + NEW_STARS.length + (allowLegendary ? LEGENDARY_STARS.length : 0);
  const maxTimesCount = RIDERS.length * maxStarCount;

  const currentTimesCount = allowLegendary
  ? Object.keys(record).length
  : Object.keys(record).filter(
      key => !(LEGENDARY_STARS as readonly Star[]).includes(splitComboKey(key).star)
    ).length;

  const timesCountText = (currentTimesCount >= maxTimesCount) ? 'All' : `${currentTimesCount}`;
  const timesWord      = (currentTimesCount === 1) ? 'time' : 'times';
  const timesEntry     = `${timesCountText} ${timesWord}`;

  return (
    <button
      type="button"
      className={`course-chip${selected === course ? ' selected' : ''}${entries.length === 0 ? ' empty' : ''}`}
      onClick={() => onSelect(course)}
    >
      <span className="name">{course}</span>
      <span className="meta">
        {best !== null
          ? `${formatMs(best)} · ${timesEntry}`
          : 'no times yet'}
      </span>
    </button>
  )
}
