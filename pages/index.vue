<template>
  <div class="flex justify-between py-2 border-b border-gray-300 dark:border-gray-800">
    <UInput icon="i-heroicons-magnifying-glass" placeholder="Search" variant="none"></UInput>

    <UButtonGroup>
      <UButton color="primary" variant="soft" to="/project">New Project</UButton>
      <UButton color="purple" variant="soft">Open</UButton>
    </UButtonGroup>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import fs from 'node:fs'

export default {
  async mounted() {
    console.log('ipcRenderer:', ipcRenderer)
    console.log('fs:', fs)
  }
}
</script>