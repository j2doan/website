// ---------------------------------------------------------------------------
// Click pulse feedback.
//
// Subtle, premium cursor feedback: a small expanding ring at the click point
// whenever the user clicks something interactive. Skipped under reduced motion.
// ---------------------------------------------------------------------------

export function pulseAt(x: number, y: number): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const el = document.createElement('span')
  el.className = 'click-pulse'
  el.style.left = `${x}px`
  el.style.top = `${y}px`
  document.body.appendChild(el)
  el.addEventListener('animationend', () => el.remove(), { once: true })
  window.setTimeout(() => el.remove(), 700)
}

function isInteractive(target: HTMLElement | null): boolean {
  if (!target) return false
  if (target.closest('button, a, input, select, textarea, [role="switch"], [data-pulse]')) {
    return true
  }
  // Clicking the 3D canvas (orbs) counts as interacting with the scene.
  return target.tagName === 'CANVAS'
}

export function installClickPulse(): () => void {
  const onPointerDown = (e: PointerEvent) => {
    if (isInteractive(e.target as HTMLElement | null)) {
      pulseAt(e.clientX, e.clientY)
    }
  }
  window.addEventListener('pointerdown', onPointerDown)
  return () => window.removeEventListener('pointerdown', onPointerDown)
}
