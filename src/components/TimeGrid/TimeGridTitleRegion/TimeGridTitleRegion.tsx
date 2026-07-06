import type { Course } from "../../../types/types";
import "./TimeGridTitleRegion.css";

type Props = {
  course: Course
};

export default function TimeGridTitleRegion({ course }: Props) {
  return (<div className="time-grid-title">
    <h2>{course}</h2>
    <span className="hint">
      Enter times as m:ss.xx or seconds — Enter or click away to save,
      clear to delete
    </span>
  </div>);
}
