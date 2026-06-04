<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { groupMeta, petDetailMeta, petGroups, statsByName } from '../data'
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
  selectedPet,
  selectedSkills,
  selectedStats,
  selectGroup,
  selectPet,
  visiblePets,
} = useBackpackState()
</script>

<template>
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
