// ---------------------------------------------------------------------------
// Interaction lock.
//
// Prevents overlapping animations: while a camera/UI transition is settling,
// repeated nav clicks, orb selections, and scroll/arrow nudges are ignored.
// A simple time-based lock shared across the store-less modules (scroll,
// TransitionManager consumers). The lock lives outside React so wheel/keyboard
// handlers and 3D event handlers can all consult it cheaply.
// ---------------------------------------------------------------------------

const LOCK_DURATION_MS = 1200

let lockedUntil = 0

/** Acquire the lock. Returns false if a transition is still settling. */
export function acquireTransitionLock(): boolean {
  const now = Date.now()
  if (now < lockedUntil) return false
  lockedUntil = now + LOCK_DURATION_MS
  return true
}

/** True while a transition is settling (used to gate passive input). */
export function isTransitionLocked(): boolean {
  return Date.now() < lockedUntil
}
