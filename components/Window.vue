<template>
  <NuxtDragResize dragHandle=".drag" :class="fullscreen ? 'u-card__fullscreen' : ''">
    <UCard class="w-full h-full">
      <template #header>
        <div class="flex items-center">
          <span class="drag flex-1">{{ title }}</span>
          <UButtonGroup>
            <UButton :icon="fullscreen ? 'i-heroicons-arrows-pointing-in' : 'i-heroicons-arrows-pointing-out'"
              @click="toggleFullscreen" variant="soft" />
            <UButton icon="i-heroicons-x-mark" color="red" variant="soft" @click="visible = !visible;"></UButton>
          </UButtonGroup>
        </div>
      </template>

      <slot />
    </UCard>
  </NuxtDragResize>
</template>

<style>
.u-card__fullscreen {
  @apply fixed !w-full !h-full !top-0 !left-0 !right-0 !bottom-0 rounded-none p-0 z-50;
}
</style>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "Window Title"
    },
    w: {
      type: Number
    },
    h: {
      type: Number
    },
    x: {
      type: Number
    },
    y: {
      type: Number
    }
  },
  data() {
    return {
      visible: false,
      fullscreen: false,
    }
  },

  methods: {
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen;
    }
  },
}
</script>