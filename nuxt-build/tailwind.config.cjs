// generated by the @nuxtjs/tailwindcss <https://github.com/nuxt-modules/tailwindcss> module at 10/08/2024, 19:48:30
const configMerger = require("D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/node_modules/@nuxtjs/tailwindcss/dist/runtime/merger.js");

const inlineConfig = {"content":[],"theme":{"extend":{}},"plugins":[]};

const config = [
require("./../tailwind.config.js")
].reduce((prev, curr) => configMerger(curr, prev), configMerger(inlineConfig, { content: ["D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/components/**/*.{vue,js,jsx,mjs,ts,tsx}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/components/global/**/*.{vue,js,jsx,mjs,ts,tsx}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/components/**/*.{vue,js,jsx,mjs,ts,tsx}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/layouts/**/*.{vue,js,jsx,mjs,ts,tsx}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/pages/**/*.{vue,js,jsx,mjs,ts,tsx}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/plugins/**/*.{js,ts,mjs}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/composables/**/*.{js,ts,mjs}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/utils/**/*.{js,ts,mjs}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/{A,a}pp.{vue,js,jsx,mjs,ts,tsx}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/{E,e}rror.{vue,js,jsx,mjs,ts,tsx}","D:/git-repo/EikoEnhance/electron-nuxt3/eiko-enchance/src/app.config.{js,ts,mjs}"] }));

module.exports = (() => {const cfg=config;cfg["darkMode"] = ["selector","[class~=\"dark-mode\"]"];;return cfg;})()
