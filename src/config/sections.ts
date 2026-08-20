// ---------------------------------------------------------------------------
// Central section registry.
//
// Single source of truth for every section: order, UI labels, keyboard
// shortcut, kinetic background word, camera pose, and lighting/bg treatment.
//
// Adding a new section (future): push one SectionDef here. Nav, camera,
// lighting, KineticType, keyboard shortcuts, and indices all derive from this
// list automatically — do NOT hardcode section counts or positions elsewhere.
// ---------------------------------------------------------------------------

export type SectionId =
  | 'profile'
  | 'education'
  | 'publications'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'linktree'

export interface SectionDef {
  id: SectionId
  /** UI title shown in nav / panel header. */
  title: string
  /** Subtitle shown under the panel header. */
  subtitle: string
  /** Oversized editorial word rendered by KineticType for this section. */
  kineticWord: string
  /** Cinematic camera pose for this section (must stay exact once tuned). */
  camera: {
    position: [number, number, number]
    target: [number, number, number]
    fov: number
  }
  /** Lighting + background treatment for this section. */
  visual: {
    ambient: number
    keyColor: string
    keyPosition: [number, number, number]
    keyIntensity: number
    fog: number
    bg: string
  }
}

export const SECTIONS: SectionDef[] = [
  {
    id: 'profile',
    title: 'PROFILE',
    subtitle: 'About me.',
    kineticWord: '                        DATA SCIENCE',
    camera: { position: [0, 0.7, 10.5], target: [0, 2.6, 0], fov: 40 },
    visual: {
      ambient: 0.42,
      keyColor: '#9cc8ff',
      keyPosition: [3, 4, 5],
      keyIntensity: 1.5,
      fog: 0.011,
      bg: '#020308',
    },
  },
  {
    id: 'education',
    title: 'EDUCATION',
    subtitle: 'Academic background.',
    kineticWord: 'ACADEMICS',
    camera: { position: [6.0, 2.4, 6.5], target: [0, 2.5, 0], fov: 45 },
    visual: {
      ambient: 0.34,
      keyColor: '#7fa8ff',
      keyPosition: [-4, 3, 4],
      keyIntensity: 1.3,
      fog: 0.012,
      bg: '#03030c',
    },
  },
  {
    id: 'publications',
    title: 'PUBLICATIONS',
    subtitle: 'Research and papers.',
    kineticWord: 'RESEARCH',
    camera: { position: [8.3, 4.2, 3.4], target: [0, 2.5, 0], fov: 47 },
    visual: {
      ambient: 0.32,
      keyColor: '#a98bff',
      keyPosition: [-2, 5, 3],
      keyIntensity: 1.4,
      fog: 0.0125,
      bg: '#06030f',
    },
  },
  {
    id: 'experience',
    title: 'EXPERIENCE',
    subtitle: 'Career history.',
    kineticWord: 'CAREER',
    camera: { position: [6.1, 2.0, 4.6], target: [-0.8, 2.5, 0], fov: 46 },
    visual: {
      ambient: 0.36,
      keyColor: '#8fd0ff',
      keyPosition: [5, 2, -3],
      keyIntensity: 1.45,
      fog: 0.0115,
      bg: '#02050a',
    },
  },
  {
    id: 'projects',
    title: 'PROJECTS',
    subtitle: 'A collection of interests.',
    kineticWord: '                      REPOSITORIES',
    camera: { position: [0, 3.8, 9.4], target: [0, 1.8, 0], fov: 50 },
    visual: {
      ambient: 0.4,
      keyColor: '#9fe0ff',
      keyPosition: [0, 6, 0],
      keyIntensity: 1.6,
      fog: 0.01,
      bg: '#020a10',
    },
  },
  {
    id: 'skills',
    title: 'SKILLS',
    subtitle: 'Core proficiencies.',
    kineticWord: '                                            ABILITY',
    camera: { position: [-5.6, 2.4, 4.1], target: [0.8, 2.6, 0], fov: 45 },
    visual: {
      ambient: 0.35,
      keyColor: '#b9a0ff',
      keyPosition: [4, 3, 2],
      keyIntensity: 1.5,
      fog: 0.0115,
      bg: '#060510',
    },
  },
  {
    id: 'linktree',
    title: 'LINK TREE',
    subtitle: 'Stay connected.',
    kineticWord: '                                    NETWORK',
    camera: { position: [-3.6, 1.2, 7.0], target: [0, 2.5, 0], fov: 41 },
    visual: {
      ambient: 0.46,
      keyColor: '#e8ecf4',
      keyPosition: [2, 3, 5],
      keyIntensity: 1.3,
      fog: 0.0105,
      bg: '#020308',
    },
  },
]

/** Ordered ids — drives nav, camera interpolation, scroll mapping. */
export const SECTION_ORDER: SectionId[] = SECTIONS.map((s) => s.id)

export const SECTION_COUNT = SECTIONS.length

export function getSectionIndex(id: SectionId): number {
  return SECTION_ORDER.indexOf(id)
}

export function formatSectionIndex(position: number): string {
  return String(position).padStart(2, '0')
}

/** Keyboard shortcut key for a section, derived from registry order (0..n). */
export function sectionShortcutKey(position: number): string {
  return String(position)
}
