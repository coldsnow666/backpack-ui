<script setup lang="ts">
import { computed } from 'vue'
import { useDraggablePanel } from '../app/composables/useDraggablePanel'
import Button from './Button.vue'

const props = withDefaults(defineProps<{
  cancelText?: string
  confirmText?: string
  highlightText?: string | string[]
  message: string
}>(), {
  cancelText: '取消',
  confirmText: '确认',
  highlightText: '',
})

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const dotRows = [12, 10]
const { panelStyle, startPanelDrag } = useDraggablePanel()

const messageParts = computed(() => {
  const highlightTexts = Array.isArray(props.highlightText)
    ? props.highlightText.filter(Boolean)
    : [props.highlightText].filter(Boolean)

  if (highlightTexts.length === 0) {
    return [{ text: props.message, highlighted: false }]
  }

  return highlightTexts.reduce<Array<{ text: string, highlighted: boolean }>>((parts, highlightText) => {
    return parts.flatMap((part) => {
      if (part.highlighted) {
        return [part]
      }

      return part.text.split(highlightText).flatMap((text, index, splitParts) => {
        const segment = [{ text, highlighted: false }]

        if (index < splitParts.length - 1) {
          segment.push({ text: highlightText, highlighted: true })
        }

        return segment
      })
    })
  }, [{ text: props.message, highlighted: false }]).filter((part) => {
    return part.text.length > 0
  })
})
</script>

<template>
  <Teleport to="body">
    <div class="alert-backdrop" role="presentation">
      <section class="alert-modal" :style="panelStyle" role="alertdialog" aria-modal="true">
        <div class="outer-rail-frame" aria-hidden="true"></div>
        <div class="inner-glass-frame" aria-hidden="true"></div>

        <header class="alert-header">
          <div class="dot-trapezoid" aria-hidden="true" @pointerdown="startPanelDrag">
            <div v-for="(count, rowIndex) in dotRows" :key="rowIndex" class="dot-row">
              <span v-for="dotIndex in count" :key="dotIndex"></span>
            </div>
          </div>
        </header>

        <div class="alert-content">
          <p class="alert-message">
            <template v-for="(part, index) in messageParts" :key="index">
              <span :class="{ highlighted: part.highlighted }">{{ part.text }}</span>
            </template>
          </p>

          <footer class="alert-actions">
            <Button @click="emit('confirm')">{{ confirmText }}</Button>
            <Button @click="emit('cancel')">{{ cancelText }}</Button>
          </footer>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.alert-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2400;
  display: grid;
  place-items: center;
  pointer-events: auto;
}

.alert-modal {
  position: relative;
  isolation: isolate;
  width: 378px;
  min-height: 230px;
  height: 248px;
  display: grid;
  grid-template-rows: 48px minmax(0, 1fr);
  overflow: hidden;
  padding: 7px 26px 13px;
  border: 2px solid #0a4b95;
  border-radius: 16px;
  background: transparent;
  box-shadow: 0 6px 14px rgba(0, 17, 44, 0.34);
  font-family: SimSun, "宋体", serif;
  user-select: none;
}

.alert-modal::before {
  position: absolute;
  inset: 0 14px;
  z-index: 0;
  background: linear-gradient(180deg, #55c5ff 0%, #2fa7ee 40%, #2493d9 100%);
  box-shadow: inset 0 -14px 0 rgba(10, 139, 204, 0.24);
  content: "";
  pointer-events: none;
}

.alert-modal > * {
  position: relative;
  z-index: 3;
}

.alert-modal > .outer-rail-frame {
  position: absolute;
  z-index: 2;
}

.alert-modal > .inner-glass-frame {
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

.alert-header {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  min-width: 0;
}

.dot-trapezoid {
  display: grid;
  place-content: center;
  gap: 3px;
  width: 220px;
  height: 28px;
  margin-bottom: 16px;
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

.alert-content {
  min-width: 0;
  display: grid;
  grid-template-rows: 1fr 50px;
  padding: 24px 24px 12px;
  border: 4px solid #075aa9;
  border-radius: 9px;
  color: #111111;
  background: #ffffff;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.86),
    0 2px 0 rgba(0, 45, 105, 0.62);
}

.alert-message {
  align-self: center;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  font-size: 14px;
  line-height: 1.36;
  text-align: center;
}

.alert-message .highlighted {
  color: #ff0000;
}

.alert-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 56px;
  padding-top: 8px;
}
</style>
