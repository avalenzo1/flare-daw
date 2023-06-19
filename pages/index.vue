<template>
  <div class="flex justify-center items-center h-screen">
    <div>
      <UButton :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'" color="gray" variant="ghost"
        aria-label="Theme" @click="isDark = !isDark" />
      <h1>Flare Digital Audio Workstation</h1>
      <UButton color="primary" variant="soft" to="/project">Create a new project</UButton>
      <UButton color="purple" variant="soft">Open an existing project</UButton>
    </div>
  </div>
</template>

<script setup>
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>

<script>
import { ipcRenderer } from 'electron'
import fs from 'node:fs'

export default {
  async mounted() {
    console.log('ipcRenderer:',ipcRenderer)
    console.log('fs:', fs)
  }
}
</script>