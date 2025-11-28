<template>
  <section class="seat-select">
    <div class="seat-card">
      <header class="seat-card__header">
        <p class="seat-card__sub">좌석 재선택</p>
        <h1>좌석 다시 선택</h1>
        <p class="seat-card__desc">
          이미 참여 중인 방에서 좌석을 변경할 수 있어요.<br />원하는 좌석을 다시 선택해 주세요.
        </p>
      </header>

      <div class="seat-layout" role="radiogroup" aria-label="좌석 선택">
        <svg class="seat-layout__car" viewBox="0 0 200 400" aria-hidden="true">
          <defs>
            <linearGradient id="car-body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f6f7fb" />
              <stop offset="100%" stop-color="#e3e6ee" />
            </linearGradient>
          </defs>
          <path
            d="M50 10 Q100 -10 150 10 L180 80 L180 320 L150 390 Q100 410 50 390 L20 320 L20 80 Z"
            fill="url(#car-body)"
            stroke="#cbd2e1"
            stroke-width="3"
          />
          <rect x="52" y="70" width="96" height="90" rx="18" fill="#fff" stroke="#d1d7e3" />
          <rect x="52" y="240" width="96" height="90" rx="18" fill="#fff" stroke="#d1d7e3" />
          <line x1="100" y1="70" x2="100" y2="160" stroke="#dbe2ef" stroke-width="3" />
          <line x1="84" y1="240" x2="84" y2="330" stroke="#dbe2ef" stroke-width="3" />
          <line x1="116" y1="240" x2="116" y2="330" stroke="#dbe2ef" stroke-width="3" />
          <rect x="30" y="120" width="140" height="30" rx="10" fill="#dfe4ef" />
          <rect x="30" y="250" width="140" height="30" rx="10" fill="#dfe4ef" />
          <circle cx="58" cy="56" r="12" fill="#dfe4ef" />
          <circle cx="142" cy="56" r="12" fill="#dfe4ef" />
          <circle cx="58" cy="344" r="12" fill="#dfe4ef" />
          <circle cx="142" cy="344" r="12" fill="#dfe4ef" />
        </svg>
        <div class="seat-layout__seats">
          <button
            v-for="seat in seats"
            :key="seat.number"
            type="button"
            class="seat-marker"
            :class="{ 'seat-marker--active': seat.number === selectedSeat }"
            :style="seatStyle(seat)"
            :aria-pressed="seat.number === selectedSeat"
            @click="selectSeat(seat.number)"
          >
            <span>{{ seat.number }}</span>
          </button>
        </div>
      </div>

      <transition name="fade">
        <p v-if="!isContextReady" key="context-missing" class="seat-card__selection--hint">
          방 정보를 확인할 수 없어요.<br />내 방 목록에서 다시 시도해 주세요.
        </p>
        <p v-else-if="selectedSeat" key="selection" class="seat-card__selection">
          {{ selectedSeat }}번 좌석을 다시 선택했어요. 하단 버튼으로 확정해 주세요.
        </p>
        <p v-else key="selection-hint" class="seat-card__selection--hint">
          변경할 좌석을 선택해 주세요.<br />선택 후 아래 버튼으로 확정할 수 있어요.
        </p>
      </transition>

      <footer class="seat-card__actions">
        <button type="button" class="btn btn--ghost" @click="goBack">
          돌아가기
        </button>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="!selectedSeat || isSaving || !isContextReady"
          @click="confirmSeat"
        >
          {{ isSaving ? '좌석 변경 중...' : '좌석 다시 확정하기' }}
        </button>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { changeSeatFromApi } from '@/api/rooms'
import { useRoomMembership } from '@/composables/useRoomMembership'

interface SeatInfo {
  number: number
  x: number
  y: number
}

const seats: SeatInfo[] = [
  { number: 1, x: 62, y: 28 },
  { number: 2, x: 28, y: 68 },
  { number: 3, x: 50, y: 68 },
  { number: 4, x: 72, y: 68 },
]

const router = useRouter()
const route = useRoute()
const { joinedRooms, updateSeat } = useRoomMembership()

const selectedSeat = ref<number | null>(null)
const originalOverflow = ref('')
const isSaving = ref(false)

const roomIdFromQuery = computed(() => {
  const raw = route.query.roomId
  if (Array.isArray(raw)) {
    return raw[0] ?? null
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
  }
  return null
})

const membership = computed(() => {
  const roomId = roomIdFromQuery.value
  if (!roomId) return null
  return joinedRooms.value.find(entry => entry.roomId === roomId) ?? null
})

const resolvedRoomId = computed(() => roomIdFromQuery.value ?? membership.value?.roomId ?? null)
const isContextReady = computed(() => Boolean(resolvedRoomId.value && membership.value))

