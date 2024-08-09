// src/utils/settingsManager.js

const DEFAULT_SETTINGS = {
  upscalerDirectory: 'Documents\\eiko\\upscaled',
  cacheDirectory: 'Documents\\eiko\\cache',
  upscaleFactor: '2',
  aiModel: 'balanced',
  fileFormat: 'png',
  autoSave: true,
  theme: 'dark'
}

export default {
  getSettings() {
    const savedSettings = localStorage.getItem('aiUpscalerSettings')
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS
  },

  saveSettings(settings: { upscalerDirectory: string; upscaleFactor: string; aiModel: string; fileFormat: string; autoSave: boolean; theme: string, cacheDirectory: string }) {
    localStorage.setItem('aiUpscalerSettings', JSON.stringify(settings))
  },

  resetSettings() {
    this.saveSettings(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }
}
