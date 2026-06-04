import { computed, onBeforeUnmount, ref, type CSSProperties } from 'vue'

export function useDraggablePanel() {
  const panelOffset = ref({ x: 0, y: 0 })

  let dragStart:
    | {
        pointerId: number
        clientX: number
        clientY: number
        originX: number
        originY: number
      }
    | null = null

  const panelStyle = computed<CSSProperties>(() => ({
    transform: `translate(${panelOffset.value.x}px, ${panelOffset.value.y}px)`,
  }))

  function stopPanelDrag() {
    dragStart = null
    window.removeEventListener('pointermove', movePanel)
    window.removeEventListener('pointerup', stopPanelDrag)
    window.removeEventListener('pointercancel', stopPanelDrag)
  }

  function movePanel(event: PointerEvent) {
    if (!dragStart || event.pointerId !== dragStart.pointerId) {
      return
    }

    panelOffset.value = {
      x: dragStart.originX + event.clientX - dragStart.clientX,
      y: dragStart.originY + event.clientY - dragStart.clientY,
    }
  }

  function startPanelDrag(event: PointerEvent) {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    dragStart = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      originX: panelOffset.value.x,
      originY: panelOffset.value.y,
    }
    window.addEventListener('pointermove', movePanel)
    window.addEventListener('pointerup', stopPanelDrag)
    window.addEventListener('pointercancel', stopPanelDrag)
  }

  onBeforeUnmount(() => {
    stopPanelDrag()
  })

  return {
    panelStyle,
    startPanelDrag,
  }
}
