<script setup lang="ts">
import type { GroupMeta, PetGroup } from '../types'

defineProps<{
  activeGroup: PetGroup
  groupMeta: Record<PetGroup, GroupMeta>
  petGroups: PetGroup[]
}>()

const emit = defineEmits<{
  selectGroup: [group: PetGroup]
}>()

function tabLines(group: PetGroup, groupMeta: Record<PetGroup, GroupMeta>) {
  const title = groupMeta[group].title

  return [title.slice(0, 2), title.slice(2, 4)]
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
        <span v-for="line in tabLines(group, groupMeta)" :key="line">{{ line }}</span>
      </span>
    </button>
  </nav>
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
  right: 5px;
  width: 60px;
  height: 42px;
  display: block;
  padding: 0;
  border: 0;
  color: #ffffff;
  background: transparent;
  cursor: pointer;
  transition:
    transform 150ms ease,
    filter 150ms ease;
}

.roster-tab::before {
  position: absolute;
  inset: 0;
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
    #8fe9ff 0%,
    #54d4f2 20%,
    #35b3e3 55%,
    #2c97d1 80%,
    #2477b5 100%
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
  text-shadow:
    0 1px 0 #003f7a,
    1px 0 0 #003f7a,
    -1px 0 0 #003f7a,
    0 -1px 0 #003f7a,
    1px 1px 0 #00366e,
    -1px 1px 0 #00366e;
  white-space: nowrap;
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
  border-color: #ff5a00;
  background: linear-gradient(
    to bottom,
    #ffd27a 0%,
    #ffb84d 20%,
    #ff9830 55%,
    #ff7a15 80%,
    #f56200 100%
  );
  box-shadow:
    inset 0 0 0 2px rgba(255, 246, 137, 0.72),
    0 2px 0 rgba(0, 35, 89, 0.58);
}
</style>
