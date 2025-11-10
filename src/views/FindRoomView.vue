<template>
  <section ref="viewRef" class="find-room">
    <div class="map-area">
      <RoomMap :rooms="sortedRooms" :selected-room="selectedRoom" />
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
            <p>{{ sortedRooms.length }}개의 방을 찾았어요.</p>
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
          <button
            type="button"
            class="sheet__toggle sheet__toggle--sort"
            :class="{ 'sheet__toggle--active': showSortOptions }"
            @click.stop="toggleSortOptions"
          >
            정렬
          </button>
          <button type="button" class="sheet__toggle" @click.stop="toggleSheet">
            {{ sheetHeight === MAX_SHEET ? '지도 보기' : '전체 보기' }}
          </button>
        </div>
      </header>

      <transition name="sort-panel">
        <section v-if="showSortOptions" class="sort-panel" @click.stop>
          <div class="sort-toolbar">
            <div class="sort-toolbar__mode">
              <label>
                <span>정렬 기준</span>
                <select v-model="sortMode">
                  <option v-for="mode in sortModes" :key="mode.value" :value="mode.value">
                    {{ mode.label }}
                  </option>
                </select>
              </label>
            </div>
            <div class="sort-toolbar__inputs">
              <button type="button" class="loc-btn" @click="useCurrentLocation" :disabled="isLocating">
                {{ isLocating ? '위치 확인 중...' : userLocation ? '내 위치 업데이트' : '내 위치 불러오기' }}
              </button>
              <div class="location-set">
                <div class="location-set__row">
                  <div class="location-set__info">
                    <p class="location-set__label">희망 출발지</p>
                    <p class="location-set__value">{{ formatLocationText(desiredDeparture) }}</p>
                  </div>
                  <div class="location-set__actions">
                    <button type="button" class="loc-mini" @click="openPicker('departure')">
                      지도에서 선택
                    </button>
                    <button
                      v-if="desiredDeparture"
                      type="button"
                      class="loc-clear"
                      @click="clearDesired('departure')"
                    >
                      초기화
                    </button>
                  </div>
                </div>
                <div class="location-set__row">
                  <div class="location-set__info">
                    <p class="location-set__label">희망 도착지</p>
                    <p class="location-set__value">{{ formatLocationText(desiredArrival) }}</p>
                  </div>
                  <div class="location-set__actions">
                    <button type="button" class="loc-mini" @click="openPicker('arrival')">
                      지도에서 선택
                    </button>
                    <button
                      v-if="desiredArrival"
                      type="button"
                      class="loc-clear"
                      @click="clearDesired('arrival')"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              </div>
              <div class="time-input">
                <span>희망 출발 시간</span>
                <div class="time-input__row">
                  <button type="button" class="time-btn" @click="openTimePicker">
                    {{ formattedPreferredTime }}
                  </button>
                  <button
                    v-if="hasPreferredTime"
                    type="button"
                    class="loc-clear"
                    @click="clearPreferredTime"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>
            <p v-if="sortHint" class="sort-toolbar__hint">{{ sortHint }}</p>
          </div>
        </section>
      </transition>

      <div
        ref="sheetListRef"
        class="sheet__list"
        :class="{ 'sheet__list--collapsed': isCollapsed }"
      >
        <article
          v-for="room in sortedRooms"
          :key="room.id"
          class="room-card"
          :class="{ 'room-card--active': selectedRoom?.id === room.id }"
          @click="selectRoom(room)"
        >
          <header class="room-card__header">
            <h2>{{ room.title }}</h2>
            <span class="room-card__seats">
              {{ room.capacity }}명 중 {{ room.filled }}명 참여
            </span>
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
                  <dt>참여 / 정원</dt>
                  <dd>{{ room.filled }} / {{ room.capacity }}</dd>
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
    <LocationPicker
      v-if="pickerMode"
      :title="pickerTitle"
      :initial-position="pickerInitialPosition"
      @cancel="closePicker"
      @confirm="handlePickerConfirm"
    />
    <TimePicker
      v-if="showTimePicker"
      :period="preferredPeriod"
      :hour="preferredHour"
      :minute="preferredMinute"
      @cancel="closeTimePicker"
      @confirm="handleTimeConfirm"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import RoomMap from '@/components/RoomMap.vue'
import LocationPicker from '@/components/LocationPicker.vue'
import TimePicker from '@/components/TimePicker.vue'
import { mockRooms } from '@/data/mockRooms'
import type { RoomPreview, GeoPoint } from '@/types/rooms'

const COLLAPSED_SHEET = 22
const MID_SHEET = 60
const MAX_SHEET = 100
const SHEET_STATES = [COLLAPSED_SHEET, MID_SHEET, MAX_SHEET] as const
const SNAP_THRESHOLD = 6

