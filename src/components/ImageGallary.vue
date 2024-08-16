<template>
  <div class="image-preview-gallery">
    <div v-if="images.length === 0" class="empty-state">
      <p>No images to display. Upload a file to see images from its folder.</p>
    </div>
    <div v-else class="gallery-container">
      <button class="nav-button left" @click="navigateLeft" :disabled="currentIndex === 0">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="images-wrapper">
        <div v-for="(image, index) in visibleImages" :key="currentIndex + index" class="image-item">
          <img :src="image.url" :alt="image.alt" @click="selectImage(currentIndex + index)" />
        </div>
      </div>
      <button class="nav-button right" @click="navigateRight" :disabled="currentIndex + 2 >= images.length">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['select']);

const currentIndex = ref(0);

const visibleImages = computed(() => {
  return props.images.slice(currentIndex.value, currentIndex.value + 2);
});

const navigateLeft = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 2;
  }
};

const navigateRight = () => {
  if (currentIndex.value + 2 < props.images.length) {
    currentIndex.value += 2;
  }
};

const selectImage = (index) => {
  emit('select', index);
};
</script>

<style scoped>
.image-preview-gallery {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
  background-color: #1e1e1e;
  border-radius: 12px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #a0a0a0;
  font-size: 1.1em;
}

.gallery-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.images-wrapper {
  display: flex;
  justify-content: center;
  gap: 16px;
  height: 100%;
  flex-grow: 1;
}

.image-item {
  flex: 1;
  max-width: calc(50% - 8px);
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-item:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.image-item:hover img {
  filter: brightness(1.1);
}

.nav-button {
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  font-size: 1.5em;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.left {
  margin-right: 16px;
}

.nav-button.right {
  margin-left: 16px;
}
</style>