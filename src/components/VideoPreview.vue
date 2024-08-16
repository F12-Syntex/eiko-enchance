<template>
    <div class="video-preview" tabindex="0" @keydown="handleKeydown">
        <div class="preview-content">
            <button class="close-preview" @click="$emit('close')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="main-area">
                <div class="video-container">
                    <video 
                        ref="videoElement"
                        controls 
                        :src="video.url" 
                        :type="'video/' + video.name.split('.').pop()"
                        :style="videoStyle"
                        @play="startAudioAnalysis"
                        @pause="stopAudioAnalysis"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="effects-panel">
                    <h3>Video Effects</h3>
                    <div class="control-group">
                        <label>Brightness</label>
                        <input type="range" min="0" max="200" v-model="brightness" @input="updateVideoStyle">
                    </div>
                    <div class="control-group">
                        <label>Contrast</label>
                        <input type="range" min="0" max="200" v-model="contrast" @input="updateVideoStyle">
                    </div>
                    <div class="control-group">
                        <label>Saturation</label>
                        <input type="range" min="0" max="200" v-model="saturation" @input="updateVideoStyle">
                    </div>
                    <div class="control-group">
                        <label>Hue Rotate</label>
                        <input type="range" min="0" max="360" v-model="hueRotate" @input="updateVideoStyle">
                    </div>
                    <div class="control-group">
                        <label>Blur</label>
                        <input type="range" min="0" max="10" v-model="blur" @input="updateVideoStyle">
                    </div>
                    <div class="control-group">
                        <label>Effect</label>
                        <select v-model="selectedEffect" @change="applyEffect">
                            <option value="none">None</option>
                            <option value="grayscale">Grayscale</option>
                            <option value="sepia">Sepia</option>
                            <option value="invert">Invert</option>
                            <option value="duotone">Duotone</option>
                            <option value="vintage">Vintage</option>
                            <option value="vignette">Vignette</option>
                            <option value="sOb">SoB</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Animation</label>
                        <select v-model="selectedAnimation" @change="applyAnimation">
                            <option value="none">None</option>
                            <option value="pulse">Pulse</option>
                            <option value="shake">Shake</option>
                            <option value="rotate">Rotate</option>
                            <option value="bounce">Bounce</option>
                            <option value="swing">Swing</option>
                        </select>
                    </div>
                    <button @click="resetEffects" class="reset-button">Reset Effects</button>
                </div>
            </div>
        </div>
        <div class="preview-navigation">
            <button @click="$emit('navigate', -1)" class="nav-button prev">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <button @click="$emit('navigate', 1)" class="nav-button next">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
// ... (Script remains the same as in the previous version)
</script>

<style scoped>
.video-preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(18, 18, 18, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    outline: none;
}

.preview-content {
    display: flex;
    flex-direction: column;
    width: 90%;
    height: 90%;
    position: relative;
}

.main-area {
    display: flex;
    flex: 1;
    gap: 20px;
}

.video-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.video-container video {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.effects-panel {
    width: 300px;
    padding: 20px;
    background-color: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    overflow-y: auto;
}

.effects-panel h3 {
    color: #ffffff;
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.5em;
    font-weight: 500;
}

.close-preview {
    position: absolute;
    top: -30px;
    right: -30px;
    background: rgba(30, 30, 30, 0.7);
    border: none;
    color: #ffffff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s;
}

.close-preview:hover {
    background-color: rgba(50, 50, 50, 0.9);
}

.close-preview svg {
    width: 24px;
    height: 24px;
}

.preview-navigation {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    transform: translateY(-50%);
}

.nav-button {
    background: rgba(30, 30, 30, 0.7);
    border: none;
    color: #ffffff;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s;
}

.nav-button:hover {
    background-color: rgba(50, 50, 50, 0.9);
}

.nav-button svg {
    width: 30px;
    height: 30px;
}

.control-group {
    margin-bottom: 15px;
}

.control-group label {
    display: block;
    margin-bottom: 5px;
    color: #ffffff;
    font-weight: 500;
}

input[type="range"] {
    width: 100%;
    -webkit-appearance: none;
    background: #2c2c2c;
    outline: none;
    border-radius: 15px;
    height: 8px;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #4CAF50;
    cursor: pointer;
    border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #4CAF50;
    cursor: pointer;
    border-radius: 50%;
}

select {
    width: 100%;
    padding: 8px;
    background-color: #2c2c2c;
    color: #ffffff;
    border: none;
    border-radius: 4px;
}

.reset-button {
    width: 100%;
    padding: 10px;
    background-color: #4CAF50;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-weight: 500;
}

.reset-button:hover {
    background-color: #45a049;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes swing {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(5deg); }
    50% { transform: rotate(0deg); }
    75% { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
}
</style>