import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { CATEGORY_LABEL } from './meta'

export function Fallback() {
  return (
    <main className="fallback">
      <div className="fallback__title">{profile.codename}</div>
      <div className="fallback__tagline">{profile.tagline}</div>
      <div className="fallback__origin">{profile.origin}</div>
      <section className="fallback__projects">
        {projects.map((p) => (
          <article key={p.id} className="fallback__card">
            <div className="fallback__card-cat">{CATEGORY_LABEL[p.category]}</div>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <span>
              {p.year} · {p.tags.join(' · ')}
            </span>
          </article>
        ))}
      </section>
      <footer className="fallback__contact">
        {profile.contact.map((c) => (
          <span key={c.label}>{c.label}: {c.url}</span>
        ))}
      </footer>
    </main>
  )
}
