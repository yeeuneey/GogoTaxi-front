<template>
  <div id="app" class="app-shell">
    <AppHeader />

    <main
      class="app-content"
      :style="hideBottomTab
        ? { paddingBottom: '0', minHeight: 'calc(100dvh - var(--header-h))' }
        : {}"
    >
      <router-view />
    </main>

    <Teleport to="body">
      <BottomTab v-if="!hideBottomTab" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
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

const contentStyle = computed(() =>
  hideBottomTab.value
    ? {
        paddingBottom: '0',
        minHeight: 'calc((var(--app-vh, 1vh) * 100) - var(--header-h))',
        height: 'calc((var(--app-vh, 1vh) * 100) - var(--header-h))',
      }
    : {},
)
</script>

<style>
:root {
  --header-h: 56px;
  --tab-h: 64px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --browser-ui-bottom: 0px;
}
* {
  box-sizing: border-box;
}
html,
body,
#app {
  min-height: 100%;
  margin: 0;
}
/* Hide default scrollbars but keep scrollability */
::-webkit-scrollbar {
  display: none;
}
html,
body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.app-shell {
  position: relative;
  min-height: 100%;
  background: #3a2e20;
}
.app-content {
  padding-top: var(--header-h);
  padding-bottom: calc(var(--tab-h) + var(--safe-bottom) + var(--browser-ui-bottom)); /* spacing when tab is visible */
  min-height: calc(100dvh - var(--header-h));
}
</style>

