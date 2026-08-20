import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Project } from '../content/types'
import { useAppStore } from '../store/useAppStore'
import { CATEGORY_LABEL } from './meta'
import { ARTWORK } from '../content/artwork'

const CARD_WIDTH = 290
const SIDE_MARGIN = 24
const PANEL_MAX_WIDTH = 460
const REQUIRED_GAP = 56
const STAGE_LEFT = 0.75

/**
 * Decide where the artwork can live based on the space actually available,
 * not a hardcoded breakpoint: as long as a centered card clears the
 * bottom-left project panel (plus a gap) it stays on its center stage;
 * otherwise it folds into the panel body.
 */
export function useArtworkPlacement(): 'center' | 'panel' {
  const [mode, setMode] = useState<'center' | 'panel'>(() => decide(window.innerWidth))
  useEffect(() => {
    const onResize = () => setMode(decide(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return mode
}

function decide(viewportWidth: number): 'center' | 'panel' {
  const panelLeft = SIDE_MARGIN
  const panelWidth = Math.min(PANEL_MAX_WIDTH, viewportWidth - 48)
  const panelRight = panelLeft + panelWidth
  const cardLeft = viewportWidth * STAGE_LEFT - CARD_WIDTH / 2
  return cardLeft >= panelRight + REQUIRED_GAP ? 'center' : 'panel'
}

export function ProjectArtworkCard({
  project,
  compact = false,
  live = false,
}: {
  project: Project
  compact?: boolean
  live?: boolean
}) {
  const lowFx = useAppStore((s) => s.lowFx)
  const art = ARTWORK[project.id]
  const src = art?.src || ''
  const title = art?.title || project.title
  const caption = art?.caption || `${CATEGORY_LABEL[project.category]} · ${project.year}`
  const rootRef = useRef<HTMLDivElement>(null)

  // Mouse parallax: nudge the 3D tilt toward the cursor. Decorative only.
  useEffect(() => {
    if (compact || lowFx) return
    const root = rootRef.current
    if (!root) return
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      if (r.width === 0) return
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      root.style.setProperty('--par-x', `${(dx * 2.6).toFixed(2)}deg`)
      root.style.setProperty('--par-y', `${(-dy * 2).toFixed(2)}deg`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [compact, lowFx])

  const style = { '--art-accent': project.accent } as CSSProperties

  const classes = ['art-card']
  if (compact) classes.push('art-card--compact')
  if (live) classes.push('is-live')
  if (lowFx) classes.push('is-lowfx')

  return (
    <div
      ref={rootRef}
      className={classes.join(' ')}
      style={style}
      aria-hidden="true"
    >
      {!compact && !lowFx && <div className="art-card__glow" aria-hidden="true" />}
      <div className="art-card__stack">
        {!compact && (
          <div className="art-card__tilt art-card__tilt--back" aria-hidden="true">
            <div className="art-card__glass art-card__glass--back" />
          </div>
        )}
        <div className="art-card__tilt">
          <div className="art-card__glass">
            <div className={src ? 'art-card__art' : 'art-card__art art-card__art--ph'}>
              {src ? (
                <img src={src} alt="" decoding="sync" fetchPriority="high" />
              ) : (
                <>
                  <span className="art-card__ph-index">
                    {String(project.position).padStart(2, '0')}
                  </span>
                  <span className="art-card__ph-ring" aria-hidden="true" />
                  <span className="art-card__ph-label">DATA ARCHIVE</span>
                </>
              )}
            </div>
            <div className="art-card__info">
              <div className="art-card__title">{title}</div>
              <div className="art-card__caption">{caption}</div>
            </div>
          </div>
        </div>
      </div>
      {!compact && !lowFx && <div className="art-card__ripple" aria-hidden="true" />}
    </div>
  )
}
