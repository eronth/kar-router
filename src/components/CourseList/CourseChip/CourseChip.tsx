import {
  RIDERS, STARS,
  isStarAllowed,
 } from '../../../data/gameData';
import type { Course } from "../../../types/types";
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
  ruleset,
  onSelect,
}: Props) {
  const record = times[course] ?? {};
  // Only combos the current ruleset permits count toward best time and totals.
  const countedTimes = Object.entries(record)
    .filter(([key]) => isStarAllowed(splitComboKey(key).star, ruleset))
    .map(([, ms]) => ms);
  const best = countedTimes.length > 0 ? Math.min(...countedTimes) : null;

  const maxStarCount = STARS.filter((star) => isStarAllowed(star, ruleset)).length;
  const maxTimesCount = RIDERS.length * maxStarCount;

  const currentTimesCount = countedTimes.length;

  const timesCountText = (currentTimesCount >= maxTimesCount) ? 'All' : `${currentTimesCount}`;
  const timesWord      = (currentTimesCount === 1) ? 'time' : 'times';
  const timesEntry     = `${timesCountText} ${timesWord}`;

  return (
    <button
      type="button"
      className={`course-chip${selected === course ? ' selected' : ''}${countedTimes.length === 0 ? ' empty' : ''}`}
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
