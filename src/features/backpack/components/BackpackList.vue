<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue'
import { useDraggable } from '@vueuse/core'
import { bottomTabs, topTabs } from '../data'
import { usePetHp } from '../composables/usePetHp'
import { usePetImageFit } from '../composables/usePetImageFit'
import ActionBar from './ActionBar.vue'
import BagHeader from './BagHeader.vue'
import PetSlot from './PetSlot.vue'
import type { ActionTab, Pet, PetGroup, PetStats } from '../types'

type DragTarget = { group: PetGroup, index: number } | null

const props = defineProps<{
  dragOverTarget: DragTarget
  dragTargetPetName: string
  group: PetGroup
  pets: Array<Pet | null>
  selectedPet: Pet
  statsByName: Record<string, PetStats>
}>()

const emit = defineEmits<{
  changeDragOverTarget: [target: DragTarget]
  finishPetDrag: [target: DragTarget]
  petAction: [tab: ActionTab]
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
const dragOffset = ref({ x: 0, y: 0 })
const dragPoint = ref({ x: 0, y: 0 })
const dragSlotSize = ref({ width: 0, height: 0 })
const dragSlotScale = ref(1)
const standbyNameTooltip = ref<{ text: string, x: number, y: number } | null>(null)
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
const bottomActionTabs = computed(() => bottomTabs.map(actionTabForSelectedPet))
const isBattleBag = computed(() => props.group === 'battle')
const topActionTabs = computed(() => topTabs.map(actionTabForSelectedPet))
const dragCardLeft = computed(() => dragPoint.value.x - dragOffset.value.x)
const dragCardTop = computed(() => dragPoint.value.y - dragOffset.value.y)
const dragCardVisibleWidth = computed(() => dragSlotSize.value.width * dragSlotScale.value)
const dragGhostIsRound = computed(() => draggedGroup.value === 'battle')
const roundDragCardLeft = computed(() => dragPoint.value.x - 22)
const roundDragCardTop = computed(() => dragPoint.value.y - 22)
const dragArrowStyle = computed(() => ({
  left: `${dragGhostIsRound.value ? roundDragCardLeft.value + 52 : dragCardLeft.value + dragCardVisibleWidth.value + 8}px`,
  top: `${(dragGhostIsRound.value ? roundDragCardTop.value : dragCardTop.value) - 42}px`,
}))
const roundDragGhostStyle = computed(() => ({
  left: `${dragGhostIsRound.value ? roundDragCardLeft.value : dragCardLeft.value}px`,
  top: `${dragGhostIsRound.value ? roundDragCardTop.value : dragCardTop.value}px`,
  transform: dragGhostIsRound.value ? 'none' : `scale(${dragSlotScale.value})`,
  transformOrigin: 'left top',
}))
const standbyNameTooltipStyle = computed<CSSProperties>(() => {
  if (!standbyNameTooltip.value) {
    return {}
  }

  return {
    left: `${standbyNameTooltip.value.x}px`,
    top: `${standbyNameTooltip.value.y}px`,
  }
})

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
    group: props.group,
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
  return props.group === 'battle' && props.pets[0]?.id === props.selectedPet.id
}

function actionTabForSelectedPet(tab: ActionTab): ActionTab {
  if (tab.id !== 'follow') {
    return tab
  }

  return {
    ...tab,
    image: props.selectedPet.isFollowing ? (tab.activeImage ?? tab.image) : tab.image,
    label: props.selectedPet.isFollowing ? '放入包内' : '身边跟随',
  }
}

function avatarForPet(pet: Pet) {
  return pet.avatarImage ?? pet.image
}

function hpArcStyle(pet: Pet): CSSProperties {
  const percent = Math.max(0, Math.min(100, hpPercent(pet)))

  return {
    '--hp-ring-offset': `${100 - percent}`,
  } as CSSProperties
}

