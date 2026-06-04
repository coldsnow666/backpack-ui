<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDraggable } from '@vueuse/core'
import { bottomTabs } from '../data'
import { usePetHp } from '../composables/usePetHp'
import { usePetImageFit } from '../composables/usePetImageFit'
import ActionBar from './ActionBar.vue'
import BagHeader from './BagHeader.vue'
import PetSlot from './PetSlot.vue'
import type { Pet, PetGroup, PetStats } from '../types'

const props = defineProps<{
  activeGroup: PetGroup
  pets: Array<Pet | null>
  selectedPet: Pet
  statsByName: Record<string, PetStats>
}>()

const emit = defineEmits<{
  finishPetDrag: [targetIndex: number | null]
  selectGroup: [group: PetGroup]
  selectPet: [pet: Pet]
  startPetDrag: [group: PetGroup, index: number]
  startPanelDrag: [event: PointerEvent]
}>()

const visibleSlotCount = 6
const petListRef = ref<HTMLElement | null>(null)
const dragStartPoint = ref<{ x: number, y: number } | null>(null)
const dragCandidate = ref<{ group: PetGroup, index: number, pet: Pet } | null>(null)
const draggedPet = ref<Pet | null>(null)
const draggedGroup = ref<PetGroup>('battle')
const dragOverIndex = ref<number | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const dragPoint = ref({ x: 0, y: 0 })
const dragSlotSize = ref({ width: 0, height: 0 })
const dragSlotScale = ref(1)
const { hpForPet, hpPercent } = usePetHp(props.statsByName)
const { adjustPetImagePosition, petListImageStyle } = usePetImageFit()

const displayPets = computed<Pet[]>(() => {
  const visiblePets = props.pets.slice(0, visibleSlotCount)
  const filledPets = [
    ...visiblePets,
    ...Array.from<null>({ length: Math.max(0, visibleSlotCount - visiblePets.length) }).fill(null),
  ]

  return filledPets.map((pet, index) => pet ?? emptyPet(index))
})

const disabledBottomLabels = computed(() => (isSelectedStarter() ? ['设为首发'] : []))
const bagTitle = computed(() => (props.activeGroup === 'battle' ? '出战背包' : '备战背包'))
const dragCardLeft = computed(() => dragPoint.value.x - dragOffset.value.x)
const dragCardTop = computed(() => dragPoint.value.y - dragOffset.value.y)
const dragCardVisibleWidth = computed(() => dragSlotSize.value.width * dragSlotScale.value)
const dragArrowStyle = computed(() => ({
  left: `${dragCardLeft.value + dragCardVisibleWidth.value + 8}px`,
  top: `${dragCardTop.value - 42}px`,
}))
const dragTargetBagTitle = computed(() => bagTitleForGroup(draggedPet.value ? otherGroup(draggedGroup.value) : props.activeGroup))
const dragTargetPet = computed(() => {
  if (dragOverIndex.value === null) {
    return null
  }

  return props.pets[dragOverIndex.value] ?? null
})
const dragGhostStyle = computed(() => ({
  height: `${dragSlotSize.value.height}px`,
  left: `${dragCardLeft.value}px`,
  top: `${dragCardTop.value}px`,
  transform: `scale(${dragSlotScale.value})`,
  transformOrigin: 'left top',
  width: `${dragSlotSize.value.width}px`,
}))

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

function bagTitleForGroup(group: PetGroup) {
  return group === 'battle' ? '出战背包' : '备战背包'
}

function otherGroup(group: PetGroup): PetGroup {
  return group === 'battle' ? 'standby' : 'battle'
}

function toggleGroup() {
  emit('selectGroup', otherGroup(props.activeGroup))
}

function moveSwitchTooltip(event: PointerEvent) {
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  button.style.setProperty('--tooltip-x', `${event.clientX - rect.left}px`)
  button.style.setProperty('--tooltip-y', `${event.clientY - rect.top}px`)
}

function petFromPointerEvent(event: PointerEvent) {
  const slotElement = (event.target as Element | null)?.closest<HTMLElement>('[data-pet-slot-index]')

  if (!slotElement) {
    return null
  }

  const index = Number(slotElement.dataset.petSlotIndex)
  const pet = displayPets.value[index]

  if (!Number.isInteger(index) || !pet || pet.isEmpty) {
    return null
  }

  return {
    group: props.activeGroup,
    index,
    pet,
  }
}

function targetIndexFromPoint(event: PointerEvent) {
  const element = document.elementFromPoint(event.clientX, event.clientY)
  const slotElement = element?.closest<HTMLElement>('[data-pet-slot-index]')

  if (!slotElement || !petListRef.value?.contains(slotElement)) {
    return null
  }

  const index = Number(slotElement.dataset.petSlotIndex)

  return Number.isInteger(index) ? index : null
}

