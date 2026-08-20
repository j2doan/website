// ---------------------------------------------------------------------------
// Audio configuration.
//
// Single place to manage all sound for the experience — mirrors the role of
// palette.ts for audio. To change audio:
//
//  BGM:      add/replace entries in AudioConfig.bgm.tracks, set defaultTrack.
//  SFX:      set src on an entry below, or add a new id + entry.
//  Toggles:  set `enabled: false` to disable a specific sound.
//  Volumes:  adjust `volume` per entry (0..1) or the UI panel defaults in the
//            store. The AudioManager applies category + per-sound gain.
//
// Source files live in src/audio/audio_sources/ and are imported through Vite
// (hashed URLs, fetched lazily on first use). Unconfigured entries keep src:''
// and remain silent.
// ---------------------------------------------------------------------------

// BGM
import starOdysseyUrl from './audio_sources/bgm/Star Odyssey (Instrumental).mp3'
import halfwayHouseUrl from './audio_sources/bgm/Halfway House.mp3'

// SFX
import categorySelectUrl from './audio_sources/sfx/category_select.mp3'
import addItemUrl from './audio_sources/sfx/add_item.mp3'
import removeItemUrl from './audio_sources/sfx/remove_item.mp3'
import openSettingsUrl from './audio_sources/sfx/open_settings.mp3'
import closeSettingsUrl from './audio_sources/sfx/close_settings.mp3'
import toggleOnUrl from './audio_sources/sfx/toggle_on.mp3'
import toggleOffUrl from './audio_sources/sfx/toggle_off.mp3'
import buttonUrl from './audio_sources/sfx/button.mp3'

export interface BgmTrackDef {
  id: string
  /** URL/path to the audio file, e.g. '/audio/ambient.mp3'. Empty = not set. */
  src: string
  enabled: boolean
  volume: number
  loop: boolean
}

export interface SfxDef {
  id: string
  /** URL/path to the audio file. Empty = not set. */
  src: string
  enabled: boolean
  /** 0..1 — applied on top of the master SFX volume. */
  volume: number
}

/** Stable ids referenced from interaction code. */
export const SFX = {
  /** A section transition happened (scroll crossing, nav click, shortcut). */
  section: 'section',
  navHover: 'nav-hover',
  orbHover: 'orb-hover',
  orbSelect: 'orb-select',
  orbExit: 'orb-exit',
  modalOpen: 'modal-open',
  modalClose: 'modal-close',
  toggleOn: 'toggle-on',
  toggleOff: 'toggle-off',
  sfxTest: 'sfx-test',
  access: 'access',
} as const

export type SfxId = (typeof SFX)[keyof typeof SFX]

/**
 * BGM tracks. Swap the default song by changing `bgm.defaultTrack`
 * to the index of the track you want (0 = Star Odyssey, 1 = Halfway House).
 */
const BGM_TRACKS: BgmTrackDef[] = [
  { id: 'star-odyssey', src: starOdysseyUrl, enabled: true, volume: 0.5, loop: true },
  { id: 'halfway-house', src: halfwayHouseUrl, enabled: true, volume: 0.5, loop: true },
]

export const AudioConfig = {
  bgm: {
    /** Index into `tracks` to play on load; -1 = none. */
    defaultTrack: 1,
    fadeInSec: 2.5,
    fadeOutSec: 1.5,
    tracks: BGM_TRACKS,
  },
  sfx: {
    /**
     * Audition mode: when true and a sound has no `src`, the manager plays a
     * soft neutral WebAudio blip so interaction wiring can be verified.
     */
    placeholder: false,
    entries: {
      [SFX.section]: { id: SFX.section, src: categorySelectUrl, enabled: true, volume: 0.5 },
      [SFX.navHover]: { id: SFX.navHover, src: '', enabled: true, volume: 0.35 },
      [SFX.orbHover]: { id: SFX.orbHover, src: '', enabled: true, volume: 0.35 },
      [SFX.orbSelect]: { id: SFX.orbSelect, src: addItemUrl, enabled: true, volume: 0.75 },
      [SFX.orbExit]: { id: SFX.orbExit, src: removeItemUrl, enabled: true, volume: 0.4 },
      [SFX.modalOpen]: { id: SFX.modalOpen, src: openSettingsUrl, enabled: true, volume: 0.5 },
      [SFX.modalClose]: { id: SFX.modalClose, src: closeSettingsUrl, enabled: true, volume: 0.5 },
      [SFX.toggleOn]: { id: SFX.toggleOn, src: toggleOnUrl, enabled: true, volume: 0.4 },
      [SFX.toggleOff]: { id: SFX.toggleOff, src: toggleOffUrl, enabled: true, volume: 0.4 },
      [SFX.sfxTest]: { id: SFX.sfxTest, src: buttonUrl, enabled: true, volume: 0.45 },
      [SFX.access]: { id: SFX.access, src: '', enabled: true, volume: 0.4 },
    } as Record<SfxId, SfxDef>,
  },
} as const

export type SfxConfig = (typeof AudioConfig.sfx.entries)[SfxId]
