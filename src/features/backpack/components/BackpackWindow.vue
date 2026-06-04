<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { petDetailMeta, statsByName } from '../data'
import { useBackpackState } from '../composables/useBackpackState'
import BackpackList from './BackpackList.vue'
import PetDetails from './PetDetails.vue'

defineProps<{
  panelStyle: CSSProperties
}>()

const emit = defineEmits<{
  startPanelDrag: [event: PointerEvent]
}>()

const {
  activeGroup,
  finishPetDrag,
  selectedPet,
  selectedSkills,
  selectedStats,
  selectGroup,
  selectPet,
  startPetDrag,
  visiblePets,
} = useBackpackState()
</script>

<template>
  <section class="backpack-window" :style="panelStyle" aria-label="精灵背包">
    <BackpackList
      :active-group="activeGroup"
      :pets="visiblePets"
      :selected-pet="selectedPet"
      :stats-by-name="statsByName"
      @finish-pet-drag="finishPetDrag"
      @select-group="selectGroup"
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
