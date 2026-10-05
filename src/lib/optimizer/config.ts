export const OPTIMIZATION_WEIGHTS = {
  scenarioCoverage: 5.2,
  weatherCompatibility: 2.2,
  dressCompatibility: 2.4,
  styleFit: 1.8,
  versatility: 2.1,
  photoSuitability: 1.4,
  redundancyPenalty: 2.3,
  lockedBonus: 100,
} as const

export const CATEGORY_MINIMUMS = {
  top: 2,
  bottom: 2,
  layer: 1,
  dress: 0,
  shoe: 2,
  accessory: 1,
} as const
