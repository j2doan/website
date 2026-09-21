import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useAppStore } from '../../store/useAppStore'

export function EffectStack() {
  const quality = useAppStore((s) => s.quality)
  // Canvas is created with antialias:false; high tier keeps a light MSAA pass,
  // lower tiers rely on the adaptive pixel ratio instead.
  const multisampling = quality.tier === 'high' ? 4 : 0
  if (quality.bloom) {
    return (
      <EffectComposer multisampling={multisampling}>
        <Bloom intensity={0.7} luminanceThreshold={0.18} mipmapBlur />
        <Vignette offset={0.3} darkness={0.85} />
      </EffectComposer>
    )
  }
  return <EffectComposer multisampling={multisampling}><Vignette offset={0.3} darkness={0.85} /></EffectComposer>
}
