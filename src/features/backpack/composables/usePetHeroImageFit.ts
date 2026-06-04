import { reactive, type CSSProperties } from 'vue'
import type { Pet } from '../types'

const heroSlotWidth = 124
const heroSlotHeight = 137
const heroMaxWidth = 124
const heroMaxHeight = 170
const heroOffsetX = 8
const heroOffsetY = -12

export function usePetHeroImageFit() {
  const naturalSizeByPetId = reactive<Record<number, { width: number; height: number }>>({})

  function petHeroImageStyle(pet: Pet): CSSProperties {
    const naturalSize = naturalSizeByPetId[pet.id]

    if (!naturalSize) {
      return {}
    }

    const scale = Math.min(
      1,
      heroMaxWidth / naturalSize.width,
      heroMaxHeight / naturalSize.height,
    )
    const targetWidth = Math.round(naturalSize.width * scale)
    const targetHeight = Math.round(naturalSize.height * scale)
    const offsetX = Math.round((heroSlotWidth - targetWidth) / 2) + heroOffsetX
    const offsetY = targetHeight > heroSlotHeight
      ? heroSlotHeight - targetHeight + heroOffsetY
      : Math.round((heroSlotHeight - targetHeight) / 2) + heroOffsetY
    const shadowWidth = Math.round(Math.min(96, Math.max(44, targetWidth * 0.72)))
    const shadowHeight = Math.round(shadowWidth * 0.42)
    const shadowOverlap = Math.round(Math.min(18, Math.max(8, targetHeight * 0.09)))
    const shadowLeft = offsetX + Math.round(targetWidth / 2)
    const shadowTop = offsetY + targetHeight - shadowOverlap

    return {
      '--pet-hero-image-left': `${offsetX}px`,
      '--pet-hero-image-top': `${offsetY}px`,
      '--pet-hero-image-width': `${targetWidth}px`,
      '--pet-hero-image-height': `${targetHeight}px`,
      '--pet-hero-shadow-left': `${shadowLeft}px`,
      '--pet-hero-shadow-top': `${shadowTop}px`,
      '--pet-hero-shadow-width': `${shadowWidth}px`,
      '--pet-hero-shadow-height': `${shadowHeight}px`,
      '--pet-hero-image-fallback-x': '0px',
      '--pet-hero-image-fallback-y': '0px',
    } as CSSProperties
  }

  function recordPetHeroImageSize(event: Event, pet: Pet) {
    const img = event.currentTarget as HTMLImageElement

    if (!img.naturalWidth || !img.naturalHeight) {
      return
    }

    naturalSizeByPetId[pet.id] = {
      width: img.naturalWidth,
      height: img.naturalHeight,
    }
  }

  return {
    petHeroImageStyle,
    recordPetHeroImageSize,
  }
}
