import { SECTION_ORDER, useAppStore } from '../store/useAppStore'
import { transitionToSection } from '../three/TransitionManager'
import { acquireTransitionLock } from '../three/transitionLock'
import { SECTION_META } from './meta'
import { AudioManager } from '../audio/AudioManager'
import { SFX } from '../audio/AudioConfig'

export function NavOrbit() {
  const loadPhase = useAppStore((s) => s.loadPhase)
  const section = useAppStore((s) => s.section)
  const view = useAppStore((s) => s.view)

  if (loadPhase !== 'access' || view !== 'overview') return null

  return (
    <nav className="nav-orbit" aria-label="Sections">
      <div className="nav-orbit__list">
        {SECTION_ORDER.map((s, i) => (
          <button
            key={s}
            type="button"
            className={s === section ? 'nav-orbit__item is-active' : 'nav-orbit__item'}
            aria-current={s === section ? 'true' : undefined}
            onMouseEnter={() => AudioManager.playSfx(SFX.navHover)}
            onFocus={() => AudioManager.playSfx(SFX.navHover)}
            onClick={() => {
              if (!acquireTransitionLock()) return
              transitionToSection(i)
            }}
          >
            <span className="nav-orbit__label">{SECTION_META[s].title}</span>
            <span className="nav-orbit__index">{SECTION_META[s].index}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
