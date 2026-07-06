import { useRef } from "react";
import type { Course } from "../../../types/types";
import "./TimeGridTitleRegion.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

type Props = {
  course: Course
  onClearCourse: (course: Course) => void
  onClearAll: () => void
};

export default function TimeGridTitleRegion({ course, onClearCourse, onClearAll }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeDialog = () => dialogRef.current?.close();

  return (<div className="time-grid-title">
    <h2>{course}</h2>
    <span className="hint">
      Enter times as m:ss.xx or seconds — Enter or click away to save,
      clear to delete
    </span>
    <button
      className="clear-times-button"
      onClick={() => dialogRef.current?.showModal()}
    >
      Clear Times
    </button>
    <dialog
      ref={dialogRef}
      className="clear-times-dialog"
      onClick={(event) => {
        // Backdrop clicks target the dialog element itself; content clicks
        // land on the inner wrapper.
        if (event.target === dialogRef.current) closeDialog();
      }}
    >
      <div className="clear-times-dialog-body">
        <h3>Clear saved course completion times?</h3>
        <p className="warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {' '}This can&apos;t be undone.
        </p>
        <div className="dialog-actions">
          <button
            onClick={() => {
              onClearCourse(course);
              closeDialog();
            }}
          >
            Clear <em>{course}</em> times
          </button>
          <button
            className="danger"
            onClick={() => {
              onClearAll();
              closeDialog();
            }}
          >
            Clear times for <em>all</em> courses
          </button>
          <button autoFocus onClick={closeDialog}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  </div>);
}
