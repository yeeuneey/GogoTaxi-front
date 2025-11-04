<template>
  <header class="header">
    <div class="header-inner">
      <img class="logo" src="@/assets/logo.png" alt="GogoTaxi" />
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  background: #fdd651;
  border-bottom: 1px solid #f0b400;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  z-index: 10;
}
.header-inner {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo {
  height: 46px;
  object-fit: contain;
}
</style>
