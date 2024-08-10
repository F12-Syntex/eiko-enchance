<template>
  <div class="advanced-options">
    <div class="header" @click="isCollapsed = !isCollapsed">
      <h2>Advanced Options</h2>
      <i :class="['arrow', isCollapsed ? 'down' : 'up']"></i>
    </div>
    <div class="content" v-show="!isCollapsed">
      <div class="option-grid">
        <div class="option-group">
          <label for="tile-size">Tile Size</label>
          <input type="number" id="tile-size" v-model="options.tileSize" min="32" max="2048" step="32" />
          <p class="description">Tile size for splitting large images (default: 512)</p>
        </div>
        <div class="option-group">
          <label for="tile-pad">Tile Pad</label>
          <input type="number" id="tile-pad" v-model="options.tilePad" min="0" max="64" step="1" />
          <p class="description">Tile padding for splitting large images (default: 10)</p>
        </div>
        <div class="option-group">
          <label for="pre-pad">Pre Pad</label>
          <input type="number" id="pre-pad" v-model="options.prePad" min="0" max="64" step="1" />
          <p class="description">Pre-padding for upscaling (default: 10)</p>
        </div>
        <div class="option-group">
          <label for="face-enhance">Face Enhance</label>
          <input type="checkbox" id="face-enhance" v-model="options.faceEnhance" />
          <p class="description">Enable face enhancement (default: true)</p>
        </div>
        <div class="option-group">
          <label for="face-inst">Face Inst</label>
          <input type="text" id="face-inst" v-model="options.faceInst" />
          <p class="description">Path to face instance (optional)</p>
        </div>
        <div class="option-group">
          <label for="denoise-level">Denoise Level</label>
          <input type="number" id="denoise-level" v-model="options.denoiseLevel" min="0" max="5" step="1" />
          <p class="description">Denoise level (0 - 5) (default: 0)</p>
        </div>
        <div class="option-group">
          <label for="upscale-level">Upscale Level</label>
          <input type="number" id="upscale-level" v-model="options.upscaleLevel" min="1" max="4" step="1" />
          <p class="description">Upscale level (1 - 4) (default: 2)</p>
        </div>
        <div class="option-group">
          <label for="output-format">Output Format</label>
          <select id="output-format" v-model="options.outputFormat">
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
          <p class="description">Output image format (default: PNG)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'AdvancedOptions',
  setup(props, { emit }) {
    const isCollapsed = ref(false);
    const options = ref({
      tileSize: 512,
      tilePad: 10,
      prePad: 10,
      faceEnhance: true,
      faceInst: '',
      denoiseLevel: 0,
      upscaleLevel: 2,
      outputFormat: 'png',
    });

    const emitOptions = () => {
      emit('update:options', options.value);
    };

    return {
      isCollapsed,
      options,
      emitOptions,
    };
  },
};
</script>

<style scoped>
.advanced-options {
  width: 100%;
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(20px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

h2 {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 0;
}

.arrow {
  border: solid #e0e0e0;
  border-width: 0 3px 3px 0;
  padding: 5px;
  transition: transform 0.3s ease;
}

.up {
  transform: rotate(-135deg);
}

.down {
  transform: rotate(45deg);
}

.content {
  margin-top: 1rem;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

input[type="number"],
input[type="text"],
select {
  padding: 0.75rem;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;
}

input[type="number"]:focus,
input[type="text"]:focus,
select:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

input[type="checkbox"] {
  margin-right: 0.5rem;
  transform: scale(1.2);
}

.description {
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-top: 0.25rem;
}
</style>