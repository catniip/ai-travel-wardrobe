import { Check } from 'lucide-react'
import type { Garment, Outfit, TripScenario } from '../lib/types'

interface ScenarioRailProps {
  scenarios: TripScenario[]
  selectedId: string
  outfits: Outfit[]
  garments: Garment[]
  coverage: Record<string, number>
  onSelect: (id: string) => void
}

export function ScenarioRail({ scenarios, selectedId, outfits, garments, coverage, onSelect }: ScenarioRailProps) {
  const garmentMap = new Map(garments.map((item) => [item.id, item]))
  return (
    <aside className="scenario-rail" aria-labelledby="coverage-heading">
      <div className="rail-heading">
        <h2 id="coverage-heading">Covered, day by day</h2>
        <p>{outfits.length + 2} outfits · {scenarios.length} key scenarios · all set</p>
      </div>
      <div className="scenario-list">
        {scenarios.map((scenario) => {
          const outfit = outfits.find((item) => item.scenarioId === scenario.id)
          const selected = scenario.id === selectedId
          return (
            <button
              type="button"
              className={`scenario-row ${selected ? 'is-selected' : ''}`}
              onClick={() => onSelect(scenario.id)}
              key={scenario.id}
            >
              <span className="timeline-dot" />
              <span className="scenario-copy">
                <small>Day {scenario.day}</small>
                <strong>{scenario.title}</strong>
                <span>{scenario.temperature} · {scenario.note}</span>
              </span>
              {scenario.image ? (
                <img className="scenario-photo" src={scenario.image} alt="" />
              ) : (
                <span className="scenario-photo scenario-photo-fallback" aria-label={`${scenario.destination} visual preview`}><strong>{scenario.destination.slice(0, 2).toUpperCase()}</strong><small>{scenario.note}</small></span>
              )}
              <span className="scenario-pieces" aria-hidden="true">
                {outfit?.garmentIds.slice(0, 3).map((id) => {
                  const garment = garmentMap.get(id)
                  return garment ? <img src={garment.image} alt="" key={id} /> : null
                })}
              </span>
              <span className="coverage-check" title={`${coverage[scenario.id]}% covered`}><Check size={16} /></span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
