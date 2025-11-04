<template>
  <section class="notice">
    <header class="notice__header">
      <h1>공지사항</h1>
      <p>꼬꼬택의 최신 소식을 모아두었어요.</p>
    </header>

    <div class="notice__layout">
      <aside class="notice__list" aria-label="공지 목록">
        <article v-for="notice in sortedNotices" :key="notice.id" class="notice-card">
          <div class="notice-card__header">
            <span class="notice-card__badge" :class="`badge--${notice.type}`">
              {{ badgeLabel(notice.type) }}
            </span>
            <time :datetime="notice.date">{{ formatDate(notice.date) }}</time>
          </div>
          <h2>{{ notice.title }}</h2>
          <button class="notice-card__action" type="button" @click="goDetail(notice.id)">
            자세히 보기
            <span aria-hidden="true">→</span>
          </button>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { notices, NoticeType } from './notices'

const router = useRouter()

const sortedNotices = computed(() =>
  [...notices].sort((a, b) => (a.date < b.date ? 1 : -1)),
)

function goDetail(id: string) {
  router.push({ name: 'notice-detail', params: { id } })
}

function badgeLabel(type: NoticeType) {
  switch (type) {
    case 'update':
      return '업데이트'
    case 'maintenance':
      return '점검'
    default:
      return '안내'
  }
}

function formatDate(dateISO: string) {
  const date = new Date(dateISO)
  return `${date.getFullYear()}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${`${date.getDate()}`.padStart(2, '0')}`
}
</script>

<style scoped>
.notice {
  padding: clamp(96px, 14vh, 140px) clamp(16px, 4vw, 40px) clamp(72px, 10vh, 120px);
  background: linear-gradient(180deg, #f6f2e8 0%, #ffffff 100%);
  min-height: calc(100dvh - var(--header-h));
}
.notice__header {
  max-width: 960px;
  margin: 0 auto clamp(28px, 5vh, 48px);
  text-align: center;
  color: #2f241b;
}
.notice__header h1 {
  margin: 0 0 12px;
  font-size: clamp(28px, 5vw, 36px);
}
.notice__header p {
  margin: 0;
  color: #6f6357;
  font-size: clamp(14px, 3vw, 16px);
}
.notice__layout {
  max-width: 860px;
  margin: 0 auto;
  display: grid;
  gap: clamp(16px, 3vw, 24px);
}
.notice__list {
  display: grid;
  gap: clamp(14px, 2.6vw, 20px);
}
.notice-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  padding: clamp(18px, 4vw, 22px);
  border-radius: 26px;
  border: 1px solid rgba(120, 92, 68, 0.12);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 16px 34px rgba(20, 12, 6, 0.12);
  min-height: 168px;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border 0.22s ease;
}
.notice-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 26px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.notice-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #85766a;
}
.notice-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}
.badge--update {
  background: linear-gradient(135deg, #f97316, #fb923c);
}
.badge--maintenance {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}
.badge--info {
  background: linear-gradient(135deg, #10b981, #34d399);
}
.notice-card h2 {
  margin: 0;
  font-size: 17px;
  color: #2f241b;
}
.notice-card__action {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.16);
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}
.notice-card__action:hover {
  transform: translateY(-2px);
  background: rgba(59, 130, 246, 0.26);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.22);
}
.notice-card__action span {
  transition: transform 0.2s ease;
}
.notice-card__action:hover span {
  transform: translateX(4px);
}
</style>
