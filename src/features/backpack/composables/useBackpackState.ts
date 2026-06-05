import { computed, reactive, ref } from 'vue'
import {
  backpackPets,
  fallbackSkills,
  skillBook,
  statsByName,
  warehousePets as initialWarehousePets,
} from '../data'
import type { ActionTab, Pet, PetGroup, Skill } from '../types'

type PetMoveResult = {
  ok: boolean
  message: string
  petName?: string
  reason?: 'bag-full'
}

export function useBackpackState() {
  const visibleSlotCount = 6
  const pets = backpackPets.filter((pet) => !pet.isEmpty)
  const warehousePetList = reactive<Pet[]>(initialWarehousePets.map((pet) => ({ ...pet })))
  const knownPets = [...pets, ...warehousePetList]
  const fallbackPet = pets[0] as Pet
  const activePetId = ref(pets.find((pet) => pet.group === 'battle')?.id ?? fallbackPet.id)
  const dragSource = ref<{
    group: PetGroup
    index: number
    pet: Pet
  } | null>(null)
  const followingPetId = ref<number | null>(pets.find((pet) => pet.isFollowing)?.id ?? null)
  const skillsByPetName = reactive<Record<string, Skill[]>>(
    Object.fromEntries(
      knownPets.map((pet) => [
        pet.name,
        (skillBook[pet.name] ?? fallbackSkills).map((skill) => ({ ...skill })),
      ]),
    ),
  )

  const petSlots = reactive<Record<PetGroup, Array<Pet | null>>>({
    battle: createSlots('battle'),
    standby: createSlots('standby'),
  })

  const battlePets = computed(() => petSlots.battle)
  const standbyPets = computed(() => petSlots.standby)
  const warehousePets = computed(() => warehousePetList)

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
  const selectedSkills = computed(() => skillsByPetName[selectedPet.value.name] ?? fallbackSkills)

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

  function replaceSelectedSkill(skillIndex: number, nextSkill: Skill) {
    if (selectedPet.value.isEmpty || !Number.isInteger(skillIndex)) {
      return
    }

    const petSkills = skillsByPetName[selectedPet.value.name]

    if (!petSkills || skillIndex < 0 || skillIndex >= petSkills.length) {
      return
    }

    petSkills[skillIndex] = { ...nextSkill }
  }

  function bagPetCount() {
    return [...petSlots.battle, ...petSlots.standby].filter(Boolean).length
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

  function firstBagPet() {
    return [...petSlots.battle, ...petSlots.standby].find(Boolean) ?? null
  }

  function removePetFromBag(petId: number) {
    for (const group of ['battle', 'standby'] as const) {
      const index = petSlots[group].findIndex((pet) => pet?.id === petId)

      if (index !== -1) {
        const [pet] = petSlots[group].splice(index, 1, null)
        compactSlots(group)

        return pet
      }
    }

    return null
  }

  function firstEmptyBagSlot() {
    const preferredGroups: PetGroup[] = ['standby', 'battle']

    for (const group of preferredGroups) {
      const index = petSlots[group].findIndex((pet) => !pet)

      if (index !== -1) {
        return { group, index }
      }
    }

    return null
  }

  function putSelectedPetInWarehouse(): PetMoveResult {
    if (selectedPet.value.isEmpty) {
      return { ok: false, message: '当前没有选中的精灵' }
    }

    if (bagPetCount() <= 1) {
      return { ok: false, message: '背包中至少需要保留一只精灵' }
    }

    const pet = removePetFromBag(selectedPet.value.id)

    if (!pet) {
      return { ok: false, message: `${selectedPet.value.name}已经不在背包中`, petName: selectedPet.value.name }
    }

    pet.group = 'standby'
    pet.isFollowing = false

    if (followingPetId.value === pet.id) {
      followingPetId.value = null
    }

    warehousePetList.unshift(pet)
    activePetId.value = firstBagPet()?.id ?? fallbackPet.id

    return { ok: true, message: `已将${pet.name}放回仓库`, petName: pet.name }
  }

  function putWarehousePetInBag(pet: Pet): PetMoveResult {
    const slot = firstEmptyBagSlot()

    if (!slot) {
      return { ok: false, message: '背包已满，请选择要替换的精灵', petName: pet.name, reason: 'bag-full' }
    }

    const warehouseIndex = warehousePetList.findIndex((item) => item.id === pet.id)

    if (warehouseIndex === -1) {
      return { ok: false, message: `${pet.name}已经不在仓库中`, petName: pet.name }
    }

    const [nextPet] = warehousePetList.splice(warehouseIndex, 1)

    nextPet.group = slot.group
    petSlots[slot.group][slot.index] = nextPet
    compactSlots(slot.group)
    activePetId.value = nextPet.id

    return { ok: true, message: `已将${nextPet.name}放入背包`, petName: nextPet.name }
  }

  function replaceBagPetWithWarehousePet(warehousePet: Pet, replacedPet: Pet): PetMoveResult {
    const targetSlot = findPetSlot(replacedPet.id)

    if (!targetSlot) {
      return { ok: false, message: `${replacedPet.name}已经不在背包中`, petName: replacedPet.name }
    }

    const currentPet = petSlots[targetSlot.group][targetSlot.index]

    if (!currentPet) {
      return { ok: false, message: `${replacedPet.name}已经不在背包中`, petName: replacedPet.name }
    }

    const warehouseIndex = warehousePetList.findIndex((item) => item.id === warehousePet.id)

    if (warehouseIndex === -1) {
      return { ok: false, message: `${warehousePet.name}已经不在仓库中`, petName: warehousePet.name }
    }

    const [nextPet] = warehousePetList.splice(warehouseIndex, 1)

    nextPet.group = targetSlot.group
    currentPet.group = 'standby'
    currentPet.isFollowing = false
    petSlots[targetSlot.group][targetSlot.index] = nextPet
    warehousePetList.unshift(currentPet)
    activePetId.value = nextPet.id

    if (followingPetId.value === currentPet.id) {
      followingPetId.value = null
    }

    return {
      ok: true,
      message: `已将${nextPet.name}放入背包，${currentPet.name}已回到仓库`,
      petName: nextPet.name,
    }
  }

  function releaseWarehousePet(pet: Pet): PetMoveResult {
    const warehouseIndex = warehousePetList.findIndex((item) => item.id === pet.id)

    if (warehouseIndex === -1) {
      return { ok: false, message: `${pet.name}已经不在仓库中`, petName: pet.name }
    }

    const [releasedPet] = warehousePetList.splice(warehouseIndex, 1)

    return { ok: true, message: `已放生${releasedPet.name}`, petName: releasedPet.name }
  }

  function toggleWarehouseEliteFavorite(pet: Pet) {
    const warehousePet = warehousePetList.find((item) => item.id === pet.id)

    if (!warehousePet) {
      return null
    }

    warehousePet.isEliteFavorite = !warehousePet.isEliteFavorite

    return warehousePet
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
    putSelectedPetInWarehouse,
    putWarehousePetInBag,
    replaceBagPetWithWarehousePet,
    releaseWarehousePet,
    selectedPet,
    selectedSkills,
    selectedStats,
    selectPet,
    replaceSelectedSkill,
    standbyPets,
    startPetDrag,
    toggleWarehouseEliteFavorite,
    warehousePets,
  }
}