const router = useRouter()
const rooms = ref<RoomPreview[]>([...mockRooms])
type SortMode = 'default' | 'nearest-departure' | 'nearest-arrival' | 'departure-time'
const sortMode = ref<SortMode>('default')
const sortModes = [
  { value: 'default', label: '기본' },
  { value: 'nearest-departure', label: '출발지 가까운 순' },
  { value: 'nearest-arrival', label: '희망 도착지 가까운 순' },
  { value: 'departure-time', label: '희망 출발시간 순' },
] as const

const userLocation = ref<GeoPoint | null>(null)
const desiredDeparture = ref<GeoPoint | null>(null)
const desiredArrival = ref<GeoPoint | null>(null)
const isLocating = ref(false)
const locationError = ref<string | null>(null)
const showSortOptions = ref(false)
const pickerMode = ref<'departure' | 'arrival' | null>(null)
const showTimePicker = ref(false)
const preferredPeriod = ref<'AM' | 'PM'>('AM')
const preferredHour = ref('')
const preferredMinute = ref('')

function useCurrentLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    alert('이 브라우저에서는 위치 정보를 사용할 수 없습니다.')
    return
  }
  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      isLocating.value = false
      locationError.value = null
    },
    error => {
      isLocating.value = false
      locationError.value = error.message
      alert('위치 정보를 가져올 수 없습니다. 권한 설정을 확인해 주세요.')
    },
    { enableHighAccuracy: true, timeout: 8000 },
  )
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function distanceBetween(a: GeoPoint, b: GeoPoint) {
  const R = 6371000
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const aHarv = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv))
  return R * c
}

function parseRoomDeparture(room: RoomPreview) {
  const match = room.time.match(/(\d{1,2}):(\d{2})/)
  if (!match) return null
  const [hours, minutes] = match.slice(1).map(Number)
  const date = new Date()
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return date
}

const hasPreferredTime = computed(() => Boolean(preferredHour.value && preferredMinute.value))

function parsePreferredDepartureTime() {
  if (!hasPreferredTime.value) return null
  let hour = Number(preferredHour.value)
  if (Number.isNaN(hour)) return null
  hour = hour % 12
  if (preferredPeriod.value === 'PM') {
    hour += 12
  }
  const minute = Number(preferredMinute.value)
  if (Number.isNaN(minute)) return null
  const date = new Date()
  date.setHours(hour ?? 0, minute ?? 0, 0, 0)
  return date
}

const sortedRooms = computed(() => {
  const base = [...rooms.value]
  switch (sortMode.value) {
    case 'nearest-departure':
      {
        const anchor = desiredDeparture.value ?? userLocation.value
        if (!anchor) return base
        return base.sort(
          (a, b) =>
            distanceBetween(anchor, a.departure.position) -
            distanceBetween(anchor, b.departure.position),
        )
      }
    case 'nearest-arrival':
      if (!desiredArrival.value) return base
      return base.sort(
        (a, b) =>
          distanceBetween(desiredArrival.value as GeoPoint, a.arrival.position) -
          distanceBetween(desiredArrival.value as GeoPoint, b.arrival.position),
      )
    case 'departure-time':
      {
        const preferred = parsePreferredDepartureTime()
        if (!preferred) return base
        return base.sort((a, b) => {
          const aDate = parseRoomDeparture(a)
          const bDate = parseRoomDeparture(b)
          if (!aDate || !bDate) return 0
          const timeDiff =
            Math.abs(aDate.getTime() - preferred.getTime()) -
            Math.abs(bDate.getTime() - preferred.getTime())
          if (timeDiff !== 0) return timeDiff
          const location = desiredDeparture.value ?? userLocation.value
          if (!location) return timeDiff
          return (
            distanceBetween(location, a.departure.position) -
            distanceBetween(location, b.departure.position)
          )
        })
      }
    default:
      return base
  }
})

const sortHint = computed(() => {
  if (sortMode.value === 'nearest-departure' && !desiredDeparture.value && !userLocation.value) {
    return '내 위치를 불러오거나 지도에서 희망 출발지를 선택하면 가까운 순으로 정렬할 수 있어요.'
  }
  if (sortMode.value === 'nearest-arrival' && !desiredArrival.value) {
    return '지도에서 희망 도착지를 지정하면 가까운 방부터 보여드려요.'
  }
  if (sortMode.value === 'departure-time' && !hasPreferredTime.value) {
    return '원하는 출발 시각을 입력하면 시간 순으로 정렬할 수 있어요.'
  }
  if (locationError.value) {
    return `위치 오류: ${locationError.value}`
  }
  return ''
})

function toggleSortOptions() {
  showSortOptions.value = !showSortOptions.value
}

function openPicker(mode: 'departure' | 'arrival') {
  pickerMode.value = mode
}

function closePicker() {
  pickerMode.value = null
}

