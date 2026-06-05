<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue'
import Alert from '../../../components/Alert.vue'
import { petDetailMeta, statsByName } from '../data'
import { useBackpackState } from '../composables/useBackpackState'
import LearningPowerModal from '../../learning-power/components/LearningPowerModal.vue'
import ItemOverlay from '../../items/components/ItemOverlay.vue'
import SkillReplaceModal from '../../skill-replace/components/SkillReplaceModal.vue'
import BackpackList from './BackpackList.vue'
import PetDetails from './PetDetails.vue'
import type { ActionTab, PetGroup, Skill } from '../types'

type DragTarget = { group: PetGroup, index: number } | null

defineProps<{
  panelStyle: CSSProperties
}>()

const emit = defineEmits<{
  startPanelDrag: [event: PointerEvent]
}>()

const {
  battlePets,
  finishPetDrag,
  handlePetAction,
  selectedPet,
  selectedSkills,
  selectedStats,
  selectPet,
  replaceSelectedSkill,
  standbyPets,
  startPetDrag,
} = useBackpackState()

const dragOverTarget = ref<DragTarget>(null)
const showItemOverlay = ref(false)
const showLearningPowerModal = ref(false)
const showSkillReplaceModal = ref(false)
const skillReplaceSuccessPetName = ref('')
const dragTargetPetName = computed(() => {
  if (!dragOverTarget.value) {
    return ''
  }

  const slots = dragOverTarget.value.group === 'battle' ? battlePets.value : standbyPets.value
  const targetPet = slots[dragOverTarget.value.index]

  return targetPet?.name ?? ''
})

function changeDragOverTarget(target: DragTarget) {
  dragOverTarget.value = target
}

function handleFinishPetDrag(target: DragTarget) {
  finishPetDrag(target)
  dragOverTarget.value = null
}

function handleBackpackAction(tab: ActionTab) {
  if (tab.id === 'learningPower') {
    showItemOverlay.value = false
    showSkillReplaceModal.value = false
    showLearningPowerModal.value = true
    return
  }

  if (tab.id === 'item') {
    showLearningPowerModal.value = false
    showSkillReplaceModal.value = false
    showItemOverlay.value = true
    return
  }

  if (tab.id === 'skill') {
    showItemOverlay.value = false
    showLearningPowerModal.value = false
    showSkillReplaceModal.value = true
    return
  }

  handlePetAction(tab)
}

function handleReplaceSkill(skillIndex: number, skill: Skill) {
  replaceSelectedSkill(skillIndex, skill)
  skillReplaceSuccessPetName.value = selectedPet.value.name
}

function closeSkillReplaceSuccessAlert() {
  skillReplaceSuccessPetName.value = ''
}
</script>

<template>
  <section class="backpack-window" :style="panelStyle" aria-label="精灵背包">
    <BackpackList
      group="standby"
      :drag-over-target="dragOverTarget"
      :drag-target-pet-name="dragTargetPetName"
      :pets="standbyPets"
      :selected-pet="selectedPet"
      :stats-by-name="statsByName"
      @change-drag-over-target="changeDragOverTarget"
      @finish-pet-drag="handleFinishPetDrag"
      @pet-action="handleBackpackAction"
      @select-pet="selectPet"
      @start-pet-drag="startPetDrag"
      @start-panel-drag="emit('startPanelDrag', $event)"
    />

    <BackpackList
      group="battle"
      :drag-over-target="dragOverTarget"
      :drag-target-pet-name="dragTargetPetName"
      :pets="battlePets"
      :selected-pet="selectedPet"
      :stats-by-name="statsByName"
      @change-drag-over-target="changeDragOverTarget"
      @finish-pet-drag="handleFinishPetDrag"
      @pet-action="handleBackpackAction"
      @select-pet="selectPet"
      @start-pet-drag="startPetDrag"
      @start-panel-drag="emit('startPanelDrag', $event)"
    />

    <div class="detail-panel-shell">
      <PetDetails
        :detail-meta="petDetailMeta"
        :pet="selectedPet"
        :skills="selectedSkills"
        :stats="selectedStats"
      />

      <ItemOverlay v-if="showItemOverlay" :pet-name="selectedPet.name" @close="showItemOverlay = false" />
    </div>

    <LearningPowerModal
      v-if="showLearningPowerModal"
      :pet="selectedPet"
      @close="showLearningPowerModal = false"
    />

    <SkillReplaceModal
      v-if="showSkillReplaceModal"
      :pet="selectedPet"
      :skills="selectedSkills"
      :stats="selectedStats"
      @close="showSkillReplaceModal = false"
      @replace-skill="handleReplaceSkill"
    />

    <Alert
      v-if="skillReplaceSuccessPetName"
      :highlight-text="skillReplaceSuccessPetName"
      :message="`你花费100赛尔号使${skillReplaceSuccessPetName}技能唤醒成功`"
      @cancel="closeSkillReplaceSuccessAlert"
      @confirm="closeSkillReplaceSuccessAlert"
    />
  </section>
</template>

<style scoped>
.detail-panel-shell {
  position: relative;
  min-width: 0;
  display: grid;
}
</style>