watch(
  () => membership.value?.seatNumber,
  seatNumber => {
    selectedSeat.value = typeof seatNumber === 'number' ? seatNumber : null
  },
  { immediate: true },
)

function seatStyle(seat: SeatInfo) {
  return {
    left: `${seat.x}%`,
    top: `${seat.y}%`,
  }
}

function selectSeat(seatNumber: number) {
  selectedSeat.value = seatNumber
}

function resolveSeatError(err: unknown) {
  if (err instanceof Error && err.message) {
    return err.message
  }
  if (typeof err === 'string' && err.trim()) {
    return err
  }
  return '좌석 변경에 실패했어요. 잠시 후 다시 시도해 주세요.'
}

async function confirmSeat() {
  if (!selectedSeat.value || isSaving.value || !isContextReady.value) return
  const roomId = resolvedRoomId.value
  if (!roomId) {
    alert('방 정보를 찾지 못했어요. 다시 시도해 주세요.')
    goBack()
    return
  }

  isSaving.value = true
  const seatNumber = selectedSeat.value

  try {
    await changeSeatFromApi(roomId, seatNumber)
    updateSeat(roomId, seatNumber)
    router.push({
      name: 'room-detail',
      params: { id: roomId },
      query: { seat: seatNumber },
    })
  } catch (error) {
    alert(resolveSeatError(error))
  } finally {
    isSaving.value = false
  }
}

function goBack() {
  const targetRoomId = resolvedRoomId.value ?? joinedRooms.value[0]?.roomId
  if (targetRoomId) {
    router.push({ name: 'room-detail', params: { id: targetRoomId } })
  } else {
    router.push({ name: 'my-rooms' })
  }
}

function ensureRoomContext() {
  if (!resolvedRoomId.value || !membership.value) {
    alert('좌석을 다시 선택할 방 정보를 찾지 못했어요.')
    router.push({ name: 'my-rooms' })
  }
}

onMounted(() => {
  originalOverflow.value = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  ensureRoomContext()
})

onBeforeUnmount(() => {
  document.body.style.overflow = originalOverflow.value
})
</script>

<style scoped>
.seat-select {
  position: relative;
  height: calc((var(--app-vh, 1vh) * 100) - var(--header-h, 0px) - var(--tab-h, 0px));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(48px, 10vh, 110px) clamp(18px, 6vw, 52px);
  background: #fff7e1;
  color: #3b2600;
  overflow: hidden;
  box-sizing: border-box;
}

.seat-card {
  width: min(520px, 100%);
  background: transparent;
  border-radius: 0;
  border: none;
  display: grid;
  gap: 20px;
  padding: clamp(26px, 5vw, 34px);
}
.seat-card__header {
  display: grid;
  gap: 10px;
  text-align: center;
  color: #3b2600;
}
.seat-card__sub {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(193, 98, 7, 0.85);
}
.seat-card__header h1 {
  margin: 0;
  font-size: clamp(22px, 4vw, 28px);
}
.seat-card__desc {
  margin: 0;
  color: #6b3b00;
  line-height: 1.6;
  font-size: 14px;
}
.seat-layout {
  position: relative;
  width: min(240px, 94%);
  margin: 0 auto;
  aspect-ratio: 2 / 3;
  background: #fffef8;
  border-radius: 28px;
  padding: 18px;
  border: 1px solid rgba(243, 193, 76, 0.6);
}
.seat-layout__car {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 24px;
  background: #fffdf4;
}
.seat-layout__seats {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
.seat-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  width: clamp(38px, 14vw, 48px);
  height: clamp(46px, 16vw, 58px);
  border-radius: 14px;
  border: 2px solid rgba(250, 204, 21, 0.25);
  background: #fffdf4;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 16px;
  color: #a16207;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
  pointer-events: auto;
}
.seat-marker:hover {
  transform: translate(-50%, -50%) translateY(-4px);
}
.seat-marker--active {
  background: #facc15;
  color: #fffdf4;
  border-color: rgba(250, 184, 0, 0.3);
}
.seat-marker span {
  pointer-events: none;
}
.seat-card__selection,
.seat-card__selection--hint {
  margin: 0;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #7c2d12;
  padding: 8px 0;
}
.seat-card__selection--hint {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #b86a1a;
}
.seat-card__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn {
  border: none;
  border-radius: 16px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
  transform: none;
  box-shadow: none;
}
.btn--primary {
  background: #facc15;
  color: #7c2d12;
}
.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
}
.btn--ghost {
  background: rgba(250, 204, 21, 0.15);
  color: #a16207;
}
.btn--ghost:hover {
  transform: translateY(-2px);
  background: rgba(250, 204, 21, 0.25);
}

@media (max-width: 520px) {
  .seat-card {
    padding: 22px;
  }
  .seat-card__actions {
    flex-direction: column-reverse;
  }
  .btn {
    width: 100%;
  }
}
</style>
