import { Check, Lock, RotateCcw, X } from 'lucide-react'
import type { Garment, Preferences } from '../lib/types'

interface RefineDrawerProps {
  open: boolean
  garments: Garment[]
  preferences: Preferences
  onClose: () => void
  onPreferences: (value: Preferences) => void
  onStatus: (id: string, status: Garment['status']) => void
  onReset: () => void
}

export function RefineDrawer({ open, garments, preferences, onClose, onPreferences, onStatus, onReset }: RefineDrawerProps) {
  if (!open) return null
  const update = (key: keyof Preferences, value: number) => onPreferences({ ...preferences, [key]: value })
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="refine-drawer" role="dialog" aria-modal="true" aria-labelledby="refine-heading" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div><small>Refine capsule</small><h2 id="refine-heading">Make it feel more like you.</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close refinements"><X /></button>
        </div>

        <div className="preference-control">
          <div><label htmlFor="style">Style over practicality</label><strong>{preferences.stylePriority}%</strong></div>
          <input id="style" type="range" min="0" max="100" value={preferences.stylePriority} onChange={(event) => update('stylePriority', Number(event.target.value))} />
          <span><small>More practical</small><small>More stylish</small></span>
        </div>
        <div className="preference-control">
          <div><label htmlFor="repeat">Comfort repeating pieces</label><strong>{preferences.repeatTolerance}%</strong></div>
          <input id="repeat" type="range" min="0" max="100" value={preferences.repeatTolerance} onChange={(event) => update('repeatTolerance', Number(event.target.value))} />
          <span><small>More variety</small><small>Repeat favorites</small></span>
        </div>
        <div className="preference-control">
          <div><label htmlFor="photos">Travel photo importance</label><strong>{preferences.photoImportance}%</strong></div>
          <input id="photos" type="range" min="0" max="100" value={preferences.photoImportance} onChange={(event) => update('photoImportance', Number(event.target.value))} />
          <span><small>Low</small><small>Essential</small></span>
        </div>
        <div className="preference-control luggage-control">
          <div><label htmlFor="luggage">Luggage limit</label><strong>{preferences.luggageLimit} pieces</strong></div>
          <input id="luggage" type="range" min="9" max="15" value={preferences.luggageLimit} onChange={(event) => update('luggageLimit', Number(event.target.value))} />
        </div>

        <div className="candidate-heading"><h3>Candidate clothes</h3><span>Lock or leave behind</span></div>
        <div className="candidate-list">
          {garments.map((garment) => (
            <div className="candidate-row" key={garment.id}>
              <img src={garment.image} alt="" />
              <span><strong>{garment.name}</strong><small>{garment.color} · {garment.styleTags.slice(0, 2).join(' · ')}</small></span>
              <div>
                <button className={garment.status === 'required' ? 'is-active' : ''} type="button" onClick={() => onStatus(garment.id, garment.status === 'required' ? 'optional' : 'required')} aria-label={`Lock ${garment.name}`}><Lock size={14} /></button>
                <button className={garment.status === 'excluded' ? 'is-excluded' : ''} type="button" onClick={() => onStatus(garment.id, garment.status === 'excluded' ? 'optional' : 'excluded')} aria-label={`Exclude ${garment.name}`}>{garment.status === 'excluded' ? <X size={14} /> : <Check size={14} />}</button>
              </div>
            </div>
          ))}
        </div>
        <div className="drawer-footer">
          <button className="button button-quiet" type="button" onClick={onReset}><RotateCcw size={15} /> Reset</button>
          <button className="button button-primary" type="button" onClick={onClose}>Apply changes</button>
        </div>
      </aside>
    </div>
  )
}
