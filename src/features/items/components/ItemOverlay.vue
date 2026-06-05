<script setup lang="ts">
import { computed, ref } from 'vue'
import Alert from '../../../components/Alert.vue'
import { backpackItems, type BackpackItem } from '../data'

const props = defineProps<{
  petName: string
}>()

const emit = defineEmits<{
  close: []
}>()

const pageSize = 12
const hoveredItem = ref<BackpackItem | null>(null)
const pageIndex = ref(0)
const pendingUseItem = ref<BackpackItem | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const pageCount = computed(() => Math.ceil(backpackItems.length / pageSize))
const visibleItems = computed(() => {
  const start = pageIndex.value * pageSize

  return backpackItems.slice(start, start + pageSize)
})
const useItemMessage = computed(() => {
  if (!pendingUseItem.value) {
    return ''
  }

  return `你确定要为你的${props.petName}使用${pendingUseItem.value.name}道具吗？`
})
const useItemHighlights = computed(() => {
  if (!pendingUseItem.value) {
    return []
  }

  return [
    props.petName,
    pendingUseItem.value.name,
  ]
})

function changePage(delta: number) {
  pageIndex.value = Math.max(0, Math.min(pageCount.value - 1, pageIndex.value + delta))
}

function moveItemTooltip(event: PointerEvent, item: BackpackItem) {
  hoveredItem.value = item
  tooltipPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }
}

function hideItemTooltip() {
  hoveredItem.value = null
}

function openUseItemAlert(item: BackpackItem) {
  pendingUseItem.value = item
  hideItemTooltip()
}

function closeUseItemAlert() {
  pendingUseItem.value = null
}

function confirmUseItemAlert() {
  closeUseItemAlert()
  emit('close')
}
</script>

<template>
  <section class="item-overlay" aria-label="道具">
    <button type="button" class="item-overlay-close" aria-label="关闭道具" @click="emit('close')">
      <img src="/backpack/icons/close.png" alt="" />
    </button>

    <div class="item-grid">
      <button
        v-for="item in visibleItems"
        :key="item.id"
        type="button"
        class="item-cell"
        :aria-label="`${item.name}，数量${item.count}`"
        @pointerenter="moveItemTooltip($event, item)"
        @pointermove="moveItemTooltip($event, item)"
        @pointerleave="hideItemTooltip"
        @click="openUseItemAlert(item)"
      >
        <img :src="item.image" :alt="item.name" />
        <strong>{{ item.count }}</strong>
      </button>
    </div>

    <footer class="item-pagination" aria-label="道具分页">
      <button type="button" class="item-page-button prev" aria-label="上一页" @click="changePage(-1)">
        <img src="/backpack/left_arrow.png" alt="" />
      </button>
      <span>{{ pageIndex + 1 }}/{{ pageCount }}</span>
      <button type="button" class="item-page-button next" aria-label="下一页" @click="changePage(1)">
        <img src="/backpack/left_arrow.png" alt="" />
      </button>
    </footer>

    <Teleport to="body">
      <aside
        v-if="hoveredItem"
        class="item-tooltip"
        :style="{
          left: `${tooltipPosition.x + 12}px`,
          top: `${tooltipPosition.y + 10}px`,
        }"
        aria-hidden="true"
      >
        <img :src="hoveredItem.image" alt="" />
        <div>
          <h3>{{ hoveredItem.name }}</h3>
          <p><b>用途:</b></p>
          <p>{{ hoveredItem.description }}</p>
        </div>
      </aside>
    </Teleport>

    <Alert
      v-if="pendingUseItem"
      :highlight-text="useItemHighlights"
      :message="useItemMessage"
      @cancel="closeUseItemAlert"
      @confirm="confirmUseItemAlert"
    />
  </section>
</template>

<style scoped>
.item-overlay {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 30px;
  padding: 25px 58px 11px;
  border: 3px solid #08c7f5;
  border-radius: 16px;
  background-color: rgba(0, 46, 103, 0.8);
  box-shadow:
    inset 0 0 0 2px rgba(0, 39, 99, 0.92),
    0 0 0 2px rgba(0, 45, 105, 0.9),
    inset 0 0 18px rgba(0, 197, 255, 0.22);
  font-family: SimSun, "宋体", serif;
  user-select: none;
}

.item-overlay-close {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 2;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  padding: 3px;
  border: 2px solid #033b79;
  border-radius: 50%;
  background: #49bcff;
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.54),
    0 2px 0 rgba(0, 36, 87, 0.6);
  cursor: pointer;
  transform-origin: center;
}

.item-overlay-close:hover,
.item-overlay-close:focus-visible {
  outline: 0;
  transform: scale(1.12);
}

.item-overlay-close img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.item-grid {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, 64px);
  grid-auto-rows: 64px;
  align-content: start;
  justify-content: center;
  gap: 9px 13px;
}

.item-cell {
  position: relative;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  padding: 5px;
  border: 2px solid rgba(250, 255, 255, 0.96);
  border-radius: 13px;
  background:
    linear-gradient(135deg, #eef5f6 0%, #d8e0e2 44%, #c8d0d2 100%);
  box-shadow:
    inset -4px 4px 0 2px rgba(132, 147, 153, 0.48),
    inset 2px -2px 0 2px rgba(255, 255, 255, 0.54),
    0 2px 0 rgba(0, 32, 78, 0.34);
  cursor: pointer;
}

.item-cell:hover,
.item-cell:focus-visible {
  filter: brightness(1.06);
  outline: 0;
}

.item-cell img {
  width: 48px;
  height: 48px;
  display: block;
  object-fit: contain;
}

.item-cell strong {
  position: absolute;
  right: 0px;
  bottom: 2px;
  color: #ffffff;
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  font-size: 13px;
  font-weight: bold;
  line-height: 1;
  text-shadow:
    0 1px 0 #ff8a00,
    1px 0 0 #ff8a00,
    -1px 0 0 #ff8a00,
    0 -1px 0 #ff8a00;
}

.item-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 42px;
  color: #ffffff;
  font-size: 15px;
  line-height: 1;
  text-shadow: 0 1px 0 #00316f;
  margin-bottom: 10px;
}

.item-page-button {
  width: 24px;
  height: 24px;
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: center;
}

.item-page-button img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.item-page-button.next img {
  transform: scaleX(-1);
}

.item-page-button:hover,
.item-page-button:focus-visible {
  outline: 0;
  transform: scale(1.12);
}

.item-tooltip {
  position: fixed;
  z-index: 2500;
  width: 225px;
  min-height: 86px;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 8px;
  padding: 7px 9px 12px;
  border: 0;
  border-radius: 6px;
  color: #19ff2e;
  background: rgba(0, 0, 0, 0.72);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.42);
  font-family: SimSun, "宋体", serif;
  font-size: 13px;
  line-height: 1.35;
  pointer-events: none;
  user-select: none;
}

.item-tooltip img {
  width: 52px;
  height: 52px;
  display: block;
  object-fit: contain;
}

.item-tooltip h3,
.item-tooltip p {
  margin: 0;
}

.item-tooltip h3 {
  margin-bottom: 10px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.1;
}

.item-tooltip b {
  color: #ffe735;
  font-weight: 700;
}
</style>
