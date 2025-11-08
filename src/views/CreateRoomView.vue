<template>
  <section class="create-room">
    <div class="map-area">
      <RoomMap :rooms="rooms" :selected-room="selectedPreview" />
    </div>

    <section
      class="sheet"
      :class="{
        'sheet--dragging': isDragging,
        'sheet--collapsed': isCollapsed,
        'sheet--expanded': sheetHeight === MAX_SHEET,
      }"
      :style="sheetStyle"
    >
      <header
        class="sheet__header"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <span class="sheet__grip" />
        <div>
          <h1>방 생성하기</h1>
          <p>목적지와 조건을 입력하면 꼬꼬택이 함께 탈 동승자를 찾아드려요.</p>
        </div>
        <button type="button" class="sheet__toggle" @click.stop="toggleSheet">
          {{ sheetHeight === MAX_SHEET ? '접기' : '전체 보기' }}
        </button>
      </header>

      <div class="sheet__list" :class="{ 'sheet__list--collapsed': isCollapsed }">
        <article class="preview-card">
          <header class="preview-card__header">
            <h2>{{ preview.title }}</h2>
            <p>{{ preview.subtitle }}</p>
          </header>
          <div class="preview-route">
            <div class="preview-route__line">
              <span class="route-pin is-start" />
              <div class="route-line__body">
                <span class="route-label">
                  {{ preview.departure }}
                </span>
                <span class="route-divider" />
                <span class="route-label">
                  {{ preview.arrival }}
                </span>
              </div>
              <span class="route-pin is-end" />
            </div>
            <ul class="route-meta">
              <li>
                <span>출발</span>
                <strong>{{ preview.time }}</strong>
              </li>
              <li>
                <span>우선순위</span>
                <strong>{{ preview.priority }}</strong>
              </li>
              <li>
                <span>결제</span>
                <strong>{{ preview.paymentMethod }}</strong>
              </li>
              <li>
                <span>예상 금액</span>
                <strong>{{ preview.fare }}</strong>
              </li>
            </ul>
          </div>
        </article>

        <form class="form" @submit.prevent="submitForm">
          <div class="form-grid">
            <label class="field">
              <span>방 이름</span>
              <input
                v-model.trim="form.title"
                type="text"
                maxlength="25"
                placeholder="예) 강남 → 인천공항 야간 합승"
              />
            </label>

            <label class="field field--autocomplete">
              <span>출발지</span>
              <div class="input-with-action">
                <input
                  v-model="departureQuery"
                  type="text"
                  placeholder="예) 강남역 5번 출구"
                  autocomplete="off"
                  @focus="setActiveField('departure')"
                  @blur="handleBlur('departure')"
                />
                <button
                  type="button"
                  class="pin-button"
                  @mousedown.prevent
                  @click="openMapPicker('departure')"
                  aria-label="지도에서 출발지 선택"
                >
                  📍
                </button>
              </div>
              <p v-if="isSearching.departure" class="hint">검색 중...</p>
              <ul
                v-if="activeField === 'departure' && departureSuggestions.length"
                class="suggestion-list"
              >
                <li v-for="place in departureSuggestions" :key="place.id">
                  <button type="button" @mousedown.prevent="selectPlace('departure', place)">
                    <strong>{{ place.name }}</strong>
                    <span>{{ place.address }}</span>
                  </button>
                </li>
              </ul>
            </label>

            <label class="field field--autocomplete">
              <span>도착지</span>
              <div class="input-with-action">
                <input
                  v-model="arrivalQuery"
                  type="text"
                  placeholder="예) 인천국제공항 T1"
                  autocomplete="off"
                  @focus="setActiveField('arrival')"
                  @blur="handleBlur('arrival')"
                />
                <button
                  type="button"
                  class="pin-button"
                  @mousedown.prevent
                  @click="openMapPicker('arrival')"
                  aria-label="지도에서 도착지 선택"
                >
                  📍
                </button>
              </div>
              <p v-if="isSearching.arrival" class="hint">검색 중...</p>
              <ul
                v-if="activeField === 'arrival' && arrivalSuggestions.length"
                class="suggestion-list"
              >
                <li v-for="place in arrivalSuggestions" :key="place.id">
                  <button type="button" @mousedown.prevent="selectPlace('arrival', place)">
                    <strong>{{ place.name }}</strong>
                    <span>{{ place.address }}</span>
                  </button>
                </li>
              </ul>
            </label>

            <label class="field">
              <span>출발 시간</span>
              <input v-model="form.departureTime" type="datetime-local" />
            </label>
          </div>

          <fieldset class="field priority-field">
            <legend>매칭 우선순위</legend>
            <div class="priority-toggle">
              <button
                v-for="option in priorityOptions"
                :key="option.value"
                type="button"
                class="priority-chip"
                :class="{ 'is-active': form.priority === option.value }"
                @click="form.priority = option.value"
              >
                <span>{{ option.label }}</span>
                <small>{{ option.description }}</small>
              </button>
            </div>
          </fieldset>

          <div class="form-grid">
            <label class="field">
              <span>결제수단</span>
              <select v-model="form.paymentMethod">
                <option v-for="method in paymentOptions" :key="method" :value="method">
                  {{ method }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>예상 결제 금액 (거리 기반)</span>
              <input :value="preview.fare" type="text" readonly />
              <p class="hint">
                약 {{ distanceLabel }} · KakaoMap 거리 계산 기준
              </p>
            </label>
          </div>

          <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

          <footer class="actions">
            <button type="button" class="ghost-button" @click="resetForm">초기화</button>
            <button type="submit" class="primary-button" :disabled="!isValid">
              방 생성하기
            </button>
          </footer>

          <p v-if="successMessage" class="form-success">{{ successMessage }}</p>
        </form>
      </div>
    </section>

    <div v-if="mapPickerVisible" class="map-picker">
      <div class="map-picker__backdrop" @click="closeMapPicker" aria-hidden="true"></div>
      <div class="map-picker__panel" role="dialog" aria-modal="true">
        <header class="map-picker__header">
          <h3>
            {{ mapPickerTarget === 'arrival' ? '도착지' : '출발지' }} 위치를 지도에서 선택하세요
          </h3>
          <p>지도나 핀을 드래그해 위치를 조정하고, 하단 버튼으로 확정하세요.</p>
        </header>
        <div class="map-picker__canvas" ref="mapPickerCanvas"></div>
        <footer class="map-picker__actions">
          <button type="button" class="ghost-button" @click="closeMapPicker">취소</button>
          <button type="button" class="primary-button" @click="confirmMapPicker">
            이 위치 사용
          </button>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import RoomMap from '@/components/RoomMap.vue'
import type { RoomPreview } from '@/types/rooms'
import { loadKakaoMaps, type KakaoNamespace } from '@/services/kakaoMaps'

type Priority = 'time' | 'seats'
type FieldKind = 'departure' | 'arrival'

type SelectedPlace = {
  id: string
  name: string
  address: string
  position: { lat: number; lng: number }
}

const paymentOptions = ['카카오페이', '토스페이', '현장 결제', '기타']

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }

