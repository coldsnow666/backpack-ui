import { computed, reactive, ref } from 'vue'
import {
  backpackPets,
  fallbackSkills,
  skillBook,
  statsByName,
} from '../data'
import type { ActionTab, Pet, PetGroup } from '../types'

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
  const followingPetId = ref<number | null>(pets.find((pet) => pet.isFollowing)?.id ?? null)

  const petSlots = reactive<Record<PetGroup, Array<Pet | null>>>({
    battle: createSlots('battle'),
    standby: createSlots('standby'),
  })

  const battlePets = computed(() => petSlots.battle)
  const standbyPets = computed(() => petSlots.standby)

  const selectedPet = computed(() => {
    const selectedSlotPet = [...petSlots.battle, ...petSlots.standby].find((pet) => pet?.id === activePetId.value)
    const firstSlotPet = [...petSlots.battle, ...petSlots.standby].find(Boolean)
    const pet = selectedSlotPet ?? pets.find((pet) => pet.id === activePetId.value) ?? firstSlotPet ?? fallbackPet

    return {
      ...pet,
      isFollowing: pet.id === followingPetId.value,
    }
  })

  const selectedStats = computed(() => statsByName[selectedPet.value.name] ?? statsByName['谱尼'])
  const selectedSkills = computed(() => skillBook[selectedPet.value.name] ?? fallbackSkills)

  function selectPet(pet: Pet) {
    activePetId.value = pet.id
  }

  function handlePetAction(tab: ActionTab) {
    if (selectedPet.value.isEmpty) {
      return
    }

    if (tab.id === 'starter') {
      setSelectedPetAsStarter()
      return
    }

    if (tab.id !== 'follow') {
      return
    }

    followingPetId.value = followingPetId.value === selectedPet.value.id ? null : selectedPet.value.id

    pets.forEach((pet) => {
      pet.isFollowing = pet.id === followingPetId.value
    })

    ;(['battle', 'standby'] as const).forEach((group) => {
      petSlots[group].forEach((pet) => {
        if (pet) {
          pet.isFollowing = pet.id === followingPetId.value
        }
      })
    })
  }

  function findPetSlot(petId: number) {
    for (const group of ['battle', 'standby'] as const) {
      const index = petSlots[group].findIndex((pet) => pet?.id === petId)

      if (index !== -1) {
        return { group, index }
      }
    }

    return null
  }

  function setSelectedPetAsStarter() {
    const selectedSlot = findPetSlot(selectedPet.value.id)

    if (!selectedSlot || (selectedSlot.group === 'battle' && selectedSlot.index === 0)) {
      return
    }

    const starterPet = petSlots.battle[0]
    const selectedSlotPet = petSlots[selectedSlot.group][selectedSlot.index]

    petSlots.battle[0] = selectedSlotPet
    petSlots[selectedSlot.group][selectedSlot.index] = starterPet

    if (petSlots.battle[0]) {
      petSlots.battle[0].group = 'battle'
    }

    if (petSlots[selectedSlot.group][selectedSlot.index]) {
      petSlots[selectedSlot.group][selectedSlot.index]!.group = selectedSlot.group
    }

    activePetId.value = selectedPet.value.id
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
    handlePetAction,
    selectedPet,
    selectedSkills,
    selectedStats,
    selectPet,
    standbyPets,
    startPetDrag,
  }
}
