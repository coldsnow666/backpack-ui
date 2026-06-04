import type { Pet, PetStats } from '../types'

export function usePetHp(statsByName: Record<string, PetStats>) {
  function hpForPet(pet: Pet) {
    const max = statsByName[pet.name]?.hp ?? 180
    const ratio = 0.82 + ((pet.id * 7) % 17) / 100

    return {
      current: Math.round(max * Math.min(ratio, 1)),
      max,
    }
  }

  function hpPercent(pet: Pet) {
    const hp = hpForPet(pet)

    return Math.round((hp.current / hp.max) * 100)
  }

  return {
    hpForPet,
    hpPercent,
  }
}
