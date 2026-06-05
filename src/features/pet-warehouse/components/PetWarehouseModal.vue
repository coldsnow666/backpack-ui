<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDraggablePanel } from '../../../app/composables/useDraggablePanel'
import Alert from '../../../components/Alert.vue'
import Button from '../../../components/Button.vue'
import {
  allTypeId,
  dualTypeIds,
  matchesPetTypeFilter,
  petFilterTypeLabel,
  petTypeIcon,
  petTypeLabel,
  singleTypeIds,
  splitPetTypes,
} from '../../backpack/data'
import type { Pet, PetStats } from '../../backpack/types'
import type { WarehouseTypeMode } from '../../backpack/data/petTypes'

type PetMoveResult = {
  ok: boolean
  message: string
  petName?: string
  reason?: 'bag-full'
}

type WarehouseSortKey = 'id' | 'level' | 'time'
type WarehouseGenderFilter = 'all' | 'male' | 'female' | 'none'

const props = defineProps<{
  battlePets: Array<Pet | null>
  pets: Pet[]
  releasePet: (pet: Pet) => PetMoveResult
  putInBag: (pet: Pet) => PetMoveResult
  replaceBagPet: (warehousePet: Pet, replacedPet: Pet) => PetMoveResult
  statsByName: Record<string, PetStats>
  standbyPets: Array<Pet | null>
  toggleEliteFavorite: (pet: Pet) => Pet | null
}>()

const emit = defineEmits<{
  close: []
}>()

const gridPageSize = 20
const typePageSize = 20
const accountPetCount = 141
const dotRows = [12, 10]
const genderOptions: Array<{ value: WarehouseGenderFilter, label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'male', label: '雄' },
  { value: 'female', label: '雌' },
  { value: 'none', label: '无' },
]
const { panelStyle, startPanelDrag } = useDraggablePanel()
const { panelStyle: replacementPanelStyle, startPanelDrag: startReplacementPanelDrag } = useDraggablePanel()
const typeMode = ref<WarehouseTypeMode>('single')
const selectedTypeId = ref(allTypeId)
const typePage = ref(0)
const petPage = ref(0)
const sortKey = ref<WarehouseSortKey>('id')
const sortDescending = ref(true)
const level100Only = ref(false)
const favoriteOnly = ref(false)
const genderFilter = ref<WarehouseGenderFilter>('all')
const searchQuery = ref('')
const activePetId = ref<number | null>(props.pets[0]?.id ?? null)
const releaseConfirmPet = ref<Pet | null>(null)
const alertResult = ref<PetMoveResult | null>(null)
const replacementWarehousePet = ref<Pet | null>(null)
const selectedReplacementPetId = ref<number | null>(null)

const availableTypeIds = computed(() => (typeMode.value === 'single' ? singleTypeIds : dualTypeIds))
const maxTypePage = computed(() => Math.max(0, Math.ceil(availableTypeIds.value.length / typePageSize) - 1))
const currentTypeIds = computed(() => {
  const start = typePage.value * typePageSize

  return availableTypeIds.value.slice(start, start + typePageSize)
})
const filteredPets = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const pets = props.pets.filter((pet) => {
    if (!matchesPetTypeFilter(pet, typeMode.value, selectedTypeId.value)) {
      return false
    }

    if (level100Only.value && pet.level < 100) {
      return false
    }

    if (favoriteOnly.value && !pet.isEliteFavorite) {
      return false
    }

    if (genderFilter.value !== 'all' && getPetGender(pet) !== genderFilter.value) {
      return false
    }

    if (query && !`${pet.name} ${pet.serial}`.toLowerCase().includes(query)) {
      return false
    }

    return true
  })

  return [...pets].sort(compareWarehousePets)
})
const maxPetPage = computed(() => Math.max(0, Math.ceil(filteredPets.value.length / gridPageSize) - 1))
const visiblePets = computed(() => {
  const start = petPage.value * gridPageSize

  return filteredPets.value.slice(start, start + gridPageSize)
})
const gridSlots = computed<Array<Pet | null>>(() => [
  ...visiblePets.value,
  ...Array.from<null>({ length: Math.max(0, gridPageSize - visiblePets.value.length) }).fill(null),
])
const activePet = computed(() => {
  return filteredPets.value.find((pet) => pet.id === activePetId.value) ?? filteredPets.value[0] ?? null
})
const activeStats = computed(() => activePet.value ? props.statsByName[activePet.value.name] : null)
const activePetTypes = computed(() => splitPetTypes(activePet.value?.typeId).filter((typeId) => typeId > 0))
const standbyReplacementSlots = computed(() => props.standbyPets.slice(0, 6))
const standbyReplacementPets = computed(() => props.standbyPets.filter((pet): pet is Pet => Boolean(pet)))
const battleReplacementPets = computed(() => props.battlePets.filter((pet): pet is Pet => Boolean(pet)))
const replacementCandidates = computed(() => [...standbyReplacementPets.value, ...battleReplacementPets.value])
const selectedReplacementPet = computed(() => {
  return replacementCandidates.value.find((pet) => pet.id === selectedReplacementPetId.value)
    ?? replacementCandidates.value[0]
    ?? null
})

function starText(value: number, total: number) {
  const filled = Math.max(0, Math.min(total, value))

  return '★'.repeat(filled) + '☆'.repeat(total - filled)
}

watch(typeMode, () => {
  selectedTypeId.value = allTypeId
  typePage.value = 0
  petPage.value = 0
})

watch(filteredPets, (pets) => {
  if (petPage.value > maxPetPage.value) {
    petPage.value = maxPetPage.value
  }

  if (!pets.some((pet) => pet.id === activePetId.value)) {
    activePetId.value = pets[0]?.id ?? null
  }
})

