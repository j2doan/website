import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '../content/projects'
import { useAppStore } from '../store/useAppStore'
import { CATEGORY_LABEL } from './meta'
import { AudioManager } from '../audio/AudioManager'
import { SFX } from '../audio/AudioConfig'
import { BackArrowIcon } from './icons'
import { ProjectArtworkCard, useArtworkPlacement } from './ProjectArtworkCard'
import { rich } from './RichText'

export function ProjectPanel() {
  const view = useAppStore((s) => s.view)
  const activeProjectId = useAppStore((s) => s.activeProjectId)
  const setView = useAppStore((s) => s.setView)

  const project = projects.find((p) => p.id === activeProjectId) ?? null
  const open = view === 'detail'
  const placement = useArtworkPlacement()

  const [rippleLive, setRippleLive] = useState(false)

  useEffect(() => {
    if (open && project) setRippleLive(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project?.id])

  const close = () => {
    AudioManager.playSfx(SFX.orbExit)
    setView('overview')
  }

  // The project is a focused state: Escape closes it, but clicking outside does
  // not dismiss the panel.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <AnimatePresence>
      {open && project && (
        <motion.aside
          key={`panel-${project.id}`}
          className="project-panel"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          aria-label={project.title}
        >
          <button
            type="button"
            className="project-panel__back"
            aria-label="Back to main menu"
            onClick={close}
          >
            <BackArrowIcon size={18} />
            <span>MAIN MENU</span>
          </button>
          <div className="project-panel__body">
            <span className="project-panel__ghost" aria-hidden="true">
              {String(project.position).padStart(2, '0')}
            </span>
            {placement === 'panel' && <ProjectArtworkCard project={project} compact />}
            <div className="project-panel__cat">{CATEGORY_LABEL[project.category]}</div>
            <h2 className="project-panel__title">{project.title}</h2>
            <div className="project-panel__rule" aria-hidden="true" />
            <div className="project-panel__meta">
              {project.year} · {project.tags.join(' · ')}
            </div>
            <p className="project-panel__desc">{rich(project.description)}</p>
            {project.links && project.links.length > 0 && (
              <div className="project-panel__links">
                <span className="project-panel__links-title">LINKS</span>
                {project.links.map((link) =>
                  link.url ? (
                    <a
                      key={link.label}
                      className="project-panel__link"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <span key={link.label} className="project-panel__link project-panel__link--empty">
                      {link.label}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        </motion.aside>
      )}
      {open && project && placement === 'center' && (
        <motion.div
          key={`art-${project.id}`}
          className="artwork-stage"
          initial={{ opacity: 0, y: 24, rotateY: -135 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          exit={{ opacity: 0, y: 24, rotateY: 135 }}
          transition={{ type: 'spring', stiffness: 30, damping: 11, mass: 1 }}
          style={{ transformPerspective: 1100 }}
          onAnimationComplete={() => setRippleLive(true)}
        >
          <ProjectArtworkCard project={project} live={rippleLive} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
