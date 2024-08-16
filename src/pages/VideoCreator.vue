<template>
  <div class="app-container">
    <main>
      <div class="video-panel">
        <div class="image-preview">
          <ImagePreviewGallery :images="images" @select="handleImageSelect" />
        </div>
        <UploadArea v-model:images="images" />
      </div>
      <div class="controls">
        <AudioUploadPreview />
        <VideoCreationControls />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ImagePreviewGallery from '../components/ImageGallary.vue';
import UploadArea from '../components/VideoCreationUploadPreview.vue';
import AudioUploadPreview from '../components/AudioUploadPreview.vue';
import VideoCreationControls from '../components/VideoCreationControls.vue';

const images = ref([]);

const handleImageSelect = (index) => {
  console.log('Selected image index:', index);
};

onMounted(() => {
  sessionStorage.setItem('video-creation-audio', null);
  sessionStorage.setItem('video-creation-images', null);
});
</script>

<style scoped>
.app-container {
  font-family: 'Poppins', sans-serif;
  color: #e0e0e0;
  max-height: 95vh;
  height: 95vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  overflow-y: auto;
  padding: 10px;
}

.video-panel {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-height: 60vh;
  min-height: 600px;
}

.image-preview {
  height: 100%;
  width: 100%;
  max-width: 400px;
  min-width: 300px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #4a4a4a;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  flex-grow: 1;
  width: 100%;
  height: 100%;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }

  .control-group {
    flex-direction: column;
  }
}

@media (max-height: 800px) {
  .app-container {
    padding: 1rem;
  }

  .controls {
    gap: 1rem;
  }
}
</style>