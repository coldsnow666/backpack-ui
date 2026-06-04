import { nextTick, reactive, type CSSProperties } from 'vue'
import type { Pet } from '../types'

export function usePetImageFit() {
  const petAutoOffsetY = reactive<Record<number, number>>({})
  const petNaturalHeight = reactive<Record<number, number>>({})

  function petListImageStyle(pet: Pet): CSSProperties {
    const naturalHeight = petNaturalHeight[pet.id]
    const listImageHeight = pet.listImageHeight ?? (naturalHeight ? Math.min(58, Math.round(naturalHeight * 0.42)) : 58)

    return {
      '--pet-list-image-height': `${listImageHeight}px`,
      '--pet-list-image-offset-x': `${pet.listImageOffsetX ?? 0}px`,
      '--pet-list-image-offset-y': `${pet.listImageOffsetY ?? 0}px`,
      '--pet-auto-offset-y': `${petAutoOffsetY[pet.id] ?? 0}px`,
      '--pet-shadow-offset-y': `${Math.round(listImageHeight * 0.3)}px`,
    } as CSSProperties
  }

  async function adjustPetImagePosition(event: Event, pet: Pet) {
    const img = event.currentTarget as HTMLImageElement

    if (img.naturalHeight) {
      petNaturalHeight[pet.id] = img.naturalHeight
    }

    petAutoOffsetY[pet.id] = 0
    await nextTick()

    requestAnimationFrame(() => {
      const row = img.closest('.pet-row')
      const level = row?.querySelector('.pet-level-value')

      if (!(level instanceof HTMLElement)) {
        return
      }

      const imgRect = img.getBoundingClientRect()
      const levelRect = level.getBoundingClientRect()
      const allowedOverlap = 2
      const overlap = imgRect.bottom - (levelRect.top + allowedOverlap)

      petAutoOffsetY[pet.id] = overlap > 0 ? -Math.ceil(overlap) : 0
    })
  }

  return {
    adjustPetImagePosition,
    petListImageStyle,
  }
}
