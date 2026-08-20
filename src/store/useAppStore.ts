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
  /** "Low Visual Effects" performance toggle. */
  lowFx: boolean
  /** Audio volumes from 0..1; zero mutes the category. */
  bgmVolume: number
  sfxVolume: number
  setLoadPhase: (phase: LoadPhase) => void
  setSection: (section: SectionId) => void
  setView: (view: View, projectId?: string | null) => void
  setLowFx: (lowFx: boolean) => void
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
      lowFx: false,
      bgmVolume: 0.5,
      sfxVolume: 0.8,
      setLoadPhase: (loadPhase) => set({ loadPhase }),
       // Camera section sampling can race an orb click within the same frame.
       // Never let that passive update clear an active project; explicit
       // navigation closes detail through transitionToSection instead.
       setSection: (section) =>
         set((state) =>
           state.view === 'detail'
             ? { section }
             : { section, view: 'overview', activeProjectId: null },
         ),
      setView: (view, projectId = null) => set({ view, activeProjectId: projectId }),
      setLowFx: (lowFx) => set({ lowFx }),
      setBgmVolume: (bgmVolume) => set({ bgmVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
    }),
    {
       name: 'portfolio-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lowFx: s.lowFx,
        bgmVolume: s.bgmVolume,
        sfxVolume: s.sfxVolume,
      }),
    },
  ),
)

// Re-exported so existing callers keep working after the registry refactor.
export { SECTION_ORDER }
export type { SectionId }
