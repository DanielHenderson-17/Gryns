import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, ImagePlus, Leaf, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PLANT_LIBRARY, getPlantIconUrl } from '@/data/plants'
import { useTowerContext } from '@/context/TowerContext'
import type { PodRecord, GrowthStage } from '@/db'
import { capitalizeWords } from '@/utils/capitalize'

const inlineInputClass =
  'form-inline-control min-w-0 flex-1 bg-transparent border-none p-0 text-slate-100 focus:outline-none focus:ring-0 focus:border-none'

const STAGE_ORDER: GrowthStage[] = ['germination', 'sprouted', 'growing', 'harvest_ready', 'harvested']

const STAGE_BUTTON_LABELS: Record<GrowthStage, string> = {
  germination: "It sprouted!",
  sprouted: "It's growing!",
  growing: "Harvest ready!",
  harvest_ready: "Harvested",
  harvested: "Harvested",
}

function nextStage(current: GrowthStage): GrowthStage | null {
  const i = STAGE_ORDER.indexOf(current)
  return i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null
}

function formatDuration(duration?: { min?: number; max?: number; unit?: string }): string {
  if (duration?.min == null && duration?.max == null) return '—'
  const min = duration?.min ?? duration?.max
  const max = duration?.max ?? duration?.min
  const u = duration?.unit ?? ''
  const unit = u === 'week' ? 'weeks' : u === 'day' ? 'days' : u
  if (min == null && max == null) return '—'
  if (min === max) return `${min} ${unit}`
  return `${min}-${max} ${unit}`
}

interface PodDetailProps {
  pod: PodRecord
}

