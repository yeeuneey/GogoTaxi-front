<template>
<div class="hero-card" @click="$emit('click')">
<div class="ic">{{ icon }}</div>
<div class="txt">
<div class="tt">{{ title }}</div>
<div class="dd">{{ desc }}</div>
</div>
</div>
</template>
<script setup lang="ts">
defineProps({ title: String, desc: String, icon: String })
</script>
<style scoped>
/* 위 MainPage.vue의 .hero-card 스타일과 동일하게 */
</style>
