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
  modules: ['@nuxtjs/tailwindcss'],
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