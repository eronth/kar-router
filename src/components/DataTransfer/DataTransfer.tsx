import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileExport,
  faFileImport,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import {
  downloadExport,
  parseImport,
  type ImportSummary,
} from '../../utils/dataTransfer'
import type { TimesData } from '../../utils/optimizer'
import type { Settings } from '../SettingsBar/SettingsBar'
import './DataTransfer.css'

interface Props {
  times: TimesData
  settings: Settings
  onReplace: (times: TimesData, settings: Settings | null) => void
  onMerge: (times: TimesData) => void
}

export default function DataTransfer({
  times,
  settings,
  onReplace,
  onMerge,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [pending, setPending] = useState<ImportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const closeDialog = () => dialogRef.current?.close()

  async function handleFile(file: File) {
    try {
      setPending(parseImport(await file.text()))
      setError(null)
    } catch (err) {
      setPending(null)
      setError(err instanceof Error ? err.message : 'Could not read that file.')
    }
    dialogRef.current?.showModal()
  }

  return (
    <>
      <button
        type="button"
        className="data-button"
        title="Download your times and settings as a JSON file"
        onClick={() => downloadExport(times, settings)}
      >
        <FontAwesomeIcon icon={faFileExport} /> Export
      </button>
      <button
        type="button"
        className="data-button"
        title="Load times from a previously exported JSON file"
        onClick={() => fileRef.current?.click()}
      >
        <FontAwesomeIcon icon={faFileImport} /> Import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          // Reset so picking the same file again still fires onChange.
          event.currentTarget.value = ''
          if (file) handleFile(file)
        }}
      />
      <dialog
        ref={dialogRef}
        className="data-transfer-dialog"
        onClick={(event) => {
          // Backdrop clicks target the dialog element itself; content clicks
          // land on the inner wrapper.
          if (event.target === dialogRef.current) closeDialog()
        }}
      >
        <div className="data-transfer-dialog-body">
          {error !== null ? (
            <>
              <h3>Import failed</h3>
              <p className="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
              </p>
              <div className="dialog-actions">
                <button autoFocus onClick={closeDialog}>
                  Close
                </button>
              </div>
            </>
          ) : pending !== null ? (
            <>
              <h3>Import saved times?</h3>
              <p>
                This file contains <em>{pending.entryCount}</em>{' '}
                {pending.entryCount === 1 ? 'time' : 'times'} across{' '}
                <em>{pending.courseCount}</em>{' '}
                {pending.courseCount === 1 ? 'course' : 'courses'}.
              </p>
              {pending.skippedCount > 0 && (
                <p className="warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />{' '}
                  {pending.skippedCount} unrecognized{' '}
                  {pending.skippedCount === 1 ? 'entry' : 'entries'} will be
                  skipped.
                </p>
              )}
              <div className="dialog-actions">
                <button
                  autoFocus
                  onClick={() => {
                    onMerge(pending.times)
                    closeDialog()
                  }}
                >
                  <em>Merge</em> with my times
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    onReplace(pending.times, pending.settings)
                    closeDialog()
                  }}
                >
                  <em>Replace</em> everything
                </button>
                <button onClick={closeDialog}>Cancel</button>
              </div>
            </>
          ) : null}
        </div>
      </dialog>
    </>
  )
}
