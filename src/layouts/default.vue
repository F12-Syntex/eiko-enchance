<template>
  <div :class="['eiko-layout', isDarkMode ? 'dark-mode' : 'light-mode']">
    <SideBar />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme';

const { isDarkMode } = useTheme();
</script>

<style scoped>
.eiko-layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  overflow: hidden;
}

.dark-mode {
  background: #0d0d0d;
  color: #fff;
}

.light-mode {
  background: #f5f5f5;
  color: #000;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}
</style>