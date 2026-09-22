// lib/format.ts
export function toTitleCase(s: string) {
  return s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase())
}