const priorityOptions = [
  { value: 'time', label: '시간 우선', description: '출발 시간을 가장 중요하게 맞춰요.' },
  { value: 'seats', label: '인원 우선', description: '비슷한 인원을 먼저 찾아요.' },
] satisfies Array<{ value: Priority; label: string; description: string }>

const COLLAPSED_SHEET = 22
const MID_SHEET = 65
const MAX_SHEET = 100
const SHEET_STATES = [COLLAPSED_SHEET, MID_SHEET, MAX_SHEET] as const
const SNAP_THRESHOLD = 6

const rooms = ref<RoomPreview[]>([
  {
    id: 'room-101',
    title: '강남 → 인천공항 야간 합승',
    departure: {
      label: '강남역 5번 출구',
      position: { lat: 37.498095, lng: 127.02761 },
    },
    arrival: {
      label: '인천국제공항 T1',
      position: { lat: 37.4602, lng: 126.4407 },
    },
    time: '오늘 23:30 출발',
    seats: 2,
    tags: ['공항', '야간'],
  },
  {
    id: 'room-102',
    title: '홍대입구 → 서현역 출근',
    departure: {
      label: '홍대입구역 9번 출구',
      position: { lat: 37.5575, lng: 126.9242 },
    },
    arrival: {
      label: '서현역 AK플라자',
      position: { lat: 37.3851, lng: 127.1238 },
    },
    time: '내일 07:10 출발',
    seats: 1,
    tags: ['출근', '아침'],
  },
])

