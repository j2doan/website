# Portfolio

My cinematic portfolio, built as an immersive 3D world.

## Features

- Persistent Three.js world rendered with React Three Fiber
- Particle-based humanoid generated from an anatomical OBJ reference mesh
- Smooth camera movement between seven portfolio sections
- Orbiting project nodes with reversible particle transitions
- Project detail panels with artwork cards and responsive placement
- Cinematic startup screen with High VFX, Low VFX, and audio choices
- Configurable background music and interaction sound effects
- Low VFX mode for reduced particle, post-processing, and animation cost
- Keyboard navigation, wheel navigation, focus states, and portrait-mode guidance
- Data-driven project and portfolio content

## Technology

- React 18
- TypeScript
- Vite
- Three.js
- React Three Fiber and Drei
- React Three Postprocessing
- Framer Motion
- Zustand

## View Locally

The Portfolio is designed for a modern browser with WebGL support. To run it
locally from the project directory:

```bash
npm install
npm run dev
```

Then open the local address shown by Vite in a browser. Landscape viewing is
recommended, and portrait devices are shown a rotate-device prompt.

## Project Structure

```text
src/
├── audio/       Audio configuration, manager, hooks, and source files
├── config/      Section and motion configuration
├── content/     Portfolio content, project data, and artwork
├── hooks/       Navigation, startup, and responsive behavior hooks
├── loader/      Startup asset preloading
├── quality/     Device quality detection and performance settings
├── store/       Zustand application state and persisted preferences
├── three/       Scene, camera, particle systems, effects, and transitions
├── theme/       Shared visual palettes
└── ui/          Overlay panels, navigation, startup screen, and artwork cards

public/
└── favicon.svg

archive/         Retired visual experiments and development utilities
```

## Editing Portfolio Content

Most content can be changed without touching the 3D scene.

| Content | File |
| --- | --- |
| Profile, tagline, and contact links | `src/content/profile.ts` |
| Education | `src/content/education.ts` |
| Publications | `src/content/publications.ts` |
| Experience | `src/content/experience.ts` |
| Skills | `src/content/skills.ts` |
| Projects and project links | `src/content/projects.ts` |
| Project artwork and captions | `src/content/artwork.ts` |
| Section names, order, subtitles, and kinetic words | `src/config/sections.ts` |
| Camera poses and section lighting | `src/config/sections.ts` |
| Camera and transition timing | `src/config/motion.ts` |
| Shared colors | `src/theme/palette.ts` |

## Interaction Model

- Scroll or use the arrow keys to move through sections.
- Use number keys to jump to sections in registry order.
- Select a project orb or project-list entry to open its detail view.
- Use the `MAIN MENU` button or `Escape` to close a project.
- Open the gear icon to adjust BGM, SFX, and Low VFX settings.
- Portrait layouts display a rotate-device prompt rather than rendering the full scene.

## Performance

The application selects a quality tier using device capabilities and reduced-motion preferences. Different tiers adjust adjust particle counts, renderer pixel ratio, ocean density, and post-processing.

Low VFX can also be selected manually. It preserves the core experience while reducing decorative particle systems, burst particles, bloom, card glow, ripple effects, and transition animation.

## Project Artwork

Project images are stored in `src/content/images/` and imported explicitly by `src/content/artwork.ts`. Each project artwork entry is keyed by the corresponding project ID from `src/content/projects.ts`.

To add or replace artwork:

1. Add the image file to `src/content/images/`.
2. Import it in `src/content/artwork.ts`.
3. Assign it to the matching project entry.
4. Run `npm run build` to verify the asset is bundled.

## Audio

Audio is configured in `src/audio/AudioConfig.ts`.

- Background tracks are stored in `src/audio/audio_sources/bgm/`.
- Sound effects are stored in `src/audio/audio_sources/sfx/`.
- `AudioManager.ts` handles Web Audio initialization, buffering, playback, fades, and live volume changes.
- BGM and SFX volumes are persisted locally through the application store.

Audio is unlocked after a user gesture because of browser autoplay restrictions.

## Credits

Third-party media attribution and source links are recorded in `credits.txt`.
The file identifies the creators and sources of the music, sound effects,
reference mesh, and project artwork used in the Portfolio. 

The following media belongs to its respective creators and rights holders.
It is used here for a small personal portfolio project, is not presented as
original work, and will be replaced if a rights holder requests removal.
