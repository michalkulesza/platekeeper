export interface DurationMatch {
  seconds: number
  start: number
  end: number
}

export const formatCountdown = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export const formatDurationLabel = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  if (m > 0 && s > 0) return `${m}m ${s}s`
  if (m > 0) return `${m}m`
  return `${s}s`
}

export const parseDurationMatch = (text: string): DurationMatch | null => {
  let m: RegExpExecArray | null

  m = /\b(\d+)[–-](\d+)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i.exec(text)
  if (m) {
    const n = parseInt(m[1])
    const u = m[3].toLowerCase()
    let seconds: number
    if (u.startsWith('h')) seconds = n * 3600
    else if (u.startsWith('m')) seconds = n * 60
    else seconds = n
    return { seconds, start: m.index, end: m.index + m[0].length }
  }

  m = /\b(\d+)\s*(?:hours?|hrs?|h)\s+(?:and\s+)?(\d+)\s*(?:minutes?|mins?|m)\b/i.exec(text)
  if (m)
    return { seconds: parseInt(m[1]) * 3600 + parseInt(m[2]) * 60, start: m.index, end: m.index + m[0].length }

  m = /\b(\d+)\s*(?:hours?|hrs?)\b/i.exec(text)
  if (m) return { seconds: parseInt(m[1]) * 3600, start: m.index, end: m.index + m[0].length }

  m = /\b(\d+)\s*(?:minutes?|mins?)\b/i.exec(text)
  if (m) return { seconds: parseInt(m[1]) * 60, start: m.index, end: m.index + m[0].length }

  m = /\b(\d+)\s*(?:seconds?|secs?)\b/i.exec(text)
  if (m) return { seconds: parseInt(m[1]), start: m.index, end: m.index + m[0].length }

  return null
}

export const parseDurationSeconds = (text: string): number | null => {
  let m: RegExpMatchArray | null

  m = text.match(/\b(\d+)[–-](\d+)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i)
  if (m) {
    const n = parseInt(m[1])
    const u = m[3].toLowerCase()
    if (u.startsWith('h')) return n * 3600
    if (u.startsWith('m')) return n * 60
    return n
  }

  m = text.match(/\b(\d+)\s*(?:hours?|hrs?|h)\s+(?:and\s+)?(\d+)\s*(?:minutes?|mins?|m)\b/i)
  if (m) return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60

  m = text.match(/\b(\d+)\s*(?:hours?|hrs?)\b/i)
  if (m) return parseInt(m[1]) * 3600

  m = text.match(/\b(\d+)\s*(?:minutes?|mins?)\b/i)
  if (m) return parseInt(m[1]) * 60

  m = text.match(/\b(\d+)\s*(?:seconds?|secs?)\b/i)
  if (m) return parseInt(m[1])

  return null
}