export function PodDetail({ pod }: PodDetailProps) {
  const navigate = useNavigate()
  const { towers, updatePod, updatePodStage, deletePod } = useTowerContext()
  const tower = towers.find((t) => t.id === pod.towerId)
  const towerLabel = tower != null ? `Tower ${tower.index + 1}` : 'Pod'
  const [editing, setEditing] = useState<'slotNumber' | 'plantedAt' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const editAreaRef = useRef<HTMLDivElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const takePhotoInputRef = useRef<HTMLInputElement>(null)

  const plant = PLANT_LIBRARY.find((p) => p.id === pod.plantId)
  const plantIconUrl = plant ? getPlantIconUrl(plant) : null
  const displayImageUrl = pod.photoDataUrl ?? plantIconUrl

  useEffect(() => {
    if (editing == null) return
    const handlePointerDown = (e: PointerEvent) => {
      if (editAreaRef.current?.contains(e.target as Node)) return
      cancelEdit()
    }
    document.addEventListener('pointerdown', handlePointerDown, { capture: true })
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true })
  }, [editing])

  const handleDelete = async () => {
    if (!window.confirm('Delete this pod? This cannot be undone.')) return
    await deletePod(pod.id)
    navigate(`/tower/${pod.towerId}`, { replace: true })
  }

  const next = nextStage(pod.growthStage)
  const advanceLabel = next ? STAGE_BUTTON_LABELS[pod.growthStage] : null

  const startEdit = (field: 'slotNumber' | 'plantedAt', current: string) => {
    setEditing(field)
    setEditValue(current)
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (editing === 'slotNumber') {
        const n = parseInt(editValue, 10)
        if (!isNaN(n) && n >= 1) await updatePod(pod.id, { slotNumber: n })
      } else if (editing === 'plantedAt') {
        const ts = new Date(editValue).getTime()
        if (!isNaN(ts)) await updatePod(pod.id, { plantedAt: ts })
      }
    } finally {
      setSaving(false)
      setEditing(null)
    }
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditValue('')
  }

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updatePod(pod.id, { photoDataUrl: dataUrl })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setPhotoModalOpen(false)
  }

  const handleRemovePhoto = () => {
    updatePod(pod.id, { photoDataUrl: null })
    setPhotoModalOpen(false)
  }

  const plantedDateStr = new Date(pod.plantedAt).toISOString().slice(0, 10)

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link to={`/tower/${pod.towerId}`} className="shrink-0 p-1 text-slate-400 hover:text-slate-100">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <span className="text-lg font-medium text-slate-100">{towerLabel}</span>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="shrink-0 p-1 text-slate-400 hover:text-red-400"
          aria-label="Delete pod"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </header>

      <div className="px-4 py-6">
        <div className="mb-6 flex justify-center">
          <div className="relative h-40 w-40 shrink-0">
            <div className="pod-detail-hero-image absolute inset-0 border border-slate-700 bg-surface-muted">
              {displayImageUrl ? (
                <img
                  src={displayImageUrl}
                  alt={capitalizeWords(pod.plantName)}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling
                    if (fallback instanceof HTMLElement) fallback.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 flex items-center justify-center ${displayImageUrl ? 'hidden' : ''}`}
                aria-hidden
              >
                <Leaf className="h-16 w-16 text-slate-600" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPhotoModalOpen(true)}
              className="absolute bottom-0 right-0 z-[100] flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800/95 text-slate-100 shadow-lg backdrop-blur hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Change pod photo"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
        </div>

        {photoModalOpen && (
          <div
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 p-4 sm:items-center"
            onClick={() => setPhotoModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-modal-title"
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-800 p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="photo-modal-title" className="mb-3 text-lg font-medium text-slate-100">
                Pod photo
              </h2>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFile}
              />
              <input
                ref={takePhotoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoFile}
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="w-full justify-center gap-2"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                  Upload photo
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-center gap-2"
                  onClick={() => takePhotoInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  Take photo
                </Button>
                {pod.photoDataUrl && (
                  <Button
                    variant="secondary"
                    className="w-full justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove photo
                  </Button>
                )}
                <Button variant="secondary" className="w-full" onClick={() => setPhotoModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-100">
            {capitalizeWords(pod.plantName)}
          </h1>
          {plant?.species && (
            <p className="mt-1 text-sm italic text-slate-400">{plant.species}</p>
          )}
          {plant?.description && (
            <p className="mt-2 max-w-md mx-auto px-6 py-2 text-sm text-slate-300 leading-relaxed">
              {plant.description}
            </p>
          )}

          {(plant?.harvest ?? plant?.yield) && (
            <div className="mt-4 flex flex-wrap justify-center gap-8 text-center">
              {plant?.harvest && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Harvest</p>
                  <p className="mt-0.5 text-sm text-slate-300">
                    {formatDuration(plant.harvest.duration)}
                  </p>
                </div>
              )}
              {plant?.yield && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Yield</p>
                  <p className="mt-0.5 text-sm text-slate-300">
                    {plant.yield.label ?? (plant.yield.value != null && plant.yield.unit != null
                      ? `${plant.yield.value} ${plant.yield.unit}`
                      : plant.yield.unit ?? '—')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-700 bg-surface p-3">
            <p className="mb-0.5 text-xs uppercase tracking-wider text-slate-500">Slot</p>
            {editing === 'slotNumber' ? (
              <div ref={editAreaRef} className="flex h-8 flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className={inlineInputClass}
                  autoFocus
                  aria-label="Slot"
                />
                <span className="flex shrink-0 items-center gap-1">
                  <Button size="sm" className="form-inline-control text-xs" onClick={saveEdit} disabled={saving}>Save</Button>
                  <Button variant="ghost" size="sm" className="form-inline-control text-xs" onClick={cancelEdit}>Cancel</Button>
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="form-inline-control w-full text-left text-slate-100 hover:underline"
                onClick={() => startEdit('slotNumber', String(pod.slotNumber))}
              >
                Slot {pod.slotNumber}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-surface p-3">
            <p className="mb-0.5 text-xs uppercase tracking-wider text-slate-500">Planted</p>
            {editing === 'plantedAt' ? (
              <div ref={editAreaRef} className="flex h-8 flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className={inlineInputClass}
                  autoFocus
                  aria-label="Planted date"
                />
                <span className="flex shrink-0 items-center gap-1">
                  <Button size="sm" className="form-inline-control text-xs" onClick={saveEdit} disabled={saving}>Save</Button>
                  <Button variant="ghost" size="sm" className="form-inline-control text-xs" onClick={cancelEdit}>Cancel</Button>
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="form-inline-control w-full text-left text-slate-100 hover:underline"
                onClick={() => startEdit('plantedAt', plantedDateStr)}
              >
                {new Date(pod.plantedAt).toLocaleDateString()}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-surface p-3">
            <p className="mb-0.5 text-xs uppercase tracking-wider text-slate-500">Growth stage</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-slate-100 capitalize">{pod.growthStage.replace('_', ' ')}</p>
              <p className="text-sm text-slate-400 shrink-0">
                {pod.growthStage === 'germination' && plant?.germination?.duration
                  ? formatDuration(plant.germination.duration)
                  : '—'}
              </p>
            </div>
            {advanceLabel && (
              <Button
                className="mt-2 w-full"
                onClick={() => next && updatePodStage(pod.id, next)}
              >
                {advanceLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
