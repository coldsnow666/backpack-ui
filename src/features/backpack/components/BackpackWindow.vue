<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue'
import { petDetailMeta, statsByName } from '../data'
import { useBackpackState } from '../composables/useBackpackState'
import BackpackList from './BackpackList.vue'
import PetDetails from './PetDetails.vue'
import type { PetGroup } from '../types'

type DragTarget = { group: PetGroup, index: number } | null

defineProps<{
  panelStyle: CSSProperties
}>()

const emit = defineEmits<{
  startPanelDrag: [event: PointerEvent]
}>()

const {
  battlePets,
  finishPetDrag,
  selectedPet,
  selectedSkills,
  selectedStats,
  selectPet,
  standbyPets,
  startPetDrag,
} = useBackpackState()

const dragOverTarget = ref<DragTarget>(null)
const dragTargetPetName = computed(() => {
  if (!dragOverTarget.value) {
    return ''
  }

  const slots = dragOverTarget.value.group === 'battle' ? battlePets.value : standbyPets.value
  const targetPet = slots[dragOverTarget.value.index]

  return targetPet?.name ?? ''
})

function changeDragOverTarget(target: DragTarget) {
  dragOverTarget.value = target
}

function handleFinishPetDrag(target: DragTarget) {
  finishPetDrag(target)
  dragOverTarget.value = null
}
</script>

<template>
  <section class="backpack-window" :style="panelStyle" aria-label="精灵背包">
    <BackpackList
      group="standby"
      :drag-over-target="dragOverTarget"
      :drag-target-pet-name="dragTargetPetName"
      :pets="standbyPets"
      :selected-pet="selectedPet"
      :stats-by-name="statsByName"
      @change-drag-over-target="changeDragOverTarget"
      @finish-pet-drag="handleFinishPetDrag"
      @select-pet="selectPet"
      @start-pet-drag="startPetDrag"
      @start-panel-drag="emit('startPanelDrag', $event)"
    />

    <BackpackList
      group="battle"
      :drag-over-target="dragOverTarget"
      :drag-target-pet-name="dragTargetPetName"
      :pets="battlePets"
      :selected-pet="selectedPet"
      :stats-by-name="statsByName"
      @change-drag-over-target="changeDragOverTarget"
      @finish-pet-drag="handleFinishPetDrag"
      @select-pet="selectPet"
      @start-pet-drag="startPetDrag"
      @start-panel-drag="emit('startPanelDrag', $event)"
    />

    <PetDetails
      :detail-meta="petDetailMeta"
      :pet="selectedPet"
      :skills="selectedSkills"
      :stats="selectedStats"
    />
  </section>
</template>
