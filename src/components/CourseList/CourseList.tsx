import { OLD_COURSES, NEW_COURSES, type StarRuleset } from '../../data/gameData';
import type { TimesData } from '../../utils/optimizer';
import type { Course } from '../../types/types';
import CourseChip from './CourseChip/CourseChip';
import './CourseList.css';

export type CourseListProps = {
  times: TimesData;
  selected: Course;
  ruleset: StarRuleset;
  onSelect: (course: Course) => void;
};

const GROUPS = [
  { label: 'Classic Courses', courses: OLD_COURSES },
  { label: 'New Courses', courses: NEW_COURSES },
];

export default function CourseList(props: CourseListProps) {
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
