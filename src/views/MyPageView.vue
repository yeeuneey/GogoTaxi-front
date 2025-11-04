<template>
  <section class="stub-page">
    <h1>마이페이지 (임시화면)</h1>
    <p>여기에 나중에 프로필, 설정 등 추가할 예정이에요.</p>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.stub-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-h) - var(--tab-h));
  background: #f9f9f9;
  color: #333;
  text-align: center;
}
</style>
