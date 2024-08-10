<template>
    <div class="library-container">
        <div class="folder-navigation">
            <button @click="goBack" :disabled="currentPath.length === 0" class="back-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back
            </button>
            <span class="current-path">{{ currentPathString }}</span>
        </div>
        <div class="library-content">
            <div v-for="item in sortedItems" :key="item.name" class="library-item">
                <template v-if="item.type === 'directory'">
                    <div class="folder" @click="openFolder(item.name)">
                        <i class="fas fa-folder"></i>
                        <span>{{ item.name }}</span>
                    </div>
                </template>
                <template v-else-if="item.type === 'image'">
                    <div class="image" @click="previewMedia(item)">
                        <img :src="item.thumbnailUrl" :alt="item.name">
                        <span>{{ item.name }}</span>
                    </div>
                </template>
                <template v-else-if="item.type === 'video'">
                    <div class="video" @click="previewMedia(item)">
                        <img :src="item.thumbnailUrl" :alt="item.name" class="video-thumbnail">
                        <span>{{ item.name }}</span>
                    </div>
                </template>
                <template v-else-if="item.type === 'audio'">
                    <div class="audio" @click="previewMedia(item)">
                        <i class="fas fa-music"></i>
                        <span>{{ item.name }}</span>
                    </div>
                </template>
            </div>
        </div>
        <div v-if="previewItem" class="media-preview" tabindex="0" ref="mediaPreview">
            <div class="preview-content">
                <button class="close-preview" @click="closePreview">&times;</button>
                <img v-if="previewItem.type === 'image'" :src="previewItem.url" :alt="previewItem.name">
                <video v-else-if="previewItem.type === 'video'" controls>
                    <source :src="previewItem.url" :type="'video/' + previewItem.name.split('.').pop()">
                    Your browser does not support the video tag.
                </video>
                <audio v-else-if="previewItem.type === 'audio'" controls>
                    <source :src="previewItem.url" :type="'audio/' + getAudioType(previewItem.name)">
                    Your browser does not support the audio tag.
                </audio>
            </div>
            <div class="preview-navigation">
                <button @click="navigatePreview(-1)" class="nav-button prev">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="feather feather-chevron-left">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button @click="navigatePreview(1)" class="nav-button next">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="feather feather-chevron-right">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import useElectron from '../../composables/useElectron';
import SettingsManager from '../managers/SettingsManager';

const items = ref([]);
const currentPath = ref([]);
const previewItem = ref(null);
const mediaPreview = ref(null);

const sortedItems = computed(() => {
    return [...items.value].sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return 1;
        if (b.type === 'directory' && a.type !== 'directory') return -1;
        return a.name.localeCompare(b.name);
    });
});

const currentPathString = computed(() => {
    const basePath = SettingsManager.getSettings().upscalerDirectory;
    return basePath + (currentPath.value.length > 0 ? '\\' + currentPath.value.join('\\') : '');
});

const openFolder = (folderName) => {
    currentPath.value.push(folderName);
    loadCurrentFolder();
};

const goBack = () => {
    currentPath.value.pop();
    loadCurrentFolder();
};

const previewMedia = (item) => {
    previewItem.value = item;
    nextTick(() => {
        if (mediaPreview.value) {
            mediaPreview.value.focus();
        }
    });
};

const closePreview = () => {
    previewItem.value = null;
};

const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
        return 'image';
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
        return 'video';
    } else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
        return 'audio';
    }
    return 'other';
};

const getAudioType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'mp3') {
        return 'audio/mpeg';
    } else if (extension === 'wav') {
        return 'audio/wav';
    } else if (extension === 'ogg') {
        return 'audio/ogg';
    } else if (extension === 'flac') {
        return 'audio/flac';
    } else if (extension === 'aac') {
        return 'audio/aac';
    }
    return '';
};

const loadCurrentFolder = async () => {
    const { fileExplorer } = useElectron();
    const currentFullPath = currentPathString.value;
    console.log(currentFullPath);
    const filesObject = await fileExplorer.exploreFolder(currentFullPath);

    const processFiles = (files) => {
        if (!Array.isArray(files)) {
            files = Object.values(files);
        }

        return files.map(file => {
            const type = file.isDirectory ? 'directory' : getFileType(file.name);
            const absolutePath = `${currentFullPath}\\${file.name}`;

            return {
                name: file.name,
                type,
                url: `local-file://${absolutePath}`,
                thumbnailUrl: type === 'video' || type === 'audio' ? '' : `local-file://${absolutePath}`
            };
        }).filter(item => item.type === 'directory' || item.type === 'image' || item.type === 'video' || item.type === 'audio');
    };

    items.value = processFiles(filesObject);
};