const sheetHeight = ref<number>(MID_SHEET)
const isDragging = ref(false)
const isCollapsed = computed(() => !isDragging.value && sheetHeight.value === COLLAPSED_SHEET)
const sheetStyle = computed(() =>
  isCollapsed.value ? { height: 'auto', minHeight: '140px' } : { height: `${sheetHeight.value}vh` },
)

let startY = 0
let startHeight = MID_SHEET

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
  const deltaPercent = (deltaY / window.innerHeight) * 100
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
  sheetHeight.value = sheetHeight.value === MAX_SHEET ? MID_SHEET : MAX_SHEET
}

const form = reactive({
  title: '',
  departure: null as SelectedPlace | null,
  arrival: null as SelectedPlace | null,
  departureTime: '',
  priority: 'time' as Priority,
  paymentMethod: '카카오페이',
})

const departureQuery = ref('')
const arrivalQuery = ref('')
const departureSuggestions = ref<SelectedPlace[]>([])
const arrivalSuggestions = ref<SelectedPlace[]>([])
const activeField = ref<FieldKind | null>(null)
const isSearching = reactive<Record<FieldKind, boolean>>({
  departure: false,
  arrival: false,
})
const mapPickerVisible = ref(false)
const mapPickerTarget = ref<FieldKind | null>(null)
const mapPickerCanvas = ref<HTMLDivElement | null>(null)
const mapPickerPosition = reactive({ ...DEFAULT_CENTER })

const errorMessage = ref('')
const successMessage = ref('')
const estimatedFare = ref(0)
const estimatedDistanceKm = ref(0)

const isValid = computed(() => {
  return (
    Boolean(form.title.trim()) &&
    Boolean(form.departure) &&
    Boolean(form.arrival) &&
    Boolean(form.departureTime) &&
    form.departure?.id !== form.arrival?.id
  )
})

const preview = computed(() => ({
  title: form.title.trim() || '방 이름을 입력해 주세요',
  subtitle: `${form.departure?.name ?? '출발지 미정'} → ${form.arrival?.name ?? '도착지 미정'}`,
  departure: form.departure?.address ?? '출발지를 선택해 주세요',
  arrival: form.arrival?.address ?? '도착지를 선택해 주세요',
  time: form.departureTime ? formatDate(form.departureTime) : '출발 시간을 선택해 주세요',
  priority: form.priority === 'time' ? '시간 우선' : '인원 우선',
  paymentMethod: form.paymentMethod,
  fare: estimatedFare.value ? `${estimatedFare.value.toLocaleString()}원` : '거리 산정 중',
}))

const distanceLabel = computed(() => {
  if (!estimatedDistanceKm.value) return '거리 계산 중'
  return `${estimatedDistanceKm.value.toFixed(1)}km`
})

const selectedPreview = computed<RoomPreview | null>(() => {
  if (!form.departure && !form.arrival) return null
  const departure = form.departure ?? form.arrival
  const arrival = form.arrival ?? form.departure
  if (!departure || !arrival) return null
  return {
    id: 'new-room-preview',
    title: form.title.trim() || '새로운 방',
    departure: { label: departure.name, position: departure.position },
    arrival: { label: arrival.name, position: arrival.position },
    time: preview.value.time,
    seats: form.priority === 'seats' ? 3 : 1,
    tags: [preview.value.priority, form.paymentMethod],
  }
})

let kakaoApi: KakaoNamespace | null = null
let placesService: kakao.maps.services.Places | null = null
let polyline: kakao.maps.Polyline | null = null
let geocoder: kakao.maps.services.Geocoder | null = null
let mapPickerMap: kakao.maps.Map | null = null
let mapPickerMarker: kakao.maps.Marker | null = null