function selectFilterType(typeId: number) {
  selectedTypeId.value = typeId
  petPage.value = 0
}

function getPetGender(pet: Pet): WarehouseGenderFilter {
  const gender = (pet as Pet & { gender?: WarehouseGenderFilter }).gender

  return gender === 'male' || gender === 'female' ? gender : 'none'
}

function compareWarehousePets(a: Pet, b: Pet) {
  const direction = sortDescending.value ? -1 : 1
  const valueA = getWarehouseSortValue(a)
  const valueB = getWarehouseSortValue(b)

  if (valueA === valueB) {
    return a.id - b.id
  }

  return valueA > valueB ? direction : -direction
}

function getWarehouseSortValue(pet: Pet) {
  if (sortKey.value === 'level') {
    return pet.level
  }

  if (sortKey.value === 'time') {
    return new Date(pet.acquiredAt.replaceAll('-', '/')).getTime()
  }

  return Number(pet.serial) || pet.id
}

function changeSort(key: WarehouseSortKey) {
  if (sortKey.value === key) {
    sortDescending.value = !sortDescending.value
  } else {
    sortKey.value = key
    sortDescending.value = true
  }

  petPage.value = 0
}

function setGenderFilter(value: WarehouseGenderFilter) {
  genderFilter.value = value
  petPage.value = 0
}

function resetWarehouseFilters() {
  selectedTypeId.value = allTypeId
  petPage.value = 0
  sortKey.value = 'id'
  sortDescending.value = true
  level100Only.value = false
  favoriteOnly.value = false
  genderFilter.value = 'all'
  searchQuery.value = ''
}

function changeTypePage(delta: number) {
  typePage.value = Math.max(0, Math.min(maxTypePage.value, typePage.value + delta))
}

function changePetPage(delta: number) {
  petPage.value = Math.max(0, Math.min(maxPetPage.value, petPage.value + delta))
}

function selectPet(pet: Pet | null) {
  if (!pet) {
    return
  }

  activePetId.value = pet.id
}

function handlePutInBag() {
  if (!activePet.value) {
    return
  }

  const result = props.putInBag(activePet.value)

  if (!result.ok && result.reason === 'bag-full') {
    replacementWarehousePet.value = activePet.value
    selectedReplacementPetId.value = replacementCandidates.value[0]?.id ?? null
    return
  }

  alertResult.value = result
}

function requestRelease() {
  if (!activePet.value) {
    return
  }

  releaseConfirmPet.value = activePet.value
}

function confirmRelease() {
  if (!releaseConfirmPet.value) {
    return
  }

  alertResult.value = props.releasePet(releaseConfirmPet.value)
  releaseConfirmPet.value = null
}

function toggleEliteFavorite() {
  if (!activePet.value) {
    return
  }

  const nextPet = props.toggleEliteFavorite(activePet.value)

  if (nextPet) {
    alertResult.value = {
      ok: true,
      message: nextPet.isEliteFavorite ? `已将${nextPet.name}加入精英收藏` : `已取消${nextPet.name}的精英收藏`,
      petName: nextPet.name,
    }
  }
}

function closeAlertResult() {
  alertResult.value = null
}

function hpForPet(pet: Pet) {
  const max = props.statsByName[pet.name]?.hp ?? 180
  const ratio = 0.82 + ((pet.id * 7) % 17) / 100
  const current = Math.round(max * Math.min(ratio, 1))

  return {
    current,
    max,
    percent: Math.round((current / max) * 100),
  }
}

function closeReplacementModal() {
  replacementWarehousePet.value = null
  selectedReplacementPetId.value = null
}

function confirmReplacement() {
  if (!replacementWarehousePet.value || !selectedReplacementPet.value) {
    return
  }

  alertResult.value = props.replaceBagPet(replacementWarehousePet.value, selectedReplacementPet.value)
  closeReplacementModal()
}
</script>

