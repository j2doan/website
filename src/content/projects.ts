import type { Project } from './types'
import { ORB_PALETTE } from '../theme/palette'

export const projects: Project[] = [
  {
    id: 'project-one',
    title: 'DSCForge',
    description:
      'An open-source Python package published on PyPI designed to streamline data science workflows. Developed a modular command-line interface (CLI), standardized project architecture, and comprehensive documentation to enhance reproducibility and developer efficiency across the lifecycle of data projects.',
    category: 'software-engineering',
    tags: ['python', 'cli', 'pypi', 'devops'],
    year: '2026',
    featured: true,
    position: 1,
    accent: ORB_PALETTE[0],
    links: [
      { label: 'GITHUB', url: 'https://github.com/j2doan/dscforge' },
      { label: 'PYPI', url: 'https://pypi.org/project/dscforge/' },
    ],
  },
  {
    id: 'project-two',
    title: 'Interactive Wildfire Narrative',
    description:
      'An interactive data storytelling platform analyzing 2,380+ NASA MODIS wildfire records. Features a time-animated geospatial map and a dynamic ranking system to visualize 10-year fire trends. Implemented a supervised classification model to predict wildfire occurrence from minimal temporal and regional inputs using custom preprocessing and feature encoding pipelines.',
    category: 'machine-learning',
    tags: ['geospatial', 'classification', 'web-dev', 'storytelling'],
    year: '2025',
    featured: true,
    position: 2,
    accent: ORB_PALETTE[1],
    links: [
      { label: 'GITHUB', url: 'https://github.com/j2doan/wildfire-interactive-narrative' },
      { label: 'Website', url: 'https://j2doan.github.io/wildfire-interactive-narrative/' },
    ],
  },
  {
    id: 'project-three',
    title: 'Geospatial Wildfire Monitoring',
    description:
      'A web-based monitoring application for real-time wildfire activity. Features a dynamic day-night cycle filter, intensity tracking, and a density curve plot to visualize fire concentration over time. Includes interactive filtering and intensity comparison tools.',
    category: 'data-viz',
    tags: ['geospatial', 'data-viz', 'web-dev'],
    year: '2025',
    featured: false,
    position: 3,
    accent: ORB_PALETTE[2],
    links: [
      { label: 'GITHUB', url: 'https://github.com/j2doan/geospatial-wildfire-monitoring' },
      { label: 'GITHUB', url: 'https://j2doan.github.io/geospatial-wildfire-monitoring/' },
    ],
  },
  {
    id: 'project-four',
    title: 'Amazon Purchase Verification & Classification',
    description:
      'Machine learning model designed to classify Amazon product reviews as verified purchases. Leveraged product review metadata to build a robust binary classification pipeline, focusing on pattern recognition in unstructured consumer data.',
    category: 'machine-learning',
    tags: ['classification', 'nlp', 'amazon'],
    year: '2025',
    featured: false,
    position: 4,
    accent: ORB_PALETTE[3],
    links: [{ label: 'GITHUB', url: 'https://github.com/j2doan/amazon-purchase-verification-ml' }],
  },
  {
    id: 'project-five',
    title: 'Goodreads Behavior Prediction Modeling',
    description:
      'Predictive modeling project analyzing user behavior and reading patterns on Goodreads. Developed machine learning models to forecast user activity based on historical engagement data, providing insights into consumer behavior patterns.',
    category: 'machine-learning',
    tags: ['modeling', 'predictive-analytics', 'behavioral-science'],
    year: '2025',
    featured: false,
    position: 5,
    accent: ORB_PALETTE[4],
    links: [{ label: 'GITHUB', url: 'https://github.com/j2doan/user-behavior-modeling' }],
  },
  {
    id: 'project-six',
    title: 'Distributed Network Gaming: Quoridor Kit PvP',
    description:
      'A LAN-based multiplayer game engine featuring a custom-built networking kit. Engineered real-time state synchronization and turn-based logic for low-latency matches between local players, demonstrating core concepts of socket programming and network architecture.',
    category: 'software-engineering',
    tags: ['networking', 'distributed-systems', 'game-dev'],
    year: '2026',
    featured: false,
    position: 6,
    accent: ORB_PALETTE[5],
    links: [{ label: 'GITHUB', url: 'https://github.com/j2doan/quoridor-kit-pvp' }],
  },
  {
    id: 'project-seven',
    title: 'Automated Event Log Processing',
    description:
      'A modular data engineering pipeline that automates the cleaning, transformation, and feature extraction of high-volume, noisy event logs. Implemented DVC (Data Version Control) to ensure data integrity, reproducibility, and consistent output across the pipeline.',
    category: 'software-engineering',
    tags: ['dvc', 'pipeline', 'data-engineering'],
    year: '2026',
    featured: false,
    position: 7,
    accent: ORB_PALETTE[6],
    links: [{ label: 'GITHUB', url: 'https://github.com/j2doan/automated-log-processing' }],
  },
  {
    id: 'project-eight',
    title: 'NLP Temporal Parsing',
    description:
      'A Natural Language Processing (NLP) pipeline designed to extract and normalize date expressions from unstructured text. Implemented a robust parsing logic to convert diverse temporal descriptions into standardized, machine-readable formats.',
    category: 'software-engineering',
    tags: ['nlp', 'parsing', 'data-processing'],
    year: '2026',
    featured: false,
    position: 8,
    accent: ORB_PALETTE[7],
    links: [{ label: 'GITHUB', url: 'https://github.com/j2doan/nlp-date-parsing' }],
  },
]

