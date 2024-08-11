<template>
  <div class="app-container">
    <header>
      <h1>Smart Upscaler</h1>
      <p class="subtitle">Enhance your images and videos</p>
    </header>
    <main>
      <div class="upload-area" @dragover.prevent @drop.prevent="handleFileDrop" @click="triggerFileInput">
        <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*, video/*" style="display: none;" />
        <div v-if="!previewUrl" class="upload-prompt">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Drag & Drop or Click to Upload</p>
          <p class="file-types">Supported: JPG, PNG, GIF, MP4, WebM</p>
        </div>
        <div v-else class="preview-container">
          <img v-if="fileType === 'image'" :src="previewUrl" alt="Preview" />
          <video v-else-if="fileType === 'video'" :src="previewUrl" controls></video>
        </div>
      </div>
      <div class="controls">
        <div class="control-group">
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
              <option value="" disabled selected>Select an AI model</option>
              <option v-for="model in availableModels" :key="model.name" :value="model.name">{{ model.name }}</option>
            </select>
          </div>
        </div>
        <AdvancedOptions v-model:options="advancedOptions" />
        <div v-if="isProcessing" class="progress-bar">
          <div class="progress" :style="{ width: `${progress}%` }"></div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
        <button class="process-button" @click="processImage" :disabled="!canProcess || isProcessing">
          <span>{{ isProcessing ? 'Processing...' : 'Upscale' }}</span>
          <i class="fas fa-magic"></i>
        </button>
      </div>
      <div v-if="processedImageUrl" class="comparison-section">
        <h2>Compare Results</h2>
        <div class="comparison-container">
          <div class="original">
            <h3>Original</h3>
            <img v-if="fileType === 'image'" :src="previewUrl" alt="Original" />
            <video v-else-if="fileType === 'video'" :src="previewUrl" controls></video>
          </div>
          <div class="upscaled">
            <h3>Upscaled</h3>
            <img v-if="fileType === 'image'" :src="processedImageUrl" alt="Upscaled" />
            <video v-else-if="fileType === 'video'" :src="processedImageUrl" controls></video>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import AdvancedOptions from '../components/AdvancedOptions.vue';
import aiModels from '../controller/ai-models';
import settings from '../managers/SettingsManager';

const advancedOptions = ref({});
const fileInput = ref(null);
const previewUrl = ref('');
const fileType = ref('');
const scaleRatio = ref(1);
const selectedAiTool = ref('');
const filePath = ref('');
const isProcessing = ref(false);
const progress = ref(0);
const processedImageUrl = ref('');

const tileSize = ref(512);
const tilePad = ref(10);
const prePad = ref(10);
const faceEnhance = ref(true);
const faceInst = ref('');
const denoiseLevel = ref(0);

const availableModels = ref([]);
const intervalId = ref(null);

const canProcess = computed(() => selectedAiTool.value !== '' && previewUrl.value !== '');

async function loadModels() {
  const { models } = await aiModels.getInstalledModels();
  availableModels.value = models.filter((model) => model.usable && model.installed);
  console.log('Available Models:', availableModels.value);

  // Set the default model to the last one
  selectedAiTool.value = availableModels.value[availableModels.value.length - 1].name;
}

loadModels();

function triggerFileInput() {
  fileInput.value.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    filePath.value = file.path;
    previewUrl.value = URL.createObjectURL(file);
    fileType.value = file.type.startsWith('image') ? 'image' : 'video';
    processedImageUrl.value = ''; // Reset processed image when new file is uploaded

    // Save to sessionStorage
    sessionStorage.setItem('filePath', filePath.value);
    sessionStorage.setItem('previewUrl', previewUrl.value);
    sessionStorage.setItem('fileType', fileType.value);
  }
}

function handleFileDrop(event) {
  const file = event.dataTransfer.files[0];
  if (file) {
    filePath.value = file.path;
    previewUrl.value = URL.createObjectURL(file);
    fileType.value = file.type.startsWith('image') ? 'image' : 'video';
    processedImageUrl.value = ''; // Reset processed image when new file is uploaded

    // Save to sessionStorage
    sessionStorage.setItem('filePath', filePath.value);
    sessionStorage.setItem('previewUrl', previewUrl.value);
    sessionStorage.setItem('fileType', fileType.value);
  }
}

watch([scaleRatio, selectedAiTool, isProcessing, tileSize, tilePad, prePad, faceEnhance, faceInst, denoiseLevel], () => {
  // Save to sessionStorage
  sessionStorage.setItem('scaleRatio', scaleRatio.value);
  sessionStorage.setItem('selectedAiTool', selectedAiTool.value);
  sessionStorage.setItem('isProcessing', isProcessing.value);
  sessionStorage.setItem('tileSize', tileSize.value);
  sessionStorage.setItem('tilePad', tilePad.value);
  sessionStorage.setItem('prePad', prePad.value);
  sessionStorage.setItem('faceEnhance', faceEnhance.value);
  sessionStorage.setItem('faceInst', faceInst.value);
  sessionStorage.setItem('denoiseLevel', denoiseLevel.value);
});

async function processImage() {
  isProcessing.value = true;
  progress.value = 0;

  const model = document.getElementById('ai-model').value;
  const modelInfo = await aiModels.getModelFromName(model);

  const exportFilePath = settings.getSettings().upscalerDirectory;
  const cacheDir = settings.getSettings().cacheDirectory;
  const sourceFile = filePath.value;


  //update advanced options based on the data in the advanced options component
  advancedOptions.value = {
    tileSize: tileSize.value,
    tilePad: tilePad.value,
    prePad: prePad.value,
    faceEnhance: faceEnhance.value,
    faceInst: faceInst.value,
    denoiseLevel: denoiseLevel.value
  };

  const request = {
    exportFilePath: exportFilePath,
    sourceFile: sourceFile,
    cacheDir: cacheDir,
    aiModel: modelInfo,
    advancedOptions: advancedOptions.value
  };

  console.log('Processing file:', request);

  try {
    const response = await fetch('/api/upscaler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Method-Name': 'upscale'
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();

    console.log('Upscaling result:', result);

    if (result.error) {
      console.error('Upscaling failed:', result.error);
    } else {
      console.log('Upscaling completed:', result.filePath);
      processedImageUrl.value = URL.createObjectURL(new Blob([result.filePath]));
    }
  } catch (error) {
    console.error('Error calling upscaler API:', error);
  } finally {
    isProcessing.value = false;
  }
}

async function monitorProgress() {
  try {
    const { progress: currentProgress } = await getProgress();
    progress.value = currentProgress;
  } catch (error) {
    console.error('Error checking progress:', error);
  }
}

async function getProgress() {
  try {
    const response = await fetch('/api/upscaler', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Method-Name': 'getProgress'
      }
    });

    const rawText = await response.text();

    try {
      const progressResult = JSON.parse(rawText);
      return progressResult;
    } catch (parseError) {
      throw new Error('Invalid JSON response: ' + parseError.message);
    }
  } catch (fetchError) {
    console.error('Error fetching progress:', fetchError);
    throw fetchError;
  }
}

function downloadResult() {
  if (processedImageUrl.value) {
    const link = document.createElement('a');
    link.href = processedImageUrl.value;
    link.download = `upscaled_${fileType.value === 'image' ? 'image' : 'video'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

onMounted(() => {
  const storedFilePath = sessionStorage.getItem('filePath');
  const storedPreviewUrl = sessionStorage.getItem('previewUrl');
  const storedFileType = sessionStorage.getItem('fileType');
  const storedScaleRatio = sessionStorage.getItem('scaleRatio');
  const storedSelectedAiTool = sessionStorage.getItem('selectedAiTool');
  const storedIsProcessing = sessionStorage.getItem('isProcessing');
  const storedTileSize = sessionStorage.getItem('tileSize');
  const storedTilePad = sessionStorage.getItem('tilePad');
  const storedPrePad = sessionStorage.getItem('prePad');
  const storedFaceEnhance = sessionStorage.getItem('faceEnhance');
  const storedFaceInst = sessionStorage.getItem('faceInst');
  const storedDenoiseLevel = sessionStorage.getItem('denoiseLevel');

  if (storedFilePath) filePath.value = storedFilePath;
  if (storedPreviewUrl) previewUrl.value = storedPreviewUrl;
  if (storedFileType) fileType.value = storedFileType;
  if (storedScaleRatio) scaleRatio.value = parseInt(storedScaleRatio);
  if (storedSelectedAiTool) selectedAiTool.value = storedSelectedAiTool;
  if (storedIsProcessing) isProcessing.value = storedIsProcessing === 'true';
  if (storedTileSize) tileSize.value = parseInt(storedTileSize);
  if (storedTilePad) tilePad.value = parseInt(storedTilePad);
  if (storedPrePad) prePad.value = parseInt(storedPrePad);
  if (storedFaceEnhance) faceEnhance.value = storedFaceEnhance === 'true';
  if (storedFaceInst) faceInst.value = storedFaceInst;
  if (storedDenoiseLevel) denoiseLevel.value = parseInt(storedDenoiseLevel);

  intervalId.value = setInterval(monitorProgress, 100);
});

onUnmounted(() => {
  clearInterval(intervalId.value);
});
</script>

<style scoped>
.app-container {
  font-family: 'Poppins', sans-serif;
  color: #e0e0e0;
  max-height: 100vh;
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
  overflow: auto;
  width: 100%;
}

.upload-area {
  width: 100%;
  max-width: 80%;

  min-height: 400px;

  height: 400px;
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

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
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