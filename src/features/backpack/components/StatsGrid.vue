<script setup lang="ts">
import type { PetStats } from '../types'

defineProps<{
  stats: PetStats
}>()

const statRows = [
  [
    { key: 'attack', label: '攻击', iconClass: 'attack' },
    { key: 'defense', label: '防御', iconClass: 'defense' },
  ],
  [
    { key: 'specialAttack', label: '特攻', iconClass: 'special-attack' },
    { key: 'specialDefense', label: '特防', iconClass: 'special-defense' },
  ],
  [
    { key: 'speed', label: '速度', iconClass: 'speed' },
    { key: 'hp', label: '体力', iconClass: 'hp' },
  ],
] as const
</script>

<template>
  <section class="stats-grid" aria-label="能力值">
    <div v-for="(row, rowIndex) in statRows" :key="rowIndex" class="stat-row">
      <div v-for="stat in row" :key="stat.key" class="stat-item">
        <span class="stat-icon" :class="stat.iconClass"></span>
        <b>{{ stat.label }}:</b>
        <strong>{{ stats[stat.key] }}</strong>
        <i></i>
        <em>{{ rowIndex === 2 ? 255 : 0 }}</em>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-rows: repeat(3, 22px);
  gap: 3px;
  align-content: center;
  padding: 3px 7px 3px 8px;
}

.stat-row {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  column-gap: 14px;
}

.stat-item {
  min-width: 0;
  display: grid;
  grid-template-columns: 18px 34px 36px 16px 28px;
  align-items: center;
  column-gap: 3px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 400;
}

.stats-grid b {
  justify-self: start;
  font-weight: 400;
}

.stats-grid strong {
  justify-self: end;
  color: #ffe735;
  font-weight: 400;
}

.stats-grid em {
  justify-self: start;
  color: #2ff7ff;
  font-style: normal;
  font-weight: 400;
}

.stat-icon {
  width: 17px;
  height: 17px;
  display: inline-block;
  flex: 0 0 auto;
}

.stat-item i {
  width: 14px;
  height: 14px;
  display: inline-block;
  flex: 0 0 auto;
  justify-self: center;
}

.stat-icon,
.stat-item i {
  background: url("/backpack/elem/shengling.png") center / contain no-repeat;
}
</style>
