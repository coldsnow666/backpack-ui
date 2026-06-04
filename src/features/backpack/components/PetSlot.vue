<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Pet, PetGroup } from '../types'

defineProps<{
  activeGroup: PetGroup
  dropTarget: boolean
  hp: {
    current: number
    max: number
  }
  hpPercent: number
  imageStyle: CSSProperties
  pet: Pet
  petIndex: number
  selected: boolean
}>()

const emit = defineEmits<{
  imageLoad: [event: Event, pet: Pet]
  select: [pet: Pet]
}>()

function selectDisplayPet(pet: Pet) {
  if (pet.isEmpty) {
    return
  }

  emit('select', pet)
}
</script>

<template>
  <button
    type="button"
    class="pet-row"
    :class="{
      empty: pet.isEmpty,
      'drop-target': dropTarget,
      starter: !pet.isEmpty && activeGroup === 'battle' && petIndex === 0,
      selected: !pet.isEmpty && selected,
    }"
    :data-pet-slot-index="petIndex"
    :aria-disabled="pet.isEmpty"
    :tabindex="pet.isEmpty ? -1 : 0"
    @click="selectDisplayPet(pet)"
  >
    <span class="pet-edge-glow" aria-hidden="true"></span>
    <span v-if="!pet.isEmpty" class="pet-avatar" :style="imageStyle">
      <img :src="pet.image" :alt="pet.name" @load="emit('imageLoad', $event, pet)" />
    </span>
    <span v-if="!pet.isEmpty" class="pet-copy">
      <strong>{{ pet.name }}</strong>
      <span class="hp-track">
        <span :class="{ full: hpPercent >= 100 }" :style="{ width: `${hpPercent}%` }"></span>
      </span>
    </span>
    <span v-if="!pet.isEmpty" class="pet-level-value">Lv. {{ pet.level }}</span>
    <span v-if="!pet.isEmpty" class="pet-hp-value">{{ hp.current }}/{{ hp.max }}</span>
  </button>
</template>

<style scoped>
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
  border: 2px solid #176daa;
  border-radius: 8px;
  color: #ffffff;
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
  border: 1px solid #ffd8bf;
  background: #ff9900;
  box-shadow:
    inset 0 -2px 0 #ff6600,
    0 0 0 1px #ffffff;
}

.pet-row.selected {
  border-color: #ffff1e;
  box-shadow:
    inset 0 0 0 0 rgba(255, 255, 221, 0.96),
    inset 0 0 3px 1px rgba(255, 248, 39, 0.72),
    inset 0 0 8px 3px rgba(255, 214, 0, 0.34);
}

.pet-row.starter.selected {
  box-shadow:
    inset 0 -2px 0 #ff6600,
    inset 0 0 3px 1px rgba(255, 248, 39, 0.72),
    inset 0 0 8px 3px rgba(255, 214, 0, 0.34),
    0 0 0 1px #ffffff;
}

.pet-row.empty {
  cursor: default;
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

.pet-row.drop-target {
  border-color: #2ff7ff;
  box-shadow:
    inset 0 0 3px 1px rgba(47, 247, 255, 0.78),
    inset 0 0 8px 3px rgba(0, 194, 255, 0.36);
}

.pet-row.drop-target .pet-edge-glow {
  opacity: 1;
}

.pet-row.drop-target .pet-edge-glow::before {
  box-shadow:
    inset 0 0 6px 3px rgba(47, 247, 255, 0.48),
    inset 0 0 10px 5px rgba(0, 194, 255, 0.26);
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
  top: calc(var(--pet-image-anchor-y) + var(--pet-list-image-offset-y) + var(--pet-auto-offset-y) + var(--pet-shadow-offset-y));
  left: calc(var(--pet-image-anchor-x) + var(--pet-list-image-offset-x));
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
  top: var(--pet-image-anchor-y);
  left: var(--pet-image-anchor-x);
  z-index: 2;
  width: auto;
  max-width: none;
  height: var(--pet-list-image-height);
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
  top: 7px;
  right: 5px;
  left: 39px;
  z-index: 3;
  min-width: 0;
  height: 24px;
  display: grid;
  grid-template-rows: 14px 4px;
  align-content: start;
  gap: 4px;
}

.pet-copy strong {
  overflow: hidden;
  color: #ffffff;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pet-level-value {
  position: absolute;
  bottom: 3px;
  left: 4px;
  z-index: 2;
  color: #ffffff;
  font-size: 10px;
  font-weight: 400;
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
  font-weight: 400;
  line-height: 1;
  text-align: right;
}

.hp-track {
  position: relative;
  top: 4px;
  width: 100%;
  height: 4px;
  overflow: hidden;
  border: 0;
  background: transparent;
}

.hp-track span {
  display: block;
  height: 100%;
  border-radius: 2px 0 0;
  background: #e50000;
}

.hp-track span.full {
  border-radius: 2px 2px 0 0;
}
</style>
