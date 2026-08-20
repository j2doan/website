import { useEffect, useState } from 'react'
import { PORTRAIT_GATE_ENABLED } from '../config/viewport'

/**
 * Returns true when the portrait interstitial is enabled and the viewport is
 * portrait AND narrower than a tablet, i.e. a phone held upright.
 */
export function usePortraitGate(): boolean {
  const [portrait, setPortrait] = useState<boolean>(() => {
    if (!PORTRAIT_GATE_ENABLED || typeof window === 'undefined') return false
    const mq = window.matchMedia('(orientation: portrait)')
    return mq.matches && window.innerWidth < 820
  })

  useEffect(() => {
    if (!PORTRAIT_GATE_ENABLED) return
    const mq = window.matchMedia('(orientation: portrait)')
    const update = () => {
      setPortrait(mq.matches && window.innerWidth < 820)
    }
    update()
    if (mq.addEventListener) mq.addEventListener('change', update)
    else (mq as MediaQueryList).addListener(update)
    window.addEventListener('resize', update)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      else (mq as MediaQueryList).removeListener(update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return portrait
}
