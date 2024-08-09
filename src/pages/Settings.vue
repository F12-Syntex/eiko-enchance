<template>
  <div class="container">
    <h1>Settings</h1>
    <p>Configure your AI Image Upscaler settings here.</p>

    <div class="settings-grid">
      <div class="setting-item">
        <label for="upscaler-directory">Upscaler Output Directory:</label>
        <input type="text" id="upscaler-directory" v-model="settings.upscalerDirectory" @input="saveSettings"
          @click="changeDir">
      </div>
    </div>

    <button @click="resetSettings" class="reset-button">Reset to Defaults</button>
  </div>
</template>

<script>
// import actionsController from './path/to/actionsController';
export default {
  name: "Settings",
  data() {
    return {
      settings: {
        upscalerDirectory: "",
        upscaleFactor: "2",
        aiModel: "balanced",
        fileFormat: "png",
        autoSave: true,
        theme: "dark"
      }
    };
  },
  mounted() {
    this.loadSettings();
  },
  methods: {
    saveSettings() {
      localStorage.setItem("aiUpscalerSettings", JSON.stringify(this.settings));
    },
    loadSettings() {
      const savedSettings = localStorage.getItem("aiUpscalerSettings");
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
    },
    resetSettings() {
      this.settings = {
        upscalerDirectory: "",
        upscaleFactor: "2",
        aiModel: "balanced",
        fileFormat: "png",
        autoSave: true,
        theme: "dark"
      };
      this.saveSettings();
    },
    async changeDir() {
      // try {
      //   const response = await actionsController.exploreFileView();
      //   if (response.folderPath) {
      //     console.log('Selected folder:', response.folderPath);
      //     // Do something with the selected folder path
      //   } else if (response.canceled) {
      //     console.log('Folder selection was canceled');
      //   } else if (response.error) {
      //     console.error('Error:', response.error);
      //   }
      // } catch (error) {
      //   console.error('Failed to open file explorer:', error);
      // }
      alert('Change directory');
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
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