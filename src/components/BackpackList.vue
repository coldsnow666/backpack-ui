<script setup lang="ts">
import { nextTick, reactive, type CSSProperties } from 'vue'
import { bottomTabs, topTabs } from '../constants/tabs'
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

const dotRows = [12, 10]
const petAutoOffsetY = reactive<Record<number, number>>({})
const petNaturalHeight = reactive<Record<number, number>>({})

function hpForPet(pet: Pet) {
  const max = props.statsByName[pet.name]?.hp ?? 180
  const ratio = 0.82 + ((pet.id * 7) % 17) / 100

  return {
    current: Math.round(max * Math.min(ratio, 1)),
    max,
  }
}

function hpPercent(pet: Pet) {
  const hp = hpForPet(pet)

  return Math.round((hp.current / hp.max) * 100)
}

function tabLines(group: PetGroup) {
  const title = props.groupMeta[group].title

  return [title.slice(0, 2), title.slice(2, 4)]
}

function petListImageStyle(pet: Pet): CSSProperties {
  const naturalHeight = petNaturalHeight[pet.id]
  const listImageHeight = pet.listImageHeight ?? (naturalHeight ? Math.min(58, Math.round(naturalHeight * 0.42)) : 58)

  return {
    '--pet-list-image-height': `${listImageHeight}px`,
    '--pet-list-image-offset-x': `${pet.listImageOffsetX ?? 0}px`,
    '--pet-list-image-offset-y': `${pet.listImageOffsetY ?? 0}px`,
    '--pet-auto-offset-y': `${petAutoOffsetY[pet.id] ?? 0}px`,
    '--pet-shadow-offset-y': `${Math.round(listImageHeight * 0.3)}px`,
  } as CSSProperties
}

async function adjustPetImagePosition(event: Event, pet: Pet) {
  const img = event.currentTarget as HTMLImageElement

  if (img.naturalHeight) {
    petNaturalHeight[pet.id] = img.naturalHeight
  }

  petAutoOffsetY[pet.id] = 0
  await nextTick()

  requestAnimationFrame(() => {
    const row = img.closest('.pet-row')
    const level = row?.querySelector('.pet-level-value')

    if (!(level instanceof HTMLElement)) {
      return
    }

    const imgRect = img.getBoundingClientRect()
    const levelRect = level.getBoundingClientRect()
    const allowedOverlap = 2
    const overlap = imgRect.bottom - (levelRect.top + allowedOverlap)

    petAutoOffsetY[pet.id] = overlap > 0 ? -Math.ceil(overlap) : 0
  })
}

function moveActionTooltip(event: PointerEvent) {
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  button.style.setProperty('--tooltip-x', `${event.clientX - rect.left}px`)
  button.style.setProperty('--tooltip-y', `${event.clientY - rect.top}px`)
}

type BottomTab = (typeof bottomTabs)[number]

function isSelectedStarter() {
  return props.activeGroup === 'battle' && props.pets[0]?.id === props.selectedPet.id
}

function isBottomTabDisabled(tab: BottomTab) {
  return tab.label === '设为首发' && isSelectedStarter()
}

function bottomTabImage(tab: BottomTab) {
  if (isBottomTabDisabled(tab) && 'activeImage' in tab && tab.activeImage) {
    return tab.activeImage
  }

  return tab.image
}
</script>

