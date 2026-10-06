import type { TripActivity, TripConfig, TripScenario } from '../../lib/types'

const scene = (index: number) => `/assets/scenes/scene-${String(index).padStart(2, '0')}.webp`

export const defaultTrip: TripConfig = {
  destination: 'France',
  stops: [
    { id: 'paris', city: 'Paris', days: 4 },
    { id: 'provence', city: 'Provence', days: 3 },
    { id: 'nice', city: 'Nice', days: 3 },
  ],
  startDate: '2026-05-08',
  endDate: '2026-05-17',
  activities: ['cafe', 'museum', 'sightseeing', 'market', 'beach', 'dinner'],
  luggageType: 'medium-suitcase',
  luggageLimit: 12,
  laundry: 'once',
  dressRequirements: 'One elegant Michelin-star dinner',
  photoImportance: 86,
  varietyImportance: 72,
}

export function normalizeTrip(input?: Partial<TripConfig> & { cities?: string[] }): TripConfig {
  if (!input) return defaultTrip
  const merged = { ...defaultTrip, ...input }
  if (Array.isArray(input.stops) && input.stops.length) {
    return {
      ...merged,
      stops: input.stops.map((stop, index) => ({
        id: stop.id || `stop-${index + 1}`,
        city: stop.city || merged.destination,
        days: Math.max(1, Number(stop.days) || 1),
      })),
    }
  }

  const legacyCities = Array.isArray(input.cities) && input.cities.length ? input.cities : defaultTrip.stops.map((stop) => stop.city)
  const totalDays = getTripDays(merged as TripConfig)
  const baseDays = Math.floor(totalDays / legacyCities.length)
  const remainder = totalDays % legacyCities.length
  return {
    ...merged,
    stops: legacyCities.map((city, index) => ({
      id: `stop-${index + 1}`,
      city,
      days: Math.max(1, baseDays + (index < remainder ? 1 : 0)),
    })),
  }
}

export const activityOptions: Array<{ id: TripActivity; label: string; description: string }> = [
  { id: 'sightseeing', label: 'Sightseeing', description: 'Long city days' },
  { id: 'cafe', label: 'Café', description: 'Relaxed, polished' },
  { id: 'museum', label: 'Museum', description: 'Indoor walking' },
  { id: 'market', label: 'Local market', description: 'Casual daytime' },
  { id: 'beach', label: 'Beach / coast', description: 'Warm weather' },
  { id: 'hiking', label: 'Hiking', description: 'Active outdoors' },
  { id: 'dinner', label: 'Nice dinner', description: 'Elevated evening' },
  { id: 'nightlife', label: 'Nightlife', description: 'Late evening' },
  { id: 'religious', label: 'Religious site', description: 'Modest dress' },
  { id: 'formal', label: 'Formal event', description: 'Special dress' },
  { id: 'business', label: 'Business', description: 'Professional' },
]

export function getTripDays(trip: TripConfig) {
  const start = new Date(`${trip.startDate}T12:00:00`)
  const end = new Date(`${trip.endDate}T12:00:00`)
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  return Number.isFinite(days) ? Math.max(1, days) : 1
}

export function getTripLabel(trip: TripConfig) {
  return `${getTripDays(trip)} days in ${trip.destination}`
}

type ScenarioTemplate = Omit<TripScenario, 'day' | 'destination' | 'image' | 'title'> & {
  destinationIndex: number
  imageIndex: number
  title: (city: string) => string
}

