<template>
  <div class="container">
    <h1>Settings</h1>
    <p>Configure your AI Image Upscaler settings here.</p>

    <div class="settings-grid">
      <div class="setting-item">
        <label for="upscaler-directory">Upscaler Output Directory:</label>
        <input type="text" id="upscaler-directory" v-model="settings.upscalerDirectory" 
               @click="changeDir('upscaler')" readonly>
      </div>
      <div class="setting-item">
        <label for="cache-directory">Cache Directory:</label>
        <input type="text" id="cache-directory" v-model="settings.cacheDirectory" 
               @click="changeDir('cache')" readonly>
      </div>
    </div>

    <button @click="resetSettings" class="reset-button">Reset to Defaults</button>
  </div>
</template>

<script>
import useElectron from '../../composables/useElectron';
import settingsManager from '../managers/SettingsManager';

export default {
  name: "Settings",
  data() {
    return {
      settings: settingsManager.getSettings()
    };
  },
  methods: {
    saveSettings() {
      settingsManager.saveSettings(this.settings);
    },
    resetSettings() {
      this.settings = settingsManager.resetSettings();
    },
    async changeDir(type) {
      const { fileExplorer } = useElectron()
      const dialog = await fileExplorer.openFileDialogFolder();
      if (dialog.filePaths && dialog.filePaths.length > 0) {
        if (type === 'upscaler') {
          this.settings.upscalerDirectory = dialog.filePaths[0];
        } else if (type === 'cache') {
          this.settings.cacheDirectory = dialog.filePaths[0];
        }
        this.saveSettings();
      }
    }
  }
};
</script>

<style scoped>
.container {
  margin: 0 auto;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 0.5em;
  color: #fff;
}

p {
  font-size: 1.2em;
  margin-bottom: 1.5em;
  color: #ccc;
}

.settings-grid {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;

  width: 80%;
}

label {
  font-size: 1em;
  margin-bottom: 5px;
  color: #fff;
}

input[type="text"],
select {
  padding: 10px;
  font-size: 1em;
  background-color: #2c2c2c;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  cursor: default; 
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked+.slider {
  background-color: #2196F3;
}

input:checked+.slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.reset-button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1em;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-button:hover {
  background-color: #d32f2f;
}
</style>