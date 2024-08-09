<template>
  <div class="app-container">
    <header>
      <h1>AI Image Upscaler</h1>
    </header>
    <main>
      <div class="upload-area" @dragover.prevent @drop.prevent="handleFileDrop" @click="triggerFileInput">
        <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*, video/*"
          style="display: none;" />
        <div v-if="!previewUrl" class="upload-prompt">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Drag & Drop or Click to Upload</p>
        </div>
        <div v-else class="preview-container">
          <img v-if="fileType === 'image'" :src="previewUrl" alt="Preview" />
          <video v-else-if="fileType === 'video'" :src="previewUrl" controls></video>
        </div>
      </div>
      <div class="controls">
        <div class="scale-control">
          <label for="scale-ratio">Upscale Factor</label>
          <div class="scale-slider">
            <input type="range" id="scale-ratio" min="1" max="4" step="1" v-model="scaleRatio" />
            <div class="scale-labels">
              <span v-for="n in 4" :key="n">{{ n }}x</span>
            </div>
          </div>
          <span class="scale-value">{{ scaleRatio }}x</span>
        </div>
        <div class="ai-model-control">
          <label for="ai-model">AI Model</label>
          <select id="ai-model" v-model="selectedAiTool">
            <option value="">Select an AI model</option>
            <option v-for="model in availableModels" :key="model.id" :value="model.id">{{ model.name }}</option>
          </select>
        </div>
        <button class="process-button" @click="processImage" :disabled="!canProcess">
          <span>Process</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import aiModels from '../controller/ai-models';
import settings from '../managers/SettingsManager';

const fileInput = ref(null);
const previewUrl = ref('');
const fileType = ref('');
const scaleRatio = ref(1);
const selectedAiTool = ref('');
const filePath = ref('');

const availableModels = ref([]);

let canProcess = computed(() => selectedAiTool.value != '' && previewUrl.value != '');
// let canProcess = true;
// let canProcess = computed(() => selectedAiTool.value !== '');


async function loadModels() {
  let { models } = await aiModels.getInstalledModels();
  availableModels.value = models.filter((model) => model.usable && model.installed);
  console.log('Available Models:', availableModels.value);
}

loadModels();

function triggerFileInput() {
  fileInput.value.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  filePath.value = file.path;
  if (file) {
    previewUrl.value = URL.createObjectURL(file);
    fileType.value = file.type.startsWith('image') ? 'image' : 'video';
  }
}

function handleFileDrop(event) {
  const file = event.dataTransfer.files[0];
  filePath.value = file.path;
  if (file) {
    previewUrl.value = URL.createObjectURL(file);
    fileType.value = file.type.startsWith('image') ? 'image' : 'video';
  }
}

async function processImage() {
  // Get the selected AI model from the 'ai-model' select element
  const model = document.getElementById('ai-model').value;

  //get the model information from the name

  const modelInfo = await aiModels.getModelFromName(model);

  const exportFilePath = settings.getSettings().upscalerDirectory;
  const cacheDir = settings.getSettings().cacheDirectory;
  const sourceFile = filePath.value;

  const request = {
    scaleRatio: scaleRatio.value,
    aiModel: modelInfo,
    filePath: exportFilePath.value,
    exportFilePath: exportFilePath,
    cacheDir: cacheDir,
    sourceFile: sourceFile
  };

  console.log('Processing Image:', request);

  // Process the image using the selected AI model
  try {
    const response = await fetch('/api/upscaler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Method-Name': 'upscaleImage'
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();

    if (result.error) {
      console.error('Upscaling failed:', result.error);
    } else {
      console.log('Upscaling completed:', result.message);
    }
  } catch (error) {
    console.error('Error calling upscaler API:', error);
  }

}


</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css');

.app-container {
  font-family: 'Poppins', sans-serif;
  color: #e0e0e0;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-sizing: border-box;
  overflow-y: auto;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #ffffff;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  flex-grow: 1;
}

.upload-area {
  width: 100%;
  max-width: 80%;
  height: 400px;
  border: 3px dashed #4a4a4a;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.upload-prompt {
  text-align: center;
}

.upload-prompt i {
  font-size: 4rem;
  color: #808080;
  margin-bottom: 1rem;
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
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
}

.scale-control,
.ai-model-control {
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

.process-button {
  background-color: #3a3a3a;
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
}

.process-button:hover:not(:disabled) {
  background-color: #4a4a4a;
  transform: translateY(-2px);
}

.process-button:disabled {
  background-color: #2a2a2a;
  color: #808080;
  cursor: not-allowed;
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
}

@media (max-height: 800px) {
  .app-container {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .upload-area {
    height: 250px;
  }

  .controls {
    gap: 1rem;
  }
}
</style>