<template>
  <Teleport to="body">
    <div class="warehouse-backdrop" role="presentation">
      <section class="warehouse-modal" :style="panelStyle" role="dialog" aria-modal="true" aria-label="精灵仓库">
        <div class="outer-rail-frame" aria-hidden="true"></div>
        <div class="inner-glass-frame" aria-hidden="true"></div>

        <header class="warehouse-drag-header">
          <div class="dot-trapezoid" aria-hidden="true" @pointerdown="startPanelDrag">
            <div v-for="(count, rowIndex) in dotRows" :key="rowIndex" class="dot-row">
              <span v-for="dotIndex in count" :key="dotIndex"></span>
            </div>
          </div>

          <header class="warehouse-header">
            <div class="warehouse-count">
              <img src="/backpack/icons/pet_warehouse.png" alt="" />
              <span class="warehouse-count-title">数量</span>
              <span class="warehouse-count-number">{{ accountPetCount }}</span>
            </div>

            <button type="button" class="warehouse-close" aria-label="关闭精灵仓库" @click="emit('close')">
              <img src="/backpack/icons/close.png" alt="" />
            </button>
          </header>
        </header>

        <div class="warehouse-content">
          <main class="warehouse-body">
            <aside class="type-filter-panel" aria-label="属性筛选">
              <div class="type-mode-tabs">
                <svg class="type-mode-tabs-frame" viewBox="0 0 216 38" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="type-tab-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#62c6f0" />
                      <stop offset="100%" stop-color="#2991d7" />
                    </linearGradient>
                    <linearGradient id="type-tab-active-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#9eedff" />
                      <stop offset="100%" stop-color="#5ac8f4" />
                    </linearGradient>
                  </defs>
                  <path
                    class="type-tab-shape"
                    :class="{ active: typeMode === 'single' }"
                    d="M2 2 H108 V36 H18 Z"
                  />
                  <path
                    class="type-tab-shape"
                    :class="{ active: typeMode === 'dual' }"
                    d="M108 2 H214 L198 36 H108 Z"
                  />
                  <path class="type-tab-divider" d="M108 2 V36" />
                </svg>
                <button
                  type="button"
                  :class="{ active: typeMode === 'single' }"
                  @click="typeMode = 'single'"
                >
                  单属性
                </button>
                <button
                  type="button"
                  :class="{ active: typeMode === 'dual' }"
                  @click="typeMode = 'dual'"
                >
                  双属性
                </button>
              </div>

              <div class="type-panel-body">
                <svg class="type-panel-frame" viewBox="0 0 240 356" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    class="type-panel-frame-fill"
                    d="M12 2 H228 Q238 2 238 12 V344 Q238 354 228 354 H12 Q2 354 2 344 V12 Q2 2 12 2 Z"
                  />
                  <path
                    class="type-panel-frame-highlight"
                    d="M12 7 H228 Q233 7 233 12 V344 Q233 349 228 349 H12 Q7 349 7 344 V12 Q7 7 12 7 Z"
                  />
                </svg>

                <div class="type-icon-grid">
                  <button
                    v-for="typeId in currentTypeIds"
                    :key="`${typeMode}-${typeId}`"
                    type="button"
                    class="type-icon-button"
                    :class="{ active: selectedTypeId === typeId }"
                    :title="petFilterTypeLabel(typeId, typeMode)"
                    @click="selectFilterType(typeId)"
                  >
                    <img :src="petTypeIcon(typeId)" :alt="petFilterTypeLabel(typeId, typeMode)" />
                  </button>
                </div>

                <div class="type-pager">
                  <button
                    type="button"
                    class="type-page-button prev"
                    :disabled="typePage <= 0"
                    aria-label="上一页属性"
                    @click="changeTypePage(-1)"
                  >
                    <img src="/backpack/left_arrow.png" alt="" />
                  </button>
                  <span>{{ typePage + 1 }} / {{ maxTypePage + 1 }}</span>
                  <button
                    type="button"
                    class="type-page-button next"
                    :disabled="typePage >= maxTypePage"
                    aria-label="下一页属性"
                    @click="changeTypePage(1)"
                  >
                    <img src="/backpack/left_arrow.png" alt="" />
                  </button>
                </div>
              </div>

              <Button class="all-pets-button type-all-pets-button" @click="selectFilterType(allTypeId)">全部精灵</Button>
            </aside>

            <section class="warehouse-grid-panel" aria-label="仓库精灵列表">
              <div class="warehouse-filter-bar" aria-label="仓库筛选">
                <button
                  type="button"
                  class="filter-chip"
                  :class="{ active: sortKey === 'id' }"
                  @click="changeSort('id')"
                >
                  ID {{ sortKey === 'id' ? (sortDescending ? '↓' : '↑') : '' }}
                </button>
                <button
                  type="button"
                  class="filter-chip"
                  :class="{ active: sortKey === 'level' }"
                  @click="changeSort('level')"
                >
                  等级 {{ sortKey === 'level' ? (sortDescending ? '↓' : '↑') : '' }}
                </button>
                <button
                  type="button"
                  class="filter-chip"
                  :class="{ active: sortKey === 'time' }"
                  @click="changeSort('time')"
                >
                  时间 {{ sortKey === 'time' ? (sortDescending ? '↓' : '↑') : '' }}
                </button>

                <label class="filter-toggle level-toggle">
                  <span>大于100级</span>
                  <input v-model="level100Only" type="checkbox" @change="petPage = 0" />
                  <i aria-hidden="true"></i>
                </label>

                <label class="filter-toggle favorite-toggle">
                  <span>仅收藏</span>
                  <input v-model="favoriteOnly" type="checkbox" @change="petPage = 0" />
                  <i aria-hidden="true"></i>
                </label>

                <div class="gender-filter" aria-label="性别筛选">
                  <button
                    v-for="option in genderOptions"
                    :key="option.value"
                    type="button"
                    :class="{ active: genderFilter === option.value }"
                    @click="setGenderFilter(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>

                <input
                  v-model="searchQuery"
                  class="warehouse-search"
                  type="search"
                  placeholder="输入ID或名称"
                  @input="petPage = 0"
                />

                <Button class="filter-refresh" @click="resetWarehouseFilters">刷新</Button>
              </div>

              <div class="pet-grid">
                <button
                  v-for="(pet, index) in gridSlots"
                  :key="pet?.id ?? `empty-${petPage}-${index}`"
                  type="button"
                  class="warehouse-pet-slot"
                  :class="{ selected: pet && activePet?.id === pet.id, empty: !pet }"
                  :aria-disabled="!pet"
                  :aria-label="pet?.name ?? '空仓库格'"
                  @click="selectPet(pet)"
                >
                  <img v-if="pet" :src="pet.avatarImage ?? pet.image" :alt="pet.name" />
                </button>
              </div>

              <div class="pet-grid-footer">
                <div class="grid-pager">
                  <button
                    type="button"
                    class="grid-page-button prev"
                    :disabled="petPage <= 0"
                    aria-label="上一页精灵"
                    @click="changePetPage(-1)"
                  >
                    <img src="/backpack/left_arrow.png" alt="" />
                  </button>
                  <span>{{ petPage + 1 }} / {{ maxPetPage + 1 }}</span>
                  <button
                    type="button"
                    class="grid-page-button next"
                    :disabled="petPage >= maxPetPage"
                    aria-label="下一页精灵"
                    @click="changePetPage(1)"
                  >
                    <img src="/backpack/left_arrow.png" alt="" />
                  </button>
                </div>
                <Button class="put-bag-button" :disabled="!activePet" @click="handlePutInBag">放入背包</Button>
              </div>
            </section>

            <aside class="pet-detail-panel" aria-label="仓库精灵详情">
              <template v-if="activePet">
                <dl class="warehouse-pet-info">
                  <div>
                    <dt>序号:</dt>
                    <dd>
                      {{ activePet.serial }}
                      <span class="type-mini-icons">
                        <img
                          v-for="typeId in activePetTypes"
                          :key="typeId"
                          :src="petTypeIcon(typeId)"
                          :alt="petTypeLabel(typeId)"
                        />
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>名字:</dt>
                    <dd>{{ activePet.name }}</dd>
                  </div>
                  <div>
                    <dt>等级:</dt>
                    <dd>{{ activePet.level }}</dd>
                    <dt class="inline-label">个体:</dt>
                    <dd>31</dd>
                  </div>
                  <div>
                    <dt>性格:</dt>
                    <dd>{{ activePet.nature }}</dd>
                  </div>
                  <div>
                    <dt>炫彩等级:</dt>
                    <dd><span class="star-text">{{ starText(activePet.colorfulLevel, 3) }}</span></dd>
                  </div>
                  <div>
                    <dt>获得时间:</dt>
                    <dd>{{ activePet.acquiredAt }}</dd>
                  </div>
                </dl>

                <dl class="warehouse-stats">
                  <div>
                    <dt>攻击:</dt>
                    <dd>{{ activeStats?.attack ?? 17 }}</dd>
                  </div>
                  <div>
                    <dt>防御:</dt>
                    <dd>{{ activeStats?.defense ?? 15 }}</dd>
                  </div>
                  <div>
                    <dt>特攻:</dt>
                    <dd>{{ activeStats?.specialAttack ?? 18 }}</dd>
                  </div>
                  <div>
                    <dt>特防:</dt>
                    <dd>{{ activeStats?.specialDefense ?? 18 }}</dd>
                  </div>
                  <div>
                    <dt>速度:</dt>
                    <dd>{{ activeStats?.speed ?? 13 }}</dd>
                  </div>
                  <div>
                    <dt>体力:</dt>
                    <dd>{{ activeStats?.hp ?? 29 }}</dd>
                  </div>
                </dl>

                <div class="detail-actions">
                  <Button class="favorite-button" @click="toggleEliteFavorite">
                    {{ activePet.isEliteFavorite ? '取消收藏' : '精英收藏' }}
                  </Button>
                  <Button class="release-button" @click="requestRelease">放生</Button>
                  <Button class="display-button" @click="alertResult = { ok: true, message: `${activePet.name}正在展示中`, petName: activePet.name }">
                    展示
                  </Button>
                </div>
              </template>

              <div v-else class="empty-detail">
                仓库为空
              </div>
            </aside>
          </main>
        </div>
      </section>
    </div>

    <div v-if="replacementWarehousePet" class="replacement-backdrop" role="presentation">
      <div class="replacement-shell" :style="replacementPanelStyle">
        <aside class="replacement-standby-sidebar" aria-label="备战精灵">
          <button
            v-for="(pet, index) in standbyReplacementSlots"
            :key="pet?.id ?? `standby-empty-${index}`"
            type="button"
            class="replacement-standby-item"
            :class="{ empty: !pet, selected: pet && selectedReplacementPetId === pet.id }"
            :aria-disabled="!pet"
            @click="pet ? selectedReplacementPetId = pet.id : undefined"
          >
            <span class="replacement-standby-slot">
              <img v-if="pet" :src="pet.avatarImage ?? pet.image" :alt="pet.name" />
            </span>
            <span>{{ pet?.name ?? '无精灵' }}</span>
          </button>
        </aside>

        <section
          class="replacement-modal"
          role="dialog"
          aria-modal="true"
          aria-label="选择替换精灵"
        >
          <div class="outer-rail-frame" aria-hidden="true"></div>
          <div class="inner-glass-frame" aria-hidden="true"></div>

          <header class="replacement-header">
            <div class="dot-trapezoid replacement-dots" aria-hidden="true" @pointerdown="startReplacementPanelDrag">
              <div v-for="(count, rowIndex) in dotRows" :key="rowIndex" class="dot-row">
                <span v-for="dotIndex in count" :key="dotIndex"></span>
              </div>
            </div>

            <button type="button" class="replacement-close" aria-label="关闭替换选择" @click="closeReplacementModal">
              <img src="/backpack/icons/close.png" alt="" />
            </button>
          </header>

          <h2 class="replacement-title">
            你的精灵包已经满了
            <span>请选择要替换的精灵</span>
          </h2>

          <div class="replacement-content">
            <div class="replacement-list" aria-label="出战精灵">
              <button
                v-for="(pet, index) in battleReplacementPets"
                :key="`battle-${pet.id}`"
                type="button"
                class="replacement-pet-row"
                :class="{ selected: selectedReplacementPetId === pet.id, starter: index === 0 }"
                @click="selectedReplacementPetId = pet.id"
              >
                <span class="replacement-avatar">
                  <img :src="pet.image" :alt="pet.name" />
                </span>
                <span class="replacement-copy">
                  <strong>{{ pet.name }}</strong>
                  <span class="replacement-hp-track">
                    <span :style="{ width: `${hpForPet(pet).percent}%` }"></span>
                  </span>
                </span>
                <span class="replacement-level-value">Lv. {{ pet.level }}</span>
                <span class="replacement-hp-value">
                  {{ hpForPet(pet).current }}/{{ hpForPet(pet).max }}
                </span>
              </button>
            </div>

            <footer class="replacement-actions">
              <Button class="replacement-confirm" :disabled="!selectedReplacementPet" @click="confirmReplacement">替换</Button>
            </footer>
          </div>
        </section>
      </div>
    </div>

    <Alert
      v-if="releaseConfirmPet"
      :highlight-text="releaseConfirmPet.name"
      :message="`确定要放生${releaseConfirmPet.name}吗？`"
      @cancel="releaseConfirmPet = null"
      @confirm="confirmRelease"
    />

    <Alert
      v-if="alertResult"
      :highlight-text="alertResult.petName"
      :message="alertResult.message"
      @cancel="closeAlertResult"
      @confirm="closeAlertResult"
    />
  </Teleport>
