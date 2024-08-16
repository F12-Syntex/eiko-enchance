<template>
  <div class="upload-area" @dragover.prevent @drop.prevent="handleFileDrop">
    <input 
      type="file" 
      ref="fileInput" 
      @change="handleFileUpload" 
      accept="image/*" 
      directory 
      webkitdirectory
      style="display: none;" 
    />
    <div v-if="images.length === 0" class="upload-prompt" @click="triggerFileInput">
      <i class="fas fa-cloud-upload-alt"></i>
      <p>Drag & Drop or Click to Upload Folder</p>
      <p class="file-types">Supported: JPG, PNG, GIF</p>
    </div>
    <div v-else class="image-display">
      <div class="current-image" :style="{ transform: `scale(${zoomLevel})` }">
        <img :src="currentImage.url" :alt="currentImage.alt" />
      </div>
      <div class="zoom-controls">
        <button @click="zoomIn">+</button>
        <button @click="zoomOut">-</button>
      </div>
      <div class="slider-container">
        <input 
          type="range" 
          :min="0" 
          :max="images.length - 1" 
          v-model="currentIndex" 
          class="slider"
        >
        <div class="slider-info">
          {{ images.length - (images.length - currentIndex - 1)}} / {{ images.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:images']);

const fileInput = ref(null);
const currentIndex = ref(0);
const zoomLevel = ref(1);

const currentImage = computed(() => props.images[currentIndex.value] || {});

const triggerFileInput = () => {
  fileInput.value.click();
}; 

const handleFileDrop = (event) => {
  const items = event.dataTransfer.items;
  if (items && items.length > 0) {
    const item = items[0].webkitGetAsEntry();
    if (item.isDirectory) {
      processDirectory(item);
    }
  }
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  processFiles(files);
};

const processDirectory = (directoryEntry) => {
  const directoryReader = directoryEntry.createReader();
  directoryReader.readEntries((entries) => {
    const imageFiles = entries.filter(entry => entry.isFile && /\.(jpe?g|png|gif)$/i.test(entry.name));
    processImageEntries(imageFiles);
  });
};

const processFiles = (files) => {
  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
  processImageFiles(imageFiles);
};

const processImageEntries = (entries) => {
  Promise.all(entries.map(entry => new Promise((resolve) => {
    entry.file(file => {
      resolve({ file, url: URL.createObjectURL(file), alt: file.name });
    });
  }))).then(imageData => {
    emit('update:images', imageData);
  });
};

const processImageFiles = (files) => {
  const imageData = files.map(file => ({
    file,
    url: URL.createObjectURL(file),
    alt: file.name
  }));
  emit('update:images', imageData);
};

const zoomIn = () => {
  zoomLevel.value = Math.min(3, zoomLevel.value + 0.1);
};

const zoomOut = () => {
  zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1);
};
</script>

<style scoped>
.upload-area {
  width: 100%;
  height: 100%;
  border: 3px dashed #4a4a4a;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.upload-prompt {
  text-align: center;
  cursor: pointer;
}

.upload-prompt i {
  font-size: 4rem;
  color: #808080;
  margin-bottom: 1rem;
}

.file-types {
  font-size: 0.9rem;
  color: #808080;
  margin-top: 0.5rem;
}

.image-display {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.current-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.current-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.zoom-controls button {
  width: 30px;
  height: 30px;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.slider-container {
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 10px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  transition: opacity .2s;
  border-radius: 5px;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #4CAF50;
  cursor: pointer;
  border-radius: 50%;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #4CAF50;
  cursor: pointer;
  border-radius: 50%;
}

.slider-info {
  margin-top: 10px;
  color: white;
  font-size: 14px;
}
</style>