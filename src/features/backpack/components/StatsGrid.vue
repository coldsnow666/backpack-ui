<script setup lang="ts">
import type { PetStats } from '../types'

defineProps<{
  learningPower: PetStats
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
        <em>{{ learningPower[stat.key] }}</em>
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
  font-size: 14px;
  margin-top: 8px;
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
  grid-template-columns: 20px 35px 24px 12px 16px 28px;
  align-items: center;
  column-gap: 3px;
  color: #ffffff;
  font-weight: 400;
  white-space: nowrap;
}

.stats-grid b {
  justify-self: start;
  font-weight: 400;
}

.stats-grid strong {
  width: 100%;
  justify-self: stretch;
  color: #ffe735;
  font-weight: 400;
  text-align: right;
}

.stats-grid em {
  justify-self: start;
  color: #ffe735;
  margin-left: 5px;
  font-style: normal;
  font-weight: 400;
}

.stat-icon {
  width: 20px;
  height: 20px;
  display: inline-block;
  flex: 0 0 auto;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.stat-item i {
  grid-column: 5;
  width: 15px;
  height: 15px;
  display: inline-block;
  flex: 0 0 auto;
  justify-self: center;
  background: url("/backpack/stats/star.png") center / contain no-repeat;
}

.stats-grid em {
  grid-column: 6;
}

.stat-icon.attack {
  background-image: url("/backpack/stats/atk.png");
}

.stat-icon.defense {
  background-image: url("/backpack/stats/def.png");
}

.stat-icon.special-attack {
  background-image: url("/backpack/stats/sp_atk.png");
}

.stat-icon.special-defense {
  background-image: url("/backpack/stats/sp_def.png");
}

.stat-icon.speed {
  background-image: url("/backpack/stats/spd.png");
}

.stat-icon.hp {
  background-image: url("/backpack/stats/hp.png");
}
</style>
