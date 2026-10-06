import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronLeft, Luggage, MapPin, Plus, Route, Sparkles, Trash2, WashingMachine, X } from 'lucide-react'
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
  const [error, setError] = useState('')
  const days = useMemo(() => getTripDays(draft), [draft])
  const allocatedDays = useMemo(() => draft.stops.reduce((sum, stop) => sum + stop.days, 0), [draft.stops])

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

  const updateStop = (index: number, change: Partial<TripConfig['stops'][number]>) => {
    update('stops', draft.stops.map((stop, stopIndex) => stopIndex === index ? { ...stop, ...change } : stop))
  }

  const addStop = () => {
    update('stops', [...draft.stops, { id: `stop-${Date.now()}`, city: '', days: 1 }])
  }

  const removeStop = (index: number) => {
    if (draft.stops.length === 1) return
    update('stops', draft.stops.filter((_, stopIndex) => stopIndex !== index))
  }

  const submit = () => {
    if (!draft.destination.trim()) return setError('Add a destination to continue.')
    if (!draft.startDate || !draft.endDate || new Date(draft.endDate) < new Date(draft.startDate)) return setError('Choose a valid date range.')
    if (!draft.stops.length || draft.stops.some((stop) => !stop.city.trim())) return setError('Add a city name for every stop.')
    if (allocatedDays !== days) return setError(`Your stays add up to ${allocatedDays} days, but the trip is ${days} days.`)
    if (!draft.activities.length) return setError('Choose at least one activity.')
    onSave({ ...draft, destination: draft.destination.trim(), stops: draft.stops.map((stop) => ({ ...stop, city: stop.city.trim() })) })
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
              <div className="field field-wide route-builder">
                <span><span>Cities & stay length</span><strong>{allocatedDays} / {days} days</strong></span>
                <div className="route-stop-list">
                  {draft.stops.map((stop, index) => (
                    <div className="route-stop-row" key={stop.id}>
                      <span className="stop-order">{index + 1}</span>
                      <div className="input-with-icon"><Route size={16} /><input aria-label={`City ${index + 1}`} value={stop.city} onChange={(event) => updateStop(index, { city: event.target.value })} placeholder="City or region" /></div>
                      <label><input aria-label={`Days in ${stop.city || `stop ${index + 1}`}`} type="number" min="1" max="30" value={stop.days} onChange={(event) => updateStop(index, { days: Math.max(1, Number(event.target.value)) })} /><span>days</span></label>
                      <button type="button" onClick={() => removeStop(index)} disabled={draft.stops.length === 1} aria-label={`Remove ${stop.city || `stop ${index + 1}`}`}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
                <button className="add-stop" type="button" onClick={addStop}><Plus size={15} /> Add another stop</button>
                <small className={allocatedDays !== days ? 'stay-warning' : ''}>{allocatedDays === days ? 'Perfect — every travel day is assigned.' : `Assign ${Math.abs(days - allocatedDays)} ${days > allocatedDays ? 'more' : 'fewer'} day${Math.abs(days - allocatedDays) === 1 ? '' : 's'}.`}</small>
              </div>
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
          <div>{error ? <span className="form-error">{error}</span> : <span><strong>{draft.destination || 'Your trip'}</strong> · {days} days · {draft.stops.length} stops</span>}</div>
          <button className="button button-primary" type="button" onClick={submit}>Continue to wardrobe <ArrowRight size={17} /></button>
        </footer>
      </section>
    </div>
  )
}
