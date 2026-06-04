<script setup lang="ts">
import { computed } from 'vue'
import { bottomTabs, topTabs } from '../data'
import { usePetHp } from '../composables/usePetHp'
import { usePetImageFit } from '../composables/usePetImageFit'
import ActionBar from './ActionBar.vue'
import BagHeader from './BagHeader.vue'
import PetSlot from './PetSlot.vue'
import RosterTabs from './RosterTabs.vue'
import type { GroupMeta, Pet, PetGroup, PetStats } from '../types'

const props = defineProps<{
  activeGroup: PetGroup
  groupMeta: Record<PetGroup, GroupMeta>
  petGroups: PetGroup[]
  pets: Pet[]
  selectedPet: Pet
  statsByName: Record<string, PetStats>
}>()

const emit = defineEmits<{
  selectGroup: [group: PetGroup]
  selectPet: [pet: Pet]
  startPanelDrag: [event: PointerEvent]
}>()

const visibleSlotCount = 6
const { hpForPet, hpPercent } = usePetHp(props.statsByName)
const { adjustPetImagePosition, petListImageStyle } = usePetImageFit()

const displayPets = computed<Pet[]>(() => {
  const realPets = props.pets.slice(0, visibleSlotCount)
  const emptyPets = Array.from({ length: Math.max(0, visibleSlotCount - realPets.length) }, (_, index) => emptyPet(index))

  return [...realPets, ...emptyPets]
})

const disabledBottomLabels = computed(() => (isSelectedStarter() ? ['设为首发'] : []))

function emptyPet(index: number): Pet {
  return {
    id: -index - 1,
    name: '',
    level: 0,
    serial: '000',
    nature: '',
    colorfulLevel: 0,
    requiredExp: 0,
    totalExp: 0,
    acquiredAt: '',
    image: '',
    group: props.activeGroup,
    learningPower: {
      attack: 0,
      specialAttack: 0,
      defense: 0,
      specialDefense: 0,
      speed: 0,
      hp: 0,
    },
    isEmpty: true,
  }
}

function isSelectedStarter() {
  return props.activeGroup === 'battle' && props.pets[0]?.id === props.selectedPet.id
}
</script>

<template>
  <RosterTabs
    :active-group="activeGroup"
    :group-meta="groupMeta"
    :pet-groups="petGroups"
    @select-group="emit('selectGroup', $event)"
  />

  <section class="bag-card panel-card">
    <div class="outer-rail-frame" aria-hidden="true"></div>

    <BagHeader @start-panel-drag="emit('startPanelDrag', $event)" />

    <ActionBar :tabs="topTabs" placement="top" />

    <section class="pet-list" :aria-label="groupMeta[activeGroup].title">
      <PetSlot
        v-for="(pet, petIndex) in displayPets"
        :key="pet.id"
        :active-group="activeGroup"
        :hp="hpForPet(pet)"
        :hp-percent="hpPercent(pet)"
        :image-style="petListImageStyle(pet)"
        :pet="pet"
        :pet-index="petIndex"
        :selected="selectedPet.id === pet.id"
        @image-load="adjustPetImagePosition"
        @select="emit('selectPet', $event)"
      />
    </section>

    <ActionBar :disabled-labels="disabledBottomLabels" :tabs="bottomTabs" placement="bottom" />
  </section>
</template>

<style scoped>
.bag-card {
  isolation: isolate;
  display: grid;
  grid-template-rows: 50px 27px minmax(0, 1fr) 42px;
  overflow: hidden;
  padding: 7px 26px 8px;
  border: 2px solid #0a4b95;
  border-radius: 16px;
  background: transparent;
  box-shadow: 0 6px 14px rgba(0, 17, 44, 0.34);
}

.bag-card::before {
  position: absolute;
  inset: 0 14px;
  z-index: 0;
  background:
    linear-gradient(180deg, rgba(147, 229, 255, 0.95) 0 4px, transparent 4px 100%),
    linear-gradient(180deg, #55c5ff 0%, #2fa7ee 40%, #2493d9 100%);
  box-shadow:
    inset 0 0 0 5px rgba(255, 255, 255, 0.28),
    inset 0 -14px 0 rgba(10, 139, 204, 0.24);
  content: "";
  pointer-events: none;
}

.outer-rail-frame {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  pointer-events: none;
}

.outer-rail-frame::before,
.outer-rail-frame::after {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 14px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.24) 24%, transparent 25%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(255, 255, 255, 0.72) 45%, rgba(255, 255, 255, 0.84) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(6, 75, 151, 0.72),
    inset 2px 0 0 rgba(255, 255, 255, 0.28),
    inset -1px 0 0 rgba(16, 122, 195, 0.5);
  content: "";
}

.outer-rail-frame::before {
  left: 0;
  border-radius: 13px 0 0 13px;
}

.outer-rail-frame::after {
  right: 0;
  border-radius: 0 13px 13px 0;
  background:
    linear-gradient(270deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.24) 24%, transparent 25%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(255, 255, 255, 0.72) 45%, rgba(255, 255, 255, 0.84) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(6, 75, 151, 0.72),
    inset -2px 0 0 rgba(255, 255, 255, 0.28),
    inset 1px 0 0 rgba(16, 122, 195, 0.5);
}

.bag-card > * {
  position: relative;
  z-index: 3;
}

.bag-card > .outer-rail-frame {
  position: absolute;
  z-index: 2;
}

.pet-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: space-between;
  column-gap: 14px;
  row-gap: 22px;
  min-height: 0;
  padding: 18px 17px 18px 18px;
  overflow: visible;
}
</style>
