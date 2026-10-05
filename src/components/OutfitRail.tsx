import { ArrowLeftRight, ChevronRight, HeartOff } from 'lucide-react'
import type { Garment, Outfit, TripScenario } from '../lib/types'

interface OutfitRailProps {
  outfits: Outfit[]
  scenarios: TripScenario[]
  garments: Garment[]
  selectedScenarioId: string
  tripDescription: string
  onSelectScenario: (id: string) => void
  onDislike: (id: string) => void
}

export function OutfitRail({ outfits, scenarios, garments, selectedScenarioId, tripDescription, onSelectScenario, onDislike }: OutfitRailProps) {
  const garmentMap = new Map(garments.map((item) => [item.id, item]))
  const visible = [
    outfits.find((item) => item.scenarioId === selectedScenarioId),
    ...outfits.filter((item) => item.scenarioId !== selectedScenarioId),
  ].filter(Boolean).slice(0, 4) as Outfit[]

  return (
    <section className="outfit-section" aria-labelledby="outfit-heading">
      <div className="outfit-heading-row">
        <div>
          <h2 id="outfit-heading">Nine looks, one suitcase</h2>
          <p>{tripDescription}</p>
        </div>
      </div>
      <div className="outfit-rail">
        {visible.map((outfit, index) => {
          const scenario = scenarios.find((item) => item.id === outfit.scenarioId)!
          return (
            <article className={`outfit-card ${outfit.scenarioId === selectedScenarioId ? 'is-selected' : ''}`} key={outfit.id}>
              <button className="outfit-main" type="button" onClick={() => onSelectScenario(outfit.scenarioId)}>
                <span className="outfit-index">0{index + 1}</span>
                {scenario.image ? (
                  <img className="outfit-photo" src={scenario.image} alt={`${outfit.title} outfit`} />
                ) : (
                  <span className="outfit-photo outfit-photo-fallback" aria-label={`${scenario.destination} outfit preview`}><strong>{scenario.destination.slice(0, 2).toUpperCase()}</strong><small>{scenario.note}</small></span>
                )}
                <span className="outfit-copy"><strong>{outfit.title}</strong><small>{outfit.subtitle}</small></span>
                <span className="outfit-pieces">
                  {outfit.garmentIds.slice(0, 4).map((id) => {
                    const garment = garmentMap.get(id)
                    return garment ? <img src={garment.image} alt={garment.shortName} key={id} /> : null
                  })}
                </span>
              </button>
              <div className="outfit-actions">
                <button type="button" onClick={() => onDislike(outfit.id)}><ArrowLeftRight size={14} /> Swap</button>
                <button type="button" onClick={() => onDislike(outfit.id)}><HeartOff size={14} /> Not my style</button>
              </div>
            </article>
          )
        })}
        <button className="rail-next" type="button" aria-label="Show more outfits"><ChevronRight /></button>
      </div>
    </section>
  )
}