function moveStandbyNameTooltip(event: PointerEvent, pet: Pet) {
  if (pet.isEmpty) {
    standbyNameTooltip.value = null
    return
  }

  standbyNameTooltip.value = {
    text: pet.name,
    x: event.clientX,
    y: event.clientY,
  }
}

function hideStandbyNameTooltip() {
  standbyNameTooltip.value = null
}

function petFromPointerEvent(event: PointerEvent) {
  const slotElement = (event.target as Element | null)?.closest<HTMLElement>('[data-bag-slot="true"]')

  if (!slotElement) {
    return null
  }

  const index = Number(slotElement.dataset.petSlotIndex)
  const pet = displayPets.value[index]

  if (!Number.isInteger(index) || !pet || pet.isEmpty) {
    return null
  }

  return {
    group: props.group,
    index,
    pet,
  }
}

function targetFromPoint(event: PointerEvent) {
  const element = document.elementFromPoint(event.clientX, event.clientY)
  const slotElement = element?.closest<HTMLElement>('[data-bag-slot="true"]')

  if (!slotElement) {
    return null
  }

  const group = slotElement.dataset.petGroup as PetGroup | undefined
  const index = Number(slotElement.dataset.petSlotIndex)

  return group && Number.isInteger(index) ? { group, index } : null
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
  emit('changeDragOverTarget', null)
  hideStandbyNameTooltip()
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

    emit('changeDragOverTarget', draggedPet.value ? targetFromPoint(event) : null)
  },
  onEnd: (_position, event) => {
    if (draggedPet.value) {
      emit('finishPetDrag', targetFromPoint(event))
    }

    resetDragState()
  },
})
</script>