const templates: Record<TripActivity, ScenarioTemplate> = {
  sightseeing: { id: 'sightseeing', title: (city) => `${city} city walk`, destinationIndex: 0, temperature: '16–22°C', note: 'City sightseeing', activities: ['city', 'walking', 'photo'], weatherTags: ['mild', 'sun'], dressiness: 2, photoImportance: 4, imageIndex: 2 },
  cafe: { id: 'cafe', title: (city) => `${city} café`, destinationIndex: 0, temperature: '15–21°C', note: 'Polished casual', activities: ['cafe', 'city', 'walking'], weatherTags: ['mild', 'sun'], dressiness: 2, photoImportance: 4, imageIndex: 0 },
  museum: { id: 'museum', title: (city) => `${city} museum afternoon`, destinationIndex: 0, temperature: '14–20°C', note: 'Museum walking', activities: ['museum', 'walking', 'city'], weatherTags: ['mild', 'indoor'], dressiness: 3, photoImportance: 4, imageIndex: 1 },
  market: { id: 'market', title: (city) => `${city} local market`, destinationIndex: 1, temperature: '18–25°C', note: 'Sunny / relaxed', activities: ['market', 'walking', 'photo'], weatherTags: ['warm', 'sun'], dressiness: 2, photoImportance: 5, imageIndex: 3 },
  beach: { id: 'beach', title: (city) => `${city} coast day`, destinationIndex: 2, temperature: '22–28°C', note: 'Seaside', activities: ['seaside', 'walking', 'photo'], weatherTags: ['hot', 'sun'], dressiness: 2, photoImportance: 5, imageIndex: 4 },
  hiking: { id: 'hiking', title: (city) => `${city} trail day`, destinationIndex: 1, temperature: '12–21°C', note: 'Active outdoors', activities: ['walking', 'travel', 'photo'], weatherTags: ['mild', 'cool', 'sun'], dressiness: 1, photoImportance: 3, imageIndex: 7 },
  dinner: { id: 'dinner', title: (city) => `Dinner in ${city}`, destinationIndex: 2, temperature: '18–23°C', note: 'Elegant evening', activities: ['dinner', 'evening', 'photo'], weatherTags: ['mild', 'indoor'], dressiness: 5, photoImportance: 5, imageIndex: 5 },
  nightlife: { id: 'nightlife', title: (city) => `${city} after dark`, destinationIndex: 0, temperature: '16–22°C', note: 'Night out', activities: ['evening', 'dinner', 'photo'], weatherTags: ['mild', 'indoor'], dressiness: 4, photoImportance: 4, imageIndex: 5 },
  religious: { id: 'religious', title: (city) => `${city} heritage site`, destinationIndex: 0, temperature: '15–23°C', note: 'Modest dress', activities: ['museum', 'walking', 'city'], weatherTags: ['mild', 'indoor'], dressiness: 3, photoImportance: 3, imageIndex: 1 },
  formal: { id: 'formal', title: () => 'Formal occasion', destinationIndex: 0, temperature: '18–23°C', note: 'Formal dress', activities: ['dinner', 'evening', 'photo'], weatherTags: ['mild', 'indoor'], dressiness: 5, photoImportance: 5, imageIndex: 5 },
  business: { id: 'business', title: (city) => `Business in ${city}`, destinationIndex: 0, temperature: '16–22°C', note: 'Professional', activities: ['museum', 'city', 'dinner'], weatherTags: ['mild', 'indoor'], dressiness: 4, photoImportance: 2, imageIndex: 1 },
}

const fallbackActivities: TripActivity[] = ['sightseeing', 'cafe', 'museum', 'market', 'dinner']

export function buildTripScenarios(trip: TripConfig): TripScenario[] {
  const activities = [...trip.activities]
  for (const fallback of fallbackActivities) {
    if (activities.length >= 6) break
    if (!activities.includes(fallback)) activities.push(fallback)
  }

  const selected = activities.slice(0, 6)
  const tripDays = getTripDays(trip)
  const usesFranceDemoImagery = trip.destination.trim().toLowerCase() === 'france'
  const stops = trip.stops.length ? trip.stops : [{ id: 'destination', city: trip.destination, days: tripDays }]
  const activityScenarios = selected.map((activity, index) => {
    const template = templates[activity]
    const stopIndex = Math.min(template.destinationIndex, stops.length - 1)
    const stop = stops[stopIndex]
    const stopStartDay = 1 + stops.slice(0, stopIndex).reduce((sum, item) => sum + item.days, 0)
    const scenariosAtStop = selected.slice(0, index).filter((item) => Math.min(templates[item].destinationIndex, stops.length - 1) === stopIndex).length
    const day = Math.min(tripDays, stopStartDay + Math.min(Math.max(0, stop.days - 1), scenariosAtStop))
    return {
      ...template,
      title: template.title(stop.city),
      destination: stop.city,
      day,
      image: usesFranceDemoImagery ? scene(template.imageIndex) : '',
    }
  })

  const lastCity = stops[stops.length - 1]?.city ?? trip.destination
  return [
    ...activityScenarios,
    {
      id: 'weather-gap',
      day: tripDays,
      title: 'Rain / cool',
      destination: lastCity,
      temperature: '12–17°C',
      note: 'Weather backup',
      activities: ['city', 'walking', 'travel'],
      weatherTags: ['cool', 'rain'],
      dressiness: 2,
      photoImportance: 2,
      image: usesFranceDemoImagery ? scene(6) : '',
    },
  ]
}
