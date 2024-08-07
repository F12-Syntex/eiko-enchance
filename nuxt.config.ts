import { fileURLToPath } from 'url';

export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  ssr: false,
  alias: {
    'images': fileURLToPath(new URL('../assets/images', import.meta.url)),
    'style': fileURLToPath(new URL('../assets/styles', import.meta.url)),
  },
  css: [
    '@/../assets/styles/global.scss',
    'animate.css/animate.min.css'
  ],
  colorMode: {
    preference: 'system',
    fallback: 'light', 
    classSuffix: '-mode'
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  tailwindcss: {
    cssPath: '~/assets/styles/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    config: {},
  },
  buildDir: 'nuxt-build',
  devServer: {
    port: 3000,
    host: 'localhost'
  },
  srcDir: 'src/',
});