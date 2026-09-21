import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { profile } from '../content/profile'
import { education } from '../content/education'
import { publications } from '../content/publications'
import { experience } from '../content/experience'
import { skills } from '../content/skills'
import { projects } from '../content/projects'
import { openProject, transitionToSection } from '../three/TransitionManager'
import { useAppStore, type SectionId } from '../store/useAppStore'
import { SECTION_META, CATEGORY_LABEL } from './meta'
import { rich } from './RichText'
import { SECTION_ORDER } from '../config/sections'
import { acquireTransitionLock } from '../three/transitionLock'

function SectionStepper({ section }: { section: SectionId }) {
  const index = SECTION_ORDER.indexOf(section)
  const move = (nextIndex: number) => {
    if (!acquireTransitionLock()) return
    transitionToSection(nextIndex)
  }

  return (
    <div
      className={`section-stepper${index === 0 ? ' is-first' : index === SECTION_ORDER.length - 1 ? ' is-last' : ''}`}
      aria-label="Section navigation"
    >
      {index > 0 && (
        <button
          type="button"
          className="section-stepper__button"
          onClick={() => move(index - 1)}
        >
          <span aria-hidden="true">←</span> PREVIOUS
        </button>
      )}
      {index < SECTION_ORDER.length - 1 && (
        <button
          type="button"
          className="section-stepper__button"
          onClick={() => move(index + 1)}
        >
          NEXT <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  const match = text.match(/^\*\*(.+?)\*\*\s*(.*)$/)
  if (!match) return <li>{rich(text)}</li>
  return (
    <li className="section-info__bullet">
      <span className="section-info__bullet-title">{match[1]}</span>
      {match[2] && <span className="section-info__bullet-body">{rich(match[2])}</span>}
    </li>
  )
}

function SectionBody({ section }: { section: SectionId }) {
  switch (section) {
    case 'profile':
      return (
        <div className="section-info__body-content">
          <p className="section-info__origin">{rich(profile.origin)}</p>
          <div className="section-info__chips section-info__chips--profile">
            <div className="section-info__chip-row">
              {profile.tags.map((tag) => (
                <span key={tag} className="section-info__chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="section-info__credits">{profile.creditsNote}</p>
        </div>
      )
    case 'education':
      return (
        <div className="section-info__list">
          {education.map((e) => (
            <div key={e.id} className="section-info__entry">
              <div className="section-info__entry-title">{e.school}</div>
              <div className="section-info__entry-sub">
                {e.degree} · {e.gpa}
              </div>
              <div className="section-info__entry-meta">{e.expected}</div>
            </div>
          ))}
        </div>
      )
    case 'publications':
      return (
        <div className="section-info__list">
          {publications.map((p) => (
            <div key={p.id} className="section-info__entry">
              <div className="section-info__entry-title">{p.title}</div>
              <div className="section-info__entry-sub">
                {p.status} · {p.venue}
              </div>
            </div>
          ))}
        </div>
      )
    case 'experience':
      return (
        <div className="section-info__list">
          {experience.map((e) => (
            <div key={e.id} className="section-info__entry">
              <div className="section-info__entry-title">{e.role}</div>
              <div className="section-info__entry-sub">
                {e.organization} · {e.period}
              </div>
              <ul className="section-info__bullets">
                {e.points.map((point) => (
                  <Bullet key={point} text={point} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    case 'projects':
      return (
        <div className="section-info__body-content">
          <p className="section-info__origin">
            Click on a project below or select an orbiting orb.
          </p>
          {/* The list is driven by project data and uses the same opening path as
              the corresponding project orbs. */}
          <div className="project-list" aria-label="Projects">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                className="project-list__item"
                onClick={() => openProject(p.id)}
              >
                <span className="project-list__index">
                  {String(p.position).padStart(2, '0')}
                </span>
                <span className="project-list__body">
                  <span className="project-list__title">{p.title}</span>
                  <span className="project-list__meta">
                    {CATEGORY_LABEL[p.category]} · {p.year}
                  </span>
                </span>
                <span className="project-list__arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )
    case 'skills':
      return (
        <div className="section-info__chips">
          {skills.map((group) => (
            <div key={group.id} className="section-info__chip-group">
              <div className="section-info__chip-title">{group.title}</div>
              <div className="section-info__chip-row">
                {group.items.map((item) => (
                  <span key={item} className="section-info__chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    case 'linktree':
      return (
        <div className="section-info__links">
          {profile.contact.map((c) => (
            <div key={c.label} className="section-info__link-entry">
              <a
                className="project-panel__link"
                href={c.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${c.label} contact link`}
              >
                {c.label}
              </a>
            </div>
          ))}
        </div>
      )
  }
}

export function SectionInfo() {
  const section = useAppStore((s) => s.section)
  const view = useAppStore((s) => s.view)
  const backdropControls = useAnimationControls()
  const infoControls = useAnimationControls()

  useEffect(() => {
    if (view === 'detail') return

    backdropControls.set({ opacity: 0, rotate: -90 })
    infoControls.set({ opacity: 0, rotate: -90, clipPath: 'inset(0 100% 0 0 round 4px)' })
    void backdropControls.start(
      { opacity: 1, rotate: -4 },
      { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
    )
    void infoControls.start(
      { opacity: 1, rotate: 0, clipPath: 'inset(0 0% 0 0 round 4px)' },
      { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    )
  }, [backdropControls, infoControls, section, view])

  if (view === 'detail') return null
  const meta = SECTION_META[section]

  return (
    <motion.div className="section-info-stage">
        <motion.div
          className="section-info__backdrop"
          aria-hidden="true"
          initial={false}
          animate={backdropControls}
        />
        <motion.div
          className="section-info"
          initial={false}
          animate={infoControls}
        >
          <span className="section-info__ghost" aria-hidden="true">
            {meta.index}
          </span>
          <div className="section-info__content">
            <div className="section-info__head">
              <span className="section-info__index">{meta.index}</span>
              <h2 className="section-info__title">{meta.title}</h2>
            </div>
            <div className="section-info__rule" aria-hidden="true" />
            <div className="section-info__sub">{meta.subtitle}</div>
            <SectionBody section={section} />
            <SectionStepper section={section} />
          </div>
        </motion.div>
    </motion.div>
  )
}
