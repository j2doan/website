import type { OrbState } from 'thinking-orbs'

// Change these independently to switch each project's orb animation.
// Available values: working, searching, solving, listening, connecting,
// weaving, composing, breathing, shaping.
export const PROJECT_ONE_ORB_STATE: OrbState = 'composing'
export const PROJECT_TWO_ORB_STATE: OrbState = 'composing'
export const PROJECT_THREE_ORB_STATE: OrbState = 'composing'
export const PROJECT_FOUR_ORB_STATE: OrbState = 'composing'
export const PROJECT_FIVE_ORB_STATE: OrbState = 'composing'
export const PROJECT_SIX_ORB_STATE: OrbState = 'composing'
export const PROJECT_SEVEN_ORB_STATE: OrbState = 'composing'
export const PROJECT_EIGHT_ORB_STATE: OrbState = 'composing'

// Keep this array aligned with projects.ts positions 1 through 8.
export const PROJECT_ORB_STATES: readonly OrbState[] = [
  PROJECT_ONE_ORB_STATE,
  PROJECT_TWO_ORB_STATE,
  PROJECT_THREE_ORB_STATE,
  PROJECT_FOUR_ORB_STATE,
  PROJECT_FIVE_ORB_STATE,
  PROJECT_SIX_ORB_STATE,
  PROJECT_SEVEN_ORB_STATE,
  PROJECT_EIGHT_ORB_STATE,
]
