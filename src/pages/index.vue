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
      <div>
        <label for="scale-ratio">Scale Ratio: {{ scaleRatio }}x</label>
        <input type="range" id="scale-ratio" min="1" max="4" step="0.1" v-model="scaleRatio" />
        <progress :value="scaleRatio" max="4"></progress>
      </div>

      <div>
        <label for="ai-tool">AI Tool:</label>
        <select id="ai-tool" v-model="selectedAiTool">
          <option value="">Select an AI tool</option>
          <option value="tool1">AI Tool 1</option>
          <option value="tool2">AI Tool 2</option>
          <option value="tool3">AI Tool 3</option>
        </select>
      </div>
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
  max-width: 800px;
  padding: 40px;
  margin-bottom: 20px;
  border: 2px dashed #555;
  background-color: #2c2c2c;
  border-radius: 15px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.upload-section:hover {
  background-color: #3a3a3a;
}

.upload-section p {
  font-size: 18px;
  color: #bbb;
}

.upload-section input {
  display: none;
}

.preview {
  margin-top: 20px;
  max-width: 100%;
  max-height: 400px;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.preview img,
.preview video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.options-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 800px;
  padding: 20px;
  background-color: #333;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.options-section > div {
  margin: 20px;
  width: 100%;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

input[type="range"] {
  width: 100%;
}

progress {
  width: 100%;
  height: 20px;
  margin-top: 10px;
  border-radius: 10px;
  overflow: hidden;
  appearance: none;
}

progress::-webkit-progress-bar {
  background-color: #444;
}

progress::-webkit-progress-value {
  background-color: #76c7c0;
}

select {
  padding: 10px;
  width: 100%;
  background-color: #444;
  color: #f0f0f0;
  border: 1px solid #555;
  border-radius: 10px;
  transition: border-color 0.3s ease;
}

select:focus {
  border-color: #76c7c0;
}
</style>