const generateThumbnails = async () => {
    for (const item of items.value) {
        if (item.type === 'image' || item.type === 'video') {
            item.thumbnailUrl = await generateThumbnail(item.url, item.type);
        }
    }
};

const generateThumbnail = (url, type) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const targetWidth = 256;
            const targetHeight = 144;

            const aspectRatio = img.width / img.height;

            let width, height;
            if (aspectRatio > targetWidth / targetHeight) {
                width = targetWidth;
                height = targetWidth / aspectRatio;
            } else {
                height = targetHeight;
                width = targetHeight * aspectRatio;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        if (type === 'video') {
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.preload = 'metadata';
            video.onloadeddata = () => {
                video.currentTime = 1;
            };
            video.onseeked = () => {
                img.src = getVideoFrame(video);
            };
        } else {
            img.src = url;
        }
    });
};

const getVideoFrame = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
};

const navigatePreview = (direction) => {
    const mediaItems = sortedItems.value.filter(item => item.type === 'image' || item.type === 'video' || item.type === 'audio');
    const currentIndex = mediaItems.findIndex(item => item.name === previewItem.value.name);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
        newIndex = mediaItems.length - 1;
    } else if (newIndex >= mediaItems.length) {
        newIndex = 0;
    }

    previewItem.value = mediaItems[newIndex];
};

const handleKeydown = (event) => {
    event.preventDefault();
    if (event.key === 'ArrowLeft') {
        navigatePreview(-1);
    } else if (event.key === 'ArrowRight') {
        navigatePreview(1);
    } else if (event.key === 'Escape') {
        closePreview();
    }
};

onMounted(async () => {
    await loadCurrentFolder();
    await generateThumbnails();
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

watch(currentPath, async () => {
    await loadCurrentFolder();
    await generateThumbnails();
}, { deep: true });

</script>

<style scoped>
.audio {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.audio i {
    font-size: 50px;
    margin-bottom: 10px;
    color: #0e639c;
}

.library-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    color: #ffffff;
    overflow: hidden;
}

.folder-navigation {
    padding: 15px;
    border-bottom: 1px solid #333333;
    display: flex;
    align-items: center;
}

.back-button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.back-button:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.1);
}

.back-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.back-button svg {
    width: 20px;
    height: 20px;
    margin-right: 5px;
}

.current-path {
    margin-left: 15px;
    font-size: 14px;
    opacity: 0.8;
}

.library-content {
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    overflow-y: auto;
    padding: 15px;
    align-content: flex-start;
    height: 0;
}

.media-preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    outline: none;
}

.library-item {
    width: 150px;
    height: 150px;
    margin: 10px;
    text-align: center;
    cursor: pointer;
    border-radius: 8px;
    transition: transform 0.3s, background-color 0.3s;
    overflow: hidden;
}

.library-item:hover {
    background-color: #2d2d2d;
    transform: translateY(-5px);
}

.folder,
.image,
.video {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.folder i {
    font-size: 50px;
    margin-bottom: 10px;
    color: #0e639c;
}

.video-thumbnail,
.image img {
    max-width: 100%;
    max-height: 80%;
    object-fit: cover;
    border-radius: 4px;
}

.library-item span {
    font-size: 14px;
    margin-top: 5px;
    word-break: break-word;
    padding: 0 5px;
}

.media-preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.preview-content {
    max-width: 90%;
    max-height: 90%;
    position: relative;
}

.preview-content img,
.preview-content video {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.library-content::-webkit-scrollbar {
    width: 10px;
}

.library-content::-webkit-scrollbar-track {
    background: #1e1e1e;
}

.library-content::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 5px;
}

.library-content::-webkit-scrollbar-thumb:hover {
    background: #4f4f4f;
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
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: #ffffff;
    font-size: 24px;
    padding: 15px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.nav-button:hover {
    background-color: rgba(0, 0, 0, 0.7);
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
</style>