<template>
  <section v-if="!isBattleBag" class="bag-card standby-card panel-card">
    <section ref="petListRef" class="standby-list" aria-label="备战精灵列表">
      <div
        v-for="(pet, petIndex) in displayPets"
        :key="pet.id"
        class="standby-item"
        data-bag-slot="true"
        :data-pet-group="group"
        :data-pet-slot-index="petIndex"
      >
        <button
          type="button"
          class="standby-slot"
          :class="{
            empty: pet.isEmpty,
            selected: !pet.isEmpty && selectedPet.id === pet.id,
            'drop-target': props.dragOverTarget?.group === group && props.dragOverTarget.index === petIndex,
          }"
          :aria-disabled="pet.isEmpty"
          :tabindex="pet.isEmpty ? -1 : 0"
          @click="pet.isEmpty ? undefined : emit('selectPet', pet)"
        >
          <img v-if="!pet.isEmpty" :src="avatarForPet(pet)" :alt="pet.name" />
          <svg
            v-if="!pet.isEmpty"
            class="standby-hp-arc"
            :style="hpArcStyle(pet)"
            viewBox="0 0 40 40"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              class="standby-hp-arc-track"
              cx="20"
              cy="20"
              r="19"
              pathLength="100"
            />
            <circle
              class="standby-hp-arc-fill"
              cx="20"
              cy="20"
              r="19"
              pathLength="100"
            />
          </svg>
        </button>
        <span
          class="standby-pet-name"
          :class="{
            empty: pet.isEmpty,
            selected: !pet.isEmpty && selectedPet.id === pet.id,
          }"
          @pointerenter="moveStandbyNameTooltip($event, pet)"
          @pointermove="moveStandbyNameTooltip($event, pet)"
          @pointerleave="hideStandbyNameTooltip"
        >
          {{ pet.isEmpty ? '无精灵' : pet.name }}
        </span>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="draggedPet"
        class="drag-guidance"
        :style="dragArrowStyle"
      >
        <span class="drag-hint-text">
          <template v-if="props.dragOverTarget && props.dragTargetPetName">
            松手后替换目标精灵<span class="drag-hint-accent">{{ props.dragTargetPetName }}</span>
          </template>
          <template v-else-if="props.dragOverTarget">
            松手后放入<span class="drag-hint-accent">空位</span>
          </template>
          <template v-else>
            松手后<span class="drag-hint-accent">回到原位</span>
          </template>
        </span>
        <img
          class="drag-arrow"
          src="/backpack/arrow.png"
          alt=""
        />
      </div>

      <div v-if="draggedPet" class="round-drag-ghost" :style="roundDragGhostStyle">
        <span class="standby-slot standby-ghost-slot">
          <img :src="avatarForPet(draggedPet)" :alt="draggedPet.name" />
        </span>
        <span class="standby-pet-name">{{ draggedPet.name }}</span>
      </div>

      <div
        v-if="standbyNameTooltip"
        class="standby-name-tooltip"
        :style="standbyNameTooltipStyle"
      >
        {{ standbyNameTooltip.text }}
      </div>
    </Teleport>
  </section>

  <section v-else class="bag-card panel-card">
    <div class="outer-rail-frame" aria-hidden="true"></div>
    <div class="inner-glass-frame" aria-hidden="true"></div>

    <BagHeader :show-close="isBattleBag" @start-panel-drag="emit('startPanelDrag', $event)" />

    <ActionBar
      class="bag-top-tabs"
      :tabs="topActionTabs"
      placement="top"
      @action="emit('petAction', $event)"
    />

    <section ref="petListRef" class="pet-list" aria-label="精灵列表">
      <PetSlot
        v-for="(pet, petIndex) in displayPets"
        :key="pet.id"
        :active-group="group"
        data-bag-slot="true"
        :data-pet-group="group"
        :drop-target="props.dragOverTarget?.group === group && props.dragOverTarget.index === petIndex"
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

    <ActionBar
      :disabled-labels="disabledBottomLabels"
      :tabs="bottomActionTabs"
      placement="bottom"
      @action="emit('petAction', $event)"
    />

    <Teleport to="body">
      <div
        v-if="draggedPet"
        class="drag-guidance"
        :style="dragArrowStyle"
      >
        <span class="drag-hint-text">
          <template v-if="props.dragOverTarget && props.dragTargetPetName">
            松手后替换目标精灵<span class="drag-hint-accent">{{ props.dragTargetPetName }}</span>
          </template>
          <template v-else-if="props.dragOverTarget">
            松手后放入<span class="drag-hint-accent">空位</span>
          </template>
          <template v-else>
            松手后<span class="drag-hint-accent">回到原位</span>
          </template>
        </span>
        <img
          class="drag-arrow"
          src="/backpack/arrow.png"
          alt=""
        />
      </div>

      <div v-if="draggedPet" class="round-drag-ghost" :style="roundDragGhostStyle">
        <span class="standby-slot standby-ghost-slot">
          <img :src="avatarForPet(draggedPet)" :alt="draggedPet.name" />
        </span>
        <span class="standby-pet-name">{{ draggedPet.name }}</span>
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

.standby-card {
  width: 82px;
  min-height: 360px;
  grid-template-rows: minmax(0, 1fr);
  overflow: visible;
  place-items: center;
  padding: 16px 8px;
  border: 3px solid #00cfff;
  background-color: rgba(0, 46, 103, 0.8);
  box-shadow:
    inset 0 0 0 2px rgba(0, 46, 103, 0.9),
    0 0 0 2px rgba(0, 46, 103, 0.9),
    inset 0 0 12px rgba(0, 86, 180, 0.18),
    0 6px 14px rgba(0, 17, 44, 0.34);
}

.standby-card::before {
  display: none;
}

.standby-list {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-rows: repeat(6, 54px);
  gap: 4px;
}

.standby-item {
  min-width: 0;
  display: grid;
  grid-template-rows: 44px 10px;
  justify-items: center;
  align-content: start;
  margin-bottom: 2px;
}

