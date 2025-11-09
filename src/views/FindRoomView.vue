<template>
  <section ref="viewRef" class="find-room">
    <div class="map-area">
      <RoomMap :rooms="rooms" :selected-room="selectedRoom" />
    </div>

    <section
      class="sheet"
      :class="{
        'sheet--dragging': isDragging,
        'sheet--expanded': sheetHeight === MAX_SHEET,
        'sheet--collapsed': isCollapsed,
      }"
      :style="sheetStyle"
    >
      <header
        ref="sheetHeaderRef"
        class="sheet__header"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <span class="sheet__grip" />
        <div class="sheet__title">
          <div class="sheet__title-text">
            <h1>탐색 중인 방</h1>
            <p>{{ rooms.length }}개의 방을 찾았어요</p>
          </div>
        </div>
        <div class="sheet__actions">
          <button
            type="button"
            class="sheet__toggle"
            aria-label="방 만들기 페이지로 이동"
            @click.stop="goToCreateRoom"
          >
            방 만들기
          </button>
          <button type="button" class="sheet__toggle" @click.stop="toggleSheet">
            {{ sheetHeight === MAX_SHEET ? '지도 보기' : '전체 보기' }}
          </button>
        </div>
      </header>

      <div
        ref="sheetListRef"
        class="sheet__list"
        :class="{ 'sheet__list--collapsed': isCollapsed }"
      >
        <article
          v-for="room in rooms"
          :key="room.id"
          class="room-card"
          :class="{ 'room-card--active': selectedRoom?.id === room.id }"
          @click="selectRoom(room)"
        >
          <header class="room-card__header">
            <h2>{{ room.title }}</h2>
            <span class="room-card__seats">{{ room.seats }}자리 남음</span>
          </header>
          <dl class="room-card__meta">
            <div>
              <dt>출발지</dt>
              <dd>{{ room.departure.label }}</dd>
            </div>
            <div>
              <dt>도착지</dt>
              <dd>{{ room.arrival.label }}</dd>
            </div>
            <div>
              <dt>출발 시간</dt>
              <dd>{{ room.time }}</dd>
            </div>
          </dl>
          <footer class="room-card__tags">
            <span v-for="tag in room.tags" :key="tag">#{{ tag }}</span>
          </footer>
          <transition name="room-detail">
            <section
              v-if="selectedRoom?.id === room.id"
              class="room-detail"
              @click.stop
            >
              <header class="room-detail__header">
                <h3>{{ room.title }}</h3>
                <p class="room-detail__subtitle">{{ room.departure.label }} → {{ room.arrival.label }}</p>
              </header>
              <dl class="room-detail__meta">
                <div>
                  <dt>출발지</dt>
                  <dd>{{ room.departure.label }}</dd>
                </div>
                <div>
                  <dt>도착지</dt>
                  <dd>{{ room.arrival.label }}</dd>
                </div>
                <div>
                  <dt>출발 시간</dt>
                  <dd>{{ room.time }}</dd>
                </div>
                <div>
                  <dt>잔여 좌석</dt>
                  <dd>{{ room.seats }}자리</dd>
                </div>
              </dl>
              <footer class="room-detail__tags">
                <span v-for="tag in room.tags" :key="tag">#{{ tag }}</span>
              </footer>
              <button type="button" class="room-detail__cta" @click.stop="joinRoom(room)">방 들어가기</button>
            </section>
          </transition>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import RoomMap from '@/components/RoomMap.vue'
import { mockRooms } from '@/data/mockRooms'
import type { RoomPreview } from '@/types/rooms'

const COLLAPSED_SHEET = 22
const MID_SHEET = 60
const MAX_SHEET = 100
const SHEET_STATES = [COLLAPSED_SHEET, MID_SHEET, MAX_SHEET] as const
const SNAP_THRESHOLD = 6

const router = useRouter()
const rooms = ref<RoomPreview[]>([...mockRooms])

const viewRef = ref<HTMLElement | null>(null)
const sheetHeight = ref<number>(MID_SHEET)
const isDragging = ref(false)
const selectedRoom = ref<RoomPreview | null>(null)
const isCollapsed = computed(() => !isDragging.value && sheetHeight.value === COLLAPSED_SHEET)
const sheetHeaderRef = ref<HTMLElement | null>(null)
const sheetListRef = ref<HTMLElement | null>(null)
const collapsedSheetHeight = ref<number | null>(null)
const availableHeight = ref(0)
const baseHeight = computed(() => availableHeight.value || window.innerHeight)
const sheetStyle = computed(() =>
  isCollapsed.value
    ? collapsedSheetHeight.value
      ? { height: `${Math.min(collapsedSheetHeight.value, baseHeight.value)}px` }
      : { height: 'auto' }
    : { height: `${(sheetHeight.value / 100) * baseHeight.value}px` },
)

