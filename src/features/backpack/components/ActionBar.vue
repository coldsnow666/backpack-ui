<script setup lang="ts">
import { ref } from 'vue'
import type { ActionTab } from '../types'

const props = defineProps<{
  disabledLabels?: string[]
  placement: 'top' | 'bottom'
  tabs: ActionTab[]
}>()

const emit = defineEmits<{
  action: [tab: ActionTab]
}>()

const hoveredTabKey = ref<string | null>(null)

function tabKey(tab: ActionTab) {
  return tab.id ?? tab.label
}

function isDisabled(tab: ActionTab) {
  return props.disabledLabels?.includes(tab.label) ?? false
}

function tabImage(tab: ActionTab) {
  if (tab.id === 'starter' && hoveredTabKey.value === tabKey(tab) && tab.activeImage) {
    return tab.activeImage
  }

  if (isDisabled(tab) && tab.activeImage) {
    return tab.activeImage
  }

  return tab.image
}

function setHoveredTab(tab: ActionTab | null) {
  hoveredTabKey.value = tab ? tabKey(tab) : null
}

function moveActionTooltip(event: PointerEvent) {
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  button.style.setProperty('--tooltip-x', `${event.clientX - rect.left}px`)
  button.style.setProperty('--tooltip-y', `${event.clientY - rect.top}px`)
}
</script>

<template>
  <footer v-if="placement === 'bottom'" class="bag-actions" aria-label="背包操作">
    <button
      v-for="tab in tabs"
      :key="tabKey(tab)"
      type="button"
      :class="{ disabled: isDisabled(tab) }"
      :aria-disabled="isDisabled(tab)"
      :aria-label="tab.label"
      @click="isDisabled(tab) ? undefined : emit('action', tab)"
      @focus="setHoveredTab(tab)"
      @blur="setHoveredTab(null)"
      @pointerenter="moveActionTooltip"
      @pointermove="moveActionTooltip"
      @pointerover="setHoveredTab(tab)"
      @pointerleave="setHoveredTab(null)"
    >
      <img :src="tabImage(tab)" alt="" />
      <span class="action-tooltip">{{ tab.label }}</span>
    </button>
  </footer>

  <div v-else class="queue-strip">
    <button
      v-for="tab in tabs"
      :key="tabKey(tab)"
      type="button"
      :aria-label="tab.label"
      @click="emit('action', tab)"
      @focus="setHoveredTab(tab)"
      @blur="setHoveredTab(null)"
      @pointerenter="moveActionTooltip"
      @pointermove="moveActionTooltip"
      @pointerover="setHoveredTab(tab)"
      @pointerleave="setHoveredTab(null)"
    >
      <img :src="tab.image" alt="" />
      <span class="action-tooltip">{{ tab.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.queue-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 6px;
  min-width: 0;
  margin-bottom: 10px;
  padding: 0 46px;
  border: 0;
  background: transparent;
}

.bag-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 6px;
  margin-bottom: 20px;
}

.queue-strip button,
.bag-actions button {
  position: relative;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
}

.bag-actions button.disabled {
  cursor: default;
}

.bag-actions button.disabled img {
  opacity: 0.45;
}

.action-tooltip {
  position: absolute;
  top: var(--tooltip-y, 0);
  left: var(--tooltip-x, 50%);
  z-index: 10;
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

.queue-strip button:hover .action-tooltip,
.queue-strip button:focus-visible .action-tooltip,
.bag-actions button:not(.disabled):hover .action-tooltip,
.bag-actions button:not(.disabled):focus-visible .action-tooltip {
  opacity: 1;
}

.bag-actions button.disabled .action-tooltip {
  display: none;
}

.queue-strip img,
.bag-actions img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  transform-origin: center;
  will-change: transform;
  transition:
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.queue-strip button:hover img,
.queue-strip button:focus-visible img,
.bag-actions button:not(.disabled):hover img,
.bag-actions button:not(.disabled):focus-visible img {
  filter: brightness(1.06);
  transform: scale(1.055);
}
</style>
