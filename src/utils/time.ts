/** Parses "1:23.45", "83.45" or "83" into milliseconds; null if invalid. */
export function parseTimeInput(raw: string): number | null {
  const match = raw.trim().match(/^(?:(\d+):)?(\d*\.?\d+)$/)
  if (!match) return null
  const minutes = match[1] ? parseInt(match[1], 10) : 0
  const seconds = parseFloat(match[2])
  if (match[1] && seconds >= 60) return null
  const ms = Math.round((minutes * 60 + seconds) * 1000)
  return ms > 0 ? ms : null
}

/** Formats milliseconds as "m:ss.xx". */
export function formatMs(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = (ms - minutes * 60000) / 1000
  return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`
}
