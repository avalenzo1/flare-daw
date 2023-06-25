// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true
  },
  build: {
    transpile: ['vue3-pixi']
  },
  modules: [
    'nuxt-electron', '@pinia-plugin-persistedstate/nuxt', '@pinia/nuxt', '@nuxthq/ui'
  ],
  // plugins: [
  //   { src: '~/plugins/pixijs', mode: 'client', ssr: false}
  // ],
  
  electron: {
    build: [
      { // Main-Process entry file of the Electron App.
        entry: 'electron/main.ts'
      }, {
        entry: 'electron/preload.ts',
        onstart(options : any) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
          // instead of restarting the entire Electron App.
          options.reload()
        }
      },
    ],
    renderer: {}
  }
})
