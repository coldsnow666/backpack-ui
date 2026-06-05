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

  const battlePets = computed(() => petSlots.battle)
  const standbyPets = computed(() => petSlots.standby)

  const selectedPet = computed(() => {
    const selectedSlotPet = [...petSlots.battle, ...petSlots.standby].find((pet) => pet?.id === activePetId.value)
    const firstSlotPet = [...petSlots.battle, ...petSlots.standby].find(Boolean)

    return selectedSlotPet ?? pets.find((pet) => pet.id === activePetId.value) ?? firstSlotPet ?? fallbackPet
  })

  const selectedStats = computed(() => statsByName[selectedPet.value.name] ?? statsByName['谱尼'])
  const selectedSkills = computed(() => skillBook[selectedPet.value.name] ?? fallbackSkills)

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

    return pet
  }

  function finishPetDrag(target: { group: PetGroup, index: number } | null) {
    const source = dragSource.value

    if (!source) {
      return
    }

    const targetPet = target === null ? null : (petSlots[target.group][target.index] ?? null)

    if (target === null || (!targetPet && target.group === source.group)) {
      petSlots[source.group][source.index] = source.pet
      compactSlots(source.group)
      activePetId.value = source.pet.id
      dragSource.value = null

      return
    }

    if (!targetPet) {
      petSlots[target.group][target.index] = source.pet
      compactSlots(source.group)
      compactSlots(target.group)
      activePetId.value = source.pet.id
      dragSource.value = null

      return
    }

    petSlots[target.group][target.index] = source.pet
    petSlots[source.group][source.index] = targetPet
    compactSlots(source.group)
    compactSlots(target.group)
    activePetId.value = source.pet.id
    dragSource.value = null
  }

  return {
    battlePets,
    finishPetDrag,
    selectedPet,
    selectedSkills,
    selectedStats,
    selectPet,
    standbyPets,
    startPetDrag,
  }
}
