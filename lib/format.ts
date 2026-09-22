// lib/format.ts
export function toTitleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/(^|[\s,/(-])([a-z])/g, (_match, sep: string, letter: string) => sep + letter.toUpperCase())
}