loadKakaoMaps().then((kakao) => {
  if (!kakao) return
  kakaoApi = kakao
  placesService = new kakao.maps.services.Places()
  polyline = new kakao.maps.Polyline()
  geocoder = new kakao.maps.services.Geocoder()
  computeDistance()
})

const searchTimers: Record<FieldKind, ReturnType<typeof setTimeout> | null> = {
  departure: null,
  arrival: null,
}
const suppressSearch: Record<FieldKind, boolean> = {
  departure: false,
  arrival: false,
}

watch(departureQuery, (value) => scheduleSearch('departure', value))
watch(arrivalQuery, (value) => scheduleSearch('arrival', value))

watch(
  () => [form.departure, form.arrival],
  () => computeDistance(),
  { deep: true },
)

function scheduleSearch(kind: FieldKind, keyword: string) {
  if (suppressSearch[kind]) {
    suppressSearch[kind] = false
    return
  }
  const trimmed = keyword.trim()
  if (trimmed.length < 2 || !placesService) {
    setSuggestions(kind, [])
    return
  }
  if (searchTimers[kind]) {
    clearTimeout(searchTimers[kind]!)
  }
  searchTimers[kind] = setTimeout(() => runSearch(kind, trimmed), 250)
}

function runSearch(kind: FieldKind, keyword: string) {
  if (!placesService || !kakaoApi) return
  isSearching[kind] = true
  placesService.keywordSearch(
    keyword,
    (data, status) => {
      isSearching[kind] = false
      if (status !== kakaoApi!.maps.services.Status.OK || !Array.isArray(data)) {
        setSuggestions(kind, [])
        return
      }
      const mapped: SelectedPlace[] = data.slice(0, 6).map((item) => ({
        id: item.id ?? `${item.x}-${item.y}`,
        name: item.place_name,
        address: item.road_address_name || item.address_name || '자세한 주소 정보를 찾지 못했어요.',
        position: { lat: Number(item.y), lng: Number(item.x) },
      }))
      setSuggestions(kind, mapped)
    },
    { size: 6 },
  )
}

function setSuggestions(kind: FieldKind, items: SelectedPlace[]) {
  if (kind === 'departure') {
    departureSuggestions.value = items
  } else {
    arrivalSuggestions.value = items
  }
}

function selectPlace(kind: FieldKind, place: SelectedPlace) {
  suppressSearch[kind] = true
  if (kind === 'departure') {
    form.departure = place
    departureQuery.value = place.name
    departureSuggestions.value = []
  } else {
    form.arrival = place
    arrivalQuery.value = place.name
    arrivalSuggestions.value = []
  }
  activeField.value = null
  computeDistance()
}

function setActiveField(kind: FieldKind) {
  activeField.value = kind
}

function handleBlur(kind: FieldKind) {
  setTimeout(() => {
    if (kind === 'departure') {
      departureSuggestions.value = []
    } else {
      arrivalSuggestions.value = []
    }
    if (activeField.value === kind) {
      activeField.value = null
    }
  }, 120)
}

function openMapPicker(kind: FieldKind) {
  mapPickerTarget.value = kind
  const base = form[kind]?.position ?? DEFAULT_CENTER
  mapPickerPosition.lat = base.lat
  mapPickerPosition.lng = base.lng
  mapPickerVisible.value = true
  loadKakaoMaps().then(() => {
    nextTick(() => {
      setupMapPicker()
    })
  })
}

function closeMapPicker() {
  mapPickerVisible.value = false
  mapPickerTarget.value = null
  destroyMapPicker()
}

async function setupMapPicker() {
  if (!mapPickerVisible.value || !kakaoApi || !mapPickerCanvas.value) return
  const center = new kakaoApi.maps.LatLng(mapPickerPosition.lat, mapPickerPosition.lng)
  mapPickerMap = new kakaoApi.maps.Map(mapPickerCanvas.value, {
    center,
    level: 4,
  })
  mapPickerMarker = new kakaoApi.maps.Marker({
    position: center,
    map: mapPickerMap,
    draggable: true,
  })

  kakaoApi.maps.event.addListener(mapPickerMarker, 'dragend', () => {
    if (!mapPickerMarker) return
    const position = mapPickerMarker.getPosition()
    mapPickerPosition.lat = position.getLat()
    mapPickerPosition.lng = position.getLng()
  })

  kakaoApi.maps.event.addListener(mapPickerMap, 'click', (event: kakao.maps.event.MouseEvent) => {
    if (!mapPickerMarker) return
    mapPickerMarker.setPosition(event.latLng)
    mapPickerPosition.lat = event.latLng.getLat()
    mapPickerPosition.lng = event.latLng.getLng()
  })
}

