import { profile } from '../content/profile'
import { useAppStore } from '../store/useAppStore'
import { SECTION_META } from './meta'

export function HUD() {
  const loadPhase = useAppStore((s) => s.loadPhase)
  const section = useAppStore((s) => s.section)
  const meta = SECTION_META[section]

  return (
    <header className="hud">
      <div className="hud__corner hud__corner--tl" />
      <div className="hud__corner hud__corner--tr" />
      <div className="hud__corner hud__corner--bl" />
      <div className="hud__corner hud__corner--br" />

      <div className="hud__left">
        <span className="hud__dot" />
        <span className="hud__codename">{profile.codename}</span>
      </div>

      <div className="hud__right">
        {loadPhase === 'access' ? (
          <span className="hud__meta">
            {meta.index} / {meta.title}
          </span>
        ) : (
          <span className="hud__meta">SIGNAL {loadPhase.toUpperCase()}</span>
        )}
      </div>

    </header>
  )
}