function beginDragMode(event: PointerEvent) {
  if (!dragCandidate.value || draggedPet.value) {
    return
  }

  draggedPet.value = dragCandidate.value.pet
  draggedGroup.value = dragCandidate.value.group
  dragPoint.value = {
    x: event.clientX,
    y: event.clientY,
  }
  emit('startPetDrag', dragCandidate.value.group, dragCandidate.value.index)
}

function resetDragState() {
  dragStartPoint.value = null
  dragCandidate.value = null
  draggedPet.value = null
  dragOverIndex.value = null
  dragOffset.value = {
    x: 0,
    y: 0,
  }
  dragSlotSize.value = {
    width: 0,
    height: 0,
  }
  dragSlotScale.value = 1
}

useDraggable(petListRef, {
  buttons: [0],
  preventDefault: true,
  onStart: (_position, event) => {
    const candidate = petFromPointerEvent(event)
    const slotElement = (event.target as Element | null)?.closest<HTMLElement>('[data-pet-slot-index]')

    if (!candidate || !slotElement) {
      return false
    }

    const rect = slotElement.getBoundingClientRect()

    dragCandidate.value = candidate
    dragStartPoint.value = {
      x: event.clientX,
      y: event.clientY,
    }
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    dragPoint.value = {
      x: event.clientX,
      y: event.clientY,
    }
    dragSlotSize.value = {
      width: slotElement.offsetWidth,
      height: slotElement.offsetHeight,
    }
    dragSlotScale.value = rect.width / slotElement.offsetWidth || 1
  },
  onMove: (_position, event) => {
    if (!dragCandidate.value || !dragStartPoint.value) {
      return
    }

    dragPoint.value = {
      x: event.clientX,
      y: event.clientY,
    }

    const distance = Math.hypot(
      event.clientX - dragStartPoint.value.x,
      event.clientY - dragStartPoint.value.y,
    )

    if (distance >= 6) {
      beginDragMode(event)
    }

    dragOverIndex.value = draggedPet.value ? targetIndexFromPoint(event) : null
  },
  onEnd: (_position, event) => {
    if (draggedPet.value) {
      emit('finishPetDrag', targetIndexFromPoint(event))
    }

    resetDragState()
  },
})
</script>

