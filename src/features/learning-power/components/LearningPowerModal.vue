<script setup lang="ts">
import { computed, reactive } from 'vue'
import Button from '../../../components/Button.vue'
import type { Pet, PetStats } from '../../backpack/types'

type LearningPowerKey = keyof PetStats

type LearningPowerOption = {
  key: LearningPowerKey
  label: string
  icon: string
}

const props = defineProps<{
  pet: Pet
}>()

const emit = defineEmits<{
  close: []
}>()

const options: LearningPowerOption[] = [
  { key: 'attack', label: '攻击学习力', icon: '/backpack/stats/atk.png' },
  { key: 'specialAttack', label: '特攻学习力', icon: '/backpack/stats/sp_atk.png' },
  { key: 'speed', label: '速度学习力', icon: '/backpack/stats/spd.png' },
  { key: 'defense', label: '防御学习力', icon: '/backpack/stats/def.png' },
  { key: 'specialDefense', label: '特防学习力', icon: '/backpack/stats/sp_def.png' },
  { key: 'hp', label: '体力学习力', icon: '/backpack/stats/hp.png' },
]

const learningPowerDraft = reactive<PetStats>({ ...props.pet.learningPower })

const currentTotal = computed(() => (
  learningPowerDraft.attack
  + learningPowerDraft.specialAttack
  + learningPowerDraft.defense
  + learningPowerDraft.specialDefense
  + learningPowerDraft.speed
  + learningPowerDraft.hp
))

function maxLearningPowerFor(key: LearningPowerKey) {
  const usedByOtherStats = currentTotal.value - learningPowerDraft[key]

  return Math.min(255, Math.max(0, 510 - usedByOtherStats))
}

function updateLearningPower(key: LearningPowerKey, event: Event) {
  const input = event.target as HTMLInputElement
  const nextValue = Math.min(Number(input.value), maxLearningPowerFor(key))

  learningPowerDraft[key] = nextValue
  input.value = String(nextValue)
}

function adjustLearningPower(key: LearningPowerKey, delta: number) {
  const nextValue = learningPowerDraft[key] + delta

  learningPowerDraft[key] = Math.min(Math.max(nextValue, 0), maxLearningPowerFor(key))
}

function confirmLearningPower() {
  Object.assign(props.pet.learningPower, learningPowerDraft)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="learning-power-backdrop" role="presentation">
      <section class="learning-power-modal" role="dialog" aria-modal="true" aria-label="学习力分配">
        <header class="learning-power-header">
          <img class="learning-power-title" src="/backpack/stats/title.png" alt="全能学习力注入剂" />
          <button type="button" class="learning-power-close" aria-label="关闭" @click="emit('close')">
            <img src="/backpack/icons/close.png" alt="" />
          </button>
        </header>

        <div class="learning-power-body">
          <section class="learning-power-pet-info" aria-label="当前精灵学习力信息">
            <div class="learning-power-pet-summary">
              <span class="learning-power-avatar">
                <img :src="pet.avatarImage ?? pet.image" :alt="pet.name" />
              </span>
              <strong>{{ pet.name }}</strong>
            </div>

            <dl class="learning-power-pool">
              <div>
                <dt>学习力池子:</dt>
                <dd>5000点</dd>
              </div>
              <div>
                <dt>当前总和:</dt>
                <dd>{{ currentTotal }}/510</dd>
              </div>
            </dl>
          </section>

          <div class="learning-power-options" aria-label="学习力类型">
            <div
              v-for="option in options"
              :key="option.key"
              class="learning-power-option"
            >
              <img :src="option.icon" alt="" />
              <span>
                <strong>
                  <span class="learning-power-option-label">{{ option.label }}</span>
                  <em class="learning-power-option-value">{{ learningPowerDraft[option.key] }}</em>
                </strong>
                <span class="learning-power-slider-row">
                  <input
                    class="learning-power-slider"
                    type="range"
                    min="0"
                    max="255"
                    :style="{ '--learning-power-percent': `${(learningPowerDraft[option.key] / 255) * 100}%` }"
                    :value="learningPowerDraft[option.key]"
                    :aria-label="option.label"
                    @input="updateLearningPower(option.key, $event)"
                  />
                  <button
                    class="learning-power-step"
                    type="button"
                    :aria-label="`${option.label}减1`"
                    @click="adjustLearningPower(option.key, -1)"
                  >
                    -
                  </button>
                  <button
                    class="learning-power-step"
                    type="button"
                    :aria-label="`${option.label}加1`"
                    @click="adjustLearningPower(option.key, 1)"
                  >
                    +
                  </button>
                </span>
              </span>
            </div>
          </div>

          <div class="learning-power-confirm">
            <Button @click="confirmLearningPower">确认</Button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.learning-power-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: grid;
  place-items: center;
  pointer-events: auto;
}