<template>
  <nav class="roster-sidebar" aria-label="精灵队列">
    <button
      v-for="group in petGroups"
      :key="group"
      type="button"
      class="roster-tab"
      :class="{ active: activeGroup === group }"
      :aria-pressed="activeGroup === group"
      :aria-label="groupMeta[group].title"
      @click="emit('selectGroup', group)"
    >
      <span class="roster-tab-face">
        <span v-for="line in tabLines(group)" :key="line">{{ line }}</span>
      </span>
    </button>
  </nav>

  <section class="bag-card panel-card">
    <div class="outer-rail-frame" aria-hidden="true"></div>

    <header class="bag-header">
      <div class="dot-trapezoid" aria-hidden="true" @pointerdown="emit('startPanelDrag', $event)">
        <div v-for="(count, rowIndex) in dotRows" :key="rowIndex" class="dot-row">
          <span v-for="dotIndex in count" :key="dotIndex"></span>
        </div>
      </div>
      <button type="button" class="close-button" aria-label="关闭">
        <img src="/backpack/icons/close.png" alt="" />
      </button>
    </header>

    <div class="queue-strip">
      <button
        v-for="tab in topTabs"
        :key="tab.label"
        type="button"
        :aria-label="tab.label"
        @pointerenter="moveActionTooltip"
        @pointermove="moveActionTooltip"
      >
        <img :src="tab.image" alt="" />
        <span class="action-tooltip">{{ tab.label }}</span>
      </button>
    </div>

    <section class="pet-list" :aria-label="groupMeta[activeGroup].title">
      <button
        v-for="(pet, petIndex) in pets"
        :key="pet.id"
        type="button"
        class="pet-row"
        :class="{
          starter: activeGroup === 'battle' && petIndex === 0,
          selected: selectedPet.id === pet.id,
        }"
        @click="emit('selectPet', pet)"
      >
        <span class="pet-edge-glow" aria-hidden="true"></span>
        <span class="pet-avatar" :style="petListImageStyle(pet)">
          <img :src="pet.image" :alt="pet.name" @load="adjustPetImagePosition($event, pet)" />
        </span>
        <span class="pet-copy">
          <strong>{{ pet.name }}</strong>
          <span class="hp-track">
            <span
              :class="{ full: hpPercent(pet) >= 100 }"
              :style="{ width: `${hpPercent(pet)}%` }"
            ></span>
          </span>
        </span>
        <span class="pet-level-value">Lv. {{ pet.level }}</span>
        <span class="pet-hp-value">{{ hpForPet(pet).current }}/{{ hpForPet(pet).max }}</span>
      </button>
    </section>

    <footer class="bag-actions" aria-label="背包操作">
      <button
        v-for="tab in bottomTabs"
        :key="tab.label"
        type="button"
        :class="{ disabled: isBottomTabDisabled(tab) }"
        :aria-disabled="isBottomTabDisabled(tab)"
        :aria-label="tab.label"
        @pointerenter="moveActionTooltip"
        @pointermove="moveActionTooltip"
      >
        <img :src="bottomTabImage(tab)" alt="" />
        <span class="action-tooltip">{{ tab.label }}</span>
      </button>
    </footer>
  </section>
</template>

<style scoped>
.roster-sidebar {
  position: absolute;
  top: 72px;
  left: 6px;
  z-index: auto;
  display: grid;
  gap: 9px;
}

.roster-tab {
  position: relative;
  width: 60px;
  height: 42px;
  display: block;
  padding: 0;
  border: 0;
  color: #ffffff;
  background: transparent;
  cursor: pointer;
  right: 5px;
  transition:
    transform 150ms ease,
    filter 150ms ease;
}

.roster-tab::before {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 11px 0 0 11px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.34)),
    rgba(255, 255, 255, 0.46);
  box-shadow:
    inset 0 0 0 1px rgba(105, 203, 244, 0.24),
    0 1px 2px rgba(0, 37, 92, 0.14);
  content: "";
}

.roster-tab-face {
  position: absolute;
  top: 2px;
  left: 2px;
  z-index: 4;
  width: 38px;
  height: 38px;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  place-items: center;
  padding: 4px 3px;
  border: 2px solid #134d84;
  border-radius: 8px;


  background: linear-gradient(
    to bottom,
    #8FE9FF 0%,
    #54D4F2 20%,
    #35B3E3 55%,
    #2C97D1 80%,
    #2477B5 100%
  );

  box-shadow:
    inset 0 0 0 2px rgba(174, 243, 255, 0.66),
    0 2px 0 rgba(0, 35, 89, 0.58);
}

.roster-tab-face span {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  color: #ffffff;
  font-family: "Backpack Tab Qingke", "ZCOOL Qingke HuangYou", "站酷庆科黄油体", "Microsoft YaHei UI", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  transform: none;
  text-shadow:
    0 1px 0 #003f7a,
    1px 0 0 #003f7a,
    -1px 0 0 #003f7a,
    0 -1px 0 #003f7a,
    1px 1px 0 #00366e,
    -1px 1px 0 #00366e;
}

