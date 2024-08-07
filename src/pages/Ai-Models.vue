<template>
  <div class="model-page">
    <h1>AI Models</h1>
    <div class="model-section">
      <h2>Installed Models</h2>
      <ul>
        <li v-for="model in installedModels" :key="model.name">
          {{ model.name }}
        </li>
      </ul>
    </div>
    <div class="model-section">
      <h2>Available Models</h2>
      <ul>
        <li v-for="model in availableModels" :key="model.name">
          {{ model.name }}
          <button @click="downloadModel(model)" v-if="!model.downloading && !model.installed">
            <i class="download-icon">⬇️</i>
          </button>
          <div v-if="model.downloading">
            <progress :value="model.progress" max="100"></progress>
            {{ model.progress }}%
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      installedModels: [
        { name: "Model A" },
        { name: "Model B" }
      ],
      availableModels: [
        { name: "Model C", installed: false, downloading: false, progress: 0 },
        { name: "Model D", installed: false, downloading: false, progress: 0 }
      ]
    };
  },
  methods: {
    downloadModel(model) {
      model.downloading = true;
      const interval = setInterval(() => {
        if (model.progress < 100) {
          model.progress += 10;
        } else {
          clearInterval(interval);
          model.installed = true;
          model.downloading = false;
          this.installedModels.push(model);
          this.availableModels = this.availableModels.filter(m => m.name !== model.name);
        }
      }, 500);
    }
  }
};
</script>

<style scoped>
.model-page {
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1, h2 {
  color: #333;
}

.model-section {
  margin-bottom: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #f5f5f5;
  margin: 10px 0;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.download-icon {
  font-size: 18px;
  cursor: pointer;
}

progress {
  width: 100px;
  margin-left: 10px;
}
</style>