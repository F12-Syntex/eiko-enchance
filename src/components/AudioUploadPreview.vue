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
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <p>No audio file selected</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
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
        //save the audio file to the session
        sessionStorage.setItem('video-creation-audio', audioUrl.value);
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
  padding: 1.5rem;
  gap: 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #1e1e1e;
  color: #ffffff;
}

.content-wrapper {
  display: flex;
  gap: 1.5rem;
}

.audio-player-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #2a2a2a;
  border-radius: 10px;
  padding: 1.5rem;
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
  background-color: #2a2a2a;
  padding: 2rem;
}

.upload-area.dragging {
  background-color: #3a3a3a;
  border-color: #6a6a6a;
}

.upload-area input {
  display: none;
}

.upload-area span {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #b0b0b0;
  text-align: center;
  font-size: 1rem;
}

.upload-area svg {
  margin-bottom: 1rem;
  color: #b0b0b0;
}

.audio-player {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.visualizer {
  width: 100%;
  height: 120px;
  background-color: #1a1a1a;
  border-radius: 8px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  color: #ffffff;
}

button:hover {
  background-color: #3a3a3a;
}

.seek-bar {
  flex-grow: 1;
  -webkit-appearance: none;
  background: #4a4a4a;
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
  background: #ffffff;
  cursor: pointer;
}

.seek-bar::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
}

.time {
  font-size: 0.9rem;
  color: #b0b0b0;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 1rem;
  background-color: rgba(255, 107, 107, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

.no-audio-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #b0b0b0;
  font-style: italic;
}

.no-audio-message svg {
  margin-bottom: 1rem;
  color: #4a4a4a;
}

</style>