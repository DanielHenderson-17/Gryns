import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PhotoPickerModal } from '@/components/ui/PhotoPickerModal'
import { Select } from '@/components/ui/Select'
import { PlantSelect } from '@/components/ui/PlantSelect'
import { PLANT_LIBRARY } from '@/data/plants'
import { useTowerContext } from '@/context/TowerContext'

export function AddPodToTower() {
  const { towerId } = useParams<{ towerId: string }>()
  const navigate = useNavigate()
  const { towers, pods, addPod } = useTowerContext()
  const tower = towers.find((t) => t.id === towerId)
  const occupiedSlots = tower ? pods.filter((p) => p.towerId === tower.id).map((p) => p.slotNumber) : []
  const allSlots = tower ? Array.from({ length: tower.slotCount }, (_, i) => i + 1) : []
  const availableSlots = allSlots.filter((s) => !occupiedSlots.includes(s))

  const [plantId, setPlantId] = useState('')
  const [slotNumber, setSlotNumber] = useState(1)
  const [plantedAt, setPlantedAt] = useState(Date.now())
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!tower) {
    return (
      <div className="px-4 py-6">
        <p className="text-slate-500">Tower not found.</p>
        <Link to="/dashboard" className="mt-2 inline-block text-accent">Back to dashboard</Link>
      </div>
    )
  }

  const plant = PLANT_LIBRARY.find((p) => p.id === plantId)
  const plantName = (plant?.name ?? plantId) || ''
  const dateStr = new Date(plantedAt).toISOString().slice(0, 10)

  if (tower && availableSlots.length === 0) {
    return (
      <div className="min-h-screen pb-8">
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
          <Link to={`/tower/${tower.id}`} className="p-1 text-slate-400 hover:text-slate-100">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <span className="text-lg font-medium text-slate-100">Add pod</span>
        </header>
        <div className="px-4 py-6">
          <p className="text-slate-400">All slots in this tower are in use.</p>
          <Link to={`/tower/${tower.id}`} className="mt-2 inline-block text-accent">Back to tower</Link>
        </div>
      </div>
    )
  }

  const defaultSlot = availableSlots[0]
  const slotNumberValid = defaultSlot != null && availableSlots.includes(slotNumber)
  useEffect(() => {
    if (tower && defaultSlot != null && !availableSlots.includes(slotNumber)) {
      setSlotNumber(defaultSlot)
    }
  }, [tower?.id, defaultSlot, slotNumber, availableSlots])

  const handleSave = async () => {
    const chosenSlot = slotNumberValid ? slotNumber : defaultSlot
    if (!plantId || !plantName.trim() || chosenSlot == null) return
    setSaving(true)
    try {
      await addPod({
        towerId: tower.id,
        plantId,
        plantName: plantName.trim(),
        slotNumber: chosenSlot,
        plantedAt,
        photoDataUrl,
        growthStage: 'germination',
        perenualId: null,
        plantImageUrl: plant?.img ?? null,
      })
      navigate(`/tower/${tower.id}`, { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <Link to={`/tower/${tower.id}`} className="p-1 text-slate-400 hover:text-slate-100">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="text-lg font-medium text-slate-100">Add pod</span>
      </header>

      <div className="space-y-6 px-4 py-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Plant</label>
          <PlantSelect
            value={plantId}
            onChange={setPlantId}
            placeholder="Select a plant"
            ariaLabel="Plant"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Slot</label>
          <Select
            value={slotNumberValid ? slotNumber : defaultSlot ?? 1}
            onChange={(e) => setSlotNumber(parseInt(e.target.value, 10))}
          >
            {availableSlots.map((s) => (
              <option key={s} value={s}>
                Slot {s}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Planted date</label>
          <Input
            type="date"
            value={dateStr}
            onChange={(e) => setPlantedAt(new Date(e.target.value).getTime())}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Photo (optional)</label>
          {photoDataUrl ? (
            <div className="relative inline-block">
              <img
                src={photoDataUrl}
                alt="Pod"
                className="h-24 w-24 rounded-lg border border-slate-600 object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute bottom-0 right-0"
                onClick={() => setPhotoModalOpen(true)}
              >
                Change
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPhotoModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 bg-surface-muted px-4 py-3 text-slate-400 transition-colors hover:border-accent hover:text-accent"
            >
              <Camera className="h-5 w-5" />
              Add photo
            </button>
          )}
          <PhotoPickerModal
            open={photoModalOpen}
            onClose={() => setPhotoModalOpen(false)}
            value={photoDataUrl}
            onChange={setPhotoDataUrl}
            title="Pod photo"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={!plantId || saving}
        >
          {saving ? 'Saving...' : 'Save pod'}
        </Button>
      </div>
    </div>
  )
}