let startY = 0
let startHeight = MID_SHEET
let resizeObserver: ResizeObserver | null = null

function updateCollapsedSheetHeight() {
  if (!isCollapsed.value) return
  const headerEl = sheetHeaderRef.value
  const listEl = sheetListRef.value
  if (!headerEl || !listEl) return
  const headerHeight = headerEl.getBoundingClientRect().height
  const listHeight = listEl.getBoundingClientRect().height
  collapsedSheetHeight.value = headerHeight + listHeight
}

function scheduleCollapsedMeasurement() {
  if (!isCollapsed.value) return
  requestAnimationFrame(() => updateCollapsedSheetHeight())
}

function updateAvailableHeight() {
  availableHeight.value = viewRef.value?.getBoundingClientRect().height ?? window.innerHeight
}

const handleResize = () => {
  updateAvailableHeight()
  if (isCollapsed.value) {
    updateCollapsedSheetHeight()
  }
}

function clamp(value: number) {
  return Math.min(MAX_SHEET, Math.max(COLLAPSED_SHEET, value))
}

function closestStateIndex(value: number) {
  let nearestIndex = 0
  let minDiff = Number.POSITIVE_INFINITY
  SHEET_STATES.forEach((state, idx) => {
    const diff = Math.abs(state - value)
    if (diff < minDiff) {
      minDiff = diff
      nearestIndex = idx
    }
  })
  return nearestIndex
}

function stateValueAt(index: number) {
  const clampedIndex = Math.min(SHEET_STATES.length - 1, Math.max(0, index))
  return SHEET_STATES[clampedIndex] ?? MID_SHEET
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.buttons !== 1) return
  event.preventDefault()
  isDragging.value = true
  startY = event.clientY
  startHeight = sheetHeight.value
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value) return
  const deltaY = startY - event.clientY
  const deltaPercent = (deltaY / baseHeight.value) * 100
  sheetHeight.value = clamp(startHeight + deltaPercent)
}

function finishDrag() {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)

  const clamped = clamp(sheetHeight.value)
  sheetHeight.value = clamped
  const delta = clamped - startHeight
  const absDelta = Math.abs(delta)

  if (absDelta < SNAP_THRESHOLD) {
    sheetHeight.value = stateValueAt(closestStateIndex(startHeight))
    return
  }

  const startIdx = closestStateIndex(startHeight)
  const targetIdx = closestStateIndex(clamped)

  if (targetIdx === startIdx && absDelta >= SNAP_THRESHOLD) {
    const direction = delta > 0 ? 1 : -1
    sheetHeight.value = stateValueAt(startIdx + direction)
    return
  }

  sheetHeight.value = stateValueAt(targetIdx)
}

function onPointerUp(event: PointerEvent) {
  if (isDragging.value) {
    onPointerMove(event)
    finishDrag()
  }
}

function onPointerCancel() {
  finishDrag()
}

function toggleSheet() {
  if (isCollapsed.value) {
    updateCollapsedSheetHeight()
  }
  sheetHeight.value = sheetHeight.value === MAX_SHEET ? MID_SHEET : MAX_SHEET
}

function selectRoom(room: RoomPreview) {
  selectedRoom.value = selectedRoom.value?.id === room.id ? null : room
}

function joinRoom(room: RoomPreview) {
  router.push({ name: 'seat-selection', query: { roomId: room.id } })
}

function goToCreateRoom() {
  router.push({ name: 'create-room' })
}

watch(isCollapsed, (collapsed) => {
  if (collapsed) {
    scheduleCollapsedMeasurement()
  }
})

watch(
  rooms,
  () => {
    if (isCollapsed.value) {
      scheduleCollapsedMeasurement()
    }
  },
  { deep: true },
)

watch(selectedRoom, () => {
  if (isCollapsed.value) {
    scheduleCollapsedMeasurement()
  }
})

