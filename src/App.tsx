import { useEffect, useMemo, useState, useTransition } from 'react'
import { ArrowRight, Check, RefreshCw, SlidersHorizontal, Sparkles, Umbrella, X } from 'lucide-react'
import { AppHeader } from './components/AppHeader'
import { CapsuleCanvas } from './components/CapsuleCanvas'
import { OutfitRail } from './components/OutfitRail'
import { RefineDrawer } from './components/RefineDrawer'
import { ScenarioRail } from './components/ScenarioRail'
import { garments as seedGarments } from './data/demo'
import { TripEditor } from './features/trip/TripEditor'
import { buildTripScenarios, defaultTrip, getTripDays, getTripLabel } from './features/trip/tripConfig'
import { optimizeCapsule } from './lib/optimizer/optimize'
import type { Garment, Preferences, TripConfig } from './lib/types'

const STORAGE_KEY = 'luma-travel-wardrobe-v2'
const defaultPreferences: Preferences = { stylePriority: 72, repeatTolerance: 64, photoImportance: 86, luggageLimit: 12 }

interface SavedState {
  garments: Garment[]
  preferences: Preferences
  trip: TripConfig
}

function loadSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedState>
      return {
        garments: parsed.garments ?? seedGarments,
        preferences: parsed.preferences ?? defaultPreferences,
        trip: parsed.trip ?? defaultTrip,
      }
    }
  } catch {
    // The seeded experience remains fully usable when storage is unavailable.
  }
  return { garments: seedGarments, preferences: defaultPreferences, trip: defaultTrip }
}

