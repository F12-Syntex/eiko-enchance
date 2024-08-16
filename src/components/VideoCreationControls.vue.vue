<template>
    <div class="video-creation-controls">
      <h2>Video Creation Controls</h2>
      <div class="config-grid">
        <div class="config-item">
          <label for="fps">FPS:</label>
          <input type="number" id="fps" v-model="fps" min="1" max="60" step="1">
        </div>
        <div class="config-item">
          <label for="resolution">Resolution:</label>
          <select id="resolution" v-model="resolution">
            <option value="1920x1080">1920x1080 (1080p)</option>
            <option value="1280x720">1280x720 (720p)</option>
            <option value="854x480">854x480 (480p)</option>
          </select>
        </div>
        <div class="config-item">
          <label for="bitrate">Bitrate (kbps):</label>
          <input type="number" id="bitrate" v-model="bitrate" min="100" max="10000" step="100">
        </div>
        <div class="config-item">
          <label for="codec">Video Codec:</label>
          <select id="codec" v-model="codec">
            <option value="libx264">H.264</option>
            <option value="libx265">H.265 (HEVC)</option>
            <option value="vp9">VP9</option>
          </select>
        </div>
        <div class="config-item">
          <label for="preset">Encoding Preset:</label>
          <select id="preset" v-model="preset">
            <option value="ultrafast">Ultrafast</option>
            <option value="superfast">Superfast</option>
            <option value="veryfast">Veryfast</option>
            <option value="faster">Faster</option>
            <option value="fast">Fast</option>
            <option value="medium">Medium</option>
            <option value="slow">Slow</option>
            <option value="slower">Slower</option>
            <option value="veryslow">Veryslow</option>
          </select>
        </div>
        <div class="config-item">
          <label for="audioCodec">Audio Codec:</label>
          <select id="audioCodec" v-model="audioCodec">
            <option value="aac">AAC</option>
            <option value="mp3">MP3</option>
            <option value="opus">Opus</option>
          </select>
        </div>
        <div class="config-item">
          <label for="audioBitrate">Audio Bitrate (kbps):</label>
          <input type="number" id="audioBitrate" v-model="audioBitrate" min="32" max="320" step="16">
        </div>
        <div class="config-item">
          <label for="format">Output Format:</label>
          <select id="format" v-model="format">
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="mov">MOV</option>
          </select>
        </div>
      </div>
      <button @click="createVideo" class="create-video-btn">Create Video</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const fps = ref(30);
  const resolution = ref('1920x1080');
  const bitrate = ref(5000);
  const codec = ref('libx264');
  const preset = ref('medium');
  const audioCodec = ref('aac');
  const audioBitrate = ref(128);
  const format = ref('mp4');
  
  const createVideo = () => {
    console.log('Creating video with settings:', {
      fps: fps.value,
      resolution: resolution.value,
      bitrate: bitrate.value,
      codec: codec.value,
      preset: preset.value,
      audioCodec: audioCodec.value,
      audioBitrate: audioBitrate.value,
      format: format.value
    });

    //retrieve the video and audio files from the session storage   
    //video-creation-audio
    //video-creation-images

    const audio = sessionStorage.getItem('video-creation-audio');
    const images = JSON.parse(sessionStorage.getItem('video-creation-images'));
    
    console.log('Audio:', audio);
    console.log('Images:', images);

    //if audio is not present, show an error message
    if (!audio) {
      alert('Please upload an audio file to create a video.');
      return;
    }

    //if images are not present, show an error message
    if (!images || images.length === 0) {
      alert('Please upload images to create a video.');
      return;
    }

    const data = {
      audio,
      images,
      settings: {
        fps: fps.value,
        resolution: resolution.value,
        bitrate: bitrate.value,
        codec: codec.value,
        preset: preset.value,
        audioCodec: audioCodec.value,
        audioBitrate: audioBitrate.value,
        format: format.value
      }
    };


  };
  </script>
  
  <style scoped>
  .video-creation-controls {
    background-color: #2c2c2c;
    border-radius: 10px;
    padding: 1.5rem;
    width: 100%;
    height: 100%;
    min-height: 500px;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: #e0e0e0;
  }
  
  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .config-item {
    display: flex;
    flex-direction: column;
  }
  
  label {
    margin-bottom: 0.5rem;
    color: #b0b0b0;
  }
  
  input, select {
    background-color: #3c3c3c;
    border: 1px solid #4a4a4a;
    border-radius: 5px;
    color: #e0e0e0;
    padding: 0.5rem;
  }
  
  .create-video-btn {
    background-color: #4CAF50;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    transition: background-color 0.3s;
  }
  
  .create-video-btn:hover {
    background-color: #45a049;
  }
  </style>