<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type CSSProperties } from 'vue'
import BackpackList from './components/BackpackList.vue'
import PetDetails from './components/PetDetails.vue'
import {
  backpackPets,
  fallbackSkills,
  groupMeta,
  petDetailMeta,
  petGroups,
  skillBook,
  statsByName,
} from './constants/mock'
import type { Pet, PetGroup } from './types'

const pets = backpackPets.filter((pet) => !pet.isEmpty)
const fallbackPet = pets[0] as Pet
const activeGroup = ref<PetGroup>('battle')
const activePetId = ref(pets.find((pet) => pet.group === 'battle')?.id ?? fallbackPet.id)
const panelOffset = ref({ x: 0, y: 0 })

let dragStart:
  | {
      pointerId: number
      clientX: number
      clientY: number
      originX: number
      originY: number
    }
  | null = null

const visiblePets = computed(() => pets.filter((pet) => pet.group === activeGroup.value))

const selectedPet = computed(() => {
  return pets.find((pet) => pet.id === activePetId.value) ?? visiblePets.value[0] ?? fallbackPet
})

const selectedStats = computed(() => statsByName[selectedPet.value.name] ?? statsByName['谱尼'])
const selectedSkills = computed(() => skillBook[selectedPet.value.name] ?? fallbackSkills)
const panelStyle = computed<CSSProperties>(() => ({
  transform: `translate(${panelOffset.value.x}px, ${panelOffset.value.y}px)`,
}))

function stopPanelDrag() {
  dragStart = null
  window.removeEventListener('pointermove', movePanel)
  window.removeEventListener('pointerup', stopPanelDrag)
  window.removeEventListener('pointercancel', stopPanelDrag)
}

function movePanel(event: PointerEvent) {
  if (!dragStart || event.pointerId !== dragStart.pointerId) {
    return
  }

  panelOffset.value = {
    x: dragStart.originX + event.clientX - dragStart.clientX,
    y: dragStart.originY + event.clientY - dragStart.clientY,
  }
}

function startPanelDrag(event: PointerEvent) {
  if (event.button !== 0) {
    return
  }

  event.preventDefault()
  dragStart = {
    pointerId: event.pointerId,
    clientX: event.clientX,
    clientY: event.clientY,
    originX: panelOffset.value.x,
    originY: panelOffset.value.y,
  }
  window.addEventListener('pointermove', movePanel)
  window.addEventListener('pointerup', stopPanelDrag)
  window.addEventListener('pointercancel', stopPanelDrag)
}

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

onBeforeUnmount(() => {
  stopPanelDrag()
})
</script>

<template>
  <main class="app-stage">
    <section class="backpack-window" :style="panelStyle" aria-label="精灵背包">
      <BackpackList
        :active-group="activeGroup"
        :group-meta="groupMeta"
        :pet-groups="petGroups"
        :pets="visiblePets"
        :selected-pet="selectedPet"
        :stats-by-name="statsByName"
        @select-group="selectGroup"
        @select-pet="selectPet"
        @start-panel-drag="startPanelDrag"
      />

      <PetDetails
        :detail-meta="petDetailMeta"
        :pet="selectedPet"
        :skills="selectedSkills"
        :stats="selectedStats"
      />
    </section>
  </main>
</template>
