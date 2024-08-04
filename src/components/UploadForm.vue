<template>
  <div 
    class="upload-form" 
    @dragover.prevent="handleDragOver" 
    @dragleave.prevent="handleDragLeave" 
    @drop.prevent="handleDrop"
    :class="{ 'dragging': dragging }"
  >
    <input type="file" @change="handleFileUpload" ref="fileInput" />
    <div class="upload-text" v-if="!imageSrc" @click="triggerFileInput">
      <p>Drag & Drop your image here or click to upload</p>
    </div>
    <div class="uploaded-image" v-if="imageSrc">
      <img :src="imageSrc" alt="Uploaded Image" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      imageSrc: null,
      dragging: false,
      uploading: false
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadFile(file);
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleDragOver() {
      this.dragging = true;
    },
    handleDragLeave() {
      this.dragging = false;
    },
    handleDrop(event) {
      this.dragging = false;
      const file = event.dataTransfer.files[0];
      if (file) {
        this.uploadFile(file);
      }
    },
    uploadFile(file) {
      this.imageSrc = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append('file', file);

      this.uploading = true;

      axios.post('/upload-endpoint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        console.log('File uploaded successfully:', response.data);
        this.uploading = false;
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        this.uploading = false;
      });
    }
  }
};
</script>

<style scoped>
.upload-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #1a1033;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  width: 100%;
  height: 700px; /* Fixed height for the upload area */
  box-sizing: border-box;
  transition: background-color 0.3s ease;
  cursor: pointer;
  border: 2px dashed #f50057;
}

.upload-form.dragging {
  background-color: #2a1f4f;
}

.upload-form input[type="file"] {
  display: none;
}

.upload-form .upload-text {
  text-align: center;
  color: #ffffff;
}

.uploaded-image {
  margin-top: 20px;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.uploaded-image img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  object-fit: contain; /* Maintain aspect ratio */
}
</style>