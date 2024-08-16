<template>
  <div class="app-container">
    <main>
      <div class="video-panel">
        <div class="image-preview">
          <ImagePreviewGallery :images="images" @select="handleImageSelect" />
        </div>
        <div 
          class="upload-area" 
          :class="{ 'has-files': images.length > 0 }"
          @dragover.prevent 
          @drop.prevent="handleFileDrop" 
          @click="triggerFileInput"
        >
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileUpload" 
            accept="image/*" 
            directory 
            webkitdirectory
            style="display: none;" 
          />
          <div v-if="images.length === 0" class="upload-prompt">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag & Drop or Click to Upload Folder</p>
            <p class="file-types">Supported: JPG, PNG, GIF</p>
          </div>
          <div v-else class="file-preview">
            <p>{{ images.length }} image(s) uploaded</p>
            <div class="thumbnail-container">
              <img 
                v-for="(image, index) in previewImages" 
                :key="index" 
                :src="image.url" 
                :alt="image.alt" 
                class="thumbnail"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="controls">
        <div class="audio-display">
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import ImagePreviewGallery from '../components/ImageGallary.vue';

const fileInput = ref(null);
const images = ref([]);

const previewImages = computed(() => {
  return images.value.slice(0, 4); // Show up to 4 preview images
});

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
    images.value = imageData;
  });
};

const processImageFiles = (files) => {
  images.value = files.map(file => ({
    file,
    url: URL.createObjectURL(file),
    alt: file.name
  }));
};

const handleImageSelect = (index) => {
  console.log('Selected image index:', index);
  // Handle image selection logic here
};
</script>

<style scoped>


.upload-area.has-files {
  border-style: solid;
  background-color: rgba(255, 255, 255, 0.1);
}

.file-preview {
  text-align: center;
}

.thumbnail-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
}

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

.audio-display {
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 125px;
  border-radius: 10px;

  border: 1px solid #4a4a4a;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
  border-radius: 10px;

  overflow: hidden;

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

header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 3rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.2rem;
  color: #b0b0b0;
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

.upload-area {

  width: 100%;
  max-width: 100%;
  height: 100% ;

  border: 3px dashed #4a4a4a;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upload-area:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.upload-prompt {
  text-align: center;
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

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-container img,
.preview-container video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  object-fit: contain;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}


.control-group {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.scale-control,
.ai-model-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 1rem;
  font-weight: 600;
  color: #b0b0b0;
}

.scale-slider {
  position: relative;
}

input[type="range"] {
  width: 100%;
  -webkit-appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  background: #2a2a2a;
  border-radius: 4px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #ffffff;
  margin-top: -8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.scale-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  align-self: center;
}

select {
  padding: 0.8rem;
  border-radius: 10px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3a3a3a;
  font-size: 1rem;
  cursor: pointer;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #2a2a2a;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.process-button {
  background: linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%);
  color: #ffffff;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.process-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%);
  transform: translateY(-2px);
}

.process-button:disabled {
  background: #2a2a2a;
  color: #808080;
  cursor: not-allowed;
}

.comparison-section {
  width: 100%;
  max-width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.comparison-section h2 {
  font-size: 1.8rem;
  color: #ffffff;
  margin-bottom: 1rem;
}

.comparison-container {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
}

.original,
.upscaled {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.original h3,
.upscaled h3 {
  font-size: 1.4rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.original img,
.upscaled img,
.original video,
.upscaled video {
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px;
  object-fit: contain;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .upload-area {
    height: 300px;
  }

  .control-group {
    flex-direction: column;
  }

  .comparison-container {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-height: 800px) {
  .app-container {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .upload-area {
    height: 250px;
  }

  .controls {
    gap: 1rem;
  }
}
</style>