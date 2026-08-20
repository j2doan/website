import { useCallback, useEffect } from 'react'
import { AudioConfig, SFX, type SfxId } from './AudioConfig'
import { AudioManager } from './AudioManager'
import { useAppStore } from '../store/useAppStore'

/** Stable audio helpers for React components. */
export function useAudio() {
  const playSfx = useCallback((id: SfxId) => AudioManager.playSfx(id), [])
  const setBgm = useCallback((index: number) => AudioManager.setBgm(index), [])
  const unlock = useCallback(() => AudioManager.unlock(), [])
  return { playSfx, setBgm, unlock }
}

export { SFX }

/**
 * Fade in the default BGM once the experience reaches the "access" phase.
 * No-op until a default track is configured in AudioConfig.
 */
export function useBgmFadeIn() {
  const loadPhase = useAppStore((s) => s.loadPhase)
  const { setBgm, playSfx } = useAudio()

  useEffect(() => {
    if (loadPhase !== 'access') return
    setBgm(AudioConfig.bgm.defaultTrack)
    playSfx(SFX.access)
  }, [loadPhase, setBgm, playSfx])
}

/**
 * Unlock the AudioContext on the first user gesture (autoplay policy).
 * Mount once at the app root.
 */
export function useAudioUnlock() {
  const unlock = useAudio().unlock

  useEffect(() => {
    const handler = () => unlock()
    window.addEventListener('pointerdown', handler, { once: true })
    window.addEventListener('keydown', handler, { once: true })
    return () => {
      window.removeEventListener('pointerdown', handler)
      window.removeEventListener('keydown', handler)
    }
  }, [unlock])
}