</template>

<style scoped>
.warehouse-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1800;
  display: grid;
  place-items: center;
  pointer-events: auto;
}

.warehouse-modal {
  position: relative;
  isolation: isolate;
  width: min(96vw, 1032px);
  height: min(86vh, 612px);
  min-height: 560px;
  display: grid;
  grid-template-rows: 76px minmax(0, 1fr);
  overflow: hidden;
  padding: 7px 26px 13px;
  border: 2px solid #0a4b95;
  border-radius: 16px;
  background: transparent;
  box-shadow: 0 6px 14px rgba(0, 17, 44, 0.34);
  font-family: SimSun, "宋体", serif;
  user-select: none;
}

.warehouse-modal::before {
  position: absolute;
  inset: 0 14px;
  z-index: 0;
  background: linear-gradient(180deg, #55c5ff 0%, #2fa7ee 40%, #2493d9 100%);
  box-shadow: inset 0 -14px 0 rgba(10, 139, 204, 0.24);
  content: "";
  pointer-events: none;
}

.warehouse-modal > * {
  position: relative;
  z-index: 3;
}

.warehouse-modal > .outer-rail-frame {
  position: absolute;
  z-index: 2;
}

.warehouse-modal > .inner-glass-frame {
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

.warehouse-drag-header {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  justify-items: stretch;
  min-width: 0;
}

.dot-trapezoid {
  position: absolute;
  top: 2px;
  left: 50%;
  z-index: 5;
  display: grid;
  place-content: center;
  gap: 3px;
  width: 320px;
  height: 40px;
  margin: 0;
  cursor: grab;
  opacity: 0.95;
  pointer-events: auto;
  touch-action: none;
  transform: translateX(-50%);
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

.warehouse-content {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  padding: 14px 18px 16px;
  border: 4px solid #075aa9;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(180deg, #34acec 0%, #2ca5e5 56%, #2297d9 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.45),
    0 2px 0 rgba(0, 45, 105, 0.62);
}

.warehouse-header {
  position: relative;
  z-index: 2;
  height: 100%;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 72px;
  align-items: center;
  gap: 12px;
}

.warehouse-count {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 44px;
}

.warehouse-count img {
  width: 54px;
  height: 54px;
  object-fit: contain;
  filter: drop-shadow(0 2px 0 #073d78);
}

.warehouse-count-title {
  color: #ffffff;
  font-family: "Backpack Tab Qingke", "ZCOOL Qingke HuangYou", "Microsoft YaHei UI", sans-serif;
  font-size: 32px;
  line-height: 1;
  letter-spacing: 0;
  text-shadow:
    0 3px 0 #084a87,
    3px 0 0 #084a87,
    -3px 0 0 #084a87,
    0 -3px 0 #084a87;
}

.warehouse-count-number {
  color: #ffffff;
  font-family: Arial, sans-serif;
  font-size: 20px;
  text-shadow: 0 2px 0 #0a4e8e;
}

.warehouse-close {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  justify-self: end;
  margin-top: -10px;
  margin-right: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 0.12s ease;
  transform-origin: center;
}

.warehouse-close:hover {
  transform: scale(1.12);
}

.warehouse-close img {
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.warehouse-body {
  display: grid;
  grid-template-columns: 248px minmax(386px, 1fr) 270px;
  gap: 14px;
  min-height: 0;
}

.type-filter-panel {
  min-height: 0;
  display: grid;
  grid-template-rows: 40px 356px 60px;
  align-content: start;
  padding-top: 0;
}

.type-mode-tabs {
  position: relative;
  width: 216px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 0;
  justify-self: center;
}

.type-mode-tabs-frame {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  overflow: visible;
  pointer-events: none;
}

.type-tab-shape {
  fill: url(#type-tab-fill);
  stroke: #063e78;
  stroke-width: 3.5;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.type-tab-shape.active {
  fill: url(#type-tab-active-fill);
}

.type-tab-divider {
  fill: none;
  stroke: #063e78;
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
}

.type-mode-tabs button {
  position: relative;
  z-index: 2;
  width: 108px;
  height: 38px;
  padding: 0;
  border: 0;
  color: #ffffff;
  background: transparent;
  font-family: "Backpack Tab Qingke", "ZCOOL Qingke HuangYou", "Microsoft YaHei UI", sans-serif;
  font-size: 20px;
  line-height: 1;
  letter-spacing: 0;
  text-shadow: 0 2px 0 #07467f;
  cursor: pointer;
}

.type-mode-tabs button:focus-visible {
  outline: 0;
  text-shadow:
    0 0 8px rgba(255, 255, 255, 0.9),
    0 2px 0 #07467f;
}

.type-panel-body {
  position: relative;
  width: 240px;
  height: 356px;
  justify-self: center;
  display: grid;
  grid-template-rows: 306px 50px;
  min-height: 0;
}

.type-panel-frame {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  pointer-events: none;
}

.type-panel-frame-fill {
  fill: rgba(18, 101, 153, 0.46);
  stroke: #064b91;
  stroke-width: 4;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.type-panel-frame-highlight {
  fill: none;
  stroke: rgba(0, 194, 255, 0.7);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.type-icon-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 47px);
  grid-template-rows: repeat(5, 47px);
  align-content: start;
  justify-content: center;
  gap: 8px;
  min-height: 0;
  padding: 13px 10px 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.type-icon-button {
  box-sizing: border-box;
  width: 47px;
  height: 47px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 3px solid #064b91;
  border-radius: 10px;
  background: linear-gradient(180deg, #71d0ff 0%, #34a8eb 45%, #137fd0 100%);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.32),
    inset 0 -4px 0 rgba(0, 71, 143, 0.25);
  cursor: pointer;
  transition: transform 120ms ease;
  transform-origin: center;
}

.type-icon-button:hover,
.type-icon-button:focus-visible {
  outline: 0;
  transform: scale(1.1);
}

.type-icon-button.active {
  border-color: #fffc21;
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.34),
    0 0 8px rgba(255, 246, 22, 0.74);
}

.type-icon-button img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.type-icon-button.all-type {
  color: #ffffff;
  font-family: "Backpack Tab Qingke", "ZCOOL Qingke HuangYou", sans-serif;
  font-size: 24px;
  text-shadow: 0 2px 0 #07467f;
}

.grid-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 42px;
  color: #ffffff;
  font-size: 15px;
  line-height: 1;
  text-shadow: 0 1px 0 #00316f;
}

.grid-page-button {
  width: 24px;
  height: 24px;
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: center;
}

.grid-page-button:disabled {
  cursor: default;
  opacity: 0.45;
}

.grid-page-button img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.grid-page-button.next img {
  transform: scaleX(-1);
}

.grid-page-button:not(:disabled):hover,
.grid-page-button:not(:disabled):focus-visible {
  outline: 0;
  transform: scale(1.12);
}

.grid-pager span {
  display: block;
}

.type-pager {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 42px;
  margin: 0;
  color: #ffffff;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  font-size: 15px;
  line-height: 1;
  text-shadow: 0 1px 0 #00316f;
}

.type-page-button {
  width: 24px;
  height: 24px;
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: center;
}

.type-page-button:disabled {
  cursor: default;
  opacity: 0.45;
}

.type-page-button img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.type-page-button.next img {
  transform: scaleX(-1);
}

.type-page-button:not(:disabled):hover,
.type-page-button:not(:disabled):focus-visible {
  outline: 0;
  transform: scale(1.12);
}

.warehouse-grid-panel {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 96px auto 62px;
  gap: 5px;
  padding-top: 0;
}

.warehouse-filter-bar {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: center;
  gap: 2px;
  min-width: 0;
  margin-bottom: 14px;
  color: #d7f3ff;
  font-family: "Microsoft YaHei UI", sans-serif;
  font-size: 14px;
  line-height: 1;
  text-shadow: 0 1px 0 #00316f;
  position: relative;
  bottom: 10px;
}

.warehouse-filter-bar::after {
  display: block;
  flex-basis: 100%;
  height: 0;
  content: "";
  order: 3;
}

.filter-chip,
.gender-filter,
.filter-toggle,
.warehouse-search {
  box-sizing: border-box;
  height: 28px;
  border: 2px solid rgba(14, 105, 183, 0.78);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(77, 184, 255, 0.52) 0%, rgba(25, 105, 184, 0.56) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.14),
    inset 0 -3px 0 rgba(0, 49, 117, 0.22);
}

.filter-chip,
.gender-filter button {
  color: #d7f3ff;
  font: inherit;
  border: 0;
  cursor: pointer;
}

.filter-chip {
  flex: 1 1 62px;
  min-width: 0;
  padding: 0 12px;
}

.level-toggle {
  flex: 1.45 1 120px;
}

.favorite-toggle {
  flex: 1 1 112px;
  order: 2;
}

.gender-filter {
  display: inline-flex;
  overflow: hidden;
  flex: 1.55 1 186px;
  order: 2;
  padding: 0;
}

.filter-chip.active,
.gender-filter button.active {
  color: #ffffff;
  background:
    linear-gradient(180deg, #6fd9ff 0%, #1597e1 100%);
}

.filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 9px 0 12px;
}

.filter-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.filter-toggle i {
  position: relative;
  width: 32px;
  height: 16px;
  border: 2px solid #0a5b9c;
  border-radius: 999px;
  background: rgba(9, 58, 116, 0.68);
  box-shadow: inset 0 1px 2px rgba(0, 13, 55, 0.45);
}

.filter-toggle i::after {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(180deg, #fff2c2 0%, #c48938 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.42);
  content: "";
  transition: transform 120ms ease;
}

.filter-toggle input:checked + i::after {
  transform: translateX(16px);
}

.filter-toggle input:checked + i {
  background: rgba(40, 156, 217, 0.9);
}

.gender-filter button {
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  padding: 0 10px;
  background: transparent;
}

.warehouse-search {
  order: 4;
  flex: 1 1 0;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  border: 4px solid #1685d2;
  border-radius: 10px;
  color: #ffffff;
  background: #07316b;
  box-shadow:
    inset 0 2px 5px rgba(0, 8, 38, 0.62),
    inset 0 0 0 1px rgba(0, 20, 70, 0.8),
    0 1px 0 rgba(255, 255, 255, 0.22);
  font-family: "Microsoft YaHei UI", sans-serif;
  font-size: 15px;
  font-weight: 700;
  outline: 0;
}

.warehouse-search::placeholder {
  color: rgba(255, 255, 255, 0.88);
}

.warehouse-search:focus {
  border-color: #3bc2ff;
  box-shadow:
    inset 0 2px 5px rgba(0, 8, 38, 0.62),
    0 0 6px rgba(61, 207, 255, 0.72);
}

.filter-refresh {
  order: 4;
  flex: 0 0 64px;
  min-width: 64px;
  height: 40px;
  padding: 0;
  border-width: 3px;
  border-radius: 12px;
  font-size: 18px;
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(5, 68px);
  grid-template-rows: repeat(4, 68px);
  gap: 10px;
  min-height: 0;
  align-content: start;
  justify-content: start;
}

.warehouse-pet-slot {
  box-sizing: border-box;
  width: 68px;
  height: 68px;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  padding: 0;
  border: 3px solid #095ca5;
  border-radius: 13px;
  background: #ffffff;
  cursor: pointer;
}

.warehouse-pet-slot.empty {
  cursor: default;
}

.warehouse-pet-slot.selected {
  border-color: #fbff17;
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.55),
    0 0 8px rgba(255, 246, 24, 0.72);
}

.warehouse-pet-slot img {
  max-width: 86%;
  max-height: 88%;
  object-fit: contain;
  filter: drop-shadow(0 2px 1px rgba(0, 23, 70, 0.24));
}

.pet-grid-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 142px;
  align-items: center;
  gap: 8px;
}

.all-pets-button,
.favorite-button,
.release-button,
.display-button {
  box-sizing: border-box;
  min-width: 0;
  height: 48px;
  border-width: 3px;
  border-radius: 14px;
  font-size: 24px;
}

.all-pets-button,
.put-bag-button {
  box-sizing: border-box;
  width: 142px;
  min-width: 142px;
  height: 50px;
  font-size: 24px;
}

.type-all-pets-button {
  justify-self: center;
  align-self: center;
}

.pet-grid-footer .grid-pager {
  gap: 42px;
}

.pet-detail-panel {
  box-sizing: border-box;
  width: 270px;
  min-height: 0;
  align-self: center;
  display: grid;
  grid-template-rows: auto auto 94px;
  gap: 12px;
  padding: 28px 20px 18px;
  border: 5px solid #004986;
  border-radius: 22px;
  color: #ffffff;
  background: rgba(0, 51, 102, 0.76);
  box-shadow:
    inset 0 0 0 4px #00bfe9,
    inset 0 0 18px rgba(0, 19, 61, 0.24);
  font-size: 20px;
  line-height: 1.28;
}

.warehouse-pet-info,
.warehouse-stats {
  display: grid;
  gap: 5px;
  margin: 0;
}

.warehouse-pet-info div,
.warehouse-stats div {
  display: flex;
  align-items: center;
  min-width: 0;
}

.warehouse-pet-info dt,
.warehouse-stats dt {
  margin: 0;
  white-space: nowrap;
}

.warehouse-pet-info dd,
.warehouse-stats dd {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-label {
  padding-left: 12px;
}

.type-mini-icons {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.type-mini-icons img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.star-text {
  color: #fff637;
  letter-spacing: 0;
}

.warehouse-stats {
  grid-template-columns: 1fr 1fr;
  row-gap: 9px;
}

.detail-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: end;
  gap: 10px;
}

.favorite-button {
  grid-column: 1 / -1;
  justify-self: center;
  width: 120px;
  height: 40px;
  font-size: 18px;
}

.release-button,
.display-button {
  height: 44px;
  font-size: 22px;
}

.empty-detail {
  display: grid;
  place-items: center;
  min-height: 240px;
  color: rgba(255, 255, 255, 0.78);
}

.replacement-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: grid;
  place-items: center;
  pointer-events: auto;
}

.replacement-shell {
  display: grid;
  grid-template-columns: 82px 390px;
  align-items: center;
  gap: 10px;
}

.replacement-modal {
  position: relative;
  isolation: isolate;
  width: 390px;
  min-height: 438px;
  display: grid;
  grid-template-rows: 44px 58px minmax(0, 1fr);
  overflow: hidden;
  padding: 7px 26px 12px;
  border: 2px solid #0a4b95;
  border-radius: 16px;
  background: transparent;
  box-shadow: 0 6px 14px rgba(0, 17, 44, 0.34);
  font-family: SimSun, "宋体", serif;
  user-select: none;
}

.replacement-modal::before {
  position: absolute;
  inset: 0 14px;
  z-index: 0;
  background: linear-gradient(180deg, #55c5ff 0%, #2fa7ee 40%, #2493d9 100%);
  box-shadow: inset 0 -14px 0 rgba(10, 139, 204, 0.24);
  content: "";
  pointer-events: none;
}

.replacement-modal > * {
  position: relative;
  z-index: 3;
}

.replacement-modal > .outer-rail-frame {
  position: absolute;
  z-index: 2;
}

.replacement-modal > .inner-glass-frame {
  position: absolute;
  z-index: 1;
}

.replacement-header {
  position: relative;
  display: grid;
  justify-items: center;
  min-width: 0;
}

.replacement-dots {
  width: 220px;
  height: 28px;
}

.replacement-close {
  position: absolute;
  top: -4px;
  right: -5px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 0.12s ease;
  transform-origin: center;
}

.replacement-close:hover {
  transform: scale(1.12);
}

.replacement-close img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.replacement-title {
  justify-self: end;
  align-self: center;
  width: 312px;
  margin: 0 0 0 auto;
  color: #ffffff;
  font-family: "SimHei", "Microsoft YaHei", sans-serif;
  font-size: 20px;
  line-height: 1.12;
  text-align: center;
  text-shadow:
    0 2px 0 #084a87,
    2px 0 0 #084a87,
    -2px 0 0 #084a87,
    0 -2px 0 #084a87;
}

.replacement-title span {
  display: block;
}

.replacement-standby-sidebar {
  width: 82px;
  min-height: 360px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: repeat(6, 54px);
  align-content: center;
  justify-items: center;
  gap: 4px;
  padding: 16px 8px;
  border: 3px solid #00cfff;
  border-radius: 14px;
  background-color: rgba(0, 46, 103, 0.8);
  box-shadow:
    inset 0 0 0 2px rgba(0, 46, 103, 0.9),
    0 0 0 2px rgba(0, 46, 103, 0.9),
    inset 0 0 12px rgba(0, 86, 180, 0.18);
}

.replacement-standby-item {
  min-width: 0;
  width: 64px;
  height: 54px;
  display: grid;
  grid-template-rows: 44px 10px;
  justify-items: center;
  align-content: start;
  padding: 0;
  border: 0;
  color: #ffffff;
  background: transparent;
  cursor: pointer;
}

.replacement-standby-item.empty {
  cursor: default;
  opacity: 0.55;
}

.replacement-standby-slot {
  position: relative;
  overflow: hidden;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 2px solid #176daa;
  border-radius: 50%;
  background: #184992;
}

.replacement-standby-item.selected .replacement-standby-slot {
  border-color: #ffff1e;
  box-shadow:
    inset 0 0 3px 1px rgba(255, 248, 39, 0.72),
    inset 0 0 8px 3px rgba(255, 214, 0, 0.34),
    0 0 6px rgba(255, 246, 24, 0.58);
}

.replacement-standby-slot img {
  width: 40px;
  height: 40px;
  display: block;
  object-fit: contain;
  pointer-events: none;
}

.replacement-standby-item > span:last-child {
  max-width: 58px;
  overflow: hidden;
  font-size: 10px;
  line-height: 9px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.replacement-content {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 54px;
  padding: 16px 17px 10px 18px;
  border: 4px solid #075aa9;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(180deg, #34acec 0%, #2ca5e5 56%, #2297d9 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.45),
    0 2px 0 rgba(0, 45, 105, 0.62);
}

.replacement-list {
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: space-between;
  column-gap: 14px;
  row-gap: 22px;
  padding: 5px 0 10px;
}

.replacement-pet-row {
  position: relative;
  min-width: 0;
  height: 52px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 2px;
  padding: 4px 7px 4px 3px;
  border: 2px solid #176daa;
  border-radius: 8px;
  color: #ffffff;
  background: #184992;
  cursor: pointer;
}

.replacement-pet-row::before {
  position: absolute;
  top: 4px;
  left: 8px;
  z-index: 1;
  width: 38px;
  height: 38px;
  background: url("/backpack/icons/pet_back.png") center / contain no-repeat;
  content: "";
  pointer-events: none;
  transform: translate(-15px, -18px);
}

.replacement-pet-row.starter {
  border: 1px solid #ffd8bf;
  background: #ff9900;
  box-shadow:
    inset 0 -2px 0 #ff6600,
    0 0 0 1px #ffffff;
}

.replacement-pet-row.selected {
  border-color: #ffff1e;
  box-shadow:
    inset 0 0 3px 1px rgba(255, 248, 39, 0.72),
    inset 0 0 8px 3px rgba(255, 214, 0, 0.34);
}

.replacement-pet-row.selected::before {
  background-image: url("/backpack/icons/pet_back_active.png");
  filter:
    drop-shadow(0 0 1px #ffff4a)
    drop-shadow(0 0 3px rgba(255, 247, 41, 0.98));
}

.replacement-avatar {
  position: relative;
  z-index: 4;
  width: 44px;
  height: 52px;
  overflow: visible;
}

.replacement-avatar img {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 2;
  width: auto;
  max-width: none;
  height: 46px;
  object-fit: contain;
  filter: drop-shadow(0 3px 2px rgba(0, 18, 58, 0.58));
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.replacement-copy {
  position: absolute;
  top: 7px;
  right: 5px;
  left: 39px;
  z-index: 3;
  min-width: 0;
  height: 24px;
  display: grid;
  grid-template-rows: 14px 4px;
  align-content: start;
  gap: 4px;
}

.replacement-copy strong,
.replacement-level-value,
.replacement-hp-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.replacement-copy strong {
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
}

.replacement-level-value,
.replacement-hp-value {
  position: absolute;
  bottom: 3px;
  z-index: 4;
  font-size: 10px;
  line-height: 1;
}

.replacement-level-value {
  left: 4px;
}

.replacement-hp-value {
  right: 5px;
  text-align: right;
}

.replacement-hp-track {
  width: 100%;
  height: 4px;
  background: transparent;
}

.replacement-hp-track span {
  display: block;
  height: 100%;
  border-radius: 2px 0 0;
  background: #e50000;
}

.replacement-actions {
  display: grid;
  place-items: center;
}

.replacement-confirm {
  width: 120px;
  height: 50px;
  font-size: 26px;
}

@media (max-width: 980px) {
  .warehouse-modal {
    width: 98vw;
    height: 96vh;
    min-height: 0;
    padding: 12px 24px 22px;
  }

  .warehouse-body {
    grid-template-columns: 230px minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) 230px;
  }

  .pet-detail-panel {
    grid-column: 1 / -1;
    align-self: stretch;
    grid-template-rows: auto auto;
  }
}
</style>
