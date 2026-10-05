import { CATEGORY_MINIMUMS, OPTIMIZATION_WEIGHTS as W } from './config'
import type {
  Garment,
  GarmentCategory,
  OptimizationResult,
  Outfit,
  Preferences,
  ScoredGarment,
  TripScenario,
} from '../types'

const overlap = (a: string[], b: string[]) => a.filter((value) => b.includes(value)).length

function compatibility(garment: Garment, scenario: TripScenario, preferences: Preferences) {
  const activityMatches = overlap(garment.activityTags, scenario.activities)
  const weatherMatches = overlap(garment.weatherTags, scenario.weatherTags)
  const dressDelta = Math.abs(garment.dressiness - scenario.dressiness)
  const dressCompatibility = Math.max(0, 1 - dressDelta / 4)
  const scenarioFit = activityMatches > 0 ? 1 : garment.versatility / 10
  const photoFit = (garment.photoScore / 10) * (scenario.photoImportance / 5)

  return (
    scenarioFit * W.scenarioCoverage +
    Math.min(1, weatherMatches) * W.weatherCompatibility +
    dressCompatibility * W.dressCompatibility +
    (garment.versatility / 10) * W.versatility +
    (photoFit * preferences.photoImportance * W.photoSuitability) / 100 +
    (garment.photoScore / 10) * (preferences.stylePriority / 100) * W.styleFit
  )
}

function getScore(
  garment: Garment,
  scenarios: TripScenario[],
  preferences: Preferences,
  alreadySelected: Garment[],
): ScoredGarment {
  const scenarioScores = scenarios.map((scenario) => ({
    id: scenario.id,
    score: compatibility(garment, scenario, preferences),
  }))
  const coverage = scenarioScores.filter(({ score }) => score >= 6.6).map(({ id }) => id)
  const redundantWith = alreadySelected.filter(
    (item) => item.category === garment.category && overlap(item.activityTags, garment.activityTags) >= 3,
  ).length
  const repeatBonus = (preferences.repeatTolerance / 100) * garment.versatility
  const total =
    scenarioScores.reduce((sum, item) => sum + item.score, 0) +
    repeatBonus -
    redundantWith * W.redundancyPenalty +
    (garment.status === 'required' ? W.lockedBonus : 0)

  const reasons = [
    coverage.length >= 5 ? `Works across ${coverage.length} scenarios` : `Covers ${coverage.length} key moments`,
    garment.versatility >= 8 ? 'High versatility' : 'Purposeful specialist',
  ]
  if (garment.weatherTags.includes('cool')) reasons.push('Adds a warm layer')
  if (garment.dressiness >= 4) reasons.push('Elevates evening looks')

  return { garment, total, coverage, reasons }
}

function chooseOutfit(
  scenario: TripScenario,
  selected: Garment[],
  dislikedOutfitIds: string[],
): Outfit {
  const rank = (items: Garment[]) =>
    [...items].sort((a, b) => {
      const bFit = overlap(b.activityTags, scenario.activities) * 3 - Math.abs(b.dressiness - scenario.dressiness)
      const aFit = overlap(a.activityTags, scenario.activities) * 3 - Math.abs(a.dressiness - scenario.dressiness)
      return bFit - aFit || b.versatility - a.versatility
    })

  const pick = (category: GarmentCategory) => rank(selected.filter((item) => item.category === category))
  const dress = pick('dress')[0]
  const useDress = scenario.dressiness >= 4 && dress
  const topChoices = pick('top')
  const bottomChoices = pick('bottom')
  const variant = dislikedOutfitIds.includes(`outfit-${scenario.id}`) ? 1 : 0
  const garmentIds = useDress
    ? [dress.id]
    : [topChoices[variant % Math.max(1, topChoices.length)]?.id, bottomChoices[variant % Math.max(1, bottomChoices.length)]?.id]
  const layer = pick('layer').find((item) => scenario.weatherTags.some((tag) => item.weatherTags.includes(tag)))
  const shoes = pick('shoe')[scenario.dressiness >= 4 ? 0 : variant % Math.max(1, pick('shoe').length)]
  const accessory = pick('accessory')[0]

  return {
    id: `outfit-${scenario.id}`,
    scenarioId: scenario.id,
    title: scenario.title,
    subtitle: scenario.note,
    garmentIds: [...garmentIds, layer?.id, shoes?.id, accessory?.id].filter(Boolean) as string[],
  }
}

export function optimizeCapsule(
  garments: Garment[],
  scenarios: TripScenario[],
  preferences: Preferences,
  dislikedOutfitIds: string[] = [],
): OptimizationResult {
  const available = garments.filter((item) => item.status !== 'excluded')
  const selected: Garment[] = available.filter((item) => item.status === 'required')

  for (const [category, minimum] of Object.entries(CATEGORY_MINIMUMS)) {
    while (selected.filter((item) => item.category === category).length < minimum) {
      const candidates = available
        .filter((item) => item.category === category && !selected.some((chosen) => chosen.id === item.id))
        .map((item) => getScore(item, scenarios, preferences, selected))
        .sort((a, b) => b.total - a.total)
      if (!candidates[0]) break
      selected.push(candidates[0].garment)
    }
  }

  while (selected.length < preferences.luggageLimit) {
    const candidates = available
      .filter((item) => !selected.some((chosen) => chosen.id === item.id))
      .map((item) => getScore(item, scenarios, preferences, selected))
      .sort((a, b) => b.total - a.total)
    if (!candidates[0]) break
    selected.push(candidates[0].garment)
  }

  const selectedScores = selected
    .map((item) => getScore(item, scenarios, preferences, selected.filter((chosen) => chosen.id !== item.id)))
    .sort((a, b) => b.total - a.total)
  const excludedScores = garments
    .filter((item) => !selected.some((chosen) => chosen.id === item.id))
    .map((item) => getScore(item, scenarios, preferences, selected))
    .sort((a, b) => b.total - a.total)
  const outfits = scenarios.map((scenario) => chooseOutfit(scenario, selected, dislikedOutfitIds))
  const coverage = Object.fromEntries(
    scenarios.map((scenario) => {
      const outfit = outfits.find((item) => item.scenarioId === scenario.id)
      const categories = new Set(
        outfit?.garmentIds.map((id) => selected.find((item) => item.id === id)?.category).filter(Boolean),
      )
      const complete = categories.has('dress') || (categories.has('top') && categories.has('bottom'))
      return [scenario.id, complete && categories.has('shoe') ? 100 : complete ? 82 : 58]
    }),
  )

  return {
    selected: selectedScores,
    excluded: excludedScores,
    outfits,
    coverage,
    gap: 'A packable rain shell would close the only weather gap.',
  }
}
