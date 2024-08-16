<template>
    <div class="video-preview" tabindex="0" @keydown="handleKeydown">
        <div class="preview-content">
            <button class="close-preview" @click="$emit('close')">&times;</button>
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
        <div class="preview-navigation">
            <button @click="$emit('navigate', -1)" class="nav-button prev">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-chevron-left">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <button @click="$emit('navigate', 1)" class="nav-button next">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-chevron-right">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    video: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'navigate']);

const videoElement = ref(null);
const brightness = ref(100);
const contrast = ref(100);
const saturation = ref(100);
const hueRotate = ref(0);
const blur = ref(0);
const selectedEffect = ref('none');
const selectedAnimation = ref('none');

let audioContext = null;
let analyser = null;
let dataArray = null;
let animationFrameId = null;

const videoStyle = computed(() => ({
    filter: `brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%) hue-rotate(${hueRotate.value}deg) blur(${blur.value}px) ${getEffectFilter()}`,
    animation: getAnimation(),
    transform: selectedEffect.value === 'sOb' ? 'translateX(0)' : 'none'
}));

const updateVideoStyle = () => {
    if (videoElement.value) {
        Object.assign(videoElement.value.style, videoStyle.value);
    }
};

const getEffectFilter = () => {
    switch (selectedEffect.value) {
        case 'grayscale': return 'grayscale(100%)';
        case 'sepia': return 'sepia(100%)';
        case 'invert': return 'invert(100%)';
        case 'duotone': return 'grayscale(100%) sepia(50%) hue-rotate(170deg) saturate(300%)';
        case 'vintage': return 'sepia(50%) hue-rotate(-30deg) saturate(120%) brightness(90%)';
        case 'vignette': return 'brightness(110%) contrast(110%) drop-shadow(0 0 10px rgba(0,0,0,0.5))';
        default: return '';
    }
};

const getAnimation = () => {
    switch (selectedAnimation.value) {
        case 'pulse': return 'pulse 2s infinite';
        case 'shake': return 'shake 0.5s infinite';
        case 'rotate': return 'rotate 5s linear infinite';
        case 'bounce': return 'bounce 1s infinite';
        case 'swing': return 'swing 2s infinite';
        default: return 'none';
    }
};

const applyEffect = () => {
    updateVideoStyle();
    if (selectedEffect.value === 'sOb') {
        startAudioAnalysis();
    } else {
        stopAudioAnalysis();
    }
};

const applyAnimation = () => {
    updateVideoStyle();
};

const resetEffects = () => {
    brightness.value = 100;
    contrast.value = 100;
    saturation.value = 100;
    hueRotate.value = 0;
    blur.value = 0;
    selectedEffect.value = 'none';
    selectedAnimation.value = 'none';
    updateVideoStyle();
    stopAudioAnalysis();
};

const handleKeydown = (event) => {
    if (event.key === 'ArrowLeft') {
        emit('navigate', -1);
    } else if (event.key === 'ArrowRight') {
        emit('navigate', 1);
    } else if (event.key === 'Escape') {
        emit('close');
    }
};

const startAudioAnalysis = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(videoElement.value);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }

    const analyzeAudio = () => {
        animationFrameId = requestAnimationFrame(analyzeAudio);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        if (average > 128) { // Adjust this threshold as needed
            videoElement.value.style.transform = `translateX(${Math.random() * 10 - 5}px)`;
        } else {
            videoElement.value.style.transform = 'translateX(0)';
        }
    };

    analyzeAudio();
};

const stopAudioAnalysis = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (videoElement.value) {
        videoElement.value.style.transform = 'translateX(0)';
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    stopAudioAnalysis();
    if (audioContext) {
        audioContext.close();
    }
});
</script>
<style scoped>
.video-preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #121212;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    outline: none;
}

.preview-content {
    display: flex;
    max-width: 90%;
    max-height: 90%;
    position: relative;
}

.video-container {
    flex: 1;
    margin-right: 20px;
}

.video-container video {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.effects-panel {
    width: 300px;
    padding: 20px;
    background-color: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    max-height: 100%;
}

.effects-panel h3 {
    color: #ffffff;
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.5em;
}

.close-preview {
    position: absolute;
    top: -40px;
    right: -40px;
    background: none;
    border: none;
    color: #ffffff;
    font-size: 32px;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.3s;
}

.close-preview:hover {
    opacity: 1;
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
    font-size: 24px;
    padding: 15px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.nav-button:hover {
    background-color: rgba(50, 50, 50, 0.9);
}

.nav-button svg {
    width: 30px;
    height: 30px;
}

.prev {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
}

.next {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
}

.control-group {
    margin-bottom: 15px;
}

.control-group label {
    display: block;
    margin-bottom: 5px;
    color: #ffffff;
    font-weight: bold;
}

input[type="range"] {
    width: 100%;
    -webkit-appearance: none;
    background: #2c2c2c;
    outline: none;
    border-radius: 15px;
    height: 10px;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #4CAF50;
    cursor: pointer;
    border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
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