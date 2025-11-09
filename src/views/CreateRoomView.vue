<template>
  <section class="create-room">
    <div class="create-room__container">
      <header class="page-header">
        <div>
          <p class="page-header__eyebrow">방 만들기</p>
          <p class="page-header__description page-header__description--inline">
            조건을 입력하면 꼬꼬택이 함께 탈 동승자를 찾아드려요.
          </p>
        </div>
      </header>

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
              placeholder="공항팟 99 !!"
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
            <input v-model="form.departureTime" type="time" step="60" placeholder="예) 08:30" />
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
            </button>
          </div>
        </fieldset>

        <div class="form-grid">
          <label class="field">
            <span>결제수단</span>
            <div v-if="availablePaymentMethods.length" class="payment-methods" role="radiogroup">
              <button
                v-for="method in availablePaymentMethods"
                :key="method.id"
                type="button"
                class="payment-card"
                :class="{ 'is-active': method.id === selectedPaymentMethodId }"
                @click="selectPaymentMethod(method.id)"
              >
                <div class="payment-card__icon" :data-brand="method.brand ?? 'card'">
                  {{ method.iconText }}
                </div>
                <div class="payment-card__text">
                  <p class="payment-card__name">{{ method.label }}</p>
                  <p v-if="method.description" class="payment-card__desc">
                    {{ method.description }}
                  </p>
                </div>
              </button>
            </div>
            <p v-else class="hint">결제수단을 먼저 등록해 주세요.</p>
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
          <button type="button" class="ghost-button reset-button" @click="resetForm">초기화</button>
          <button type="submit" class="primary-button" :disabled="!isValid">
            방 생성하기
          </button>
        </footer>

        <p v-if="successMessage" class="form-success">{{ successMessage }}</p>
      </form>
    </div>

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
            확인
          </button>
        </footer>
      </div>
    </div>
  </section>
</template>


<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import type { RoomPreview } from '@/types/rooms'
import { loadKakaoMaps, type KakaoNamespace } from '@/services/kakaoMaps'
import {
  getUserPaymentMethods,
  type PaymentMethod as StoredPaymentMethod,
} from '@/data/paymentMethods'
import { addRoom } from '@/data/roomsStore'

type Priority = 'time' | 'seats'
type FieldKind = 'departure' | 'arrival'

type SelectedPlace = {
  id: string
  name: string
  address: string
  position: { lat: number; lng: number }
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }
const router = useRouter()

const ownedPaymentMethods = getUserPaymentMethods('credit-card')
const fallbackPaymentMethod: StoredPaymentMethod = {
  id: 'manual',
  label: '현장 결제',
  description: '기사님께 직접 결제',
  iconText: '₩',
}
const availablePaymentMethods: StoredPaymentMethod[] = [
  ...ownedPaymentMethods,
  fallbackPaymentMethod,
]
const selectedPaymentMethodId = ref<string>(
  availablePaymentMethods[0]?.id ?? fallbackPaymentMethod.id,
)

const priorityOptions = [
  { value: 'time', label: '시간 우선', description: '' },
  { value: 'seats', label: '인원 우선', description: '' },
] satisfies Array<{ value: Priority; label: string; description: string }>

const form = reactive({
  title: '',
  departure: null as SelectedPlace | null,
  arrival: null as SelectedPlace | null,
  departureTime: '',
  priority: 'time' as Priority,
  paymentMethod: '',
})

const selectPaymentMethod = (id: string) => {
  selectedPaymentMethodId.value = id
}

watchEffect(() => {
  const active =
    availablePaymentMethods.find((method) => method.id === selectedPaymentMethodId.value) ??
    fallbackPaymentMethod
  form.paymentMethod = active.label
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
  title: form.title.trim() || '방 이름',
  subtitle: `${form.departure?.name ?? '출발지 미정'} → ${form.arrival?.name ?? '도착지 미정'}`,
  departure: form.departure?.address ?? '출발지',
  arrival: form.arrival?.address ?? '도착지',
  time: form.departureTime ? formatDate(form.departureTime) : '출발 시간',
  priority: form.priority === 'time' ? '시간 우선' : '인원 우선',
  paymentMethod: form.paymentMethod,
  fare: estimatedFare.value ? `${estimatedFare.value.toLocaleString()}원` : '거리 산정 중',
}))

const distanceLabel = computed(() => {
  if (!estimatedDistanceKm.value) return '거리 계산 중'
  return `${estimatedDistanceKm.value.toFixed(1)}km`
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

function formatDate(value: string) {
  const [hourToken, minuteToken] = value.split(':')
  const hours = Number(hourToken)
  const minutes = Number(minuteToken)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '유효한 시간을 선택해 주세요'
  const period = hours >= 12 ? '오후' : '오전'
  const normalizedHour = hours % 12 === 0 ? 12 : hours % 12
  const paddedMinutes = minuteToken?.padStart(2, '0') ?? '00'
  return `${period} ${normalizedHour}시 ${paddedMinutes}분`
}

function resetForm() {
  form.title = ''
  form.departure = null
  form.arrival = null
  form.departureTime = ''
  form.priority = 'time'
  departureQuery.value = ''
  arrivalQuery.value = ''
  estimatedFare.value = 0
  estimatedDistanceKm.value = 0
  errorMessage.value = ''
  successMessage.value = ''
  selectedPaymentMethodId.value = availablePaymentMethods[0]?.id ?? fallbackPaymentMethod.id
}

function submitForm() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isValid.value) {
    errorMessage.value = '필수 정보를 모두 입력하고 출발/도착지를 정확히 선택해 주세요.'
    return
  }

  if (!form.departure || !form.arrival) return

  const newRoom: RoomPreview = {
    id: `room-${Date.now()}`,
    title: form.title.trim() || `${form.departure.name} → ${form.arrival.name}`,
    departure: {
      label: form.departure.name,
      position: { ...form.departure.position },
    },
    arrival: {
      label: form.arrival.name,
      position: { ...form.arrival.position },
    },
    time: preview.value.time,
    seats: form.priority === 'seats' ? 3 : 2,
    tags: [
      form.priority === 'time' ? '시간 우선' : '인원 우선',
      form.paymentMethod || '현장 결제',
    ],
  }

  addRoom(newRoom)
  successMessage.value = '새로운 방이 생성됐어요! 방 찾기에서 확인해 주세요.'
  setTimeout(() => {
    router.push({ name: 'find-room' })
    resetForm()
  }, 400)
}

