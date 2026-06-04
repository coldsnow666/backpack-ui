<script setup lang="ts">
const emit = defineEmits<{
  startPanelDrag: [event: PointerEvent]
}>()

const dotRows = [12, 10]
</script>

<template>
  <header class="bag-header">
    <div class="dot-trapezoid" aria-hidden="true" @pointerdown="emit('startPanelDrag', $event)">
      <div v-for="(count, rowIndex) in dotRows" :key="rowIndex" class="dot-row">
        <span v-for="dotIndex in count" :key="dotIndex"></span>
      </div>
    </div>
    <button type="button" class="close-button" aria-label="关闭">
      <img src="/backpack/icons/close.png" alt="" />
    </button>
  </header>
</template>

<style scoped>
.bag-header {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  gap: 5px;
  min-width: 0;
}

.dot-trapezoid {
  display: grid;
  place-content: center;
  gap: 3px;
  width: 220px;
  height: 28px;
  margin-bottom: 38px;
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

.close-button {
  position: absolute;
  top: 22px;
  right: 2px;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: translateY(-50%);
}

.close-button img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 0 rgba(0, 38, 91, 0.36));
}
</style>
