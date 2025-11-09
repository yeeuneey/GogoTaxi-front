<template>
  <div id="app" class="app-shell">
    <AppHeader />

    <main class="app-content" :style="contentStyle">
      <router-view />
    </main>

    <BottomTab v-if="!hideBottomTab" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import BottomTab from '@/components/BottomTab.vue'

const route = useRoute()

// 로그인/회원가입/비번찾기 같은 페이지에서 탭 숨기고 싶으면 meta로 제어하는 게 가장 유연함
const hideBottomTab = computed(() => {
  // 1) 라우트 이름으로 간단히: return route.name === 'login'
  // 2) meta로 더 확장 가능:
  return Boolean(route.meta?.hideBottomNav)
})

const lockContentScroll = computed(() => Boolean(route.meta?.lockScroll))

const contentStyle = computed(() => {
  const style: Record<string, string> = {}
  if (hideBottomTab.value) {
    const viewportHeight = 'calc((var(--app-vh, 1vh) * 100) - var(--header-h))'
    style.paddingBottom = '0'
    style.minHeight = viewportHeight
    style.height = viewportHeight
  }
  if (lockContentScroll.value) {
    style.overflow = 'hidden'
    style.overflowY = 'hidden'
    style.WebkitOverflowScrolling = 'auto'
  }
  return style
})
</script>

<style>
:root { --header-h: 56px; --tab-h: 64px; --app-vh: 1vh; }
* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; overflow: hidden; }

.app-shell {
  position: relative;
  height: calc(var(--app-vh, 1vh) * 100);
  background: #fff;
  overflow: hidden;
}
.app-content {
  padding-top: var(--header-h);
  padding-bottom: var(--tab-h); /* 기본값(탭 보일 때) */
  height: calc((var(--app-vh, 1vh) * 100) - var(--header-h));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