function handlePickerConfirm(position: GeoPoint) {
  if (pickerMode.value === 'departure') {
    desiredDeparture.value = position
  } else if (pickerMode.value === 'arrival') {
    desiredArrival.value = position
  }
  closePicker()
}

function clearDesired(mode: 'departure' | 'arrival') {
  if (mode === 'departure') {
    desiredDeparture.value = null
  } else {
    desiredArrival.value = null
  }
}

function clearPreferredTime() {
  preferredHour.value = ''
  preferredMinute.value = ''
}

function formatLocationText(point: GeoPoint | null) {
  if (!point) return '미설정'
  return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`
}

const pickerTitle = computed(() =>
  pickerMode.value === 'arrival' ? '희망 도착지 선택' : '희망 출발지 선택',
)

const pickerInitialPosition = computed<GeoPoint>(() => {
  const fallback =
    rooms.value[0]?.departure.position ?? {
      lat: 37.5665,
      lng: 126.978,
    }
  if (pickerMode.value === 'arrival') {
    return desiredArrival.value ?? rooms.value[0]?.arrival.position ?? fallback
  }
  return desiredDeparture.value ?? userLocation.value ?? fallback
})

const formattedPreferredTime = computed(() => {
  if (!hasPreferredTime.value) return '미설정'
  const hour = Number(preferredHour.value) % 12 || 12
  const minute = preferredMinute.value
  const period = preferredPeriod.value === 'AM' ? '오전' : '오후'
  return `${period} ${hour}시 ${minute}분`
})

function openTimePicker() {
  showTimePicker.value = true
}

function closeTimePicker() {
  showTimePicker.value = false
}

function handleTimeConfirm(payload: { period: 'AM' | 'PM'; hour: string; minute: string }) {
  preferredPeriod.value = payload.period
  preferredHour.value = payload.hour
  preferredMinute.value = payload.minute
  showTimePicker.value = false
}

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
  sortedRooms,
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
  width: 100%;
  min-height: calc(100dvh - var(--header-h));
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

.sort-panel {
  padding: 14px clamp(18px, 4vw, 28px) 18px;
  background: rgba(255, 250, 230, 0.96);
  border-top: 1px solid rgba(245, 158, 11, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.sort-panel-enter-active,
.sort-panel-leave-active {
  transition: all 0.2s ease;
}

.sort-panel-enter-from,
.sort-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.sort-toolbar {
  display: grid;
  gap: 12px;
}

.sort-toolbar__mode label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #b45309;
}

.sort-toolbar__mode select {
  border: 1px solid rgba(245, 158, 11, 0.5);
  border-radius: 14px;
  padding: 6px 12px;
  background: rgba(255, 252, 230, 0.8);
  font-size: 13px;
  color: #78350f;
}

.sort-toolbar__inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.location-set {
  display: grid;
  gap: 8px;
  min-width: 220px;
}

.location-set__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.location-set__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.location-set__label {
  margin: 0;
  font-size: 11px;
  color: #d97706;
}

.location-set__value {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #78350f;
}

.location-set__actions {
  display: flex;
  gap: 6px;
}


.loc-mini {
  border: 1px solid rgba(217, 119, 6, 0.4);
  background: rgba(253, 230, 138, 0.6);
  color: #92400e;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  cursor: pointer;
}

.loc-mini:disabled {
  opacity: 0.6;
  cursor: progress;
}

.loc-clear {
  border: none;
  background: transparent;
  color: #b45309;
  font-size: 11px;
  cursor: pointer;
  text-decoration: underline;
}

.loc-btn {
  border: 1px solid rgba(245, 158, 11, 0.5);
  background: rgba(251, 191, 36, 0.18);
  color: #b45309;
  border-radius: 14px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.loc-btn:disabled {
  opacity: 0.6;
  cursor: progress;
}

.sort-toolbar select,
.time-input input {
  border: 1px solid rgba(146, 64, 14, 0.2);
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 12px;
  background: #fffef5;
}

.time-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  color: #92400e;
}

.time-input__row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.time-btn {
  border: 1px solid rgba(251, 191, 36, 0.6);
  background: rgba(253, 230, 138, 0.5);
  color: #92400e;
  border-radius: 14px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.sort-toolbar__hint {
  margin: 0;
  font-size: 12px;
  color: #b45309;
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
.sheet__toggle--sort {
  background: rgba(251, 191, 36, 0.4);
  color: #92400e;
}
.sheet__toggle--active,
.sheet__toggle--sort.sheet__toggle--active {
  background: #facc15;
  color: #7c2d12;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
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
  display: grid;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, border 0.2s ease, background 0.2s ease;
  overflow-anchor: none;
}

.room-card:hover {
  transform: translateY(-2px);
}

.room-card--active {
  border-color: rgba(217, 119, 6, 0.75);
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
