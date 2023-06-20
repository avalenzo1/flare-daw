export default defineAppConfig({
  ui: {
    icons: ['mdi', 'heroicons'],
    primary: 'indigo',
    gray: 'stone',
    // secondary: 'purple',
    // warning: 'orange',
    // error: 'red',
    notifications: {
      // Show toasts at the top right of the screen
      position: 'top-0 right-0'
    },
    card: {
      rounded: "rounded-none",
      header: {
        padding: "p-2"
      },
      body: {
        padding: "p-2"
      }
    }
  }
})