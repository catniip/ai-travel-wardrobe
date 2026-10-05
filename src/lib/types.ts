export type GarmentCategory = 'top' | 'bottom' | 'layer' | 'dress' | 'shoe' | 'accessory'
export type GarmentStatus = 'required' | 'optional' | 'excluded'

export interface Garment {
  id: string
  name: string
  shortName: string
  category: GarmentCategory
  color: string
  warmth: number
  dressiness: number
  versatility: number
  photoScore: number
  styleTags: string[]
  weatherTags: string[]
  activityTags: string[]
  image: string
  rationale: string
  status: GarmentStatus
}

export interface TripScenario {
  id: string
  day: number
  title: string
  destination: string
  temperature: string
  note: string
  activities: string[]
  weatherTags: string[]
  dressiness: number
  photoImportance: number
  image: string
}

export interface Preferences {
  stylePriority: number
  repeatTolerance: number
  photoImportance: number
  luggageLimit: number
}

export type TripActivity =
  | 'cafe'
  | 'museum'
  | 'sightseeing'
  | 'market'
  | 'beach'
  | 'hiking'
  | 'dinner'
  | 'nightlife'
  | 'religious'
  | 'formal'
  | 'business'

export interface TripConfig {
  destination: string
  cities: string[]
  startDate: string
  endDate: string
  activities: TripActivity[]
  luggageType: 'carry-on' | 'medium-suitcase' | 'large-suitcase'
  luggageLimit: number
  laundry: 'none' | 'once' | 'frequent'
  dressRequirements: string
  photoImportance: number
  varietyImportance: number
}

export interface ScoredGarment {
  garment: Garment
  total: number
  coverage: string[]
  reasons: string[]
}

export interface Outfit {
  id: string
  scenarioId: string
  garmentIds: string[]
  title: string
  subtitle: string
}

export interface OptimizationResult {
  selected: ScoredGarment[]
  excluded: ScoredGarment[]
  outfits: Outfit[]
  coverage: Record<string, number>
  gap?: string
}