.learning-power-modal {
  position: relative;
  width: 628px;
  height: 462px;
  display: grid;
  grid-template-rows: 110px minmax(0, 1fr);
  padding: 10px;
  border: 6px solid #f2f8ff;
  border-radius: 16px;
  color: #ffffff;
  background:
    linear-gradient(180deg, rgba(0, 160, 255, 0.42), rgba(0, 60, 150, 0.48)),
    #0966c2;
  box-shadow:
    0 0 0 2px rgba(4, 76, 164, 0.9),
    inset 0 0 0 3px #0f73e8,
    inset 0 0 0 6px rgba(255, 255, 255, 0.32),
    0 7px 0 rgba(0, 38, 91, 0.65),
    0 12px 22px rgba(0, 0, 0, 0.34);
  font-family: SimSun, "宋体", serif;
  font-weight: 400;
  user-select: none;
}

.learning-power-header {
  position: relative;
  z-index: 3;
  height: 110px;
}

.learning-power-title {
  position: absolute;
  top: -60px;
  left: 20px;
  width: 510px;
  height: auto;
  display: block;
  z-index: 4;
  object-fit: contain;
  pointer-events: none;
}

.learning-power-close {
  position: absolute;
  top: -14px;
  right: -16px;
  z-index: 5;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  padding: 3px;
  border: 3px solid #f2f8ff;
  border-radius: 50%;
  background: #54c4ff;
  box-shadow:
    0 0 0 1px rgba(0, 60, 150, 0.72),
    inset 0 0 0 1px rgba(255, 255, 255, 0.42),
    0 2px 0 rgba(0, 38, 91, 0.36);
  cursor: pointer;
  transform-origin: center;
  transition:
    filter 140ms ease,
    transform 140ms ease;
}

.learning-power-close:hover,
.learning-power-close:focus-visible {
  filter: brightness(1.08);
  outline: 0;
  transform: scale(1.12);
}

.learning-power-close img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.learning-power-body {
  position: relative;
  z-index: 1;
  min-height: 0;
  height: calc(100% + 50px);
  top: -50px;
  margin: -6px 15px 0;
  padding: 36px 26px 22px;
  border: 3px solid #19a8ff;
  border-radius: 8px;
  background:
    linear-gradient(rgba(52, 160, 255, 0.13) 1px, transparent 1px),
    linear-gradient(90deg, rgba(52, 160, 255, 0.13) 1px, transparent 1px),
    rgba(0, 42, 111, 0.92);
  background-size: 20px 20px;
  box-shadow:
    inset 0 0 0 2px #031b73,
    inset 0 0 28px rgba(0, 190, 255, 0.25);
}

.learning-power-pet-info {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 242px;
  align-items: center;
  gap: 18px;
  margin-bottom: 16px;
  margin-top: -20px;
  color: #ffffff;
}