export function App() {
  const [saved, setSaved] = useState<SavedState>(loadSavedState)
  const [selectedGarmentId, setSelectedGarmentId] = useState('black-dress')
  const [selectedScenarioId, setSelectedScenarioId] = useState('dinner')
  const [dislikedOutfits, setDislikedOutfits] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tripEditorOpen, setTripEditorOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  }, [saved])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const tripScenarios = useMemo(() => buildTripScenarios(saved.trip), [saved.trip])
  const result = useMemo(
    () => optimizeCapsule(saved.garments, tripScenarios, saved.preferences, dislikedOutfits),
    [saved.garments, saved.preferences, tripScenarios, dislikedOutfits],
  )
  const selectedGarments = result.selected.map((item) => item.garment)

  const updateStatus = (id: string, status: Garment['status']) => {
    startTransition(() => {
      setSaved((current) => ({
        ...current,
        garments: current.garments.map((item) => item.id === id ? { ...item, status } : item),
      }))
      if (status === 'excluded' && selectedGarmentId === id) setSelectedGarmentId('trench')
    })
  }

  const reset = () => {
    setSaved({ garments: seedGarments, preferences: defaultPreferences, trip: defaultTrip })
    setDislikedOutfits([])
    setSelectedGarmentId('black-dress')
    setSelectedScenarioId('dinner')
    setToast('Demo trip restored')
  }

  const regenerate = () => {
    startTransition(() => {
      setDislikedOutfits((current) => [...current])
      setToast('Capsule re-optimized around your choices')
    })
  }

  const saveTrip = (trip: TripConfig) => {
    const nextScenarios = buildTripScenarios(trip)
    startTransition(() => {
      setSaved((current) => ({
        ...current,
        trip,
        preferences: {
          ...current.preferences,
          luggageLimit: trip.luggageLimit,
          photoImportance: trip.photoImportance,
          stylePriority: trip.varietyImportance,
        },
      }))
      setSelectedScenarioId(nextScenarios[0]?.id ?? 'sightseeing')
      setDislikedOutfits([])
      setTripEditorOpen(false)
      setToast(`${trip.destination} trip optimized`)
    })
  }

  return (
    <div className="app" id="top">
      <AppHeader tripLabel={getTripLabel(saved.trip)} onEditTrip={() => setTripEditorOpen(true)} />
      <main>
        <section className="hero-row">
          <div className="hero-copy">
            <p className="mobile-trip-label">{getTripDays(saved.trip)} days · {saved.trip.destination}</p>
            <h1>Your suitcase, resolved.</h1>
            <p>{result.selected.length} pieces create 9 outfits across every moment of your trip.</p>
          </div>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={() => setToast('Packing list saved — bon voyage!')}><Sparkles size={17} /> Pack this capsule <ArrowRight size={17} /></button>
            <button className="button button-text" type="button" onClick={() => setDrawerOpen(true)}><SlidersHorizontal size={17} /> Refine</button>
          </div>
        </section>

        <div className={`workspace ${isPending ? 'is-updating' : ''}`}>
          <CapsuleCanvas
            items={result.selected}
            selectedId={selectedGarmentId}
            luggageLimit={saved.preferences.luggageLimit}
            onSelect={setSelectedGarmentId}
            onToggleLock={(id) => {
              const garment = saved.garments.find((item) => item.id === id)
              if (garment) updateStatus(id, garment.status === 'required' ? 'optional' : 'required')
            }}
            onRemove={(id) => updateStatus(id, 'excluded')}
            onOpenLeftBehind={() => setInsightsOpen((value) => !value)}
          />
          <ScenarioRail
            scenarios={tripScenarios}
            selectedId={selectedScenarioId}
            outfits={result.outfits}
            garments={selectedGarments}
            coverage={result.coverage}
            onSelect={setSelectedScenarioId}
          />
        </div>

        <div className="control-strip">
          <span>Style <span aria-hidden="true">↔</span> Practicality</span>
          <small>More stylish</small>
          <input
            type="range"
            min="0"
            max="100"
            value={100 - saved.preferences.stylePriority}
            aria-label="Style versus practicality"
            onChange={(event) => setSaved((current) => ({ ...current, preferences: { ...current.preferences, stylePriority: 100 - Number(event.target.value) } }))}
          />
          <small>More practical</small>
          <button className="button button-quiet" type="button" onClick={regenerate}><RefreshCw size={16} className={isPending ? 'spin' : ''} /> Regenerate capsule</button>
        </div>

        <OutfitRail
          outfits={result.outfits}
          scenarios={tripScenarios}
          garments={selectedGarments}
          selectedScenarioId={selectedScenarioId}
          tripDescription={`From ${saved.trip.cities[0] ?? saved.trip.destination} to ${saved.trip.cities.at(-1) ?? saved.trip.destination}, styled for your real trip.`}
          onSelectScenario={setSelectedScenarioId}
          onDislike={(id) => {
            setDislikedOutfits((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
            setToast('Look swapped — your preference was remembered')
          }}
        />

        <section className={`insights ${insightsOpen ? 'is-open' : ''}`} aria-label="Packing insights">
          <div className="insight-block">
            <span className="insight-icon"><Check /></span>
            <div><small>What you can remove</small><h2>Three pieces can stay home.</h2><p>The white shirt, dark denim, and evening heels repeat jobs already handled by more versatile pieces.</p></div>
            <div className="left-behind-images">
              {result.excluded.slice(0, 3).map(({ garment }) => <img src={garment.image} alt={garment.name} key={garment.id} />)}
            </div>
          </div>
          <div className="insight-block gap-block">
            <span className="insight-icon"><Umbrella /></span>
            <div><small>One possible gap</small><h2>{result.gap ?? 'Every weather scenario is covered.'}</h2><p>Your trench handles light rain; add a shell only if the forecast turns persistent.</p></div>
          </div>
        </section>
      </main>

      <RefineDrawer
        open={drawerOpen}
        garments={saved.garments}
        preferences={saved.preferences}
        onClose={() => setDrawerOpen(false)}
        onPreferences={(preferences) => setSaved((current) => ({ ...current, preferences }))}
        onStatus={updateStatus}
        onReset={reset}
      />

      <TripEditor
        key={`${saved.trip.destination}-${saved.trip.startDate}-${tripEditorOpen}`}
        open={tripEditorOpen}
        trip={saved.trip}
        onClose={() => setTripEditorOpen(false)}
        onSave={saveTrip}
      />

      {toast ? <div className="toast" role="status"><Check size={16} /> {toast}<button type="button" onClick={() => setToast(null)} aria-label="Dismiss"><X size={14} /></button></div> : null}
    </div>
  )
}
