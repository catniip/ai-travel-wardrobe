import { useMemo, useState } from 'react'
import { ArrowLeftRight, ArrowRight, Check, ChevronLeft, Sparkles, X } from 'lucide-react'
import type { ScoredGarment } from '../../lib/types'

export type WardrobeChoice = 'owned' | 'swap' | 'missing'

interface WardrobeChecklistProps {
  open: boolean
  items: ScoredGarment[]
  tripLabel: string
  onBack: () => void
  onSkip: () => void
  onConfirm: (choices: Record<string, WardrobeChoice>) => void
}

export function WardrobeChecklist({ open, items, tripLabel, onBack, onSkip, onConfirm }: WardrobeChecklistProps) {
  const initialChoices = useMemo(
    () => Object.fromEntries(items.map((item) => [item.garment.id, 'owned' as WardrobeChoice])),
    [items],
  )
  const [choices, setChoices] = useState<Record<string, WardrobeChoice>>(initialChoices)

  if (!open) return null

  const setChoice = (id: string, choice: WardrobeChoice) => {
    setChoices((current) => ({ ...current, [id]: choice }))
  }
  const ownedCount = Object.values(choices).filter((choice) => choice === 'owned').length
  const swapCount = Object.values(choices).filter((choice) => choice === 'swap').length

  return (
    <div className="wardrobe-check-backdrop">
      <section className="wardrobe-check" role="dialog" aria-modal="true" aria-labelledby="wardrobe-check-title">
        <header className="trip-editor-header">
          <button className="editor-back" type="button" onClick={onBack}><ChevronLeft size={18} /> Back to trip</button>
          <div className="editor-step"><span>1</span> Trip <i /> <span className="step-active">2</span> Wardrobe <i /> <span>3</span> Optimize</div>
          <button className="icon-button" type="button" onClick={onSkip} aria-label="Close wardrobe check"><X /></button>
        </header>

        <div className="wardrobe-check-intro">
          <div><small>Wardrobe check · {tripLabel}</small><h1 id="wardrobe-check-title">Start with suggestions,<br />not uploads.</h1><p>We found the smallest useful set for this trip. Just tell us what you already own—we’ll adapt the capsule around your answers.</p></div>
          <aside><Sparkles size={18} /><span><strong>No photos needed</strong>These are clothing types, not exact products. Choose the closest thing in your wardrobe.</span></aside>
        </div>

        <div className="suggestion-summary">
          <span><strong>{ownedCount}</strong> I own</span>
          <span><strong>{swapCount}</strong> need alternatives</span>
          <span><strong>{items.length - ownedCount - swapCount}</strong> unavailable</span>
        </div>

        <div className="suggestion-grid">
          {items.map(({ garment, coverage, reasons }) => {
            const choice = choices[garment.id] ?? 'owned'
            return (
              <article className={`suggestion-card choice-${choice}`} key={garment.id}>
                <div className="suggestion-image"><img src={garment.image} alt={garment.name} /><span>{coverage.length} scenarios</span></div>
                <div className="suggestion-copy"><small>{garment.category}</small><h2>{garment.name}</h2><p>{garment.rationale}</p><span>{reasons[0]}</span></div>
                <div className="ownership-control" aria-label={`Do you own ${garment.name}?`}>
                  <button className={choice === 'owned' ? 'is-active' : ''} type="button" onClick={() => setChoice(garment.id, 'owned')}><Check size={13} /> I have this</button>
                  <button className={choice === 'swap' ? 'is-active' : ''} type="button" onClick={() => setChoice(garment.id, 'swap')}><ArrowLeftRight size={13} /> Swap it</button>
                  <button className={choice === 'missing' ? 'is-active' : ''} type="button" onClick={() => setChoice(garment.id, 'missing')}><X size={13} /> Don’t have</button>
                </div>
              </article>
            )
          })}
        </div>

        <footer className="wardrobe-check-footer">
          <button className="button button-text" type="button" onClick={onSkip}>Skip — use suggestions</button>
          <div><span>{ownedCount} confirmed · {swapCount} to replace</span><button className="button button-primary" type="button" onClick={() => onConfirm(choices)}>Optimize what I own <ArrowRight size={17} /></button></div>
        </footer>
      </section>
    </div>
  )
}
