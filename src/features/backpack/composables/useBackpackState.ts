import { computed, reactive, ref } from 'vue'
import {
  backpackPets,
  fallbackSkills,
  skillBook,
  statsByName,
} from '../data'
import type { Pet, PetGroup } from '../types'

export function useBackpackState() {
  const visibleSlotCount = 6
  const pets = backpackPets.filter((pet) => !pet.isEmpty)
  const fallbackPet = pets[0] as Pet
  const activeGroup = ref<PetGroup>('battle')
  const activePetId = ref(pets.find((pet) => pet.group === 'battle')?.id ?? fallbackPet.id)
  const dragSource = ref<{
    group: PetGroup
    index: number
    pet: Pet
  } | null>(null)

  const petSlots = reactive<Record<PetGroup, Array<Pet | null>>>({
    battle: createSlots('battle'),
    standby: createSlots('standby'),
  })

  const visiblePets = computed(() => petSlots[activeGroup.value])

  const selectedPet = computed(() => {
    const visibleSelectedPet = visiblePets.value.find((pet) => pet?.id === activePetId.value)
    const visibleFirstPet = visiblePets.value.find(Boolean)

    return visibleSelectedPet ?? pets.find((pet) => pet.id === activePetId.value) ?? visibleFirstPet ?? fallbackPet
  })

  const selectedStats = computed(() => statsByName[selectedPet.value.name] ?? statsByName['谱尼'])
  const selectedSkills = computed(() => skillBook[selectedPet.value.name] ?? fallbackSkills)

  function selectGroup(group: PetGroup) {
    activeGroup.value = group

    const firstPet = petSlots[group].find(Boolean)
    if (firstPet) {
      activePetId.value = firstPet.id
    }
  }

  function selectPet(pet: Pet) {
    activePetId.value = pet.id
  }

  function createSlots(group: PetGroup) {
    const groupPets = pets.filter((pet) => pet.group === group).slice(0, visibleSlotCount)

    return [
      ...groupPets,
      ...Array.from<null>({ length: Math.max(0, visibleSlotCount - groupPets.length) }).fill(null),
    ]
  }

  function compactSlots(group: PetGroup) {
    const filledPets = petSlots[group].filter((pet): pet is Pet => Boolean(pet))
    const emptySlots = Array.from<null>({ length: visibleSlotCount - filledPets.length }).fill(null)

    petSlots[group].splice(0, visibleSlotCount, ...filledPets, ...emptySlots)
  }

  function otherGroup(group: PetGroup): PetGroup {
    return group === 'battle' ? 'standby' : 'battle'
  }

  function startPetDrag(group: PetGroup, index: number) {
    const pet = petSlots[group][index]

    if (!pet) {
      return null
    }

    dragSource.value = {
      group,
      index,
      pet,
    }
    petSlots[group][index] = null
    activePetId.value = pet.id
    activeGroup.value = otherGroup(group)

    return pet
  }

  function finishPetDrag(targetIndex: number | null) {
    const source = dragSource.value

    if (!source) {
      return
    }

    const targetGroup = activeGroup.value
    const targetPet = targetIndex === null ? null : (petSlots[targetGroup][targetIndex] ?? null)

    if (targetIndex === null || !targetPet) {
      petSlots[source.group][source.index] = source.pet
      compactSlots(source.group)
      activeGroup.value = source.group
      activePetId.value = source.pet.id
      dragSource.value = null

      return
    }

    petSlots[targetGroup][targetIndex] = source.pet
    petSlots[source.group][source.index] = targetPet
    compactSlots(source.group)
    compactSlots(targetGroup)
    activePetId.value = source.pet.id
    dragSource.value = null
  }

  return {
    activeGroup,
    finishPetDrag,
    selectedPet,
    selectedSkills,
    selectedStats,
    selectGroup,
    selectPet,
    startPetDrag,
    visiblePets,
  }
}
