import { Link } from 'react-router-dom'
import { TowerControl, Leaf } from 'lucide-react'
import type { TowerRecord } from '@/db'

interface DashboardProps {
  towers: TowerRecord[]
  podCountByTower: Record<string, number>
}

export function Dashboard({ towers, podCountByTower }: DashboardProps) {
  if (towers.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <Leaf className="h-16 w-16 text-slate-600" />
        <p className="mt-4 text-slate-400">No towers yet. Complete onboarding to add your first tower.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold text-slate-100">Towers</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {towers.map((tower) => (
          <Link
            key={tower.id}
            to={`/tower/${tower.id}`}
            className="flex items-center gap-4 rounded-xl border border-slate-700 bg-surface p-4 shadow transition-colors hover:border-accent/50 hover:bg-surface-muted"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
              <TowerControl className="h-7 w-7 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-100">Tower {tower.index + 1}</p>
              <p className="text-sm text-slate-500">
                {podCountByTower[tower.id] ?? 0} / {tower.slotCount} pods
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
