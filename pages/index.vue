<template>
  <div class="flex justify-between py-2 border-b border-gray-300 dark:border-gray-800">
    <UInput icon="i-heroicons-magnifying-glass" placeholder="Search" variant="none"></UInput>

    <UButtonGroup>
      <UButton color="primary" variant="soft"  to="/project">New Project</UButton>
      <UButton color="purple" variant="soft" @click="openProject">Open</UButton>
    </UButtonGroup>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import fs from 'node:fs'

export default {
  methods: {
    async openProject() {
      let result = await ipcRenderer.invoke('open-project')

      // Return if no path was given
      if (result.canceled) return;

      console.log(result);
    }
  },
  async mounted() {
    console.log('ipcRenderer:', ipcRenderer)
    console.log('fs:', fs)
  }
}
</script>