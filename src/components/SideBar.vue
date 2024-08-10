<template>
  <div :class="['sidebar', isCollapsed ? 'collapsed' : '']" ref="sidebar">
    <div class="resize-handle" @mousedown="startResizing"></div>
    <header class="header">
      <nav>
        <ul>
          <li :class="{ selected: currentPage === 'upscale' }">
            <NuxtLink to="/" @click="navigate('upscale')" class="nav-link">
              <span class="icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-image">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </span>
              <span class="link-text">Upscale</span>
            </NuxtLink>
          </li>
          <li :class="{ selected: currentPage === 'settings' }">
            <NuxtLink to="/settings" @click="navigate('settings')" class="nav-link">
              <span class="icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sliders">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
              </span>
              <span class="link-text">Settings</span>
            </NuxtLink>
          </li>
          <li :class="{ selected: currentPage === 'ai-models' }">
            <NuxtLink to="/ai-models" @click="navigate('ai-models')" class="nav-link">
              <span class="icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-box">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </span>
              <span class="link-text">Dependencies</span>
            </NuxtLink>
          </li>
          <li :class="{ selected: currentPage === 'library' }">
            <NuxtLink to="/library" @click="navigate('library')" class="nav-link">
              <span class="icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-folder">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
              <span class="link-text">Library</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const currentPage = ref('home');
const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const isCollapsed = ref(false);

function navigate(page) {
  currentPage.value = page;
}

function startResizing(e) {
  e.preventDefault();
  isResizing.value = true;
  startX.value = e.clientX;
  startWidth.value = sidebar.value.offsetWidth;
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResizing);
}

function resize(e) {
  if (isResizing.value) {
    const newWidth = startWidth.value + (e.clientX - startX.value);
    sidebar.value.style.width = `${Math.max(60, newWidth)}px`;
    isCollapsed.value = newWidth < 100;
  }
}

function stopResizing() {
  isResizing.value = false;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResizing);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.sidebar {
  width: 300px;
  min-width: 60px;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0f0f0f;
  color: #fff;
  font-family: 'Roboto', sans-serif;
}

.collapsed {
  width: 80px;
}

.collapsed .nav-link {
  justify-content: center;
}

.collapsed .link-text {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.resize-handle {
  width: 10px;
  cursor: ew-resize;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s ease;
}

.resize-handle:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.header {
  padding: 20px 0;
  width: 100%;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

nav ul li {
  margin: 5px 0;
  cursor: pointer;
  width: 100%;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-size: 1em;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.icon-container {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #2d2d2d;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.icon-container svg {
  width: 18px;
  height: 18px;
  stroke: #fff;
  transition: stroke 0.3s ease;
}

.link-text {
  display: inline;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.nav-link:hover {
  background-color: #1d1d1d;
  transform: translateX(5px);
}

.nav-link:hover .icon-container {
  background-color: #fff;
  transform: scale(1.1);
}

.nav-link:hover .icon-container svg {
  stroke: #1a1a1a;
}

.selected .nav-link {
  background-color: #1d1d1d;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateX(10px);
}

.selected .icon-container {
  background-color: #fff;
  transform: scale(1.2);
}

.selected .icon-container svg {
  stroke: #1a1a1a;
}
</style>