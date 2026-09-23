export const ORB_PALETTE = [
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
]

export type HumanoidColors = {
  bodyA: [number, number, number]
  bodyB: [number, number, number]
  headA: [number, number, number]
  headB: [number, number, number]
  shellA: [number, number, number]
  shellB: [number, number, number]
  innerLow: [number, number, number]
  innerHigh: [number, number, number]
}

export const BRIGHT_HUMANOID_COLORS: HumanoidColors = {
  // Fog palette: soft neutral silver with enough contrast to remain visible
  // against the black world without competing with the white project orbs.
  bodyA: [0.48, 0.52, 0.53],
  bodyB: [0.68, 0.72, 0.73],
  headA: [0.53, 0.57, 0.58],
  headB: [0.74, 0.78, 0.79],
  shellA: [0.64, 0.68, 0.69],
  shellB: [0.84, 0.87, 0.88],
  innerLow: [0.25, 0.28, 0.29],
  innerHigh: [0.44, 0.48, 0.49],
}

export const CURRENT_HUMANOID_COLORS = BRIGHT_HUMANOID_COLORS
