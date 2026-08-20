export type Category =
  | 'software-engineering'
  | 'machine-learning'
  | 'data-viz'
  | 'research'

export interface Project {
  id: string
  title: string
  description: string
  category: Category
  tags: string[]
  year: string
  featured: boolean
  position: number
  accent: string
  links: { label: string; url: string }[]
}

export interface ExperienceEntry {
  id: string
  role: string
  organization: string
  period: string
  points: string[]
}

export interface Profile {
  codename: string
  title: string
  tagline: string
  tags: string[]
  origin: string
  creditsNote: string
  contact: { label: string; url: string }[]
}

export interface EducationEntry {
  id: string
  school: string
  degree: string
  gpa: string
  expected: string
}

export interface PublicationEntry {
  id: string
  title: string
  status: string
  venue: string
}

export interface SkillGroup {
  id: string
  title: string
  items: string[]
}
