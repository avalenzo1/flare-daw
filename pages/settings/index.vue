<script setup>
import { useMainStore } from '@/store/main.ts';

const colorMode = useColorMode();
const mainStore = useMainStore();

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const languages = ['English', 'Español']

const language = ref(languages[0])
</script>

<template>
  <UFormGroup name="theme" label="Theme">
    <UButton :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'" color="gray" variant="ghost"
    aria-label="Theme" @click="isDark = !isDark">
    {{ isDark ? 'Dark' : 'Light' }}
    </UButton>
  </UFormGroup>
  
  <UFormGroup name="language" label="Language">
    <USelectMenu v-model="language" :options="languages" />
  </UFormGroup>

  <UFormGroup name="illegal" label="Illegal Plugins">
    <UTooltip text="By enabling this option. Illegal Plugins will show up.">
      <UButton color="gray" variant="ghost"
    aria-label="Theme" @click="mainStore.updateSettings({ enableIllegalPlugins: !mainStore.settings.enableIllegalPlugins })">
    {{ mainStore.settings.enableIllegalPlugins ? 'Enable Illegal Plugins' : 'Disable Illegal Plugins' }}
    </UButton>
  </UTooltip>
    
  </UFormGroup>
  
</template>