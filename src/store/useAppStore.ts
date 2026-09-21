import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { detectQuality, type QualitySettings } from '../quality/quality'
import { SECTION_ORDER, type SectionId } from '../config/sections'

export type LoadPhase = 'void' | 'chaos' | 'formation' | 'activation' | 'access'
export type View = 'overview' | 'detail'

export interface AppState {
  loadPhase: LoadPhase
  section: SectionId
  view: View
  activeProjectId: string | null
  quality: QualitySettings
  /** Audio volumes from 0..1; zero mutes the category. */
  bgmVolume: number
  sfxVolume: number
  setLoadPhase: (phase: LoadPhase) => void
  setSection: (section: SectionId) => void
  setView: (view: View, projectId?: string | null) => void
  setBgmVolume: (volume: number) => void
  setSfxVolume: (volume: number) => void
}

const initialQuality = detectQuality()

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      loadPhase: 'void',
      section: 'profile',
      view: 'overview',
      activeProjectId: null,
      quality: initialQuality,
      bgmVolume: 0,
      sfxVolume: 0,
      setLoadPhase: (loadPhase) => set({ loadPhase }),
      // Passive camera sampling must not close an active project.
      setSection: (section) =>
        set((state) =>
          state.view === 'detail'
            ? { section }
            : { section, view: 'overview', activeProjectId: null },
        ),
      setView: (view, projectId = null) => set({ view, activeProjectId: projectId }),
      setBgmVolume: (bgmVolume) => set({ bgmVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
    }),
    {
      name: 'portfolio-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        bgmVolume: s.bgmVolume,
        sfxVolume: s.sfxVolume,
      }),
    },
  ),
)

// Re-exported so existing callers keep working after the registry refactor.
export { SECTION_ORDER }
export type { SectionId }