.standby-pet-name {
  max-width: 58px;
  overflow: hidden;
  color: #ffffff;
  font-size: 10px;
  font-weight: 400;
  line-height: 10px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
}

.standby-pet-name.empty {
  opacity: 0.72;
}

.standby-pet-name.selected {
  color: #ffffff;
  text-shadow:
    0 0 2px rgba(255, 255, 255, 0.8),
    0 0 4px rgba(255, 248, 39, 0.82),
    0 0 7px rgba(255, 214, 0, 0.46),
    0 1px 0 #004b8c;
}

.standby-name-tooltip {
  position: fixed;
  z-index: 1200;
  width: max-content;
  max-width: none;
  padding: 3px 6px;
  border: 1px solid #111111;
  border-radius: 4px;
  color: #111111;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.22);
  font-size: 11px;
  line-height: 1.2;
  pointer-events: none;
  text-align: center;
  transform: translate(8px, calc(-100% - 8px));
  white-space: nowrap;
}

.standby-slot {
  position: relative;
  overflow: hidden;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 2px solid #176daa;
  border-radius: 50%;
  background: #184992;
  cursor: pointer;
}

.standby-slot.empty {
  cursor: default;
  opacity: 0.55;
}

.standby-slot.selected {
  border-color: #ffff1e;
  box-shadow:
    inset 0 0 0 0 rgba(255, 255, 221, 0.96),
    inset 0 0 3px 1px rgba(255, 248, 39, 0.72),
    inset 0 0 8px 3px rgba(255, 214, 0, 0.34),
    0 0 4px rgba(255, 247, 41, 0.58),
    0 0 8px rgba(255, 214, 0, 0.34);
  filter: drop-shadow(0 0 2px rgba(255, 247, 41, 0.5));
}

.standby-slot.selected img {
  filter: drop-shadow(0 0 3px rgba(255, 247, 41, 0.58));
}

.standby-slot.drop-target {
  border-color: #2ff7ff;
  box-shadow:
    inset 0 0 3px 1px rgba(47, 247, 255, 0.78),
    inset 0 0 8px 3px rgba(0, 194, 255, 0.36);
}

.standby-slot img {
  position: relative;
  z-index: 3;
  width: 40px;
  height: 40px;
  display: block;
  object-fit: contain;
  pointer-events: none;
  /* transform: translateY(-2px); */
}

.standby-hp-arc {
  position: absolute;
  inset: 0;
  z-index: 8;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  transform: rotate(-90deg);
}

.standby-hp-arc-track,
.standby-hp-arc-fill {
  fill: none;
  stroke-linecap: butt;
  stroke-width: 2px;
  vector-effect: non-scaling-stroke;
}

.standby-hp-arc-track {
  stroke: rgba(3, 21, 55, 0.62);
}

.standby-hp-arc-fill {
  stroke: #f00000;
  stroke-dasharray: 100;
  stroke-dashoffset: var(--hp-ring-offset);
  filter:
    drop-shadow(0 0 1px rgba(255, 255, 255, 0.72))
    drop-shadow(0 0 1px rgba(255, 0, 0, 0.95));
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

.bag-top-tabs {
  position: absolute;
  top: 39px;
  left: 50%;
  z-index: 4;
  width: 236px;
  margin: 0;
  padding: 0 24px;
  transform: translateX(-50%);
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

.round-drag-ghost {
  position: fixed;
  z-index: 1000;
  display: grid;
  grid-template-rows: 44px 10px;
  justify-items: center;
  align-content: start;
  pointer-events: none;
}

.standby-ghost-slot {
  box-shadow:
    inset 0 0 3px 1px rgba(47, 247, 255, 0.78),
    inset 0 0 8px 3px rgba(0, 194, 255, 0.36),
    0 7px 14px rgba(0, 17, 44, 0.34);
}

.standby-ghost-slot img {
  width: 40px;
  height: 40px;
  display: block;
  object-fit: contain;
  filter: none;
}
</style>
