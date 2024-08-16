<template>
  <div class="audio-display">
    <div class="content-wrapper">
      <div class="audio-player-container">
        <div v-if="audioUrl" class="audio-player">
          <canvas ref="visualizer" class="visualizer"></canvas>
          <div class="controls">
            <button @click="togglePlay" :class="{ 'playing': isPlaying }">
              <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            </button>
            <input type="range" min="0" :max="duration" v-model="currentTime" @input="seek" class="seek-bar" />
            <span class="time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          </div>
        </div>
        <div v-else class="no-audio-message">
          No audio file selected
        </div>
      </div>
      <div class="upload-container">
        <label 
          for="audio-upload" 
          class="upload-area" 
          :class="{ 'dragging': isDragging }"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input id="audio-upload" type="file" @change="handleAudioUpload" accept="audio/*" />
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Drop your audio here or click to upload
          </span>
        </label>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const audioUrl = ref('');
const isPlaying = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const visualizer = ref(null);
const errorMessage = ref('');
const isDragging = ref(false);
let audioContext, analyser, source, animationId;
const audio = new Audio();

const handleAudioUpload = (event) => {
  const file = event.target.files[0];
  processAudioFile(file);
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  processAudioFile(file);
};

const processAudioFile = (file) => {
  if (file) {
    const fileType = file.type;
    if (fileType.startsWith('audio/')) {
      if (audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value);
      }
      audioUrl.value = URL.createObjectURL(file);
      audio.src = audioUrl.value;
      audio.onloadedmetadata = () => {
        duration.value = audio.duration;
      };
      audio.onerror = (e) => {
        errorMessage.value = `Error loading audio: ${e.target.error.message}`;
        audioUrl.value = '';
      };
      setupAudioContext();
      errorMessage.value = '';
    } else {
      errorMessage.value = 'Please upload a valid audio file.';
      audioUrl.value = '';
    }
  }
};

const togglePlay = () => {
  if (audio.paused) {
    audio.play().catch(error => {
      errorMessage.value = `Error playing audio: ${error.message}`;
    });
    isPlaying.value = true;
    startVisualization();
  } else {
    audio.pause();
    isPlaying.value = false;
    cancelAnimationFrame(animationId);
  }
};

const seek = () => {
  audio.currentTime = currentTime.value;
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const setupAudioContext = () => {
  if (audioContext) {
    audioContext.close();
  }
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  } catch (error) {
    errorMessage.value = `Error setting up audio context: ${error.message}`;
  }
};

const startVisualization = () => {
  const canvas = visualizer.value;
  const ctx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
      gradient.addColorStop(0, '#ff9a9e');
      gradient.addColorStop(1, '#fad0c4');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  };

  draw();
};

onMounted(() => {
  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime;
  });
});

onUnmounted(() => {
  audio.removeEventListener('timeupdate', () => {});
  cancelAnimationFrame(animationId);
  if (audioContext) {
    audioContext.close();
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>

<style scoped>
.audio-display {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  padding: 1rem;
  gap: 1rem;
  font-family: Arial, sans-serif;
}

.content-wrapper {
  display: flex;
  gap: 1rem;
}

.audio-player-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.upload-container {
  flex: 1;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: 2px dashed #4a4a4a;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area.dragging {
  background-color: #f0f0f0;
  border-color: #2a2a2a;
}

.upload-area input {
  display: none;
}

.upload-area span {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #4a4a4a;
  text-align: center;
}

.upload-area svg {
  margin-bottom: 10px;
}

.audio-player {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.visualizer {
  width: 100%;
  height: 100px;
  background-color: #1a1a1a;
  border-radius: 5px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.seek-bar {
  flex-grow: 1;
  -webkit-appearance: none;
  background: #d3d3d3;
  outline: none;
  height: 5px;
  border-radius: 5px;
}

.seek-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4a4a4a;
  cursor: pointer;
}

.seek-bar::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4a4a4a;
  cursor: pointer;
}

.time {
  font-size: 0.8rem;
  color: #4a4a4a;
}

.error-message {
  color: #ff0000;
  font-size: 0.9rem;
  margin-top: 10px;
}

.no-audio-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #4a4a4a;
  font-style: italic;
}
</style>