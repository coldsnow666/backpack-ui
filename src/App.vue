<script setup lang="ts">
import { useDraggablePanel } from './app/composables/useDraggablePanel'
import BackpackWindow from './features/backpack/components/BackpackWindow.vue'

const { panelStyle, startPanelDrag } = useDraggablePanel()
</script>

<template>
  <main class="app-stage">
    <BackpackWindow :panel-style="panelStyle" @start-panel-drag="startPanelDrag" />
  </main>
</template>