.roster-tab:hover,
.roster-tab:focus-visible {
  filter: brightness(1.12);
  transform: translateX(1px);
  outline: none;
}

.roster-tab.active {
  filter: none;
}

.roster-tab.active .roster-tab-face {
  border-color: #FF5A00;
background: linear-gradient(
    to bottom,
    #FFD27A 0%,
    #FFB84D 20%,
    #FF9830 55%,
    #FF7A15 80%,
    #F56200 100%
);
  box-shadow:
    inset 0 0 0 2px rgba(255, 246, 137, 0.72),
    0 2px 0 rgba(0, 35, 89, 0.58);
}

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

.bag-header {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  gap: 5px;
  min-width: 0;
}

.dot-trapezoid {
  display: grid;
  place-content: center;
  gap: 3px;
  width: 220px;
  height: 28px;
  cursor: grab;
  opacity: 0.95;
  pointer-events: auto;
  touch-action: none;
}

.dot-trapezoid:active {
  cursor: grabbing;
}

.dot-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  height: 4px;
}

.dot-row span {
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #096bc3;
  box-shadow:
    1px 1px 0 rgba(255, 255, 255, 0.42),
    0 1px 0 rgba(0, 50, 120, 0.35);
}

.back-button,
.book-button,
.close-button {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.back-button {
  width: 29px;
  height: 26px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 37% 46%, #ffec3a 0 20%, transparent 21%),
    conic-gradient(from 215deg, transparent 0 14%, #16449b 14% 28%, #ffe53b 28% 58%, #16449b 58% 72%, transparent 72% 100%);
  filter: drop-shadow(0 2px 0 #004589);
}

.book-button {
  width: 29px;
  height: 29px;
  border-radius: 6px;
  background:
    linear-gradient(135deg, #b8ffff 0 18%, transparent 18%),
    linear-gradient(135deg, #38cfff 0%, #0775cb 100%);
  box-shadow:
    inset 0 0 0 3px #093b85,
    0 2px 0 rgba(0, 35, 88, 0.62);
  transform: rotate(19deg);
}

.close-button {
  position: absolute;
  top: 50%;
  right: 0;
  width: 30px;
  height: 30px;
  padding: 0;
  transform: translateY(-50%);
}

.close-button img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 0 rgba(0, 38, 91, 0.36));
}

.queue-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 6px;
  min-width: 0;
  padding: 0 46px;
  border: 0;
  background: transparent;
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


/* 背包精灵未选择样式 */
.pet-row {
  --pet-back-width: 54px;
  --pet-back-height: 54px;
  --pet-back-x: -15px;
  --pet-back-y: -18px;
  --pet-image-anchor-x: 18px;
  --pet-image-anchor-y: 26px;

  position: relative;
  isolation: isolate;
  min-width: 0;
  height: 52px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 2px;
  padding: 4px 7px 4px 3px;
  border-radius: 8px;
  color: #ffffff;

  border: 2px solid #176daa;
  background: #184992;

  cursor: pointer;
}

.pet-row::before {
  position: absolute;
  top: 4px;
  left: 8px;
  z-index: 1;
  width: 38px;
  height: 38px;
   background: url("/backpack/icons/pet_back.png") center / contain no-repeat;
  content: "";
  pointer-events: none;
  transform: translate(var(--pet-back-x), var(--pet-back-y));
}

.pet-row.selected::before {
   background: url("/backpack/icons/pet_back_active.png") center / contain no-repeat;
  filter:
    drop-shadow(0 0 1px #ffff4a)
    drop-shadow(0 0 3px rgba(255, 247, 41, 0.98))
    drop-shadow(0 0 7px rgba(255, 214, 0, 0.88));
}

.pet-row > * {
  position: relative;
  z-index: 2;
}

.pet-row.starter {
  background: #ff9900;
  border: 1px solid #ffd8bf;
  box-shadow:
    inset 0 -2px 0 #ff6600,
    0 0 0 1px #ffffff;
}

.pet-row.selected {
  border-color: #ffff1e;
  box-shadow:
    inset 0 0 0 0px rgba(255, 255, 221, 0.96),
    inset 0 0 3px 1px rgba(255, 248, 39, 0.72),
    inset 0 0 8px 3px rgba(255, 214, 0, 0.34);
}

.pet-edge-glow {
  position: absolute;
  inset: 2px;
  z-index: 1;
  overflow: hidden;
  border-radius: 7px;
  opacity: 0;
  pointer-events: none;
}

.pet-edge-glow::before {
  position: absolute;
  inset: -5px;
  border-radius: inherit;
  box-shadow:
    inset 0 0 6px 3px rgba(255, 245, 35, 0.42),
    inset 0 0 10px 5px rgba(255, 214, 0, 0.22);
  content: "";
}

.pet-row.selected .pet-edge-glow {
  opacity: 1;
}



.pet-avatar {
  position: relative;
  z-index: 4;
  width: 44px;
  height: 52px;
  grid-column: 1;
  grid-row: 1;
  overflow: visible;
}

.pet-avatar::after {
  position: absolute;
  left: calc(var(--pet-image-anchor-x) + var(--pet-list-image-offset-x));
  top: calc(var(--pet-image-anchor-y) + var(--pet-list-image-offset-y) + var(--pet-auto-offset-y) + var(--pet-shadow-offset-y));
  z-index: 1;
  width: 28px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(3, 23, 58, 0.52) 0%, rgba(3, 23, 58, 0.34) 48%, rgba(3, 23, 58, 0) 70%);
  content: "";
  pointer-events: none;
  transform: translateX(-50%);
}

.pet-avatar img {
  position: absolute;
  left: var(--pet-image-anchor-x);
  top: var(--pet-image-anchor-y);
  z-index: 2;
  width: auto;
  height: var(--pet-list-image-height);
  max-width: none;
  object-fit: contain;
  object-position: center center;
  filter: drop-shadow(0 3px 2px rgba(0, 18, 58, 0.58));
  pointer-events: none;
  transform:
    translate(-50%, -50%)
    translate(var(--pet-list-image-offset-x), calc(var(--pet-list-image-offset-y) + var(--pet-auto-offset-y)));
}

.pet-copy {
  position: absolute;
  z-index: 3;
  top: 7px;
  right: 5px;
  left: 39px;
  height: 24px;
  min-width: 0;
  display: grid;
  grid-template-rows: 14px 4px;
  align-content: start;
  gap: 4px;
}

.pet-copy strong {
  overflow: hidden;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pet-level-value {
  position: absolute;
  left: 4px;
  bottom: 3px;
  z-index: 2;
  color: #ffffff;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  text-align: left;
}

.pet-hp-value {
  position: absolute;
  right: 5px;
  bottom: 3px;
  z-index: 4;
  color: #ffffff;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  text-align: right;
}

.hp-track {
  width: 100%;
  height: 4px;
  overflow: hidden;
  border: 0;
  background: transparent;
  position: relative;
  top: 4px;
}

.hp-track span {
  display: block;
  height: 100%;
  border-radius: 2px 0 0 0;
  background: #e50000;
}

.hp-track span.full {
  border-radius: 2px 2px 0 0;
}

.bag-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 6px;
  margin-bottom: 20px;
}

.queue-strip button,
.bag-actions button {
  position: relative;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  box-shadow: none;
}

.bag-actions button.disabled {
  cursor: default;
}

.bag-actions button.disabled img {
  opacity: 0.45;
}

.action-tooltip {
  position: absolute;
  left: var(--tooltip-x, 50%);
  top: var(--tooltip-y, 0);
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
  transition:
    opacity 120ms ease;
  white-space: nowrap;
}

.queue-strip button:hover .action-tooltip,
.queue-strip button:focus-visible .action-tooltip,
.bag-actions button:not(.disabled):hover .action-tooltip,
.bag-actions button:not(.disabled):focus-visible .action-tooltip {
  opacity: 1;
}

.bag-actions button.disabled .action-tooltip {
  display: none;
}

.queue-strip img,
.bag-actions img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  transform-origin: center;
  transition: transform 120ms ease;
}

.queue-strip button:hover img,
.queue-strip button:focus-visible img,
.bag-actions button:not(.disabled):hover img,
.bag-actions button:not(.disabled):focus-visible img {
  transform: scale(1.08);
}
</style>
