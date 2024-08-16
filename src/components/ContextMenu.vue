<template>
  <div v-if="show" :style="style" class="context-menu">
    <div class="menu-item" @click="$emit('menuAction', 'copy')">Copy</div>
    <div class="menu-item" @click="$emit('menuAction', 'paste')">Paste</div>
    <div class="menu-item" @click="$emit('menuAction', 'delete')">Delete</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  x: Number,
  y: Number,
});

const emit = defineEmits(['menuAction']);

const style = computed(() => ({
  position: 'fixed',
  top: `${props.y}px`,
  left: `${props.x}px`,
}));
</script>

<style scoped>
.context-menu {
  background-color: #2c2c2c;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 5px 0;
  min-width: 150px;
  z-index: 1000;
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #3c3c3c;
}
</style>