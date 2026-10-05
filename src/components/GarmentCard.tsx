import { Lock, LockOpen, X } from 'lucide-react'
import type { ScoredGarment } from '../lib/types'

interface GarmentCardProps {
  item: ScoredGarment
  selected: boolean
  onSelect: () => void
  onToggleLock: () => void
  onRemove: () => void
}

export function GarmentCard({ item, selected, onSelect, onToggleLock, onRemove }: GarmentCardProps) {
  const { garment } = item
  return (
    <article className={`garment-card ${selected ? 'is-selected' : ''}`}>
      <button className="garment-main" type="button" onClick={onSelect} aria-pressed={selected}>
        <span className="garment-image-wrap">
          <img src={garment.image} alt={garment.name} className="garment-image" />
        </span>
        <span className="garment-name">{garment.name}</span>
      </button>
      <div className="garment-actions">
        <button
          className={`icon-button ${garment.status === 'required' ? 'is-active' : ''}`}
          type="button"
          onClick={onToggleLock}
          aria-label={garment.status === 'required' ? `Unlock ${garment.name}` : `Lock ${garment.name}`}
        >
          {garment.status === 'required' ? <Lock size={14} /> : <LockOpen size={14} />}
        </button>
        <button className="icon-button" type="button" onClick={onRemove} aria-label={`Remove ${garment.name}`}>
          <X size={15} />
        </button>
      </div>
    </article>
  )
}
