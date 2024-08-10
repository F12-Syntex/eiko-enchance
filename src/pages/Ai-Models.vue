<template>
  <div class="ai-models-container">
    <div class="ai-model-header">
      <h1>Dependencies</h1>
      <hr class="gradient-line" />
    </div>
    <div class="ai-model-cards">
      <div v-for="(model, index) in models" :key="index" class="ai-model-card">
        <div class="ai-model-card-header">
          <font-awesome-icon :icon="model.installed ? ['fas', 'check-circle'] : ['fas', 'times-circle']"
            :class="model.installed ? 'status-icon-green' : 'status-icon-red'" />
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
            <button class="ai-model-card-footer-button" @click="installModel(model)"
              :disabled="model.installed || model.isInstalling">
              <font-awesome-icon :icon="['fas', 'download']" />
            </button>
            <button class="ai-model-card-footer-button" @click="deleteModel(model)"
              :disabled="!model.installed || model.isInstalling">
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheckCircle, faDownload, faTimesCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { onMounted } from 'vue';
import aiModels from '../controller/ai-models';

let models = await aiModels.getInstalledModels();
models = models.models.filter((model) => !model.usable);


onMounted(async () => {
  try {
    console.log('hi');
  } catch (error) {
    console.error('Error fetching models:', error);
  }
});

const installModel = async (model) => {
  console.log('Installing model:', model);

  const button = event.target;
  button.classList.add('is-loading');


  await aiModels.installModel(model);
  window.location.reload();
};

const deleteModel = async (model) => {
  console.log('Deleting model:', model);

  const button = event.target;
  button.classList.add('is-loading');

  await aiModels.deleteModel(model);
  window.location.reload();
};

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
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 320px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;

  background: rgba(255, 255, 255, 0.05 );
}

.ai-model-card-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-icon-green {
  font-size: 1.5em;
  color: #4caf50;
  /* Green color */
  transition: transform 0.3s ease-in-out;
}

.status-icon-red {
  font-size: 1.5em;
  color: #f50057;
  /* Red color */
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

.is-loading {
  background-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
}

</style>