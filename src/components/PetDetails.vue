<script setup lang="ts">
import type { Pet, PetDetailMeta, PetStats, Skill } from '../types'

const props = defineProps<{
  detailMeta: PetDetailMeta
  pet: Pet
  skills: Skill[]
  stats: PetStats
}>()

function levelText(level: number) {
  return String(level).padStart(3, '0')
}

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
  <section class="detail-card panel-card" aria-label="精灵详情">
    <header class="detail-header">
      <div class="pet-hero">
        <img :src="pet.image" :alt="pet.name" />
      </div>

      <div class="identity">
        <dl>
          <div>
            <span class="identity-icon lock"></span>
            <dt>序号:</dt>
            <dd>{{ pet.serial }}</dd>
          </div>
          <div>
            <span class="identity-icon gender"></span>
            <dt>名字:</dt>
            <dd>
              {{ pet.name }}
              <img :src="detailMeta.elementalIcon" alt="" />
            </dd>
          </div>
          <div>
            <span></span>
            <dt>等级:</dt>
            <dd>{{ levelText(pet.level) }}</dd>
            <dt class="compact">个体:</dt>
            <dd>31</dd>
          </div>
          <div>
            <span></span>
            <dt>升级所需经验值:</dt>
            <dd>{{ pet.requiredExp }}</dd>
          </div>
          <div>
            <span></span>
            <dt>性格:</dt>
            <dd>{{ pet.nature }}</dd>
          </div>
          <div>
            <span></span>
            <dt>获得时间:</dt>
            <dd>{{ pet.acquiredAt }}</dd>
          </div>
        </dl>
      </div>
    </header>

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

    <section class="skills" aria-label="技能">
      <article v-for="skill in skills" :key="skill.name" :class="skill.tone">
        <div>
          <strong>{{ skill.name }}</strong>
          <span>威力: {{ skill.power }}</span>
          <span>PP: {{ skill.pp }}</span>
        </div>
        <i aria-hidden="true"></i>
      </article>
    </section>
  </section>
</template>

<style scoped>
.detail-card {
  display: grid;
  grid-template-rows: 137px 78px minmax(0, 1fr);
  gap: 7px;
  padding: 8px;
  border-color: #00cfff;
  background-color: rgba(43,62,96,0.5);
}

.detail-header {
  display: grid;
  grid-template-columns: 124px minmax(0, 1fr);
  gap: 9px;
  min-width: 0;
}

.pet-hero {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.pet-hero img {
  position: relative;
  z-index: 2;
  max-width: 105px;
  max-height: 122px;
  object-fit: contain;
}

.identity {
  min-width: 0;
}

.identity p {
  margin: 0 0 2px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 1px 0 #00295e;
}

.identity dl {
  display: grid;
  gap: 2px;
  margin: 0;
}

.identity div {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.identity dt {
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.15;
  text-shadow: 0 1px 0 #00295e;
  white-space: nowrap;
}

.identity dd {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  overflow: hidden;
  color: #ffe735;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity dd img {
  width: 15px;
  height: 15px;
  object-fit: contain;
}

.stats-grid {
  display: grid;
  grid-template-rows: repeat(3, 22px);
  gap: 3px;
  align-content: center;
  padding: 3px 7px 3px 1px;
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
  font-size: 12px;
  font-weight: 800;
}

.stats-grid b {
  justify-self: start;
  font-weight: 900;
}

.stats-grid strong {
  justify-self: end;
  color: #ffe735;
  font-weight: 900;
}

.stats-grid em {
  justify-self: start;
  color: #2ff7ff;
  font-style: normal;
  font-weight: 900;
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

.skills {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  min-height: 0;
}

.skills article {
  position: relative;
  min-width: 0;
  min-height: 58px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 27px;
  align-items: center;
  padding: 6px 6px 6px 8px;
  overflow: hidden;
  border: 2px solid #16cfff;
  border-radius: 7px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 36%),
    linear-gradient(180deg, #075b8f, #042844);
}

.skills article.fire {
  border-color: #ffb23a;
}

.skills div {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.skills strong {
  overflow: hidden;
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.1;
  text-overflow: ellipsis;
  text-shadow: 0 1px 0 #003369;
  white-space: nowrap;
}

.skills span {
  color: #ffffff;
  font-size: 10px;
  line-height: 1;
}

.skills i {
  width: 23px;
  height: 23px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8ffff, #158ce4);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.42),
    0 0 8px rgba(95, 229, 255, 0.42);
}

.skills article.fire i {
  background: linear-gradient(135deg, #fff05c, #ff6d00);
}

.skills article.light i {
  background: linear-gradient(135deg, #f7ffff, #ffe43a 58%, #ff8a00);
}
</style>
