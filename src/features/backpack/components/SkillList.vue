<script setup lang="ts">
import type { Skill } from '../types'

defineProps<{
  skills: Skill[]
}>()
</script>

<template>
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
</template>

<style scoped>
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
  font-size: 13px;
  font-weight: 400;
  line-height: 1.1;
  text-overflow: ellipsis;
  text-shadow: 0 1px 0 #003369;
  white-space: nowrap;
}

.skills span {
  color: #ffffff;
  font-size: 13px;
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
