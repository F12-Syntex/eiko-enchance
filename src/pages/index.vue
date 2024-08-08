<template>
  <div class="home-page">
    <div class="upload-section" @dragover.prevent @drop.prevent="handleFileDrop">
      <p>Drag & Drop your files here or click to upload</p>
      <input type="file" accept="image/*, video/*" @change="handleFileUpload" />
      <div v-if="previewUrl" class="preview">
        <img v-if="fileType === 'image'" :src="previewUrl" alt="Preview" />
        <video v-else-if="fileType === 'video'" :src="previewUrl" controls></video>
      </div>
    </div>

    <div class="options-section">
      <div class="scale-section">
        <div class="slider-container">
          <input
            type="range"
            id="scale-ratio"
            min="1"
            max="4"
            step="1"
            v-model="scaleRatio"
            :style="`background: linear-gradient(to right, #6c63ff ${(scaleRatio - 1) * 33.3333}%, #bbb ${(scaleRatio - 1) * 33.3333}%);`"
          />
          <div class="slider-label">
            <span>1x</span>
            <span>2x</span>
            <span>3x</span>
            <span>4x</span>
          </div>
        </div>
        <div class="scale-display">Scale Ratio: {{ scaleRatio }}x</div>
      </div>

      <div class="ai-tool-section">
        <div class="custom-select">
          <select id="ai-tool" v-model="selectedAiTool">
            <option value="">Select an AI tool</option>
            <option value="tool1">AI Tool 1</option>
            <option value="tool2">AI Tool 2</option>
            <option value="tool3">AI Tool 3</option>
          </select>
          <span class="arrow">&#9662;</span>
        </div>
      </div>

      <button class="process-button">Process</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const previewUrl = ref('');
const fileType = ref('');
const scaleRatio = ref(1);
const selectedAiTool = ref('');

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    previewUrl.value = URL.createObjectURL(file);
    fileType.value = file.type.startsWith('image') ? 'image' : 'video';
  }
}

function handleFileDrop(event) {
  const file = event.dataTransfer.files[0];
  if (file) {
    previewUrl.value = URL.createObjectURL(file);
    fileType.value = file.type.startsWith('image') ? 'image' : 'video';
  }
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  padding: 20px;
  overflow: hidden;
  color: #f0f0f0;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 900px;
  height: 400px;
  padding: 40px;
  margin-bottom: 20px;
  border: 2px dashed #6c63ff;
  background-color: transparent;
  border-radius: 15px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.upload-section:hover {
  background-color: rgba(108, 99, 255, 0.1);
}

.upload-section p {
  font-size: 20px;
  color: #bbb;
}

.upload-section input {
  display: none;
}

.preview {
  margin-top: 20px;
  max-width: 100%;
  max-height: 350px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  border-radius: 15px;
  background-color: #1c1c1e;
  padding: 10px;
}

.preview img,
.preview video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.options-section {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background-color: #1c1c1e;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.scale-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider-container {
  position: relative;
  width: 300px;
}

input[type="range"] {
  width: 100%;
  margin-top: 20px;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background-color: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #bbb;
  margin-top: 5px;
}

.scale-display {
  margin-top: 10px;
  font-size: 16px;
  color: #f0f0f0;
  text-align: center;
}

.ai-tool-section {
  display: flex;
  align-items: center;
}

.custom-select {
  position: relative;
  display: inline-block;
  width: 200px;
}

select {
  padding: 12px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #f0f0f0;
  border: none;
  border-radius: 10px;
  appearance: none;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-size: 16px;
  backdrop-filter: brightness(1.2);
}

select option {
  background-color: rgba(0, 0, 0, 0.5);
}

.arrow {
  position: absolute;
  top: 50%;
  right: 15px;
  pointer-events: none;
  transform: translateY(-50%);
  color: #f0f0f0;
}

.process-button {
  padding: 12px 24px;
  background-color: #6c63ff;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-size: 16px;
}

.process-button:hover {
  background-color: #ffffff;
  color: #6c63ff;
}
</style>