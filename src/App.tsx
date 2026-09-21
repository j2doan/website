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
import { useAppStore } from './store/useAppStore'
import { AudioManager } from './audio/AudioManager'
import { preloadImages } from './loader/preloadAssets'

// Load the 3D scene separately so the application shell stays lightweight.
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
  const [sceneReady, setSceneReady] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const portrait = usePortraitGate()
  const loadPhase = useAppStore((s) => s.loadPhase)
  const emergence = useEmergenceSequence()
  const gateOpen = sceneReady && audioReady && assetsReady

  useScrollStepper()
  useKeyboardShortcuts()
  useAudioUnlock()
  useBgmFadeIn()

  useEffect(() => installClickPulse(), [])

  useEffect(() => {
    void preloadImages().then(() => setAssetsReady(true))
    void AudioManager.preloadSfx().then(() => setAudioReady(true))
  }, [])

  useEffect(() => {
    if (!gateOpen || loadPhase !== 'void') return
    emergence.start()
  }, [emergence.start, gateOpen, loadPhase])

  useEffect(() => {
    if (loadPhase === 'access') return
    const skip = () => emergence.skip()
    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [emergence.skip, loadPhase])

  return (
    <div className="app">
      {portrait ? (
        <RotateScreen />
      ) : webgl ? (
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
        <Fallback />
      )}
    </div>
  )
}
