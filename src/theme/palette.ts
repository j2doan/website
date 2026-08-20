// Shared color progression for project orbs and data ribbons.
// These are intentionally kept in one place so orbs and ribbons stay visually
// connected as part of the same design language.

// Current color palette
export const ORB_PALETTE = [
  '#5cc8ff',
  '#9b7bff',
  '#f26f99',
  '#6ea8ff',
  '#c09bff',
  '#5c8dff',
  '#df7db0',
  '#a98bff',
]

// Original palette retained for easy restoration.
export const LEGACY_ORB_PALETTE = [
  '#5cc8ff',
  '#9b7bff',
  '#4ad0c4',
  '#6ea8ff',
  '#c09bff',
  '#5c8dff',
  '#7fd0e8',
  '#a98bff',
]

// Original red-purple-blue color gradient palette
export const RED_PURPLE_BLUE = [
  '#b7094c',
  '#972060',
  '#7f336b',
  '#674676',
  '#505981',
  '#386c8d',
  '#1f7f99',
  '#0091ad'
]

// Revised red-purple-blue brighter color gradient palette
export const BRIGHT_RED_PURPLE_BLUE = [
  '#ff89ad',
  '#ee96c2',
  '#dba5d1',
  '#c2b3de',
  '#a3c4ea',
  '#82d7f2',
  '#5fe8f8',
  '#42f6ff',
]

// ---------------------------------------------------------------------------
// Preserved color treatments. Switch the CURRENT_* values when testing a
// different visual treatment.
// ---------------------------------------------------------------------------

// Original pre-gradient humanoid particle colors. Keys mirror
// createParticleSystem options.
export const ORIGINAL_HUMANOID_COLORS: {
  bodyA: [number, number, number]
  bodyB: [number, number, number]
  headA: [number, number, number]
  headB: [number, number, number]
  shellA: [number, number, number]
  shellB: [number, number, number]
  innerLow: [number, number, number]
  innerHigh: [number, number, number]
} = {
  bodyA: [0.55, 0.72, 1.0],
  bodyB: [1.0, 0.98, 1.0],
  headA: [0.6, 0.8, 1.0],
  headB: [1.0, 1.0, 1.0],
  shellA: [0.55, 0.72, 1.0],
  shellB: [1.0, 0.98, 1.0],
  innerLow: [0.24, 0.62, 0.95],
  innerHigh: [0.68, 0.5, 1.0],
}

// Original data-ribbon treatment: cyan-to-violet mixed per band.
export const ORIGINAL_DATA_RIBBON_COLORS = [
  '#5cc8ff',
  '#9b7bff'
]

// Original data-ocean treatment (unchanged since introduction).
export const ORIGINAL_DATA_OCEAN_COLORS = {
  deep: [0.03, 0.08, 0.22],
  crest: [0.32, 0.72, 1.0],
}

// Brighter humanoid treatment for a more readable silhouette.
// Channels raised toward white; additive blending turns this into a stronger
// bloom. Reversible via ORIGINAL_HUMANOID_COLORS above.
export const BRIGHT_HUMANOID_COLORS: {
  bodyA: [number, number, number]
  bodyB: [number, number, number]
  headA: [number, number, number]
  headB: [number, number, number]
  shellA: [number, number, number]
  shellB: [number, number, number]
  innerLow: [number, number, number]
  innerHigh: [number, number, number]
} = {
  bodyA: [0.78, 0.88, 1.0],
  bodyB: [1.0, 1.0, 1.0],
  headA: [0.85, 0.92, 1.0],
  headB: [1.0, 1.0, 1.0],
  shellA: [0.82, 0.9, 1.0],
  shellB: [1.0, 1.0, 1.0],
  innerLow: [0.3, 0.72, 1.0],
  innerHigh: [0.82, 0.62, 1.0],
}

// Active treatments.
export const CURRENT_HUMANOID_COLORS = BRIGHT_HUMANOID_COLORS
export const CURRENT_DATA_RIBBON_COLORS = {
  gradient: ORIGINAL_DATA_RIBBON_COLORS, // smooth along-ribbon gradient
}
export const CURRENT_DATA_OCEAN_COLORS = ORIGINAL_DATA_OCEAN_COLORS
