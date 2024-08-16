<template>
  <div class="video-creation-controls">
    <h2>Video Creation Controls</h2>
    <div class="config-grid">
      <div class="config-item">
        <label for="fps">FPS:</label>
        <input type="number" id="fps" v-model="fps" min="1" max="60" step="1">
      </div>
      <div class="config-item">
        <label for="codec">Video Codec:</label>
        <select id="codec" v-model="codec">
          <option value="libx264">H.264</option>
          <option value="libx265">H.265 (HEVC)</option>
          <option value="vp9">VP9</option>
        </select>
      </div>
      <div class="config-item">
        <label for="format">Output Format:</label>
        <select id="format" v-model="format">
          <option value="mp4">MP4</option>
          <option value="webm">WebM</option>
          <option value="mov">MOV</option>
        </select>
      </div>
      <div class="config-item">
        <label for="fileName">File Name:</label>
        <input type="text" id="fileName" v-model="fileName" placeholder="Enter file name">
      </div>
    </div>
    <button @click="createVideo" class="create-video-btn" :disabled="isLoading">Create Video</button>
    
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Processing video... Please wait.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const fps = ref(30);
const codec = ref('libx264');
const format = ref('mp4');
const fileName = ref('');
const isLoading = ref(false);

onMounted(() => {
  generateDefaultFileName();
});

const generateDefaultFileName = () => {
  const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  fileName.value = `video${randomNumbers}`;
};

const createVideo = async () => {
  const audio = sessionStorage.getItem('video-creation-audio');
  const images = JSON.parse(sessionStorage.getItem('video-creation-images'));
  const audio_crop = sessionStorage.getItem('video-create-audio-crop');

  if (!audio) {
    alert('Please upload an audio file to create a video.');
    return;
  }

  if (!images || images.length === 0) {
    alert('Please upload images to create a video.');
    return;
  }

  const imagePath = images[0].path;
  const imageParentFolder = imagePath.substring(0, imagePath.lastIndexOf('\\'));

  const data = {
    audio,
    imageParentFolder,
    audio_crop,
    settings: {
      fps: fps.value,
      codec: codec.value,
      format: format.value,
      fileName: fileName.value || generateDefaultFileName()
    }
  };

  isLoading.value = true;

  try {
    const response = await fetch('/api/upscaler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Method-Name': 'createVideoFromPathAndAudio'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    console.log('Video creation result:', result);

    if (result.error) {
      console.error('Video creation failed:', result.error);
      alert('Video creation failed. Please try again.');
    } else {
      console.log('Video creation completed:', result.filePath);
    }
  } catch (error) {
    console.error('Error calling upscaler API:', error);
    alert('An error occurred while creating the video. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
.video-creation-controls {
  background-color: #2c2c2c;
  border-radius: 10px;
  padding: 1.5rem;
  width: 100%;
  height: 100%;
  position: relative;
}

h2 {
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.config-item {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
  color: #b0b0b0;
}

input,
select {
  background-color: #3c3c3c;
  border: 1px solid #4a4a4a;
  border-radius: 5px;
  color: #e0e0e0;
  padding: 0.5rem;
}

.create-video-btn {
  background-color: #4CAF50;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  transition: background-color 0.3s;
}

.create-video-btn:hover {
  background-color: #45a049;
}

.create-video-btn:disabled {
  background-color: #808080;
  cursor: not-allowed;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #e0e0e0;
  margin-top: 1rem;
}
</style>