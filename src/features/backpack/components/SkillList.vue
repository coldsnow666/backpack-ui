<script setup lang="ts">
import type { Skill } from '../types'

defineProps<{
  skills: Skill[]
}>()
</script>

<template>
  <section class="skills" aria-label="技能">
    <article v-for="skill in skills" :key="skill.name" class="skill">
      <strong>{{ skill.name }}</strong>
      <span class="skill-element-icon" tabindex="0" aria-label="圣灵系">
        <i aria-hidden="true"></i>
        <span class="skill-tooltip">圣灵系</span>
      </span>
      <span class="skill-power">威力:{{ skill.power }}</span>
      <span class="skill-pp">PP:{{ skill.pp }}</span>
    </article>
  </section>
</template>

<style scoped>
.skills {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  min-height: 0;
  padding: 0 8px;
}

.skill {
  position: relative;
  min-width: 0;
  min-height: 44px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  grid-template-rows: auto auto;
  align-items: start;
  gap: 2px 6px;
  padding: 10px 6px 6px 6px;
  overflow: visible;
  border: 2px solid #16cfff;
  border-radius: 7px;
}

.skills strong {
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
  cursor: pointer;
}

.skill-element-icon i {
  width: 20px;
  height: 20px;
  background: url("/backpack/elem/shengling.png") center / contain no-repeat;
}

.skill-tooltip {
  position: absolute;
  top: 0;
  left: 50%;
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

.skill-element-icon:hover .skill-tooltip,
.skill-element-icon:focus-visible .skill-tooltip {
  opacity: 1;
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

</style>
