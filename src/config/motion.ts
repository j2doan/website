// ---------------------------------------------------------------------------
// Central animation and camera timing values.
// Adjust here instead of hunting constants inside components.
// ---------------------------------------------------------------------------

export const MotionConfig = {
  /** Scroll-to-section smoothing (CameraController lerp toward target). */
  scrollSnap: 3,
  /** Camera position/target snap rate while overview (higher = snappier). */
  cameraOverviewSnap: 2.2,
  /** Camera snap rate while inspecting a project. */
  cameraDetailSnap: 1.8,
  /** Camera snap rate during the loading sequence (deliberately slow). */
  cameraLoadSnap: 0.15,
  /**
   * Rate at which the camera snap eases toward its target rate, so the slow
   * emergence drift glides into the PROFILE pose instead of snapping to full
   * speed the instant the sequence reaches ACCESS.
   */
  cameraSnapRamp: 1.5,
  /** FOV lerp rate. */
  fovSnap: 2.4,
  /** Orb level fade smoothing. */
  orbLevelSnap: 2,
} as const
