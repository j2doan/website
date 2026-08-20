export function RotateScreen() {
  return (
    <div className="rotate-screen" role="status" aria-live="polite">
      <div className="rotate-screen__particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="rotate-screen__particle"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 7) * 0.7}s`,
            }}
          />
        ))}
      </div>
      <div className="rotate-screen__inner">
        <div className="rotate-screen__phone" aria-hidden="true">
          <div className="rotate-screen__phone-body">
            <div className="rotate-screen__phone-dot" />
          </div>
          <div className="rotate-screen__arc" />
        </div>
        <h1 className="rotate-screen__title">⟳</h1>
        <p className="rotate-screen__message">Please rotate your device.</p>
        <p className="rotate-screen__message">
          This experience was designed for landscape viewing.
        </p>
        <span className="rotate-screen__hint">DESKTOP · RESIZE YOUR WINDOW</span>
      </div>
    </div>
  )
}
