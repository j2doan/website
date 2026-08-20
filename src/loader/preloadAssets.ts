import { ARTWORK } from '../content/artwork'

/**
 * Collect the URLs that should be warmed before the experience begins.
 * Currently: project artwork images (src/content/artwork.ts). Adding an
 * image there automatically flows through the startup preload.
 */
function collectImageManifest(): string[] {
  const seen = new Set<string>()
  const urls: string[] = []
  for (const def of Object.values(ARTWORK)) {
    const src = (def?.src ?? '').trim()
    if (src && !seen.has(src)) {
      seen.add(src)
      urls.push(src)
    }
  }
  return urls
}

/** Preload and decode every manifest image before the scene becomes usable. */
export function preloadImages(): Promise<void> {
  const urls = collectImageManifest()
  if (urls.length === 0) return Promise.resolve()
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          const done = () => resolve()
          img.onload = () => {
            // Network load does not guarantee that the browser has decoded the
            // bitmap. Decode now so the project card can paint immediately.
            void img.decode().catch(() => undefined).finally(done)
          }
          img.onerror = done
          img.src = url
        }),
    ),
  ).then(() => undefined)
}
