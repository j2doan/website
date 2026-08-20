import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { useAppStore } from '../../store/useAppStore'

export function EffectStack() {
  const quality = useAppStore((s) => s.quality)
  const lowFx = useAppStore((s) => s.lowFx)
  // Low VFX drops bloom entirely — it's the most expensive post-processing
  // pass — while keeping the cheap vignette/noise grain for the film look.
  // Canvas is created with antialias:false; high tier keeps a light MSAA pass,
  // lower tiers rely on the adaptive pixel ratio instead.
  const multisampling = quality.tier === 'high' ? 4 : 0
  if (quality.bloom && !lowFx) {
    return (
      <EffectComposer multisampling={multisampling}>
        <Bloom intensity={0.7} luminanceThreshold={0.18} mipmapBlur />
        <Vignette offset={0.3} darkness={0.85} />
        <Noise opacity={0.03} />
      </EffectComposer>
    )
  }
  return (
    <EffectComposer multisampling={multisampling}>
      <Vignette offset={0.3} darkness={0.85} />
      <Noise opacity={0.03} />
    </EffectComposer>
  )
}
