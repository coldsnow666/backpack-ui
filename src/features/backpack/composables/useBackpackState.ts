import { computed, ref } from 'vue'
import {
  backpackPets,
  fallbackSkills,
  skillBook,
  statsByName,
} from '../data'
import type { Pet, PetGroup } from '../types'

export function useBackpackState() {
  const pets = backpackPets.filter((pet) => !pet.isEmpty)
  const fallbackPet = pets[0] as Pet
  const activeGroup = ref<PetGroup>('battle')
  const activePetId = ref(pets.find((pet) => pet.group === 'battle')?.id ?? fallbackPet.id)

  const visiblePets = computed(() => pets.filter((pet) => pet.group === activeGroup.value))

  const selectedPet = computed(() => {
    return pets.find((pet) => pet.id === activePetId.value) ?? visiblePets.value[0] ?? fallbackPet
  })

  const selectedStats = computed(() => statsByName[selectedPet.value.name] ?? statsByName['谱尼'])
  const selectedSkills = computed(() => skillBook[selectedPet.value.name] ?? fallbackSkills)

  function selectGroup(group: PetGroup) {
    activeGroup.value = group

    const firstPet = pets.find((pet) => pet.group === group)
    if (firstPet) {
      activePetId.value = firstPet.id
    }
  }

  function selectPet(pet: Pet) {
    activePetId.value = pet.id
  }

  return {
    activeGroup,
    selectedPet,
    selectedSkills,
    selectedStats,
    selectGroup,
    selectPet,
    visiblePets,
  }
}
