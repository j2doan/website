import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { OverlayUI } from './ui/OverlayUI'
import { Fallback } from './ui/Fallback'
import { RotateScreen } from './ui/RotateScreen'
import { useScrollStepper } from './hooks/useScrollStepper'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { usePortraitGate } from './hooks/usePortraitGate'
import { useEmergenceSequence } from './hooks/useEmergenceSequence'
import { useAudioUnlock, useBgmFadeIn } from './audio/useAudio'
import { installClickPulse } from './fx/clickPulse'
import { PreScreen } from './ui/PreScreen'
import { useAppStore } from './store/useAppStore'
import { AudioManager } from './audio/AudioManager'
import { preloadImages } from './loader/preloadAssets'

// The 3D scene (three + r3f + postprocessing) is the bulk of the bundle;
// lazy-load it so the pre-screen paints immediately and the heavy chunks
// fetch only once the user hits START.
const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

export default function App() {
  const [webgl] = useState(supportsWebGL)
  const [started, setStarted] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const portrait = usePortraitGate()
  const loadPhase = useAppStore((s) => s.loadPhase)
  const emergence = useEmergenceSequence()

  useScrollStepper()
  useKeyboardShortcuts()
  useAudioUnlock()
  useBgmFadeIn()

  useEffect(() => installClickPulse(), [])

  // Any pointer/key gesture during the emergence sequence skips to ACCESS.
  useEffect(() => {
    if (!started || loadPhase === 'access') return
    const skip = () => emergence.skip()
    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [started, loadPhase, emergence.skip])

  const startExperience = () => {
    emergence.start()
    setStarted(true)
    // Warm artwork images and decode SFX + the default BGM in the background
    // so the intro starts clean; the black gate hides all of it.
    void preloadImages().then(() => setAssetsReady(true))
    void AudioManager.preloadSfx().then(() => setAudioReady(true))
  }

  const gateOpen = sceneReady && audioReady && assetsReady

  return (
    <div className="app">
      {portrait ? (
        <RotateScreen />
      ) : webgl ? (
        started ? (
          <>
            <Suspense fallback={null}>
              <Scene onReady={() => setSceneReady(true)} />
            </Suspense>
            {loadPhase === 'access' && <OverlayUI />}
            <motion.div
              className="asset-wait"
              aria-label="Preparing experience"
              aria-busy={!gateOpen}
              initial={{ opacity: 1 }}
              animate={{ opacity: gateOpen ? 0 : 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </>
        ) : (
          <PreScreen onStart={startExperience} />
        )
      ) : (
        <Fallback />
      )}
    </div>
  )
}
