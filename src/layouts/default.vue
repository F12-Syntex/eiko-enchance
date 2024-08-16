<template>
  <div class="eiko-layout" @keydown="handleKeyDown" tabindex="0">
    <SideBar />
    <main>
      <slot />
      <Terminal v-if="isTerminalOpen" @close="isTerminalOpen = false" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Terminal from '@/components/Terminal.vue';

const isTerminalOpen = ref(false);

const handleKeyDown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault(); // Prevent default tab behavior
    isTerminalOpen.value = !isTerminalOpen.value;
  }
};
</script>

<style scoped>
.eiko-layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  overflow: hidden;
  background: #0d0d0d;
  color: #fff;
  outline: none;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}
</style>