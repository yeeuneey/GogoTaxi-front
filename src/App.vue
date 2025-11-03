<template>
  <div id="app" class="app-shell">
    <AppHeader />

    <main
      class="app-content"
      :style="hideBottomTab
        ? { paddingBottom: '0', minHeight: 'calc(100vh - var(--header-h))' }
        : {}"
    >
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
</script>

<style>
:root { --header-h: 56px; --tab-h: 64px; }
* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; }

.app-shell { position: relative; min-height: 100%; background: #fff; }
.app-content {
  padding-top: var(--header-h);
  padding-bottom: var(--tab-h); /* 기본값(탭 보일 때) */
  min-height: calc(100vh - var(--header-h) - var(--tab-h));
}
</style>
