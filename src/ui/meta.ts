import type { Category } from '../content/types'
import { SECTIONS, formatSectionIndex, type SectionId } from '../config/sections'

// Derived from the central section registry so labels stay in sync with the
// actual order/count of sections.
export const SECTION_META: Record<
  SectionId,
  { index: string; title: string; subtitle: string }
> = Object.fromEntries(
  SECTIONS.map((s, i) => [
    s.id,
    { index: formatSectionIndex(i), title: s.title, subtitle: s.subtitle },
  ]),
) as Record<SectionId, { index: string; title: string; subtitle: string }>

export const CATEGORY_LABEL: Record<Category, string> = {
  'software-engineering': 'SOFTWARE ENGINEERING',
  'machine-learning': 'MACHINE LEARNING',
  'data-viz': 'DATA / VISUALIZATION',
  research: 'RESEARCH',
}
