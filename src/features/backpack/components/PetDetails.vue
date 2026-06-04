<script setup lang="ts">
import StatsGrid from './StatsGrid.vue'
import SkillList from './SkillList.vue'
import { usePetHeroImageFit } from '../composables/usePetHeroImageFit'
import type { Pet, PetDetailMeta, PetStats, Skill } from '../types'

defineProps<{
  detailMeta: PetDetailMeta
  pet: Pet
  skills: Skill[]
  stats: PetStats
}>()

const { petHeroImageStyle, recordPetHeroImageSize } = usePetHeroImageFit()

function levelText(level: number) {
  return String(level).padStart(3, '0')
}

function starText(value: number, total: number) {
  const filled = Math.max(0, Math.min(total, value))

  return '★'.repeat(filled) + '☆'.repeat(total - filled)
}

function moveIdentityTooltip(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  target.style.setProperty('--tooltip-x', `${event.clientX - rect.left}px`)
  target.style.setProperty('--tooltip-y', `${event.clientY - rect.top}px`)
}
</script>

<template>
  <section class="detail-card panel-card" aria-label="精灵详情">
    <header class="detail-header">
      <div class="pet-hero" :style="petHeroImageStyle(pet)">
        <span class="pet-hero-shadow" aria-hidden="true"></span>
        <img
          :src="pet.image"
          :alt="pet.name"
          @load="recordPetHeroImageSize($event, pet)"
        />
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
            <dd class="name-value">
              <span class="name-content">
                <span class="pet-name-text">{{ pet.name }}</span>
                <span
                  class="identity-tooltip-trigger"
                  @pointerenter="moveIdentityTooltip"
                  @pointermove="moveIdentityTooltip"
                >
                  <img :src="detailMeta.elementalIcon" alt="" />
                  <span class="identity-tooltip">圣灵系</span>
                </span>
                <span
                  class="identity-tooltip-trigger"
                  @pointerenter="moveIdentityTooltip"
                  @pointermove="moveIdentityTooltip"
                >
                  <img :src="detailMeta.genderIcon" alt="" />
                  <span class="identity-tooltip">无性别</span>
                </span>
              </span>
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
            <dt class="compact">炫彩等级:</dt>
            <dd>
              <span class="star-text">{{ starText(pet.colorfulLevel, 3) }}</span>
            </dd>
          </div>
          <div>
            <span></span>
            <dt>特性:</dt>
            <dd class="trait-value">
              <span
                class="trait-tooltip-trigger"
                @pointerenter="moveIdentityTooltip"
                @pointermove="moveIdentityTooltip"
              >
                {{ pet.trait ?? '顽强' }}
                <span class="star-text">{{ starText(pet.traitLevel ?? 5, 5) }}</span>
                <span class="identity-tooltip trait-tooltip">圣灵系属性技能增加5%</span>
              </span>
            </dd>
          </div>
          <div>
            <span></span>
            <dt>获得时间:</dt>
            <dd>{{ pet.acquiredAt }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <StatsGrid :stats="stats" />

    <SkillList :skills="skills" />
  </section>
</template>

<style scoped>
.detail-card {
  overflow: visible;
  display: grid;
  grid-template-rows: 137px 78px minmax(0, 1fr);
  gap: 7px;
  padding: 8px;
  border-color: #00cfff;
  background-color: rgba(0, 46, 103, 0.8);
}

.detail-header {
  position: relative;
  display: grid;
  grid-template-columns: 124px minmax(0, 1fr);
  gap: 9px;
  min-width: 0;
}

.pet-hero {
  position: relative;
  display: block;
  overflow: visible;
  min-width: 0;
}

.pet-hero img {
  position: absolute;
  top: var(--pet-hero-image-top, 50%);
  left: var(--pet-hero-image-left, 50%);
  z-index: 2;
  width: var(--pet-hero-image-width, auto);
  max-width: 124px;
  height: var(--pet-hero-image-height, auto);
  max-height: 170px;
  object-fit: contain;
  filter: drop-shadow(0 4px 3px rgba(0, 18, 58, 0.52));
  transform: translate(
    var(--pet-hero-image-fallback-x, -50%),
    var(--pet-hero-image-fallback-y, -50%)
  );
}

.pet-hero-shadow {
  position: absolute;
  top: var(--pet-hero-shadow-top, 100px);
  left: var(--pet-hero-shadow-left, 62px);
  z-index: 1;
  width: var(--pet-hero-shadow-width, 54px);
  height: var(--pet-hero-shadow-height, 20px);
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(2, 16, 45, 0.78) 0%, rgba(3, 23, 58, 0.56) 42%, rgba(3, 23, 58, 0.18) 66%, rgba(3, 23, 58, 0) 78%);
  filter: blur(0.3px);
  pointer-events: none;
  transform: translateX(-50%);
}

.identity {
  min-width: 0;
  font-family: SimSun, "宋体", serif;
  font-size: 14px;
  font-weight: 400;
}

.identity p {
  margin: 0 0 2px;
  color: #ffffff;
  font-family: inherit;
  font-weight: 400;
  line-height: 1;
  text-shadow: 0 1px 0 #00295e;
}

.identity dl {
  display: grid;
  gap: 5px;
  margin: 0;
}

.identity div {
  min-width: 0;
  min-height: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.identity dt {
  color: #ffffff;
  font-family: inherit;
  font-weight: 400;
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
  font-family: inherit;
  font-weight: 500;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity-tooltip-trigger {
  position: relative;
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  cursor: pointer;
}

.identity-tooltip-trigger img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.identity-tooltip {
  position: absolute;
  top: var(--tooltip-y, 0);
  left: var(--tooltip-x, 50%);
  z-index: 20;
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

.identity-tooltip-trigger:hover .identity-tooltip,
.identity-tooltip-trigger:focus-visible .identity-tooltip,
.trait-tooltip-trigger:hover .identity-tooltip,
.trait-tooltip-trigger:focus-visible .identity-tooltip {
  opacity: 1;
}

.identity dd.trait-value {
  overflow: visible;
}

.trait-tooltip-trigger {
  position: relative;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.trait-tooltip {
  max-width: none;
}

.identity dd.name-value {
  position: relative;
  overflow: visible;
  min-width: 0;
  max-width: 132px;
  height: 15px;
  display: block;
}

.name-content {
  position: absolute;
  top: 50%;
  left: 0;
  z-index: 3;
  max-width: 132px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 18px;
  transform: translateY(-50%);
}

.pet-name-text {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.star-text {
  color: #ffe735;
  letter-spacing: 0;
  white-space: nowrap;
}

.compact {
  padding-left: 10px;
}
</style>
