/**
 * Plant list from plantLibraryMaster.json (in project root).
 * Add entries to the master file and rebuild; the app list will grow.
 */

import masterData from '../../plantLibraryMaster.json'
import { capitalizeWords } from '@/utils/capitalize'
import { sortAlphabetically } from '@/utils/sortAlphabetically'

export interface MasterPlantEntry {
  name: string
  species: string | null
  description: string | null
  img: string | null
  /** Filename in public/plants/ for dropdown/list icons, e.g. "bellpepper.webp" */
  icon_img: string | null
  harvest: { duration?: { max?: number; min?: number; unit?: string } } | null
  yield: { unit?: string; value?: number; label?: string } | null
  germination: { duration?: { max?: number; min?: number; unit?: string }; rate?: number } | null
  hardinessZone: { max?: number; min?: number } | null
}

export interface PlantOption {
  id: string
  name: string
  species: string
  description: string | null
  img: string | null
  icon_img: string | null
  harvest: MasterPlantEntry['harvest']
  yield: MasterPlantEntry['yield']
  germination: MasterPlantEntry['germination']
  hardinessZone: MasterPlantEntry['hardinessZone']
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'plant'
}

const raw = (masterData as { _schema?: string[]; plants: MasterPlantEntry[] }).plants || []

export const PLANT_LIBRARY: PlantOption[] = sortAlphabetically(
  raw.map((p) => ({
    id: slug(p.name),
    name: capitalizeWords(p.name),
    species: p.species ?? '',
    description: p.description ?? null,
    img: p.img ?? null,
    icon_img: p.icon_img ?? null,
    harvest: p.harvest ?? null,
    yield: p.yield ?? null,
    germination: p.germination ?? null,
    hardinessZone: p.hardinessZone ?? null,
  })),
  (p) => p.name
)

/** Resolved plant image URL: uses img if set, otherwise /plants/{id}.webp (files in public/plants/). */
export function getPlantImageUrl(plant: { id: string; img: string | null }): string {
  return plant.img ?? `/plants/${plant.id}.webp`
}

/** URL for list/dropdown icon: uses icon_img filename in public/plants/, e.g. /plants/bellpepper.webp */
export function getPlantIconUrl(plant: { icon_img: string | null }): string | null {
  return plant.icon_img ? `/plants/${plant.icon_img}` : null
}
