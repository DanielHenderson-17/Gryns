import { Link } from 'react-router-dom'
import { Leaf, Plus } from 'lucide-react'
import type { PodRecord, TowerRecord } from '@/db'
import { PLANT_LIBRARY, getPlantIconUrl } from '@/data/plants'
import { capitalizeWords } from '@/utils/capitalize'

interface TowerViewProps {
  tower: TowerRecord
  pods: PodRecord[]
}

export function TowerView({ tower, pods }: TowerViewProps) {
  const podsBySlot = pods
    .filter((p) => p.towerId === tower.id)
    .sort((a, b) => a.slotNumber - b.slotNumber)

  return (
    <div className="space-y-4 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">Tower {tower.index + 1}</h1>
        <Link
          to={`/tower/${tower.id}/add-pod`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-muted"
          aria-label="Add pod"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>
      <p className="text-slate-400">
        {podsBySlot.length} of {tower.slotCount} slots in use
      </p>
      <ul className="space-y-2">
        {podsBySlot.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-600 bg-surface/50 py-8 text-center text-slate-500">
            No pods in this tower yet.
          </li>
        ) : (
          podsBySlot.map((pod) => {
            const plant = PLANT_LIBRARY.find((p) => p.id === pod.plantId)
            const iconUrl = plant ? getPlantIconUrl(plant) : null
            const displayUrl = pod.photoDataUrl ?? iconUrl
            return (
            <li key={pod.id}>
              <Link
                to={`/pod/${pod.id}`}
                className="flex items-center gap-4 rounded-xl border border-slate-700 bg-surface p-4 transition-colors hover:border-accent/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                  {displayUrl ? (
                    <>
                      <img
                        src={displayUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const n = e.currentTarget.nextElementSibling
                          if (n instanceof HTMLElement) n.classList.remove('hidden')
                        }}
                      />
                      <span className="hidden h-full w-full items-center justify-center bg-surface-muted [&.flex]:flex" aria-hidden>
                        <Leaf className="h-6 w-6 text-slate-500" />
                      </span>
                    </>
                  ) : (
                    <Leaf className="h-6 w-6 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-100">{capitalizeWords(pod.plantName)}</p>
                  <p className="text-sm text-slate-500">Slot {pod.slotNumber} · {stageLabel(pod.growthStage)}</p>
                </div>
              </Link>
            </li>
          )
          })
        )}
      </ul>
    </div>
  )
}

function stageLabel(s: PodRecord['growthStage']): string {
  const labels: Record<PodRecord['growthStage'], string> = {
    germination: 'Germination',
    sprouted: 'Sprouted',
    growing: 'Growing',
    harvest_ready: 'Harvest ready',
    harvested: 'Harvested',
  }
  return labels[s] ?? s
}
