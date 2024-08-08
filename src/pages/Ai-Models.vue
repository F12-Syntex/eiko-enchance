<template>
  <div class="ai-models-container">
    <div class="ai-model-header">
      <h1>Models</h1>
      <hr class="gradient-line" />
    </div>
    <div class="ai-model-cards">
      <div
        v-for="(model, index) in models"
        :key="index"
        class="ai-model-card"
      >
        <div class="ai-model-card-header">
          <font-awesome-icon
            :icon="model.isInstalled ? ['fas', 'check-circle'] : ['fas', 'times-circle']"
            :class="model.isInstalled ? 'status-icon-green' : 'status-icon-red'"
          />
          <h2>{{ model.name }}</h2>
        </div>
        <div class="ai-model-card-description">
          <p>{{ model.description }}</p>
        </div>
        <div v-if="model.isInstalling" class="progress-bar-container">
          <div class="progress-bar" :style="{ width: `${model.progress}%` }"></div>
        </div>
        <div class="ai-model-card-footer">
          <hr class="gradient-line" />
          <div class="ai-model-card-footer-panel">
            <button
              class="ai-model-card-footer-button"
              @click="installModel(model)"
              :disabled="model.isInstalled || model.isInstalling"
            >
              <font-awesome-icon :icon="['fas', 'download']" />
            </button>
            <button
              class="ai-model-card-footer-button"
              @click="deleteModel(model)"
              :disabled="!model.isInstalled || model.isInstalling"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDownload, faTrash, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const models = ref([
  {
    name: 'RealESRGAN_x4plus',
    description: 'High-quality image super-resolution model for general images.',
    isInstalled: false,
    isInstalling: false,
    progress: 0,
  },
  {
    name: 'RealESRGAN_x4plus_anime_6B',
    description: 'Optimized for anime images with a smaller model size.',
    isInstalled: false,
    isInstalling: false,
    progress: 0,
  },
  {
    name: 'RealESRGAN_x2plus',
    description: '2x upscaling model for general images.',
    isInstalled: false,
    isInstalling: false,
    progress: 0,
  },
  {
    name: 'RealESRGAN_anime_video',
    description: 'Model specifically designed for improving anime video quality.',
    isInstalled: false,
    isInstalling: false,
    progress: 0,
  },
]);

const installModel = async (model) => {
  try {
    model.isInstalling = true;
    model.progress = 0;
    const response = await fetch('/api/ai-models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: model.name, method: 'install' }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const updates = chunk.split('\n').filter(Boolean).map(JSON.parse);
      for (const update of updates) {
        model.progress = update.progress;
        if (update.status === 'complete') {
          model.isInstalled = true;
          model.isInstalling = false;
        }
      }
    }
    console.log('Model installed:', model.name);
  } catch (error) {
    console.error('Error installing model:', error);
    model.isInstalling = false;
  }
};

const deleteModel = async (model) => {
  try {
    const response = await fetch('/api/ai-models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: model.name, method: 'delete' }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log('Model deleted:', data);
    model.isInstalled = false;
  } catch (error) {
    console.error('Error deleting model:', error);
  }
};

onMounted(async () => {
  try {
    const response = await fetch('/api/ai-models');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log('Installed Models:', data.models);
    data.models.forEach(modelName => {
      const model = models.value.find(m => m.name === modelName);
      if (model) {
        model.isInstalled = true;
      }
    });
  } catch (error) {
    console.error('Error fetching models:', error);
  }
});

library.add(faDownload, faTrash, faCheckCircle, faTimesCircle);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.gradient-line {
  border: none;
  height: 2px;
  background: gray;
  width: 100%;
}

.ai-model-header {
  text-align: left;
  font-size: 1.75em;
  color: white;
  width: 100%;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(245, 0, 87, 0.5);
}

.ai-models-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 100%;
  width: 100%;
  gap: 20px;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 1.5em;
  background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.ai-model-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  width: 100%;
  gap: 20px;
}

.ai-model-card {
  color: #ffffff;
  padding: 25px;
  border-radius: 10px;
  background: linear-gradient(135deg, #222, #333);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 320px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
}

.ai-model-card-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-icon-green {
  font-size: 1.5em;
  color: #4caf50; /* Green color */
  transition: transform 0.3s ease-in-out;
}

.status-icon-red {
  font-size: 1.5em;
  color: #f50057; /* Red color */
  transition: transform 0.3s ease-in-out;
}

.ai-model-card-description {
  margin-top: 25px;
  flex-grow: 1;
  font-family: 'Poppins', sans-serif;
  font-weight: 300;
}

.ai-model-card-footer {
  margin-top: auto;
  width: 100%;
}

.ai-model-card-footer-panel {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-radius: 5px;
}

.ai-model-card-footer-button {
  padding: 15px;
  border: none;
  border-radius: 0px 0px 5px 5px;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  background-color: transparent;
}

.ai-model-card-footer-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}

.ai-model-card-footer-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-bar-container {
  width: 100%;
  height: 2px;
  background-color: #444;
  margin-bottom: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #f50057, #ff4081, #e040fb);
  transition: width 0.3s ease-in-out;
}
</style>