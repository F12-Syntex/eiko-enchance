<template>
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
        <div class="view-options">
            <div class="size-select">
                <button @click="changeGalleryItemSize('small')" :class="{ active: selectedSize === 'small' }" class="size-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-grid">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                </button>
                <button @click="changeGalleryItemSize('medium')" :class="{ active: selectedSize === 'medium' }" class="size-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-grid">
                        <rect x="3" y="3" width="9" height="9"></rect>
                        <rect x="12" y="3" width="9" height="9"></rect>
                        <rect x="12" y="12" width="9" height="9"></rect>
                        <rect x="3" y="12" width="9" height="9"></rect>
                    </svg>
                </button>
                <button @click="changeGalleryItemSize('large')" :class="{ active: selectedSize === 'large' }" class="size-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-square">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
                </button>
            </div>
            <button @click="toggleViewMode" class="view-mode-button">
                <svg v-if="viewMode === 'gallery'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-list">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-grid">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    currentPath: {
        type: Array,
        required: true
    },
    currentPathString: {
        type: String,
        required: true
    },
    viewMode: {
        type: String,
        required: true
    },
    galleryItemSize: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['goBack', 'toggleViewMode', 'changeGalleryItemSize']);

const selectedSize = ref(props.galleryItemSize || 'medium');

const goBack = () => {
    emit('goBack');
};

const toggleViewMode = () => {
    emit('toggleViewMode');
};

const changeGalleryItemSize = (size) => {
    selectedSize.value = size;
    emit('changeGalleryItemSize', size);
};
</script>

<style scoped>
.folder-navigation {
    padding: 15px;
    border-bottom: 1px solid #333333;
    display: flex;
    align-items: center;
}

.back-button, .view-mode-button, .size-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.back-button:hover:not(:disabled),
.view-mode-button:hover,
.size-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.back-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.back-button svg,
.view-mode-button svg,
.size-button svg {
    width: 20px;
    height: 20px;
}

.back-button svg {
    margin-right: 5px;
}

.current-path {
    margin-left: 15px;
    font-size: 14px;
    opacity: 0.8;
    flex-grow: 1;
}

.view-options {
    display: flex;
    align-items: center;
    margin-left: auto;
}

.size-select {
    display: flex;
    background-color: #333333;
    border-radius: 4px;
    overflow: hidden;
    margin-right: 10px;
}

.size-button {
    padding: 5px 10px;
    border-radius: 0;
}

.size-button.active {
    background-color: rgba(255, 255, 255, 0.2);
}

.view-mode-button {
    margin-left: 10px;
}
</style>