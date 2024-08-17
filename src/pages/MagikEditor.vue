<template>
  <div class="video-grid">
    <div class="video-grid__dropzone" @dragover.prevent @drop.prevent="handleDrop" :class="{ 'video-grid__dropzone--active': isDragging }">
      <div v-if="videos.length === 0" class="video-grid__dropzone-text">
        Drop videos here or click to select files
        <input type="file" multiple accept="video/*" @change="handleFileSelect" class="video-grid__file-input" />
      </div>
      <div v-else class="video-grid__videos">
        <div v-for="(video, index) in videos" :key="index" class="video-grid__video-item">
          <video :src="video.src" controls class="video-grid__video"></video>
          <button class="video-grid__remove-btn" @click="removeVideo(index)"> Remove </button>
        </div>
      </div>
    </div>
    <button class="video-grid__generate-btn" @click="generate">Generate</button>
  </div>
</template>

<script>

import settings from '../managers/SettingsManager'

export default {
  data() {
    return {
      videos: [],
      isDragging: false
    }
  },
  methods: {
    async generate() {
      const videoPaths = this.videos.map((video) => video.file.path)
      const cacheDirectory = settings.getSettings().cacheDirectory

      try {
        const request = {
          cacheDirectory,
          videoPaths
        }

        console.log('Upscaling request:', request)

        const response = await fetch('/api/magik_editor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Method-Name': 'magikvideo'
          },
          body: JSON.stringify(request)
        })

        const result = await response.json()

        console.log('Upscaling result:', result)

        if (result.error) {
          console.error('Upscaling failed:', result.error)
        } else {
          console.log('Upscaling completed:', result.filePath)
        }
      } catch (error) {
        console.error('Error calling upscaler API:', error)
      }
    },
    handleDrop(e) {
      this.isDragging = false
      const files = e.dataTransfer.files
      this.addVideos(files)
    },
    handleFileSelect(e) {
      const files = e.target.files
      this.addVideos(files)
    },
    addVideos(files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith('video/')) {
          const url = URL.createObjectURL(file)
          this.videos.push({ src: url, file })
        }
      }
    },
    removeVideo(index) {
      const videoToRemove = this.videos[index]
      URL.revokeObjectURL(videoToRemove.src)
      this.videos.splice(index, 1)
    }
  },
  mounted() {
    window.addEventListener('dragover', (e) => {
      e.preventDefault()
      this.isDragging = true
    })
    window.addEventListener('dragleave', () => {
      this.isDragging = false
    })
  }
}
</script>

<style scoped>
.video-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.video-grid__dropzone {
  width: 100%;
  height: 90%;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.video-grid__dropzone--active {
  border: 2px dashed #007aff;
}

.video-grid__dropzone-text {
  color: #888;
  font-size: 18px;
  text-align: center;
  padding: 40px;
  cursor: pointer;
}

.video-grid__file-input {
  display: none;
}

.video-grid__videos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 20px;
  max-height: 80%;
  overflow-y: auto;
}

.video-grid__video-item {
  position: relative;
}

.video-grid__video {
  width: 100%;
  height: auto;
  border-radius: 5px;
}

.video-grid__remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ff3b30;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
}

.video-grid__generate-btn {
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .video-grid__dropzone {
    width: 90%;
  }

  .video-grid__videos {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
