export const scrollState = {
  target: 0,
  current: 0,
  sectionIndex: 0,
}

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}
