<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDraggablePanel } from '../../../app/composables/useDraggablePanel'
import Button from '../../../components/Button.vue'
import type { Pet, PetStats, Skill } from '../../backpack/types'

const props = defineProps<{
  pet: Pet
  skills: Skill[]
  stats: PetStats
}>()

const emit = defineEmits<{
  close: []
  replaceSkill: [skillIndex: number, skill: Skill]
}>()

const dotRows = [12, 10]
const pageSize = 4
const pageIndex = ref(0)
const selectedOwnedIndex = ref(0)
const selectedOptionIndex = ref(0)
const { panelStyle, startPanelDrag } = useDraggablePanel()

const skillOptions: Skill[] = [
  { name: '闪电斗气', power: 0, pp: '15/15', tone: 'light' },
  { name: '抓', power: 40, pp: '35/35', tone: 'fire' },
  { name: '充电', power: 0, pp: '20/20', tone: 'light' },
  { name: '风驰电掣', power: 50, pp: '35/35', tone: 'fire' },
  { name: '极光刃', power: 130, pp: '20/20', tone: 'fire' },
  { name: '雷神觉醒', power: 0, pp: '20/20', tone: 'light' },
  { name: '瞬雷天闪', power: 160, pp: '3/3', tone: 'light' },
  { name: '雷雨天', power: 0, pp: '20/20', tone: 'water' },
  { name: '万丈光芒', power: 75, pp: '25/25', tone: 'light' },
  { name: '雷神天明闪', power: 160, pp: '3/3', tone: 'light' },
  { name: '电光火石', power: 40, pp: '30/30', tone: 'fire' },
  { name: '极电千鸟', power: 120, pp: '10/10', tone: 'light' },
  { name: '雷霆万钧', power: 95, pp: '15/15', tone: 'light' },
  { name: '白光刃', power: 95, pp: '20/20', tone: 'fire' },
  { name: '电闪雷鸣', power: 90, pp: '25/25', tone: 'light' },
  { name: '雷祭', power: 0, pp: '5/5', tone: 'water' },
  { name: '极光束', power: 65, pp: '35/35', tone: 'light' },
  { name: '充能', power: 0, pp: '20/20', tone: 'water' },
  { name: '破甲', power: 0, pp: '20/20', tone: 'fire' },
  { name: '雷霆一击', power: 100, pp: '10/10', tone: 'light' },
  { name: '圣灵魔闪光', power: 160, pp: '5/5', tone: 'light' },
  { name: '虚无', power: 0, pp: '1/1', tone: 'water' },
  { name: '灵魂干涉', power: 0, pp: '20/20', tone: 'water' },
  { name: '千烈虚光闪', power: 140, pp: '10/10', tone: 'light' },
]

const pageCount = computed(() => Math.max(1, Math.ceil(skillOptions.length / pageSize)))
const visibleOptions = computed(() => {
  const start = pageIndex.value * pageSize

  return skillOptions.slice(start, start + pageSize)
})

function levelText(level: number) {
  return String(level).padStart(3, '0')
}

function changePage(delta: number) {
  pageIndex.value = Math.max(0, Math.min(pageCount.value - 1, pageIndex.value + delta))
  selectedOptionIndex.value = 0
}

