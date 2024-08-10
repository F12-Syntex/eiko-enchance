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
            <div v-for="item in currentItems" :key="item.name" class="library-item">
                <template v-if="item.type === 'directory'">
                    <div class="folder" @click="openFolder(item.name)">
                        <i class="fas fa-folder"></i>
                        <span>{{ item.name }}</span>
                    </div>
                </template>
                <template v-else-if="item.type === 'image'">
                    <div class="image" @click="previewMedia(item)">
                        <img :src="item.url" :alt="item.name">
                        <span>{{ item.name }}</span>
                    </div>
                </template>
                <template v-else-if="item.type === 'video'">
                    <div class="video" @click="previewMedia(item)">
                        <i class="fas fa-video"></i>
                        <span>{{ item.name }}</span>
                    </div>
                </template>
            </div>
        </div>
        <div v-if="previewItem" class="media-preview">
            <div class="preview-content">
                <button class="close-preview" @click="closePreview">&times;</button>
                <img v-if="previewItem.type === 'image'" :src="previewItem.url" :alt="previewItem.name">
                <video v-else-if="previewItem.type === 'video'" controls>
                    <source :src="previewItem.url" :type="'video/' + previewItem.name.split('.').pop()">
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import useElectron from '../../composables/useElectron';
import SettingsManager from '../managers/SettingsManager';

const items = ref([]);
const currentPath = ref([]);
const previewItem = ref(null);

const currentItems = computed(() => {
    let current = items.value;
    for (const folder of currentPath.value) {
        const folderItem = current.find(item => item.name === folder && item.type === 'directory');
        if (folderItem) {
            current = folderItem.contents;
        } else {
            // Handle the case where the folder doesn't exist or is not a directory
            current = [];
            break;
        }
    }
    return current;
});

const currentPathString = computed(() => {
    const basePath = SettingsManager.getSettings().upscalerDirectory;
    return basePath + (currentPath.value.length > 0 ? '\\' + currentPath.value.join('/') : '');
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
};

const closePreview = () => {
    previewItem.value = null;
};

const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes('.' + extension)) {
        return 'image';
    } else if (['.mp4', '.webm', '.ogg'].includes('.' + extension)) {
        return 'video';
    }
    return 'other';
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
            const absulutePath = `${currentFullPath}/${file.name}`;

            if (type === 'directory') {
                const subFiles = fileExplorer.exploreFolder(absulutePath);
                const contents = processFiles(subFiles);

                return {
                    name: file.name,
                    type: 'directory',
                    url: `local-file://${absulutePath}`,
                    contents
                };
            } else {
                return {
                    name: file.name,
                    type,
                    url: `local-file://${absulutePath}`
                };
            }
        });
    };

    items.value = processFiles(filesObject);
};
onMounted(async () => {
    await loadCurrentFolder();
});
</script>

<style scoped>
.library-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #ffffff;
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

.folder i,
.video i {
    font-size: 50px;
    margin-bottom: 10px;
    color: #0e639c;
}

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

/* Scrollbar styles */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: #4f4f4f;
}
</style>