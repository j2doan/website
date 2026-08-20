import { HUD } from './HUD'
import { SectionInfo } from './SectionTitle'
import { NavOrbit } from './NavOrbit'
import { ProjectPanel } from './ProjectPanel'
import { SystemPanel } from './SystemPanel'

export function OverlayUI() {
  return (
    <div className="overlay">
      <HUD />
      <SectionInfo />
      <NavOrbit />
      <ProjectPanel />
      <SystemPanel />
    </div>
  )
}
