<template>
  <div class="time-picker-backdrop" role="dialog" aria-modal="true">
    <div class="time-picker">
      <header class="time-picker__header">
        <h2>희망 출발 시간</h2>
        <button type="button" class="time-picker__close" @click="$emit('cancel')">×</button>
      </header>
      <div class="time-picker__columns">
        <div class="picker-column">
          <p>오전/오후</p>
          <ul>
            <li v-for="periodOption in periodOptions" :key="periodOption.value">
              <button
                type="button"
                :class="{ 'is-active': localPeriod === periodOption.value }"
                @click="localPeriod = periodOption.value"
              >
                {{ periodOption.label }}
              </button>
            </li>
          </ul>
        </div>
        <div class="picker-column">
          <p>시간</p>
          <ul>
            <li v-for="hour in hours" :key="hour">
              <button type="button" :class="{ 'is-active': localHour === hour }" @click="localHour = hour">
                {{ hour }}시
              </button>
            </li>
          </ul>
        </div>
        <div class="picker-column">
          <p>분</p>
          <ul>
            <li v-for="minute in minutes" :key="minute">
              <button
                type="button"
                :class="{ 'is-active': localMinute === minute }"
                @click="localMinute = minute"
              >
                {{ minute }}분
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="time-picker__actions">
        <button type="button" class="picker-btn picker-btn--ghost" @click="$emit('cancel')">취소</button>
        <button type="button" class="picker-btn picker-btn--primary" @click="confirm">선택</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  period: 'AM' | 'PM'
  hour: string
  minute: string
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [{ period: 'AM' | 'PM'; hour: string; minute: string }]
}>()

const periodOptions = [
  { value: 'AM', label: '오전' },
  { value: 'PM', label: '오후' },
] as const

const hours = Array.from({ length: 12 }, (_, idx) => String(idx + 1).padStart(2, '0'))
const minutes = Array.from({ length: 6 }, (_, idx) => String(idx * 10).padStart(2, '0'))

const localPeriod = ref<'AM' | 'PM'>(props.period ?? 'AM')
const localHour = ref<string>(props.hour ?? hours[0])
const localMinute = ref<string>(props.minute ?? minutes[0])

watch(
  () => props.period,
  value => {
    if (value) localPeriod.value = value
  },
)

watch(
  () => props.hour,
  value => {
    if (value) localHour.value = value
  },
)

watch(
  () => props.minute,
  value => {
    if (value) localMinute.value = value
  },
)

const isValid = computed(() => Boolean(localHour.value && localMinute.value))

function confirm() {
  if (!isValid.value) return
  emit('confirm', { period: localPeriod.value, hour: localHour.value, minute: localMinute.value })
}
</script>

<style scoped>
.time-picker-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 2100;
  padding: 20px;
}

.time-picker {
  width: min(420px, 92vw);
  background: #fffdf5;
  border-radius: 24px;
  padding: 18px;
  display: grid;
  gap: 14px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
}

.time-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-picker__header h2 {
  margin: 0;
  font-size: 18px;
  color: #92400e;
}

.time-picker__close {
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  color: #b45309;
}

.time-picker__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.picker-column {
  background: rgba(255, 251, 235, 0.8);
  border-radius: 18px;
  padding: 10px;
  border: 1px solid rgba(251, 191, 36, 0.35);
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
}

.picker-column p {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #a16207;
}

.picker-column ul {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  display: grid;
  gap: 6px;
}

.picker-column button {
  width: 100%;
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 12px;
  padding: 6px 8px;
  background: #fff;
  color: #92400e;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.picker-column button.is-active {
  background: #facc15;
  color: #7c2d12;
  border-color: #facc15;
  box-shadow: 0 6px 14px rgba(217, 119, 6, 0.3);
}

.time-picker__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.picker-btn {
  border-radius: 14px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.picker-btn--ghost {
  background: rgba(253, 230, 138, 0.25);
  color: #92400e;
}

.picker-btn--primary {
  background: #fbbf24;
  color: #7c2d12;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
}
</style>
