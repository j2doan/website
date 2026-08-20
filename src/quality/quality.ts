export type QualityTier = 'high' | 'medium' | 'low'

export interface QualitySettings {
  tier: QualityTier
  particleCount: number
  innerParticleCount: number
  dpr: number
  bloom: boolean
  starsCount: number
  oceanCells: number
  reducedMotion: boolean
}

export function detectQuality(): QualitySettings {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)

  let tier: QualityTier = 'high'
  if (mobile || reducedMotion || cores <= 4 || memory <= 4) tier = 'low'
  else if (cores <= 6 || memory <= 6) tier = 'medium'

  switch (tier) {
    case 'low':
      return {
        tier,
        particleCount: 32000,
        innerParticleCount: 1600,
        dpr: 1,
        bloom: false,
        starsCount: 1200,
        oceanCells: 88,
        reducedMotion,
      }
    case 'medium':
      return {
        tier,
        particleCount: 66000,
        innerParticleCount: 2600,
        dpr: 1.25,
        bloom: true,
        starsCount: 2400,
        oceanCells: 120,
        reducedMotion,
      }
    default:
      return {
        tier,
        particleCount: 120000,
        innerParticleCount: 4000,
        dpr: 1.5,
        bloom: true,
        starsCount: 4000,
        oceanCells: 144,
        reducedMotion,
      }
  }
}