function confirmReplace() {
  const nextSkill = visibleOptions.value[selectedOptionIndex.value]

  if (!nextSkill) {
    return
  }

  emit('replaceSkill', selectedOwnedIndex.value, nextSkill)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="skill-replace-backdrop" role="presentation">
      <section class="skill-replace-modal" :style="panelStyle" role="dialog" aria-modal="true" aria-label="技能替换">
        <div class="outer-rail-frame" aria-hidden="true"></div>
        <div class="inner-glass-frame" aria-hidden="true"></div>

        <header class="skill-replace-header">
          <div class="dot-trapezoid" aria-hidden="true" @pointerdown="startPanelDrag">
            <div v-for="(count, rowIndex) in dotRows" :key="rowIndex" class="dot-row">
              <span v-for="dotIndex in count" :key="dotIndex"></span>
            </div>
          </div>

          <button type="button" class="skill-replace-close" aria-label="关闭技能替换" @click="emit('close')">
            <img src="/backpack/icons/close.png" alt="" />
          </button>
        </header>

        <div class="skill-replace-layout">
          <section class="skill-replace-left">
            <div class="pet-overview">
              <div class="pet-art">
                <img :src="pet.image" :alt="pet.name" />
              </div>

              <dl class="pet-meta">
                <div>
                  <dt>序号:</dt>
                  <dd>{{ pet.serial }}</dd>
                </div>
                <div>
                  <dt>名字:</dt>
                  <dd>{{ pet.name }}</dd>
                </div>
                <div>
                  <dt>等级:</dt>
                  <dd>{{ levelText(pet.level) }}</dd>
                </div>
                <div>
                  <dt>性格:</dt>
                  <dd>{{ pet.nature }}</dd>
                </div>
              </dl>
            </div>

            <dl class="pet-stats">
              <div>
                <dt>攻击:</dt>
                <dd>{{ stats.attack }}</dd>
              </div>
              <div>
                <dt>防御:</dt>
                <dd>{{ stats.defense }}</dd>
              </div>
              <div>
                <dt>特攻:</dt>
                <dd>{{ stats.specialAttack }}</dd>
              </div>
              <div>
                <dt>特防:</dt>
                <dd>{{ stats.specialDefense }}</dd>
              </div>
              <div>
                <dt>速度:</dt>
                <dd>{{ stats.speed }}</dd>
              </div>
              <div>
                <dt>体力:</dt>
                <dd>{{ stats.hp }}</dd>
              </div>
            </dl>

            <div class="owned-skills">
              <button
                v-for="(skill, skillIndex) in skills"
                :key="`${skill.name}-${skillIndex}`"
                type="button"
                class="skill-card"
                :class="{ selected: selectedOwnedIndex === skillIndex }"
                @click="selectedOwnedIndex = skillIndex"
              >
                <strong>{{ skill.name }}</strong>
                <span class="skill-element-icon" aria-hidden="true"><i></i></span>
                <span class="skill-power">威力:{{ skill.power }}</span>
                <span class="skill-pp">PP:{{ skill.pp }}</span>
              </button>
            </div>

            <footer class="skill-replace-actions">
              <Button @click="confirmReplace">确认</Button>
              <Button @click="emit('close')">取消</Button>
            </footer>
          </section>

          <section class="skill-replace-right">
            <p class="replace-tip">点击两边技能来替换<br />要花费<span>100</span>赛尔豆</p>

            <div class="option-skills">
              <button
                v-for="(skill, skillIndex) in visibleOptions"
                :key="`${pageIndex}-${skill.name}-${skillIndex}`"
                type="button"
                class="skill-card option"
                :class="{ selected: selectedOptionIndex === skillIndex }"
                @click="selectedOptionIndex = skillIndex"
              >
                <strong>{{ skill.name }}</strong>
                <span class="skill-element-icon" aria-hidden="true"><i></i></span>
                <span class="skill-power">威力:{{ skill.power }}</span>
                <span class="skill-pp">PP:{{ skill.pp }}</span>
              </button>
            </div>

            <footer class="skill-pager">
              <button type="button" aria-label="上一页" @click="changePage(-1)">
                <img src="/backpack/left_arrow.png" alt="" />
              </button>
              <span>{{ pageIndex + 1 }}/{{ pageCount }}</span>
              <button type="button" class="next" aria-label="下一页" @click="changePage(1)">
                <img src="/backpack/left_arrow.png" alt="" />
              </button>
            </footer>
          </section>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.skill-replace-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: grid;
  place-items: center;
  pointer-events: auto;
}

.skill-replace-modal {
  position: relative;
  isolation: isolate;
  width: 505px;
  height: 402px;
  display: grid;
  grid-template-rows: 35px minmax(0, 1fr);
  overflow: hidden;
  padding: 7px 18px 9px;
  border: 2px solid #0a4b95;
  border-radius: 16px;
  background: transparent;
  box-shadow: 0 6px 14px rgba(0, 17, 44, 0.34);
  font-family: SimSun, "宋体", serif;
  user-select: none;
}

