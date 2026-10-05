import { ArrowUpRight, Luggage } from 'lucide-react'
import { GarmentCard } from './GarmentCard'
import type { GarmentCategory, ScoredGarment } from '../lib/types'

const categoryOrder: GarmentCategory[] = ['top', 'layer', 'bottom', 'dress', 'shoe', 'accessory']
const categoryLabels: Record<GarmentCategory, string> = {
  top: 'Tops',
  bottom: 'Bottoms',
  layer: 'Layers',
  dress: 'Dress',
  shoe: 'Shoes',
  accessory: 'Extra',
}

const displayOrder = [
  'silk-blouse', 'breton-knit', 'terracotta-top', 'trench', 'navy-cardigan',
  'black-trousers', 'cream-skirt', 'light-denim', 'black-dress',
  'white-sneakers', 'slingbacks', 'crossbody',
]

interface CapsuleCanvasProps {
  items: ScoredGarment[]
  selectedId: string
  luggageLimit: number
  onSelect: (id: string) => void
  onToggleLock: (id: string) => void
  onRemove: (id: string) => void
  onOpenLeftBehind: () => void
}

export function CapsuleCanvas({
  items,
  selectedId,
  luggageLimit,
  onSelect,
  onToggleLock,
  onRemove,
  onOpenLeftBehind,
}: CapsuleCanvasProps) {
  const selected = items.find((item) => item.garment.id === selectedId) ?? items[0]

  return (
    <section className="capsule-canvas" aria-labelledby="capsule-heading">
      <div className="section-heading-row">
        <h2 id="capsule-heading">Your {items.length}-piece capsule</h2>
        <div className="capsule-meta">
          <span><Luggage size={16} /> {items.length} / {luggageLimit} items</span>
          <span className="capacity-track"><span style={{ width: `${Math.min(100, (items.length / luggageLimit) * 100)}%` }} /></span>
          <button className="text-action" type="button" onClick={onOpenLeftBehind}>Leave {Math.max(0, 15 - items.length)} behind <ArrowUpRight size={15} /></button>
        </div>
      </div>

      <div className="garment-groups">
        {categoryOrder.map((category) => {
          const group = items
            .filter((item) => item.garment.category === category)
            .sort((a, b) => displayOrder.indexOf(a.garment.id) - displayOrder.indexOf(b.garment.id))
          if (!group.length) return null
          return (
            <div className={`garment-group group-${category}`} key={category}>
              <div className="category-label">{categoryLabels[category]} <span>{group.length}</span></div>
              <div className="garment-grid">
                {group.map((item) => (
                  <GarmentCard
                    item={item}
                    selected={item.garment.id === selectedId}
                    onSelect={() => onSelect(item.garment.id)}
                    onToggleLock={() => onToggleLock(item.garment.id)}
                    onRemove={() => onRemove(item.garment.id)}
                    key={item.garment.id}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selected ? (
        <aside className="item-rationale" aria-live="polite">
          <span className="rationale-kicker">Why this piece</span>
          <strong>{selected.garment.shortName}</strong>
          <p>{selected.garment.rationale}</p>
          <div className="rationale-facts">
            <span>{selected.coverage.length} scenarios</span>
            <span>{selected.garment.versatility}/10 versatile</span>
          </div>
        </aside>
      ) : null}
    </section>
  )
}
