import { AudioConfig, type SfxId } from './AudioConfig'
import { useAppStore } from '../store/useAppStore'

// ---------------------------------------------------------------------------
// Audio manager.
//
// Thin singleton over the Web Audio API. It is fully config-driven: with no
// tracks/sources configured it stays silent and costs nothing. Volume and mute
// are read live from the zustand store so the UI panel takes effect instantly.
// ---------------------------------------------------------------------------

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext }

class AudioManagerImpl {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private buffers = new Map<string, AudioBuffer>()
  private bufferPromises = new Map<string, Promise<AudioBuffer | null>>()
  private currentBgm: { src: AudioBufferSourceNode; gain: GainNode } | null = null
  private bgmIndex: number | null = null
  private unsubscribeVolume: (() => void) | null = null

  /** Call from a user gesture (pointer/key) to satisfy autoplay policies. */
  unlock(): void {
    this.ensureContext()
    void this.preloadSfx()
  }

  // Keep the master, BGM, and SFX gains synchronized with the store so volume
  // changes take effect immediately.
  private watchVolumes(): void {
    if (this.unsubscribeVolume) return
    this.unsubscribeVolume = useAppStore.subscribe((state, prevState) => {
      if (state.bgmVolume !== prevState.bgmVolume || state.sfxVolume !== prevState.sfxVolume) {
        this.applyVolumes()
        // A muted BGM source is stopped intentionally. Re-select the active
        // track when the user raises the BGM slider so audio can resume without
        // requiring a page reload or a second transition to ACCESS.
        if (
          state.bgmVolume > 0 &&
          prevState.bgmVolume <= 0 &&
          this.bgmIndex !== null &&
          !this.currentBgm
        ) {
          this.setBgm(this.bgmIndex)
        }
      }
    })
  }

  private ensureContext(): void {
    this.watchVolumes()
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume()
      }
      return
    }
    const AC =
      window.AudioContext || (window as AudioWindow).webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.connect(this.ctx.destination)
    this.bgmGain = this.ctx.createGain()
    this.bgmGain.connect(this.master)
    this.sfxGain = this.ctx.createGain()
    this.sfxGain.connect(this.master)
    this.applyVolumes()
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.bgmGain || !this.sfxGain) return
    const { bgmVolume, sfxVolume } = useAppStore.getState()
    const t = this.ctx.currentTime
    // Ramp (not snap) so slider drags sound/feel smooth and never click.
    this.bgmGain.gain.setTargetAtTime(bgmVolume, t, 0.04)
    this.sfxGain.gain.setTargetAtTime(sfxVolume, t, 0.04)
  }

  private async loadBuffer(src: string): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(src)
    if (cached) return cached
    const pending = this.bufferPromises.get(src)
    if (pending) return pending

    const promise = (async () => {
      try {
        const res = await fetch(src)
        const data = await res.arrayBuffer()
        if (!this.ctx) return null
        const buffer = await this.ctx.decodeAudioData(data)
        this.buffers.set(src, buffer)
        return buffer
      } catch {
        return null
      } finally {
        this.bufferPromises.delete(src)
      }
    })()
    this.bufferPromises.set(src, promise)
    return promise
  }

  /** Decode all configured UI sounds before the user enters the scene. */
  async preloadSfx(): Promise<void> {
    this.ensureContext()
    if (!this.ctx) return
    const sources = Object.values(AudioConfig.sfx.entries)
      .filter((entry) => entry.enabled && entry.src)
      .map((entry) => entry.src)
    const defaultBgm = AudioConfig.bgm.tracks[AudioConfig.bgm.defaultTrack]
    if (defaultBgm?.enabled && defaultBgm.src) sources.push(defaultBgm.src)
    await Promise.all(sources.map((src) => this.loadBuffer(src)))
  }

  /** Crossfade to the BGM track at `index` (see AudioConfig.bgm). */
  setBgm(index: number): void {
    this.bgmIndex = index
    this.ensureContext()
    if (!this.ctx) return
    if (useAppStore.getState().bgmVolume <= 0) {
      this.fadeOutBgm()
      return
    }
    const def = AudioConfig.bgm.tracks[index]
    if (!def || !def.enabled || !def.src) {
      this.fadeOutBgm()
      return
    }
    void this.loadBuffer(def.src).then((buffer) => {
      if (!buffer || !this.ctx) return
      this.fadeOutBgm()
      const src = this.ctx.createBufferSource()
      src.buffer = buffer
      src.loop = def.loop
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0, this.ctx.currentTime)
      gain.connect(this.bgmGain ?? this.ctx.destination)
      src.connect(gain)
      src.start()
      gain.gain.linearRampToValueAtTime(
        def.volume,
        this.ctx.currentTime + AudioConfig.bgm.fadeInSec,
      )
      this.currentBgm = { src, gain }
    })
  }

  private fadeOutBgm(): void {
    if (!this.ctx || !this.currentBgm) return
    const { src, gain } = this.currentBgm
    this.currentBgm = null
    const t = this.ctx.currentTime + AudioConfig.bgm.fadeOutSec
    gain.gain.cancelScheduledValues(this.ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, t)
    src.stop(t + 0.1)
  }

  /** Play a named sound effect (no-op if unconfigured/disabled). */
  playSfx(id: SfxId): void {
    this.ensureContext()
    if (!this.ctx) return
    if (useAppStore.getState().sfxVolume <= 0) return
    const def = AudioConfig.sfx.entries[id]
    if (!def || !def.enabled) return
    if (def.src) {
      void this.loadBuffer(def.src).then((buffer) => {
        if (!buffer || !this.ctx) return
        this.playBuffer(buffer, def.volume, this.sfxGain)
      })
    } else if (AudioConfig.sfx.placeholder) {
      this.playPlaceholder(def.volume)
    }
  }

  private playBuffer(
    buffer: AudioBuffer,
    volume: number,
    dest: GainNode | null,
  ): void {
    if (!this.ctx) return
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume, this.ctx.currentTime)
    gain.connect(dest ?? this.ctx.destination)
    src.connect(gain)
    src.start()
    src.onended = () => {
      src.disconnect()
      gain.disconnect()
    }
  }

  private playPlaceholder(volume: number): void {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const now = this.ctx.currentTime
    const freq = 340 + Math.random() * 220
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.12 * volume, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    gain.connect(this.sfxGain ?? this.ctx.destination)
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + 0.2)
  }
}

export const AudioManager = new AudioManagerImpl()