<template>
  <section class="bag-card panel-card">
    <div class="outer-rail-frame" aria-hidden="true"></div>
    <div class="inner-glass-frame" aria-hidden="true"></div>

    <BagHeader @start-panel-drag="emit('startPanelDrag', $event)" />

    <button
      type="button"
      class="bag-switch"
      aria-label="切换背包"
      @click="toggleGroup"
      @pointerenter="moveSwitchTooltip"
      @pointermove="moveSwitchTooltip"
    >
      <img src="/backpack/switch.png" alt="" />
      <span class="switch-tooltip">切换背包</span>
    </button>

    <h2 class="bag-title">{{ bagTitle }}</h2>

    <section ref="petListRef" class="pet-list" aria-label="精灵列表">
      <PetSlot
        v-for="(pet, petIndex) in displayPets"
        :key="pet.id"
        :active-group="activeGroup"
        :drop-target="dragOverIndex === petIndex"
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

    <Teleport to="body">
      <div
        v-if="draggedPet"
        class="drag-guidance"
        :style="dragArrowStyle"
      >
        <span class="drag-hint-text">
          当前切换至<span class="drag-hint-accent">{{ dragTargetBagTitle }}</span>
          <template v-if="dragTargetPet">
            ，松开后替换<span class="drag-hint-accent">{{ dragTargetBagTitle }}</span>精灵<span class="drag-hint-accent">{{ dragTargetPet.name }}</span>
          </template>
          <template v-else>
            ，松手<span class="drag-hint-accent">回到原位</span>
          </template>
        </span>
        <img
          class="drag-arrow"
          src="/backpack/arrow.png"
          alt=""
        />
      </div>

      <div v-if="draggedPet" class="pet-drag-ghost" :style="dragGhostStyle">
        <PetSlot
          :active-group="draggedGroup"
          :drop-target="false"
          :hp="hpForPet(draggedPet)"
          :hp-percent="hpPercent(draggedPet)"
          :image-style="petListImageStyle(draggedPet)"
          :pet="draggedPet"
          :pet-index="dragCandidate?.index ?? 0"
          :selected="selectedPet.id === draggedPet.id"
          @image-load="adjustPetImagePosition"
          @select="() => undefined"
        />
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.bag-card {
  isolation: isolate;
  display: grid;
  grid-template-rows: 72px minmax(0, 1fr) 42px;
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
  background: linear-gradient(180deg, #55c5ff 0%, #2fa7ee 40%, #2493d9 100%);
  box-shadow: inset 0 -14px 0 rgba(10, 139, 204, 0.24);
  content: "";
  pointer-events: none;
}

.inner-glass-frame {
  position: absolute;
  inset: 0 14px;
  z-index: 1;
  background: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 332 360"%3E%3Cpath fill="%23fff" fill-opacity=".28" fill-rule="evenodd" d="M0 0H332V360H0ZM24 5H308A19 19 0 0 1 327 24V336A19 19 0 0 1 308 355H24A19 19 0 0 1 5 336V24A19 19 0 0 1 24 5Z"/%3E%3C/svg%3E') center / 100% 100% no-repeat;
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

.bag-card > .inner-glass-frame {
  position: absolute;
  z-index: 1;
}

.bag-switch {
  position: absolute;
  top: 18px;
  left: 37px;
  z-index: 4;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.bag-switch img {
  width: 38px;
  height: 38px;
  object-fit: contain;
  transform-origin: center;
  transition:
    transform 160ms ease,
    filter 160ms ease;
}

.bag-switch:hover img,
.bag-switch:focus-visible img {
  filter: brightness(1.08) drop-shadow(0 0 4px rgba(255, 255, 255, 0.55));
  transform: scale(1.08);
}

.switch-tooltip {
  position: absolute;
  top: var(--tooltip-y, 0);
  left: var(--tooltip-x, 50%);
  z-index: 10;
  width: max-content;
  max-width: 86px;
  padding: 3px 6px;
  border: 1px solid #111111;
  border-radius: 4px;
  color: #111111;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.22);
  font-size: 11px;
  line-height: 1.2;
  opacity: 0;
  pointer-events: none;
  text-align: center;
  transform: translate(8px, calc(-100% - 8px));
  transition: opacity 120ms ease;
  white-space: nowrap;
}

.bag-switch:hover .switch-tooltip,
.bag-switch:focus-visible .switch-tooltip {
  opacity: 1;
}

.bag-title {
  position: absolute;
  top: 40px;
  left: 50%;
  z-index: 4;
  margin: 0;
  color: #ffffff;
  font-family: "Backpack Tab Qingke", "ZCOOL Qingke HuangYou", "站酷庆科黄油体", "Microsoft YaHei UI", "PingFang SC", sans-serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;
  pointer-events: none;
  transform: translateX(-50%);
  text-shadow:
    0 2px 0 #004b8c,
    2px 0 0 #004b8c,
    -2px 0 0 #004b8c,
    0 -2px 0 #004b8c,
    2px 2px 0 #00386f,
    -2px 2px 0 #00386f,
    0 3px 3px rgba(0, 40, 88, 0.52);
  white-space: nowrap;
}

.pet-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: space-between;
  column-gap: 14px;
  row-gap: 22px;
  min-height: 0;
  padding: 14px 17px 18px 18px;
  overflow: visible;
}

.drag-guidance {
  position: fixed;
  z-index: 1001;
  width: 42px;
  pointer-events: none;
  user-select: none;
}

.drag-hint-text {
  position: absolute;
  right: 0;
  bottom: 48px;
  width: max-content;
  color: #ffffff;
  font-family: "Backpack Tab Qingke", "ZCOOL Qingke HuangYou", "站酷庆科黄油体", "Microsoft YaHei UI", "PingFang SC", sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;
  text-shadow:
    0 2px 0 #004b8c,
    2px 0 0 #004b8c,
    -2px 0 0 #004b8c,
    0 -2px 0 #004b8c,
    2px 2px 0 #00386f,
    -2px 2px 0 #00386f,
    0 3px 3px rgba(0, 40, 88, 0.52);
  white-space: nowrap;
}

.drag-hint-accent {
  color: #7dff55;
}

.drag-arrow {
  display: block;
  width: 42px;
  height: auto;
}

.pet-drag-ghost {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

.pet-drag-ghost :deep(.pet-row) {
  width: 100%;
  height: 100%;
  box-shadow:
    inset 0 0 3px 1px rgba(47, 247, 255, 0.5),
    inset 0 0 8px 3px rgba(0, 194, 255, 0.24),
    0 7px 14px rgba(0, 17, 44, 0.34);
  cursor: grabbing;
}

.pet-drag-ghost :deep(*) {
  pointer-events: none;
}

.pet-drag-ghost :deep(.pet-avatar img) {
  filter:
    drop-shadow(0 3px 2px rgba(0, 18, 58, 0.58))
    drop-shadow(0 0 5px rgba(47, 247, 255, 0.62));
}
</style>
