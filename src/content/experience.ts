import type { ExperienceEntry } from './types'

export const experience: ExperienceEntry[] = [
  {
    id: 'entry-one',
    role: 'Research Assistant',
    organization: 'MOSAIC Laboratory, Halıcıoğlu Data Science Institute',
    period: '2025 — Current',
    points: [
      '**Agent-Based Theory of Mind Modeling** Developed sequence-based neural models (LSTM) to infer latent beliefs, goals, and intentions of agents from graph-structured trajectory data. Designed workflow visualizations for publication. Conducted manuscript review to improve methodological consistency and technical accuracy.',
      '**NormWear Intervention Modeling** Developed preprocessing pipelines for patient datasets. Transformed raw clinical measurements into state, action, and reward representations for modeling. Performed exploratory analysis on surgical anesthesia data comprising 6,300 patients, ~1,000 time steps, and 975 physiological channels.',
    ],
  },
  {
    id: 'entry-two',
    role: 'Data Science Instructor & Guest Lecturer',
    organization: 'Canyon Crest Academy, DataJam',
    period: '2025 — Current',
    points: [
      '**Curriculum Design & Guest Lecturing** Co-developed 5+ weekly Python-based instructional notebooks using version control to deliver tailored data science guest lectures at Canyon Crest Academy. Distributed materials for adoption by instructors across 3+ different institutions.',
      '**Mentorship & Project Guidance** Prepared 10 competitive high school teams through end-to-end data science projects over 8-week project cycles. Guided problem formulation, data cleaning, exploratory analysis, and presentation development.',
    ],
  },
  {
    id: 'entry-three',
    role: 'Undergraduate Instructional Assistant',
    organization: 'Halıcıoğlu Data Science Institute',
    period: '2025 — Current',
    points: [
      '**Instruction & Student Engagement** Tutored 650+ students across multiple data science courses. Provided individualized support informed by insights into learning styles, challenges, and abilities. Facilitated office hours, hosted live review sessions, and resolved 350+ forum tickets to foster critical thinking and academic rigor.',
      '**Course Operations & Performance Assessment** Managed instructional logistics including Gradescope grading workflows, Canvas attendance tracking, and exam proctoring. Leveraged student performance data to support instructional improvements and enhance learning outcomes in large-enrollment courses.',
    ],
  },
]