.learning-power-pet-summary {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.learning-power-avatar {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px solid #31cfff;
  border-radius: 50%;
  background: #184992;
  box-shadow:
    inset 0 0 3px 1px rgba(47, 247, 255, 0.52),
    inset 0 0 8px 3px rgba(0, 194, 255, 0.22);
}

.learning-power-avatar img {
  width: 44px;
  height: 44px;
  display: block;
  object-fit: contain;
}

.learning-power-pet-summary strong {
  min-width: 0;
  overflow: hidden;
  font-size: 20px;
  font-weight: 400;
  line-height: 1;
  text-overflow: ellipsis;
  text-shadow:
    0 1px 0 #004b8c,
    1px 0 0 #004b8c,
    -1px 0 0 #004b8c,
    0 -1px 0 #004b8c;
  white-space: nowrap;
}

.learning-power-pool {
  display: grid;
  gap: 7px;
  margin: 0;
}

.learning-power-pool div {
  min-width: 0;
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.learning-power-pool dt,
.learning-power-pool dd {
  margin: 0;
  font-size: 15px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.learning-power-pool dt {
  color: #ffffff;
  text-shadow: 0 1px 0 #004b8c;
  text-align: right;
  font-weight: bold;
}

.learning-power-pool dd {
  color: #fff12f;
  text-shadow:
    0 1px 0 #06479e,
    1px 0 0 #06479e,
    -1px 0 0 #06479e,
    0 -1px 0 #06479e;
  font-weight: bold;
}

.learning-power-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 10px;
}

.learning-power-option {
  position: relative;
  min-width: 0;
  height: 62px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 2px;
  padding: 4px 11px 5px 9px;
  border: 2px solid #0054bf;
  border-radius: 7px;
  color: #ffffff;
  background:
    linear-gradient(180deg, #24a9ff 0%, #0c74e0 58%, #00b6ff 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.42),
    inset 0 -5px 0 rgba(0, 61, 162, 0.38),
    0 3px 0 rgba(0, 42, 118, 0.85);
  font-family: inherit;
  font-weight: 400;
  text-align: left;
}

.learning-power-option img {
  width: 38px;
  height: 38px;
  display: block;
  object-fit: contain;
}

.learning-power-option span {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.learning-power-option .learning-power-slider-row {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px 24px;
  align-items: center;
  gap: 5px;
}

.learning-power-option strong {
  overflow: hidden;
  font-weight: 400;
  line-height: 1;
  text-overflow: ellipsis;
  text-shadow:
    0 1px 0 #004b8c,
    1px 0 0 #004b8c,
    -1px 0 0 #004b8c,
    0 -1px 0 #004b8c;
  white-space: nowrap;
}

.learning-power-option strong {
  font-size: 18px;
}

.learning-power-slider {
  --slider-track-height: 9px;
  --slider-thumb-size: 17px;
  --learning-power-percent: 0%;
  width: 100%;
  height: 18px;
  display: block;
  padding: 0;
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
  accent-color: #7eefff;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.learning-power-slider::-webkit-slider-runnable-track {
  height: var(--slider-track-height);
  box-sizing: border-box;
  border: 1px solid #00499f;
  border-radius: 999px;
  background:
    linear-gradient(90deg, #e9ffff 0 var(--learning-power-percent), rgba(255, 255, 255, 0) var(--learning-power-percent)),
    linear-gradient(180deg, #55efff 0%, #16aff2 43%, #0670cf 100%);
  box-shadow:
    0 0 0 1px rgba(128, 234, 255, 0.36),
    inset 0 1px 0 rgba(255, 255, 255, 0.66),
    inset 0 -2px 0 rgba(0, 49, 143, 0.38);
}

.learning-power-slider::-webkit-slider-thumb {
  width: var(--slider-thumb-size);
  height: var(--slider-thumb-size);
  box-sizing: border-box;
  margin-top: calc((var(--slider-track-height) - var(--slider-thumb-size)) / 2);
  border: 2px solid #0054bf;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 0 0 1px rgba(157, 238, 255, 0.82),
    0 2px 0 rgba(0, 42, 118, 0.85),
    inset 0 -2px 0 rgba(199, 234, 255, 0.8);
  -webkit-appearance: none;
  appearance: none;
}

.learning-power-slider::-moz-range-track {
  height: var(--slider-track-height);
  box-sizing: border-box;
  border: 1px solid #00499f;
  border-radius: 999px;
  background: linear-gradient(180deg, #55efff 0%, #16aff2 43%, #0670cf 100%);
  box-shadow:
    0 0 0 1px rgba(128, 234, 255, 0.36),
    inset 0 1px 0 rgba(255, 255, 255, 0.66),
    inset 0 -2px 0 rgba(0, 49, 143, 0.38);
}

.learning-power-slider::-moz-range-progress {
  height: var(--slider-track-height);
  border-radius: 999px;
  background: #e9ffff;
}

.learning-power-slider::-moz-range-thumb {
  width: var(--slider-thumb-size);
  height: var(--slider-thumb-size);
  box-sizing: border-box;
  border: 2px solid #0054bf;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 0 0 1px rgba(157, 238, 255, 0.82),
    0 2px 0 rgba(0, 42, 118, 0.85),
    inset 0 -2px 0 rgba(199, 234, 255, 0.8);
}

.learning-power-step {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  padding: 0 0 2px;
  border: 1px solid #00499f;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(180deg, #61ddff 0%, #148ee6 56%, #0754b2 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.58),
    0 1px 0 rgba(0, 42, 118, 0.75);
  cursor: pointer;
  font-family: inherit;
  font-size: 20px;
  font-weight: 400;
  line-height: 1;
  text-shadow: 0 1px 0 #004b8c;
}

.learning-power-step:hover,
.learning-power-step:focus-visible {
  filter: brightness(1.1);
  outline: 0;
}

.learning-power-option strong {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.learning-power-option-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.learning-power-option-value {
  flex: 0 0 auto;
  color: #fff12f;
  font-size: 16px;
  font-style: normal;
  font-weight: bold;
  text-shadow:
    0 1px 0 #06479e,
    1px 0 0 #06479e,
    -1px 0 0 #06479e,
    0 -1px 0 #06479e;
}

.learning-power-confirm {
  position: absolute;
  right: 50%;
  bottom: 14px;
  transform: translateX(50%);
}
</style>