.skill-replace-modal::before {
  position: absolute;
  inset: 0 14px;
  z-index: 0;
  background: linear-gradient(180deg, #55c5ff 0%, #2fa7ee 40%, #2493d9 100%);
  box-shadow: inset 0 -14px 0 rgba(10, 139, 204, 0.24);
  content: "";
  pointer-events: none;
}

.skill-replace-modal > * {
  position: relative;
  z-index: 3;
}

.skill-replace-modal > .outer-rail-frame {
  position: absolute;
  z-index: 2;
}

.skill-replace-modal > .inner-glass-frame {
  position: absolute;
  z-index: 1;
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

.skill-replace-header {
  display: grid;
  place-items: center;
  min-width: 0;
}

.dot-trapezoid {
  display: grid;
  place-content: center;
  gap: 3px;
  width: 220px;
  height: 28px;
  margin-bottom: 6px;
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

.skill-replace-close {
  position: absolute;
  top: 7px;
  right: 11px;
  z-index: 8;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: center;
}

.skill-replace-close:hover,
.skill-replace-close:focus-visible {
  outline: 0;
  transform: scale(1.12);
}

.skill-replace-close img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.skill-replace-layout {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 147px;
  gap: 12px;
}

.skill-replace-left,
.skill-replace-right {
  min-width: 0;
  min-height: 0;
  display: grid;
  align-content: start;
  overflow: visible;
  padding: 9px;
  border: 4px solid #0b5db1;
  border-radius: 8px;
  color: #111111;
  background: #ffffff;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.86),
    0 2px 0 rgba(0, 45, 105, 0.62);
}

.skill-replace-left {
  grid-template-rows: 100px 54px minmax(101px, 1fr) 42px;
  gap: 4px;
}

.skill-replace-right {
  grid-template-rows: 47px minmax(0, 1fr) 35px;
  gap: 6px;
}

.pet-overview {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  align-items: start;
  gap: 4px;
}

.pet-art {
  width: 128px;
  height: 108px;
  display: grid;
  place-items: center;
  margin-top: -24px;
  overflow: visible;
}

.pet-art img {
  width: 132px;
  height: 132px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 5px 5px rgba(0, 47, 103, 0.22));
}

.pet-meta,
.pet-stats {
  display: grid;
  margin: 0;
  color: #111111;
  font-size: 14px;
  line-height: 1.32;
}

.pet-meta {
  gap: 3px;
  padding-top: 2px;
}

.pet-stats {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px 24px;
  padding: 0 8px 0 12px;
}

.pet-meta div,
.pet-stats div {
  display: flex;
}

.pet-meta dt,
.pet-stats dt {
  flex: 0 0 auto;
}

.pet-meta dd,
.pet-stats dd {
  margin: 0;
}

.owned-skills {
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 48px;
  align-content: start;
  gap: 5px 9px;
}

.option-skills {
  min-height: 0;
  display: grid;
  grid-auto-rows: 50px;
  align-content: start;
  gap: 7px;
}

.skill-card {
  position: relative;
  min-width: 0;
  min-height: 48px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  grid-template-rows: auto auto;
  align-items: start;
  gap: 2px 6px;
  padding: 8px 6px 5px;
  overflow: visible;
  border: 2px solid #16cfff;
  border-radius: 7px;
  color: #ffffff;
  background: #315579;
  cursor: pointer;
  text-align: left;
}

.skill-card.option {
  min-height: 50px;
}

.skill-card.selected {
  border-color: #ff5a18;
  background: #b87800;
  box-shadow:
    inset 0 0 0 1px rgba(255, 224, 92, 0.62),
    inset 0 2px 0 rgba(255, 210, 78, 0.36),
    0 1px 0 rgba(122, 55, 0, 0.42);
}

.skill-card.selected strong,
.skill-card.selected .skill-power,
.skill-card.selected .skill-pp {
  text-shadow:
    0 1px 0 #7a3d00,
    1px 0 0 #7a3d00,
    -1px 0 0 #7a3d00;
}

.skill-card strong {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
  overflow: hidden;
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.1;
  text-overflow: ellipsis;
  text-shadow: 0 1px 0 #003369;
  white-space: nowrap;
}

.skill-power,
.skill-pp {
  color: #ffffff;
  font-size: 11px;
  line-height: 1;
}

.skill-power {
  grid-column: 1;
  grid-row: 2;
  justify-self: start;
}

.skill-pp {
  grid-column: 2;
  grid-row: 2;
  justify-self: end;
}

.skill-element-icon {
  grid-column: 2;
  grid-row: 1;
  position: absolute;
  top: -3px;
  right: 2px;
  width: 20px;
  height: 20px;
  display: inline-grid;
  place-items: center;
  justify-self: end;
}

.skill-element-icon i {
  width: 20px;
  height: 20px;
  background: url("/backpack/elem/shengling.png") center / contain no-repeat;
}

.replace-tip {
  margin: 0;
  color: #005bdb;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  font-weight: bold;
}

.replace-tip span {
  color: #005bdb;
}

.skill-replace-actions {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 42px;
}

.skill-replace-actions :deep(.button) {
  min-width: 82px;
  height: 36px;
  border-radius: 14px;
  font-size: 22px;
}

.skill-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #111111;
  font-size: 14px;
  line-height: 1;
}

.skill-pager button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: center;
}

.skill-pager button:hover,
.skill-pager button:focus-visible {
  outline: 0;
  transform: scale(1.12);
}

.skill-pager img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.skill-pager .next img {
  transform: scaleX(-1);
}
</style>
