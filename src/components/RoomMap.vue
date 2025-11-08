<template>
  <div class="map-root">
    <div ref="canvas" class="map-canvas" />
    <div v-if="errorMessage" class="map-fallback map-fallback--error">
      <strong>지도를 불러오지 못했어요.</strong>
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else-if="!ready" class="map-fallback">
      <strong>지도를 불러오는 중입니다.</strong>
      <p>네트워크 상태를 확인하거나 잠시만 기다려 주세요.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { RoomPreview } from '@/types/rooms'

type KakaoNamespace = typeof window.kakao

const props = defineProps<{
  rooms: RoomPreview[]
  selectedRoom: RoomPreview | null
}>()

const ready = ref(false)
const errorMessage = ref<string | null>(null)
const canvas = ref<HTMLDivElement>()

let kakaoApi: KakaoNamespace | null = null
let map: any = null
const listMarkers: any[] = []
const selectedMarkers: any[] = []

const hasSelection = computed(() => Boolean(props.selectedRoom))

function setError(message: string, detail?: unknown) {
  errorMessage.value = message
  ready.value = false
  // eslint-disable-next-line no-console
  console.error('[RoomMap]', message, detail)
}

function clearMarkers(collection: any[]) {
  collection.forEach(marker => marker.setMap(null))
  collection.splice(0, collection.length)
}

function renderListMarkers() {
  if (!map || !kakaoApi) return
  clearMarkers(listMarkers)
  props.rooms.forEach(room => {
    const marker = new kakaoApi.maps.Marker({
      position: new kakaoApi.maps.LatLng(room.departure.position.lat, room.departure.position.lng),
      map,
    })
    listMarkers.push(marker)
  })
}

function renderSelectedMarkers() {
  if (!map || !kakaoApi) return
  clearMarkers(selectedMarkers)
  const room = props.selectedRoom
  if (!room) return

  const departure = new kakaoApi.maps.LatLng(room.departure.position.lat, room.departure.position.lng)
  const arrival = new kakaoApi.maps.LatLng(room.arrival.position.lat, room.arrival.position.lng)

  const departureMarker = new kakaoApi.maps.Marker({
    position: departure,
    map,
    title: `${room.title} 출발`,
  })

  const arrivalMarker = new kakaoApi.maps.Marker({
    position: arrival,
    map,
    title: `${room.title} 도착`,
  })

  selectedMarkers.push(departureMarker, arrivalMarker)

  const bounds = new kakaoApi.maps.LatLngBounds()
  bounds.extend(departure)
  bounds.extend(arrival)
  map.setBounds(bounds)
}

function updateMarkers() {
  if (hasSelection.value) {
    clearMarkers(listMarkers)
    renderSelectedMarkers()
  } else {
    clearMarkers(selectedMarkers)
    renderListMarkers()
  }
}

function initializeMap(kakao: KakaoNamespace) {
  if (!canvas.value) return
  kakaoApi = kakao
  map = new kakao.maps.Map(canvas.value, {
    center: new kakao.maps.LatLng(37.5665, 126.978),
    level: 5,
  })
  ready.value = true
  errorMessage.value = null
  updateMarkers()
}

let loaderPromise: Promise<KakaoNamespace | null> | null = null

function loadKakaoApi(): Promise<KakaoNamespace | null> {
  if (loaderPromise) return loaderPromise
  loaderPromise = new Promise(resolve => {
    if (typeof window === 'undefined') {
      setError('브라우저 환경에서만 지도를 사용할 수 있습니다.')
      resolve(null)
      return
    }
    if (window.kakao?.maps) {
      resolve(window.kakao as KakaoNamespace)
      return
    }

    const appKey = import.meta.env.VITE_KAKAO_JS_KEY
    if (!appKey) {
      setError('VITE_KAKAO_JS_KEY 값을 찾을 수 없습니다.')
      resolve(null)
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
    script.async = true
    script.onload = () => {
      if (!window.kakao?.maps) {
        setError('카카오 지도 SDK가 정상적으로 로드되지 않았습니다.')
        resolve(null)
        return
      }
      window.kakao.maps.load(() => resolve(window.kakao as KakaoNamespace))
    }
    script.onerror = event => {
      setError('카카오 지도 SDK 로드 중 오류가 발생했습니다.', event)
      resolve(null)
    }
    document.head.appendChild(script)
  })
  return loaderPromise
}

onMounted(async () => {
  const kakao = await loadKakaoApi()
  if (kakao) {
    initializeMap(kakao)
  } else {
    ready.value = false
  }
})

watch(
  () => props.rooms,
  () => {
    if (!kakaoApi) return
    updateMarkers()
  },
  { deep: true },
)

watch(
  () => props.selectedRoom,
  () => {
    if (!kakaoApi) return
    updateMarkers()
  },
)

onBeforeUnmount(() => {
  clearMarkers(listMarkers)
  clearMarkers(selectedMarkers)
  map = null
  kakaoApi = null
})
</script>

<style scoped>
.map-root {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-canvas {
  width: 100%;
  height: 100%;
  background: #eceff7;
}

.map-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  color: #1e293b;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.05));
  padding: 24px;
  gap: 8px;
  font-size: 14px;
}

.map-fallback strong {
  font-size: 16px;
}

.map-fallback--error {
  color: #dc2626;
  background: linear-gradient(180deg, rgba(248, 113, 113, 0.16), rgba(248, 113, 113, 0.04));
}
</style>
