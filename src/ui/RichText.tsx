import type { ReactNode } from 'react'

/**
 * Render a content string with `**bold**` markers as <strong> segments.
 * Text between a pair of `**` is bold; everything else is plain.
 */
export function rich(text: string): ReactNode {
  const parts = text.split('**')
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  )
}
