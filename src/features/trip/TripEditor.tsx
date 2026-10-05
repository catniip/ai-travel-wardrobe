import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronLeft, Luggage, MapPin, Route, Sparkles, WashingMachine, X } from 'lucide-react'
import { activityOptions, getTripDays } from './tripConfig'
import type { TripActivity, TripConfig } from '../../lib/types'

interface TripEditorProps {
  open: boolean
  trip: TripConfig
  onClose: () => void
  onSave: (trip: TripConfig) => void
}

export function TripEditor({ open, trip, onClose, onSave }: TripEditorProps) {
  const [draft, setDraft] = useState<TripConfig>(trip)
  const [citiesText, setCitiesText] = useState(trip.cities.join(', '))
  const [error, setError] = useState('')
  const days = useMemo(() => getTripDays(draft), [draft])

  if (!open) return null

  const update = <K extends keyof TripConfig>(key: K, value: TripConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const toggleActivity = (activity: TripActivity) => {
    if (!draft.activities.includes(activity) && draft.activities.length >= 6) {
      setError('Choose up to six activity types so the capsule stays focused.')
      return
    }
    const next = draft.activities.includes(activity)
      ? draft.activities.filter((item) => item !== activity)
      : [...draft.activities, activity]
    update('activities', next)
  }

  const submit = () => {
    const cities = citiesText.split(',').map((city) => city.trim()).filter(Boolean)
    if (!draft.destination.trim()) return setError('Add a destination to continue.')
    if (!draft.startDate || !draft.endDate || new Date(draft.endDate) < new Date(draft.startDate)) return setError('Choose a valid date range.')
    if (!cities.length) return setError('Add at least one city or stop.')
    if (!draft.activities.length) return setError('Choose at least one activity.')
    onSave({ ...draft, destination: draft.destination.trim(), cities })
  }

  return (
    <div className="trip-editor-backdrop" role="presentation">
      <section className="trip-editor" role="dialog" aria-modal="true" aria-labelledby="trip-editor-title">
        <header className="trip-editor-header">
          <button className="editor-back" type="button" onClick={onClose}><ChevronLeft size={18} /> Back to capsule</button>
          <div className="editor-step"><span>1</span> Trip <i /> <span>2</span> Wardrobe <i /> <span>3</span> Optimize</div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close trip editor"><X /></button>
        </header>

        <div className="trip-editor-intro">
          <div><small>Trip setup</small><h1 id="trip-editor-title">Where are you going?</h1><p>Give us the constraints that actually change what belongs in your suitcase.</p></div>
          <aside><Sparkles size={18} /><span><strong>{days} days · {draft.activities.length} activities</strong>We’ll turn this into a compact set of packable scenarios.</span></aside>
        </div>

        <div className="trip-form">
          <section className="form-section route-section">
            <div className="form-section-title"><MapPin size={18} /><div><span>Route & dates</span><small>Start with the shape of the trip</small></div></div>
            <div className="form-grid">
              <label className="field field-wide"><span>Destination</span><input value={draft.destination} onChange={(event) => update('destination', event.target.value)} placeholder="e.g. Japan" /></label>
              <label className="field field-wide"><span>Cities or stops</span><div className="input-with-icon"><Route size={16} /><input value={citiesText} onChange={(event) => setCitiesText(event.target.value)} placeholder="Tokyo, Kyoto, Osaka" /></div><small>Separate stops with commas, in travel order.</small></label>
              <label className="field"><span>Departure</span><div className="input-with-icon"><CalendarDays size={16} /><input type="date" value={draft.startDate} onChange={(event) => update('startDate', event.target.value)} /></div></label>
              <label className="field"><span>Return</span><div className="input-with-icon"><CalendarDays size={16} /><input type="date" value={draft.endDate} onChange={(event) => update('endDate', event.target.value)} /></div></label>
            </div>
          </section>

          <section className="form-section activity-section">
            <div className="form-section-title"><Sparkles size={18} /><div><span>What will you do?</span><small>Select the moments your clothes need to cover</small></div></div>
            <div className="activity-options">
              {activityOptions.map((activity) => {
                const selected = draft.activities.includes(activity.id)
                return <button className={selected ? 'is-selected' : ''} type="button" onClick={() => toggleActivity(activity.id)} key={activity.id}><span>{selected ? <Check size={14} /> : null}</span><strong>{activity.label}</strong><small>{activity.description}</small></button>
              })}
            </div>
          </section>

          <section className="form-section constraint-section">
            <div className="form-section-title"><Luggage size={18} /><div><span>Packing reality</span><small>Space, laundry, and dress rules</small></div></div>
            <div className="form-grid">
              <label className="field"><span>Luggage</span><select value={draft.luggageType} onChange={(event) => update('luggageType', event.target.value as TripConfig['luggageType'])}><option value="carry-on">Carry-on only</option><option value="medium-suitcase">One medium suitcase</option><option value="large-suitcase">One large suitcase</option></select></label>
              <label className="field"><span>Laundry</span><div className="input-with-icon"><WashingMachine size={16} /><select value={draft.laundry} onChange={(event) => update('laundry', event.target.value as TripConfig['laundry'])}><option value="none">No laundry</option><option value="once">Once mid-trip</option><option value="frequent">Every few days</option></select></div></label>
              <label className="field field-wide range-field"><span>Capsule size <strong>{draft.luggageLimit} pieces</strong></span><input type="range" min="9" max="18" value={draft.luggageLimit} onChange={(event) => update('luggageLimit', Number(event.target.value))} /><small><span>Very compact</span><span>More options</span></small></label>
              <label className="field field-wide"><span>Special dress requirements</span><textarea rows={3} value={draft.dressRequirements} onChange={(event) => update('dressRequirements', event.target.value)} placeholder="Religious sites, formal dinner, business event…" /></label>
            </div>
          </section>

          <section className="form-section priority-section">
            <div className="form-section-title"><Sparkles size={18} /><div><span>Your priorities</span><small>Keep it light—two signals are enough</small></div></div>
            <label className="field range-field"><span>Travel photos <strong>{draft.photoImportance}%</strong></span><input type="range" min="0" max="100" value={draft.photoImportance} onChange={(event) => update('photoImportance', Number(event.target.value))} /><small><span>Not important</span><span>Essential</span></small></label>
            <label className="field range-field"><span>Outfit variety <strong>{draft.varietyImportance}%</strong></span><input type="range" min="0" max="100" value={draft.varietyImportance} onChange={(event) => update('varietyImportance', Number(event.target.value))} /><small><span>Repeat favorites</span><span>More variety</span></small></label>
          </section>
        </div>

        <footer className="trip-editor-footer">
          <div>{error ? <span className="form-error">{error}</span> : <span><strong>{draft.destination || 'Your trip'}</strong> · {days} days · {citiesText.split(',').filter(Boolean).length || 0} stops</span>}</div>
          <button className="button button-primary" type="button" onClick={submit}>Save & optimize <ArrowRight size={17} /></button>
        </footer>
      </section>
    </div>
  )
}