</script>

<style scoped>
.create-room {
  --color-background: #ffffff;
  --color-surface: #eeeff2;
  --color-border: #d7d8de;
  --color-text-strong: #2f1c03;
  --color-text-muted: #6a5f4d;
  --color-button: #fdd651;
  --color-button-text: #2f1c03;

  min-height: 100dvh;
  background: var(--color-background);
  color: var(--color-text-strong);
}

.create-room__container {
  width: min(920px, 100%);
  margin: 0 auto;
  padding: clamp(32px, 5vw, 72px) clamp(16px, 4vw, 48px) clamp(48px, 6vw, 80px);
  display: flex;
  flex-direction: column;
  gap: clamp(18px, 3vw, 32px);
}

.page-header,
.preview-card,
.form,
fieldset.field,
.payment-card,
.map-picker__panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 32px;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.08);
}

.page-header {
  padding: clamp(20px, 3vw, 32px);
}

.page-header__eyebrow {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.page-header h1 {
  margin: 0.4rem 0 0.6rem;
  font-size: clamp(1.4rem, 4vw, 2rem);
}

.page-header__description {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.page-header__description--inline {
  font-size: 0.9rem;
  white-space: nowrap;
}

.preview-card {
  padding: clamp(20px, 3.6vw, 28px);
  border-radius: 28px;
}

.preview-card__header h2 {
  margin: 0;
  font-size: clamp(1.05rem, 3.4vw, 1.25rem);
}

.preview-card__header p {
  margin: 0.4rem 0 0;
  color: var(--color-text-muted);
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
  border: 3px solid #ffffff;
  background: var(--color-button);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
}

.route-line__body {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.route-divider {
  flex: 1;
  height: 2px;
  background: rgba(0, 0, 0, 0.14);
}

.route-meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.route-meta li {
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  display: grid;
  gap: 0.3rem;
}

.route-meta span {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.form {
  padding: clamp(20px, 3.6vw, 28px);
  border-radius: 28px;
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
  gap: 0.45rem;
  font-size: 0.92rem;
  color: var(--color-text-strong);
  position: relative;
}

.field input,
.field select {
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0.85rem 1rem;
  background: #ffffff;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: var(--color-button);
  box-shadow: 0 0 0 3px rgba(253, 214, 81, 0.35);
}

.field--autocomplete .suggestion-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  list-style: none;
  margin: 0;
  padding: 0.4rem 0;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.12);
  max-height: 220px;
  overflow-y: auto;
  z-index: 5;
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
  background: rgba(0, 0, 0, 0.04);
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
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 50%;
  border: none;
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 600;
  cursor: pointer;
}

fieldset.field {
  padding: 1.1rem;
  border-radius: 24px;
}

.priority-field legend {
  font-weight: 600;
  color: var(--color-text-muted);
}

.priority-toggle {
  display: flex;
  gap: 0.75rem;
  flex-wrap: nowrap;
}

.priority-chip {
  flex: 1 1 0;
}

.priority-chip {
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0.75rem 1rem;
  background: #ffffff;
  color: var(--color-text-strong);
  cursor: pointer;
  text-align: center;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.priority-chip.is-active {
  background: var(--color-button);
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 0 0 2px rgba(253, 214, 81, 0.45);
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.85rem;
}

.payment-card {
  padding: 0.95rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fffefb;
  color: var(--color-text-strong);
}

.payment-card.is-active {
  border-color: var(--color-button);
  box-shadow: 0 0 0 2px rgba(253, 214, 81, 0.45);
  background: var(--color-button);
  transform: translateY(-2px);
  color: var(--color-button-text);
}

.payment-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(253, 214, 81, 0.25);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--color-text-strong);
}

.payment-card.is-active .payment-card__icon {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-text-strong);
}

.payment-card.is-active .payment-card__name,
.payment-card.is-active .payment-card__desc {
  color: var(--color-button-text);
}

.payment-card__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.primary-button,
.ghost-button,
.map-picker__actions .ghost-button,
.map-picker__actions .primary-button {
  background: var(--color-button);
  color: var(--color-button-text);
  border: none;
  border-radius: 999px;
  padding: 0.9rem 2.2rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease;
}

.reset-button {
  background: linear-gradient(135deg, #ff9c8b 0%, #ff775f 100%);
  color: #ffffff;
  box-shadow: 0 16px 26px rgba(255, 119, 95, 0.28);
}

.reset-button:not(:disabled):hover {
  box-shadow: 0 18px 30px rgba(255, 119, 95, 0.35);
}

.primary-button:disabled,
.ghost-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.primary-button:not(:disabled):hover,
.ghost-button:not(:disabled):hover {
  transform: translateY(-1px);
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
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

.map-picker__panel {
  padding: 1.6rem;
  border-radius: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  position: relative;
  z-index: 1;
}

.map-picker__header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.map-picker__header p {
  margin: 0.4rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.map-picker__canvas {
  height: 360px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.map-picker__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}


@media (max-width: 600px) {
  .form-grid,
  .payment-methods {
    grid-template-columns: 1fr;
  }
}
</style>