onMounted(() => {
  updateAvailableHeight()
  if (viewRef.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      updateAvailableHeight()
      if (isCollapsed.value) scheduleCollapsedMeasurement()
    })
    resizeObserver.observe(viewRef.value)
  }
  if (isCollapsed.value) {
    scheduleCollapsedMeasurement()
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.find-room {
  position: relative;
  height: 100%;
  min-height: 100%;
  background: #f5f5f5;
  color: #1f2937;
  overflow: hidden;
}

.map-area {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.sheet {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  background: #ffffff;
  border-radius: 28px 28px 0 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -18px 40px rgba(15, 23, 42, 0.12);
  transition: height 0.3s ease, border-radius 0.3s ease, box-shadow 0.3s ease;
  will-change: height;
  touch-action: none;
  z-index: 1;
}

.sheet--collapsed {
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -18px 40px rgba(15, 23, 42, 0.12);
}

.sheet--dragging {
  transition: none;
}

.sheet__header {
  position: relative;
  padding: clamp(12px, 2.6vw, 16px) clamp(18px, 4vw, 26px) clamp(10px, 2.4vw, 14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(12px, 3.6vw, 18px);
  cursor: grab;
  user-select: none;
  flex-wrap: wrap;
}

.sheet__header:active {
  cursor: grabbing;
}

.sheet__grip {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 48px;
  height: 5px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.12);
  transform: translateX(-50%);
}

.sheet__header h1 {
  margin: 4px 0 0;
  font-size: clamp(16px, 3.4vw, 20px);
}

.sheet__header p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.35;
}
.sheet__title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 auto;
}
.sheet__title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sheet__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sheet__toggle {
  border: none;
  background: rgba(250, 204, 21, 0.15);
  color: #ca8a04;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.sheet__toggle:hover {
  background: rgba(250, 184, 0, 0.3);
  color: #a16207;
}

.sheet__list {
  flex: 1;
  overflow-y: auto;
  overflow-anchor: none;
  padding: clamp(6px, 1.6vw, 10px) clamp(18px, 4vw, 26px) clamp(18px, 3.6vw, 26px);
  scroll-padding-bottom: var(--tab-h);
  display: grid;
  gap: clamp(12px, 2.6vw, 18px);
}

.sheet__list--collapsed {
  max-height: clamp(96px, 22vh, 140px);
  padding-bottom: clamp(10px, 2.4vw, 16px);
  margin-top: clamp(6px, 1.8vw, 10px);
  overflow: hidden;
  pointer-events: none;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0));
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0));
}

.room-card {
  padding: clamp(16px, 3.4vw, 20px) clamp(16px, 3.4vw, 22px);
  border-radius: 20px;
  border: 1px solid rgba(234, 179, 8, 0.4);
  background: rgba(255, 251, 235, 0.92);
  box-shadow: 0 12px 24px rgba(202, 138, 4, 0.18);
  display: grid;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
  overflow-anchor: none;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(202, 138, 4, 0.28);
}

.room-card--active {
  border-color: rgba(217, 119, 6, 0.75);
  box-shadow: 0 20px 40px rgba(202, 138, 4, 0.4);
  background: rgba(254, 240, 138, 0.95);
}

.room-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.room-card__header h2 {
  margin: 0;
  font-size: clamp(15px, 3.4vw, 18px);
  color: #1f2937;
}

.room-card__seats {
  font-size: 13px;
  font-weight: 600;
  color: #b45309;
  background: rgba(251, 191, 36, 0.3);
  border-radius: 999px;
  padding: 6px 12px;
}

.room-card__meta {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  margin: 0;
}

.room-card__meta div {
  display: grid;
  gap: 4px;
}

.room-card__meta dt {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.room-card__meta dd {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
}

.room-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}

.room-card__tags span {
  font-size: 12px;
  color: #d97706;
  background: rgba(251, 191, 36, 0.25);
  padding: 6px 10px;
  border-radius: 999px;
}

.room-detail-enter-active,
.room-detail-leave-active {
  transition: all 0.25s ease;
}

.room-detail-enter-from,
.room-detail-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.room-detail {
  margin-top: 10px;
  padding: clamp(14px, 3vw, 18px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 16px;
  border: 1px solid rgba(234, 179, 8, 0.6);
  background: #fff9db;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.room-detail__header h3 {
  margin: 0;
  font-size: clamp(15px, 3.6vw, 18px);
  color: #0f172a;
}

.room-detail__subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
}

.room-detail__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin: 0;
}

.room-detail__meta dt {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.room-detail__meta dd {
  margin: 4px 0 0;
  font-size: 14px;
  color: #1f2937;
}

.room-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}

.room-detail__tags span {
  font-size: 12px;
  color: #92400e;
  background: rgba(251, 191, 36, 0.35);
  padding: 6px 12px;
  border-radius: 999px;
}

.room-detail__cta {
  border: none;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  background: #fcd34d;
  color: #78350f;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(234, 179, 8, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.room-detail__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(202, 138, 4, 0.35);
}

@media (min-width: 960px) {
  .find-room {
    border-radius: 28px;
    overflow: hidden;
  }

  .sheet {
    margin-inline: auto;
    max-width: 860px;
  }
}

</style>
