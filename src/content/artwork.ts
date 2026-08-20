// Project artwork card data — the file you edit to change each project's card.
//
// Every field is optional at the component level, but keeping the entry here is
// the easiest way to set an image, title and caption per project.
//
//   src     — imported image URL. Images live in src/content/images/ and are
//             assigned below by filename. Leave '' to render the generated
//             placeholder instead.
//   title   — text shown on the card. Leave '' to fall back to the project title.
//   caption — short line beneath the artwork. Leave '' to fall back to the
//             project's category + year.
//
// Add a new project? Copy one of the entries below and change the key to the
// new project's id (from src/content/projects.ts).

export interface ArtworkDef {
  src: string
  title: string
  caption: string
}

// Explicit imports keep the card URLs reliable in both Vite dev and production
// builds, regardless of the image filename or bundler glob key format.
import amazonImage from './images/amazon.jpg'
import dscforgeImage from './images/dscforge.jpg'
import eventImage from './images/event.jpg'
import geoImage from './images/geo.jpg'
import goodreadsImage from './images/goodreads.jpg'
import nlpImage from './images/nlp.jpg'
import quoridorImage from './images/quoridor.jpg'
import wildfireImage from './images/wildfire.jpg'

export const ARTWORK: Record<string, ArtworkDef> = {
  'project-one': {
    src: dscforgeImage,
    title: '',
    caption: 'PYTHON · CLI · PYPI',
  },
  'project-two': {
    src: wildfireImage,
    title: '',
    caption: 'GEOSPATIAL · MACHINE LEARNING',
  },
  'project-three': {
    src: geoImage,
    title: '',
    caption: 'VISUALIZATION · WILDFIRE',
  },
  'project-four': {
    src: amazonImage,
    title: '',
    caption: 'CLASSIFICATION · REVIEWS',
  },
  'project-five': {
    src: goodreadsImage,
    title: '',
    caption: 'BEHAVIOR · MODELING',
  },
  'project-six': {
    src: quoridorImage,
    title: '',
    caption: 'LAN · MULTIPLAYER · GAME',
  },
  'project-seven': {
    src: eventImage,
    title: '',
    caption: 'PIPELINE · DVC',
  },
  'project-eight': {
    src: nlpImage,
    title: '',
    caption: 'NLP · PARSING',
  },
}
