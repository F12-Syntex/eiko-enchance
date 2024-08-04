<template>
  <div class="container">
    <div class="main-content">
      <div class="content">
        <h1>AI Image Upscaler</h1>
        <UploadForm />
      </div>
      <div class="options">
        <h2>Settings</h2>
        <div class="option">
          <label for="model">Model</label>
          <select id="model" v-model="selectedModel">
            <option value="realsrgen">RealSRGen</option>
            <option value="model2">Model 2</option>
            <option value="model3">Model 3</option>
          </select>
        </div>
        <div class="separator"></div>
        <div class="option">
          <label for="upscale-ratio">Upscale Ratio</label>
          <input type="number" id="upscale-ratio" v-model="upscaleRatio" min="2" max="4" />
        </div>
        <button class="upscale-button" @click="upscaleImage">Upscale</button>
      </div>
    </div>
  </div>
</template>

<script>
import UploadForm from '@/components/UploadForm.vue';

export default {
  components: {
    UploadForm
  },
  data() {
    return {
      selectedModel: 'realsrgen',
      upscaleRatio: 2
    };
  },
  methods: {
    upscaleImage() {
      // Placeholder function for upscale button
      console.log('Upscale button clicked');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.container {
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
}

nav {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

nav a {
  margin-right: 20px;
  text-decoration: none;
  color: #f50057;
}

.main-content {
  display: flex;
  justify-content: space-between;
}

.content {
  flex: 3;
  padding-right: 20px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.content h1 {
  font-size: 2.5em;
  margin-bottom: 0.5em;
}

.content p {
  font-size: 1.2em;
  margin-bottom: 1.5em;
  color: #ccc;
}

.options {
  flex: 1;
  background-color: #1a1033;
  padding: 20px;
  border-radius: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.options h2 {
  margin-bottom: 15px;
  font-size: 1.5em;
}

.option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.option label {
  font-size: 1.1em;
  color: #ccc;
}

.separator {
  height: 1px;
  background-color: #ffffff;
  margin: 20px 0;
}

select, input[type="number"] {
  background-color: #2a1f4f;
  color: #ffffff;
  border: none;
  padding: 0.5em;
  border-radius: 5px;
  width: 100%;
  max-width: 200px;
  box-sizing: border-box;
}

.upscale-button {
  background-color: #f50057;
  border: none;
  color: #fff;
  padding: 0.75em 1.5em;
  font-size: 1em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: auto;
  width: 100%;
}

.upscale-button:hover {
  background-color: #c51162;
}
</style>