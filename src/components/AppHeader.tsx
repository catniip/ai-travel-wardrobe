import { ChevronDown, Pencil } from 'lucide-react'

const steps = ['Trip', 'Wardrobe', 'Preferences', 'Capsule']

interface AppHeaderProps {
  tripLabel: string
  onEditTrip: () => void
}

export function AppHeader({ tripLabel, onEditTrip }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-group">
        <a className="wordmark" href="#top" aria-label="Luma home">Luma</a>
        <span className="header-rule" />
        <button className="trip-switcher" type="button" onClick={onEditTrip}>
          {tripLabel} <ChevronDown size={15} strokeWidth={1.8} />
        </button>
      </div>

      <nav className="progress-nav" aria-label="Trip setup progress">
        {steps.map((step, index) => (
          <div className={`progress-step ${index === 3 ? 'is-current' : ''}`} key={step}>
            <span className="step-number">{index + 1}</span>
            <span>{step}</span>
            {index < steps.length - 1 ? <span className="step-line" /> : null}
          </div>
        ))}
      </nav>

      <div className="header-actions">
        <button className="button button-quiet" type="button" onClick={onEditTrip}><Pencil size={15} /> Edit trip</button>
        <div className="avatar" aria-label="Profile">L</div>
      </div>
    </header>
  )
}