function destroyMapPicker() {
  if (mapPickerMarker) {
    mapPickerMarker.setMap(null)
    mapPickerMarker = null
  }
  mapPickerMap = null
}

async function confirmMapPicker() {
  const target = mapPickerTarget.value
  if (!target) {
    closeMapPicker()
    return
  }
  const info = await reverseGeocode(mapPickerPosition)
  const place: SelectedPlace = {
    id: `custom-${target}-${Date.now()}`,
    name: info.name,
    address: info.address,
    position: { lat: mapPickerPosition.lat, lng: mapPickerPosition.lng },
  }
  selectPlace(target, place)
  closeMapPicker()
}

function reverseGeocode(position: { lat: number; lng: number }) {
  return new Promise<{ name: string; address: string }>((resolve) => {
    if (!geocoder || !kakaoApi) {
      resolve({
        name: '사용자 지정 위치',
        address: `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`,
      })
      return
    }
    geocoder.coord2Address(position.lng, position.lat, (result, status) => {
      if (status === kakaoApi!.maps.services.Status.OK && result[0]) {
        const road = result[0].road_address?.address_name
        const lot = result[0].address?.address_name
        resolve({
          name: lot ?? road ?? '사용자 지정 위치',
          address: road ?? lot ?? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`,
        })
      } else {
        resolve({
          name: '사용자 지정 위치',
          address: `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`,
        })
      }
    })
  })
}

function computeDistance() {
  if (!kakaoApi || !form.departure || !form.arrival || !polyline) {
    estimatedDistanceKm.value = 0
    estimatedFare.value = 0
    return
  }

  const start = new kakaoApi.maps.LatLng(form.departure.position.lat, form.departure.position.lng)
  const end = new kakaoApi.maps.LatLng(form.arrival.position.lat, form.arrival.position.lng)

  polyline.setPath([start, end])
  const meters = polyline.getLength()
  const km = meters / 1000
  estimatedDistanceKm.value = km
  estimatedFare.value = calculateFare(meters)
}

function calculateFare(meters: number) {
  if (!meters) return 0
  const baseFare = 4000
  const perKm = 1200
  const km = meters / 1000
  return Math.round(baseFare + perKm * km)
}

function formatDate(datetime: string) {
  const date = new Date(datetime)
  if (Number.isNaN(date.getTime())) return '유효한 시간을 선택해 주세요'
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function resetForm() {
  form.title = ''
  form.departure = null
  form.arrival = null
  form.departureTime = ''
  form.priority = 'time'
  form.paymentMethod = '카카오페이'
  departureQuery.value = ''
  arrivalQuery.value = ''
  estimatedFare.value = 0
  estimatedDistanceKm.value = 0
  errorMessage.value = ''
  successMessage.value = ''
}

function submitForm() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isValid.value) {
    errorMessage.value = '필수 정보를 모두 입력하고 출발/도착지를 정확히 선택해 주세요.'
    return
  }

  successMessage.value = '새로운 방이 임시로 생성됐어요! 목록에서 확인해 보세요.'
  console.info('[create-room] payload', {
    ...form,
    departure: form.departure,
    arrival: form.arrival,
    estimatedFare: estimatedFare.value,
    distanceKm: estimatedDistanceKm.value,
  })
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
})
</script>

<style scoped>
.create-room {
  position: relative;
  min-height: 100dvh;
  background: #0f172a;
  overflow: hidden;
  color: #1f2937;
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

.sheet__toggle {
  margin-left: auto;
  border: none;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.sheet__toggle:hover {
  background: rgba(37, 99, 235, 0.2);
  color: #1d4ed8;
}

.sheet__list {
  flex: 1;
  overflow-y: auto;
  padding: clamp(6px, 1.6vw, 10px) clamp(18px, 4vw, 26px) clamp(18px, 3.6vw, 26px);
  display: grid;
  gap: clamp(14px, 2.6vw, 20px);
}

.sheet__list--collapsed {
  max-height: clamp(140px, 32vh, 200px);
  padding-bottom: clamp(10px, 2.4vw, 16px);
  margin-top: clamp(6px, 1.8vw, 10px);
  overflow: hidden;
  pointer-events: none;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0));
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0));
}

.preview-card {
  padding: clamp(16px, 3.4vw, 20px);
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  border: 1px solid rgba(37, 99, 235, 0.4);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
  display: grid;
  gap: 1rem;
}

.preview-card__header h2 {
  margin: 0;
  font-size: clamp(16px, 3.6vw, 20px);
}

.preview-card__header p {
  margin: 0.3rem 0 0;
  color: rgba(248, 250, 252, 0.7);
}

.preview-route__line {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.route-pin {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #60a5fa;
  background: #1d4ed8;
  display: inline-block;
}

.route-pin.is-end {
  background: #f97316;
  border-color: #fdba74;
}

.route-line__body {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-weight: 600;
}

.route-divider {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, rgba(96, 165, 250, 0.2), rgba(248, 113, 113, 0.5));
}

.route-label {
  min-width: 120px;
}

.route-meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

.route-meta li {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.route-meta span {
  font-size: 0.8rem;
  color: rgba(248, 250, 252, 0.7);
}

.route-meta strong {
  font-size: 1rem;
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.92rem;
  color: #1f2937;
  position: relative;
}

.field input,
.field select {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.field--autocomplete .suggestion-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0.25rem 0 0;
  padding: 0.4rem 0;
  list-style: none;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(15, 23, 42, 0.12);
  z-index: 2;
  max-height: 220px;
  overflow-y: auto;
}

.suggestion-list li button {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 0.65rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  cursor: pointer;
}

.suggestion-list li button:hover {
  background: rgba(37, 99, 235, 0.08);
}

.suggestion-list strong {
  font-size: 0.92rem;
}

.suggestion-list span {
  font-size: 0.8rem;
  color: #6b7280;
}

fieldset.field {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 20px;
  padding: 1rem;
  background: #ffffff;
}

.input-with-action {
  display: flex;
  align-items: center;
  position: relative;
}

.input-with-action input {
  flex: 1;
  padding-right: 2.5rem;
}

.pin-button {
  position: absolute;
  right: 0.5rem;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
}

.pin-button:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.5);
  outline-offset: 2px;
}

.priority-field legend {
  padding: 0 0.4rem;
  font-weight: 600;
  color: #1f2937;
}

.priority-toggle {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.priority-chip {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 18px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  cursor: pointer;
  background: #f8fafc;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.priority-chip small {
  color: #6b7280;
  font-size: 0.8rem;
}

.priority-chip.is-active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
}

.hint {
  margin: 0;
  font-size: 0.78rem;
  color: #6b7280;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ghost-button {
  border: 1px solid rgba(15, 23, 42, 0.15);
  background: transparent;
  border-radius: 999px;
  padding: 0.45rem 1.4rem;
  cursor: pointer;
  font-weight: 600;
}

.primary-button {
  border: none;
  border-radius: 999px;
  padding: 0.9rem 2rem;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.primary-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.form-error {
  color: #dc2626;
  margin: 0;
  font-weight: 600;
}

.form-success {
  color: #059669;
  margin: 0;
  font-weight: 600;
}

.map-picker {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.map-picker__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
}

.map-picker__panel {
  position: relative;
  width: min(640px, 90vw);
  background: #ffffff;
  border-radius: 28px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  z-index: 1;
}

.map-picker__header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.map-picker__header p {
  margin: 0.4rem 0 0;
  color: #475569;
  font-size: 0.95rem;
}

.map-picker__canvas {
  height: 360px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.map-picker__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (min-width: 960px) {
  .sheet {
    margin-inline: auto;
    max-width: 880px;
  }
}
</style>
